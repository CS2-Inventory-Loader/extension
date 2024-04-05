import contentScript from 'url:~lib/content-script';
import injectorScript from '~lib/content-script';
import scriptURL from "url:~lib/inventory";

if (!globalThis.browser) {
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	globalThis.browser = globalThis.chrome;
}

async function getSteamId() {
	const profileXML = await fetch('https://steamcommunity.com/my?xml=1').then((r) => r.text());
	const match = profileXML.match(/<steamID64>(\d{17})<\/steamID64>/);
	return match ? match[1] : null;
}

async function fetchInventory(steamId: string, appId: number, contextId: number) {
	// TODO: Send referrer header
	// TODO: Load next batch of items (steam does 75 then 2000)
	// TODO: Error handling
	const inventory = await fetch(`https://steamcommunity.com/inventory/${steamId}/${appId}/${contextId}?l=english&count=75`).then((r) => r.json());
	return inventory;
}

async function getUserInventory(appId: number, contextId: number) {
	const steamId = await getSteamId();
	const inventory = await fetchInventory(steamId, appId, contextId);
	return inventory;
}

// internal helpers
async function ensureContentScript(tabId: number, attempt = 0) {
	try {
		// will throw if content script is not injected unless safari
		const res = await browser.tabs.sendMessage(tabId, { event: 'content-script-check' });

		// Safari returns undefined instead of throwing
		if (res === undefined) {
			throw new Error('No response from content script');
		}

		// otherwise if we receive a response, we know the content script is injected
		return true;
	} catch (error) {
		const result = await chrome.scripting.executeScript({
			target: { tabId },
			func: injectorScript,
			args: [scriptURL],
		});
		console.debug('Injected content script into tab', tabId, result);

		// avoid infinite loop
		if (!attempt) {
			return ensureContentScript(tabId, 1);
		}

		throw new Error(`Failed to inject content script into tab ${tabId}`);
	}
}

async function executeCommand(fn, respond) {
	return fn()
		.then((payload) => respond({ success: true, payload }))
		.catch((err) => respond({ success: false, error: err.message }));
}

// eslint-disable-next-line no-unused-vars
function requestHostPermission(tab) {
	const tabUrl = new URL(tab.url);

	if (tabUrl.protocol !== 'https:') {
		throw new Error('Host must be secure (https)');
	}

	const hostOrigin = tabUrl.origin;
	if (!hostOrigin) {
		throw new Error('Failed to extract host origin');
	}

	console.debug('Requesting permission for', hostOrigin);
	return browser.permissions.request({ origins: [`${hostOrigin}/*`] });
}

// action handlers
browser.action.onClicked.addListener(async (tab) => {
	// TODO context menu items to persist permission until popup ui is made
	// await requestHostPermission(tab)

  const tabId = tab.id;
	// await ensureContentScript(tab.id)
	const result = await chrome.scripting.executeScript({
		target: { tabId },
		func: injectorScript,
		args: [scriptURL],
	});
	console.debug('Injected content script into tab', tabId, result);

	// TODO turn icon green or something to show user the content script is loaded?
});

// NOTE the handlers cannot be async due to safari bug iirc
browser.runtime.onMessage.addListener(({ event, data }, sender, respond) => {
	switch (event) {
		case 'get-inventory':
			executeCommand(() => getUserInventory(data.appId, data.contextId), respond);
			break;
		default:
			console.warn('Unknown event', event);
	}

	// needed to inform browser we will use respond method
	return true;
});

browser.permissions.onAdded.addListener(async (permissions) => {
	const newOrigins = permissions.origins;
	if (!newOrigins.length) return;

	console.debug('Permission added for', newOrigins);

	const [activeScript] = await browser.scripting.getRegisteredContentScripts({ ids: ['content-script'] });

	const newScript = {
		id: 'content-script',
		js: [contentScript],
		matches: [...new Set([...(activeScript?.matches ?? []), ...newOrigins])],
		runAt: 'document_idle',
	};

	if (activeScript) {
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		await browser.scripting.updateContentScripts([newScript]);
	} else {
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		await browser.scripting.registerContentScripts([newScript]);
	}

	console.debug('Updated content script following origin permission change', newScript.matches);
});

browser.permissions.onRemoved.addListener(async (permissions) => {
	const removedOrigins = permissions.origins;
	if (!removedOrigins.length) return;

	console.debug('Removed permission for', removedOrigins);

	const [activeScript] = await browser.scripting.getRegisteredContentScripts({ ids: ['content-script'] });

	const newOrigins = [];
	if (activeScript) {
		for (const origin of activeScript.matches) {
			if (removedOrigins.includes(origin)) continue;
			newOrigins.push(origin);
		}
	}

	const newScript = {
		id: 'content-script',
		js: [contentScript],
		matches: newOrigins,
		runAt: 'document_idle',
	};

	if (activeScript) {
		if (newScript.matches.length) {
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			await browser.scripting.updateContentScripts([newScript]);
		} else {
			await browser.scripting.unregisterContentScripts({ ids: ['content-script'] });
		}
	} else if (newScript.matches.length) {
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		await browser.scripting.registerContentScripts([newScript]);
	}

	console.debug('Updated content script following origin permission change', newScript.matches);
});

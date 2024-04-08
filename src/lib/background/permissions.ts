export function installPermissionsHandlers() {
  
}

browser.permissions.onAdded.addListener(async (permissions) => {
	const newOrigins = permissions.origins;
	if (!newOrigins.length) return;

	console.debug('Permission added for', newOrigins);

	const [activeScript] = await browser.scripting.getRegisteredContentScripts({ ids: ['content-script'] });

	const newScript = {
		id: 'content-script',
		js: [contentScript],
		matches: [...new Set([...(activeScript?.matches ?? []), ...newOrigins])],
		runAt: 'document_idle' as const,
	};

	if (activeScript) {
		await browser.scripting.updateContentScripts([newScript]);
	} else {
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
		runAt: 'document_idle' as const,
	};

	if (activeScript) {
		if (newScript.matches.length) {
			await browser.scripting.updateContentScripts([newScript]);
		} else {
			await browser.scripting.unregisterContentScripts({ ids: ['content-script'] });
		}
	} else if (newScript.matches.length) {
		await browser.scripting.registerContentScripts([newScript]);
	}

	console.debug('Updated content script following origin permission change', newScript.matches);
});

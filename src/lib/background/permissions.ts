import { joinRelativeURL } from 'ufo';
import contetntScriptURL from 'url:~/injectables/content-script';
import { getBrowser } from '~/lib/utils';

async function updateContentScripts(origins: string[], activeOrigins?: string[]) {
	if (!activeOrigins) {
		activeOrigins = await getActiveOrigins();
	}

	if (origins.length === 0) {
		if (activeOrigins.length === 0) {
			// Nothing to do
			return;
		}

		await getBrowser().scripting.unregisterContentScripts({ ids: ['content-script'] });
		return;
	}

	const dedupedOrigins = Array.from(new Set(origins));

	const script = {
		id: 'content-script',
		js: [joinRelativeURL(contetntScriptURL)],
		matches: dedupedOrigins,
		runAt: 'document_idle' as const,
	};

	if (activeOrigins.length === 0) {
		// This is the first origin, install new script
		await getBrowser().scripting.registerContentScripts([script]);
		return;
	}

	await getBrowser().scripting.updateContentScripts([script]);
}

async function getActiveOrigins() {
	const [activeScript] = await browser.scripting.getRegisteredContentScripts({ ids: ['content-script'] });

	if (!activeScript) {
		return [];
	}

	return activeScript.matches;
}

export function installPermissionsHandlers() {
	getBrowser().permissions.onAdded.addListener(async (permissions) => {
		const newOrigins = permissions.origins;

		if (!newOrigins.length) {
			return;
		}

		console.debug('🔓 Permission added for', newOrigins);

		const activeOrigins = await getActiveOrigins();
		const origins = Array.from(new Set([...activeOrigins, ...newOrigins]));

		await updateContentScripts(origins, activeOrigins);
	});

	getBrowser().permissions.onRemoved.addListener(async (permissions) => {
		const removedOrigins = permissions.origins;

		if (!removedOrigins.length) {
			return;
		}

		console.debug('🔒 Permissions removed for', removedOrigins);

		const activeOrigins = await getActiveOrigins();
		const origins = activeOrigins.filter((origin) => !removedOrigins.includes(origin));

		await updateContentScripts(origins, activeOrigins);
	});
}

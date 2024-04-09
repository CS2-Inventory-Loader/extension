import { parseFilename } from 'ufo';
import contetntScriptURL from 'url:~/injectables/content-script';
import { detectContentScript } from '~/lib/messaging/background';
import { getBrowser } from '~/lib/utils';

export async function installContentScript(tab) {
	if (await detectContentScript(tab.id)) {
		console.log('☑️ Skipping installation, already present');
		return;
	}

	await getBrowser().scripting.executeScript({
		target: { tabId: tab.id },
		files: [parseFilename(contetntScriptURL, { strict: true })],
	});

	console.log(`✅ Installed in ${tab.url} (${tab.id})`);
}

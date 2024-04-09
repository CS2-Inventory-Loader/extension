import { installContentScript } from '~/lib/background/install-content-script';
import { handleMessages } from '~/lib/messaging/background';
import { getUserInventory } from '~/lib/steam/inventory';
import { getBrowser } from '~/lib/utils';

import type { MessageRequest } from '~/lib/messaging/types';

(() => {
	getBrowser().action.onClicked.addListener(async (tab) => {
		await installContentScript(tab);
	});

	handleMessages({
		'load-inventory': (req: MessageRequest) => {
			const { appId, contextId } = req.body;
			return getUserInventory(appId, contextId);
		},
	});
})();

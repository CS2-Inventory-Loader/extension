import { isSameOrigin } from '~/lib/messaging/utils';

import type { MessageRequest } from '~/lib/messaging/types';

export async function sendViaRelay(req: MessageRequest, timeout = 30e3, messagePort = globalThis.window) {
	return new Promise((resolve, reject) => {
		const responseHandler = (event: MessageEvent) => {
			if (!isSameOrigin(event) || !event.data.relayed) {
				return;
			}

			clear();

			if (event.data.body.success) {
				resolve(event.data.body.response);
			} else {
				reject(new Error(event.data.body.error));
			}
		};

		const clear = () => {
			window.removeEventListener('message', responseHandler);
			clearTimeout(timeoutTimer);
		};

		const timeoutTimer = setTimeout(() => {
			clear();
			reject('TIMEOUT');
		}, timeout);

		messagePort.addEventListener('message', responseHandler);
		messagePort.postMessage(req);
	});
}

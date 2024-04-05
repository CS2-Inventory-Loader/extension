function install() {
	if ('cs2inventory' in window) {
		console.warn('CS2Inventory already installed');
		return;
	}

	function execute(eventName: string, payload: unknown, timeout = 30e3) {
		return new Promise((resolve, reject) => {
			window.addEventListener(
				`${eventName};reply`,
				(resp: CustomEvent) => {
					if (resp.detail.success) {
						return resolve(resp.detail.payload);
					}

					return reject(resp.detail.error);
				},
				{ once: true }
			);

			window.dispatchEvent(new CustomEvent(eventName, { detail: payload }));

			setTimeout(() => reject(new Error('Timeout')), timeout);
		});
	}

	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	window.cs2inventory = {
		loadInventory(appId: number, contextId: number) {
			return execute('cs2il:get-inventory', { appId, contextId });
		},
	};
}

install();

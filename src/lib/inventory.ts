function install() {
	console.log('Installing cs2inventory');
	if ('cs2inventory' in window) {
		return;
	}

	function execute(eventName, payload, timeout = 30e3) {
		return new Promise((resolve, reject) => {
			window.addEventListener(
				`${eventName};reply`,
				(resp) => {
					if ((<any>resp).detail.success) {
						return resolve((<any>resp).detail.payload);
					}

					return reject((<any>resp).detail.error);
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
		loadInventory(appId, contextId) {
			return execute('cs2il:get-inventory', { appId, contextId });
		},
	};
}

install();

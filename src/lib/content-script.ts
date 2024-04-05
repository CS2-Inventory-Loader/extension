import scriptURL from "url:~lib/inventory";

// installHostScript();

export default function installHostScript() {
  console.log('Installing host script')
  const script = document.createElement('script')
	script.type = 'module';
	// script.src = 'chrome-extension://lalkeolkhiipnjpmkcjfhbgnkallcbfk/inventory.fb5321ed.js';
  script.src = scriptURL;
  console.log('Installed host script: ', script);
	(document.head || document.documentElement).appendChild(script);

  // handleEvent('cs2il:get-inventory', async (event) => {
  //   if (!event.detail) {
  //     throw new Error('loadInventory(appId, contextId) requires params, received none')
  //   }
  
  //   if (event.detail.appId !== 730) {
  //     throw new Error(`Only appId=730 is currently supported, received: ${event.detail.appId}`)
  //   }
  
  //   if (event.detail.contextId !== 2) {
  //     throw new Error(`Only contextId=2 is currently supported, received: ${event.detail.contextId}`)
  //   }
  
  //   const response = await browser.runtime.sendMessage({
  //     event: 'get-inventory',
  //     data: event.detail
  //   })
  
  //   if (response.success === false) {
  //     throw new Error(response.error)
  //   }
  
  //   return response.payload
  // })
}

if (!globalThis.browser) {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  globalThis.browser = globalThis.chrome
}

browser.runtime.onMessage.addListener((request, sender, respond) => {
  switch (request.event) {
    case 'content-script-check':
      respond(true)
      break
    default:
      console.warn('Unknown event', request)
  }

  // needed to inform browser we will use respond method
  return true
})

const handleEvent = (eventName, handler) => {
  window?.addEventListener(eventName, async (event) => {
    try {
      const payload = await handler(event)
      window.dispatchEvent(new CustomEvent(`${eventName};reply`, { detail: { success: true, payload } }))
    } catch (err) {
      window.dispatchEvent(new CustomEvent(`${eventName};reply`, { detail: { success: false, error: err } }))
    }
  })
}

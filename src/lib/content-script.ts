// Since this is injected as content script, we cannot use data outside of this function
// see: https://docs.plasmo.com/framework/content-scripts#injecting-into-the-main-world
export default function injectorScript(scriptURL: string) {
  const script = document.createElement('script')
	script.type = 'module';
  script.src = scriptURL;
  console.debug('Installed host script: ', script);
	(document.head || document.documentElement).appendChild(script);

  if (!globalThis.browser) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    globalThis.browser = globalThis.chrome
  }

  chrome.runtime.onMessage.addListener((request, sender, respond) => {
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

  handleEvent('cs2il:get-inventory', async (event) => {
    if (!event.detail) {
      throw new Error('loadInventory(appId, contextId) requires params, received none')
    }
  
    if (event.detail.appId !== 730) {
      throw new Error(`Only appId=730 is currently supported, received: ${event.detail.appId}`)
    }
  
    if (event.detail.contextId !== 2) {
      throw new Error(`Only contextId=2 is currently supported, received: ${event.detail.contextId}`)
    }
  
    const response = await chrome.runtime.sendMessage({
      event: 'get-inventory',
      data: event.detail
    })
  
    if (response.success === false) {
      throw new Error(response.error)
    }
  
    return response.payload
  })
}

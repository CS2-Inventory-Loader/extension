if (!globalThis.browser) {
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

async function handleEvent (eventName, handler) {
  window.addEventListener(eventName, async (event) => {
    try {
      const payload = await handler(event)
      window.dispatchEvent(new CustomEvent(`${eventName};reply`, { detail: { success: true, payload } }))
    } catch (err) {
      window.dispatchEvent(new CustomEvent(`${eventName};reply`, { detail: { success: false, error: err } }))
    }
  })
}

function installHostScript () {
  const hostScriptUrl = browser.runtime.getURL('injectable/cs2inventory.js')
  const script = document.createElement('script')
  script.setAttribute('src', hostScriptUrl)
  document.querySelector('body').appendChild(script)
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

  const response = await browser.runtime.sendMessage({
    event: 'get-inventory',
    data: event.detail
  })

  if (response.success === false) {
    throw new Error(response.error)
  }

  return response.payload
})

installHostScript()

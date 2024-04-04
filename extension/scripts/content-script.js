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

async function handleEvent(eventName, handler) {
  window.addEventListener(eventName, async (event) => {
    try {
      const payload = await handler(event)
      window.dispatchEvent(new CustomEvent(`${eventName};reply`, { detail: { success: true, payload } }))
    } catch (err) {
      console.error(`Failed to execute "${eventName}"`, err)
      window.dispatchEvent(new CustomEvent(`${eventName};reply`, { detail: { success: false } }))
    }
  })
}

function installHostScript() {
  const hostScriptUrl = browser.runtime.getURL('injectable/cs2inventory.js')
  const script = document.createElement('script')
  script.setAttribute('src', hostScriptUrl)
  document.querySelector('body').appendChild(script)
}

handleEvent('cs2il:get-inventory', async (event) => {
  return browser.runtime.sendMessage({
    event: 'get-inventory',
    data: event.detail,
  })
})

installHostScript()

if (!globalThis.browser) globalThis.browser = globalThis.chrome

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


window.addEventListener('cs2:get-inventory', async event => {
  const inventory = await browser.runtime.sendMessage({
    event: 'get-inventory',
    data: event.detail,
  }).catch(console.error)
  // TODO better error handling?

  window.dispatchEvent(new CustomEvent('cs2:get-inventory;reply', {detail: inventory}))
})

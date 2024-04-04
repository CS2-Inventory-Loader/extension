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


// TODO wrap this in api
window.addEventListener('cs2:get-inventory', async event => {
  console.log('cs2:get-inventory', event.detail)
  const inventory = await browser.runtime.sendMessage({
    event: 'get-inventory',
    data: event.detail,
  }).catch(console.error)


  console.log(inventory)
})


// current usage
// window.dispatchEvent(new CustomEvent('cs2:get-inventory', {detail: {appId: 730, contextId: 2}}))

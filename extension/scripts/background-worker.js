if (!globalThis.browser) {
  globalThis.browser = globalThis.chrome
}

async function getSteamId() {
  const profileXML = await fetch('https://steamcommunity.com/my?xml=1').then(r => r.text())
  const match = profileXML.match(/\<steamID64\>(\d{17})\<\/steamID64\>/)
  return match ? match[1] : null
}

async function fetchInventory(steamId, appId, contextId) {
  // TODO: Send referrer header
  // TODO: Load next batch of items (steam does 75 then 2000)
  // TODO: Error handling
  const inventory = await fetch(`https://steamcommunity.com/inventory/${steamId}/${appId}/${contextId}?l=english&count=75`).then(r => r.json())
  return inventory
}

async function getUserInventory(appId, contextId) {
  const steamId = await getSteamId()
  const inventory = await fetchInventory(steamId, appId, contextId)
  return inventory
}

async function ensureContentScript(tabId, attempt = 0) {
  try {
    // will throw if content script is not injected unless safari
    const res = await browser.tabs.sendMessage(tabId, { event: 'content-script-check' })

    // Safari returns undefined instead of throwing
    if (res === undefined) {
      throw new Error('No response from content script')
    }

    // otherwise if we receive a response, we know the content script is injected
    return true
  } catch (error) {
    await browser.scripting.executeScript({
      target: { tabId },
      files: ['scripts/content-script.js']
    })

    // avoid infinite loop
    if (!attempt) {
      return ensureContentScript(tabId, 1)
    }

    throw new Error(`Failed to inject content script into tab ${tabId}`)
  }
}

async function executeCommand(fn, respond) {
  return fn()
    .then((payload) => respond({ success: true, payload }))
    .catch((err) => respond({ success: false, error: err.message }))
}

// action handlers
browser.action.onClicked.addListener(async (tab) => {
  await ensureContentScript(tab.id)

  // TODO turn icon green or something to show user the content script is loaded
  // maybe via content script message to also double check comms work
})

// NOTE the handlers cannot be async due to safari bug iirc
browser.runtime.onMessage.addListener(({ event, data }, sender, respond) => {
  switch(event) {
    case 'get-inventory':
      executeCommand(() => getUserInventory(data.appId, data.contextId), respond)
      break
    default:
      console.warn('Unknown event', event)
  }

  // needed to inform browser we will use respond method
  return true
})

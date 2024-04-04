chrome.webRequest.onBeforeRequest.addListener(async (details) => {
  if (details.url !== 'https://cs2inventory.dev/capture') {
    return
  }

  const initiatorHost = new URL(details.initiator).host
  const steamId = await getSteamId()
  const inventory = await fetchInventory(steamId, 730, 2)

  await fetch(`https://cs2inventory.dev/report/${initiatorHost}/${steamId}`, { 
    body: JSON.stringify(inventory), 
    headers: { 
      'Content-Type': 'application/json',
    }, 
    method: 'POST' 
  })
}, { urls: ['https://cs2inventory.dev/*'] })

async function getSteamId() {
  // TODO: Cache steamid
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

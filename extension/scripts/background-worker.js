chrome.runtime.onInstalled.addListener(() => {
  updateInventory()
  chrome.alarms.create('update-inventory', { periodInMinutes: 1 })
})

chrome.alarms.onAlarm.addListener((alarm) => {
  switch (alarm.name) {
    case 'update-inventory':
      return updateInventory()
  }
})

async function getSteamId() {
  // TODO: Cache steamid
  const profileXML = await fetch('https://steamcommunity.com/my?xml=1').then(r => r.text())
  const match = profileXML.match(/\<steamID64\>(\d{17})\<\/steamID64\>/)
  return match ? match[1] : null
}

async function updateInventory() {
  const steamId = await getSteamId()

  if (!steamId) {
    return
  }

  const inventory = await getSteamInventory(steamId, 730, 2)

  // TODO: Consider compressing payload
  await reportInventory(steamId, inventory)
}

async function reportInventory(steamId, inventory) {
  // TODO: Finalize domain
  // TODO: Optional user-selected cache server under subdomain
  // TODO: Cache inventory locally and ping only when it updates
  await fetch(`https://cs2-inventory.froggly.dev/inventory/${steamId}`, { 
    body: JSON.stringify(inventory), 
    headers: { 'Content-Type': 'application/json' }, 
    method: 'POST' 
  })
}

async function getSteamInventory(steamId, appId, contextId) {
  // TODO: Send referrer header
  // TODO: Load next batch of items (steam does 75 then 2000)
  // TODO: Error handling
  const inventory = await fetch(`https://steamcommunity.com/inventory/${steamId}/${appId}/${contextId}?l=english&count=75`).then(r => r.json())
  return inventory
}

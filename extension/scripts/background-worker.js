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

  await reportInventory(inventory)
}

async function reportInventory(inventory) {
  // TODO: Send inventory to server
  console.log(inventory)
}

async function getSteamInventory(steamId, appId, contextId) {
  // TODO: Handle loading remaining items
  const inventory = await fetch(`https://steamcommunity.com/inventory/${steamId}/${appId}/${contextId}?l=english&count=75`).then(r => r.json())
  return inventory
}

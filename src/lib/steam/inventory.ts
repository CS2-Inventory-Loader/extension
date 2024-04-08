export async function getSteamId() {
	const profileXML = await fetch('https://steamcommunity.com/my?xml=1').then((r) => r.text());
	const match = profileXML.match(/<steamID64>(\d{17})<\/steamID64>/);
	return match ? match[1] : null;
}

export async function fetchInventory(steamId: string, appId: number, contextId: number) {
	// TODO: Send referrer header
	// TODO: Load next batch of items (steam does 75 then 2000)
	// TODO: Error handling
	const inventory = await fetch(`https://steamcommunity.com/inventory/${steamId}/${appId}/${contextId}?l=english&count=75`).then((r) => r.json());
	return inventory;
}

export async function getUserInventory(appId: number, contextId: number) {
	const steamId = await getSteamId();
	const inventory = await fetchInventory(steamId, appId, contextId);
	return inventory;
}

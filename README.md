# CS2 Inventory Extension

### Install (dev)
1. Visit chrome://extensions
2. Enable developer mode (upper right corner)
3. Click "Load unpacked"
4. Select `extension` directory from this repository

### Logs
1. Visit chrome://extensions
2. Click "service worker" under the extension card

![Open Service Worker](.github/image.png)

### Current usage
Subject to change.

```js
async getInventory(appId, contextId) {
  return new Promise((resolve, reject) => {
    window.addEventListener('cs2:get-inventory;reply', resp => resolve(resp.detail), { once: true })
    window.dispatchEvent(new CustomEvent('cs2:get-inventory', { detail: { appId, contextId }}))

    setTimeout(() => reject('Timeout'), 30e3)
  })
}
```

### TODO
- bunch of TODO comments in [scripts/background-worker.js](./extension/scripts/background-worker.js)
- bundle process for easy dev against local server
- popup UI
- options UI

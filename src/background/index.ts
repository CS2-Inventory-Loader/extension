import { parseFilename } from 'ufo'

import { detectContentScript, handleMessages, onMessage } from '~/lib/messaging/background'
import type { MessageRequest } from '~/lib/messaging/types'
import { getUserInventory } from '~/lib/steam/inventory'
import { getBrowser } from '~/lib/utils'

import contetntScriptURL from 'url:~/lib/injectables/content-script'
import hostScriptURL from 'url:~/lib/injectables/host-script'

async function ensureContentScript(tabId: number) {
  if (await detectContentScript(tabId)) {
    console.log('Skipping installation, already present')
    return
  }

  await getBrowser().scripting.executeScript({
    target: { tabId },
    files: [parseFilename(contetntScriptURL, { strict: true })]
  })

  await getBrowser().scripting.executeScript({
    target: { tabId },
    files: [parseFilename(hostScriptURL, { strict: true })],
    world: 'MAIN'
  })
}

function loadInventory(req: MessageRequest) {
  const { appId, contextId } = req.body
  return getUserInventory(appId, contextId)
}

(() => {
  handleMessages()

  onMessage('load-inventory', loadInventory)

  getBrowser().action.onClicked.addListener(async (tab) => {
    await ensureContentScript(tab.id)
  })
})()

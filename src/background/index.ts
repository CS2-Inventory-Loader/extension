import { installContentScript } from '~/lib/background/install-content-script'
import { handleMessages } from '~/lib/messaging/background'
import type { MessageRequest } from '~/lib/messaging/types'
import { getUserInventory } from '~/lib/steam/inventory'
import { getBrowser } from '~/lib/utils'


(() => {
  getBrowser().action.onClicked.addListener(async (tab) => {
    await installContentScript(tab)
  })

  handleMessages({
    'load-inventory': (req: MessageRequest) => {
      const { appId, contextId } = req.body
      return getUserInventory(appId, contextId)
    }
  })
})()

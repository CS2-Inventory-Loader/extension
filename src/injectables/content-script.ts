import { installHostScript } from '~/lib/content/install-host-script'
import { handleMessages, relayMessages } from '~/lib/messaging/content-script'

(() => {
  handleMessages()
  relayMessages()

  installHostScript()

  console.log('Content Script installed')
})()


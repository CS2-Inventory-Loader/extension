import { handleMessages, relayMessages } from '~/lib/messaging/content-script'

(() => {
  handleMessages()
  relayMessages()

  console.log('Content Script installed')
})()


import { EVENT_PING } from '~/lib/constants'
import type { MessageRequest } from '~/lib/messaging/types'
import { getRuntime as getRuntime, isSameOrigin } from '~/lib/messaging/utils'

export function relayMessages(
  onMessage = (req: MessageRequest) => getRuntime().sendMessage(null, req),
  messagePort = globalThis.window
) {
  const relayHandler = async (event: MessageEvent<MessageRequest>) => {
    if (!isSameOrigin(event) || event.data.relayed) {
      return
    }

    const payload = { name: event.data.name, body: event.data.body } as MessageRequest
    const response = await onMessage(payload)

    messagePort.postMessage({ name: event.data.name, body: response, relayed: true })
  }

  messagePort.addEventListener('message', relayHandler)
  return () => messagePort.removeEventListener('message', relayHandler)
}

function messageListener(
  req: MessageRequest, 
  _sender: chrome.runtime.MessageSender, 
  sendResponse: (response) => void
) {
  if (req.name === EVENT_PING) {
    sendResponse(true)
  }

  return true
}

export function handleMessages() {
  getRuntime().onMessage.addListener(messageListener)
}

import { ERROR_UNKNOWN_MESSAGE_TYPE, EVENT_PING } from '~/lib/constants';
import type { MessageRequest } from '~/lib/messaging/types';
import { getRuntime } from '~/lib/messaging/utils';
import { getBrowser } from '~/lib/utils';

type MessageHandler = (req?: MessageRequest) => any

export const handlers = new Map<string, MessageHandler>()

export function onMessage(
  name: string, 
  handler: MessageHandler
) {
  handlers.set(name, handler)

  return () => {
    const currentHandler = handlers.get(name)

    if (currentHandler === handler) {
      handlers.delete(name)
    }
  }
}

function messageListener(
  req: MessageRequest, 
  _sender: chrome.runtime.MessageSender, 
  sendResponse: (response) => void
) {
  const handler = handlers.get(req.name)
  
  if (handler) {
    Promise.resolve()
    .then(() => handler(req))
    .then((response) => sendResponse({ success: true, response }))
    .catch((err) => {
      console.error(`Failed to process ${req.name}:`, err)
      sendResponse({ success: false, error: err.message })
    })
  } else {
    sendResponse({ success: false, error: ERROR_UNKNOWN_MESSAGE_TYPE })
  }

  return true
}

export function handleMessages(
  messageHandlers?: { [name: string]: MessageHandler }
) {
  getRuntime().onMessage.addListener(messageListener)

  if (messageHandlers) {
    for (const [name, handler] of Object.entries(messageHandlers)) {
      onMessage(name, handler)
    }
  }
}

export async function detectContentScript(tabId: number) {
  try {
    const response = await getBrowser().tabs.sendMessage(tabId, { name: EVENT_PING })
    return response !== undefined
  } catch (err) {
    return false
  }
}

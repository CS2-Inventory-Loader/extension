import type { MessageRequest } from '~/lib/messaging/types'
import { getBrowser } from '~/lib/utils'

export function getRuntime() {
  return getBrowser().runtime
}

export function isSameOrigin(
  event: MessageEvent<MessageRequest>,
) {
  return event.source === globalThis.window 
    && event.data.name
}

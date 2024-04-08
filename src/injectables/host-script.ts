import { sendViaRelay } from '~/lib/messaging/host-script';

(() => {
  if ('cs2inventory' in window) {
    console.warn('CS2Inventory already installed');
    return;
  }

  (window as any).cs2inventory = {
    loadInventory(appId: number, contextId: number) {
      return sendViaRelay({ name: 'load-inventory', body: { appId, contextId } });
    },
  };
  
  console.log('cs2inventory host script injected')
})()


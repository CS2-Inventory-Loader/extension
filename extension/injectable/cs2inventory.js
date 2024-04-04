function install() {
  if ('cs2inventory' in window) {
    retrun
  }

  function execute(eventName, payload, timeout = 30e3) {
    return new Promise((resolve, reject) => {
      window.addEventListener(`${eventName};reply`, resp => {
        if (resp.detail.success) {
          return resolve(resp.detail.payload)
        }

        return reject(resp.detail.error)
      }, { once: true })

      window.dispatchEvent(new CustomEvent(eventName, { detail: payload }))
  
      setTimeout(() => reject('Timeout'), timeout)
    })
  }

  window.cs2Inventory = {
    loadInventory(appId, contextId) {
      return execute('cs2il:get-inventory', { appId, contextId })
    }
  }
}

install()


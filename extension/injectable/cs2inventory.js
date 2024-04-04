function install () {
  if ('cs2inventory' in window) {
    return
  }

  function execute (eventName, payload, timeout = 30e3) {
    return new Promise((resolve, reject) => {
      window.addEventListener(`${eventName};reply`, resp => {
        if (resp.detail.success) {
          return resolve(resp.detail.payload)
        }

        return reject(resp.detail.error)
      }, { once: true })

      window.dispatchEvent(new CustomEvent(eventName, { detail: payload }))

      setTimeout(() => reject(new Error('Timeout')), timeout)
    })
  }

  window.cs2inventory = {
    loadInventory (appId, contextId) {
      return execute('cs2il:get-inventory', { appId, contextId })
    }
  }
}

install()

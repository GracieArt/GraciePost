function onError(error) {
  console.log(`Error: ${error}`)
}

function saveOptions(e) {
  e.preventDefault()
  browser.storage.sync.set({
    key: document.querySelector("#key").value,
    sendurl: document.querySelector("#sendurl").value,
    churl: document.querySelector("#churl").value
  })
}

function restoreOptions() {
  browser.storage.sync.get("key")
    .then((result) => {document.querySelector("#key").value = result.key || ""}, onError)

  browser.storage.sync.get("sendurl")
    .then((result) => {document.querySelector("#sendurl").value = result.sendurl || ""}, onError)

  browser.storage.sync.get("churl")
    .then((result) => {document.querySelector("#churl").value = result.churl || ""}, onError)
}

document.addEventListener("DOMContentLoaded", restoreOptions)
document.querySelector("form").addEventListener("submit", saveOptions)

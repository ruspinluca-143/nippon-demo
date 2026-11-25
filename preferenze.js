/* Pagina «Preferenze notifiche»: attiva le notifiche push su questo dispositivo.
   Il permesso del dispositivo si chiede solo quando il genitore preme il pulsante. */
(function () {
  "use strict";
  var bottone = document.getElementById("attiva-push");
  var modulo = document.getElementById("form-push");
  if (!bottone || !modulo) { return; }
  var esito = document.getElementById("esito-push");
  var supportato = "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
  if (!supportato) {
    bottone.disabled = true;
    esito.textContent = "Questo dispositivo o browser non supporta le notifiche push (su iPhone serve aggiungere il sito alla schermata Home).";
    return;
  }
  function chiaveBinaria(base64) {
    var padding = "=".repeat((4 - base64.length % 4) % 4);
    var raw = atob((base64 + padding).replace(/-/g, "+").replace(/_/g, "/"));
    return Uint8Array.from(raw, function (c) { return c.charCodeAt(0); });
  }
  bottone.addEventListener("click", function () {
    Notification.requestPermission().then(function (permesso) {
      if (permesso !== "granted") { esito.textContent = "Permesso negato dal dispositivo: puoi cambiarlo dalle impostazioni del browser."; return null; }
      return navigator.serviceWorker.register("/sw.js").then(function (reg) {
        return navigator.serviceWorker.ready.then(function () {
          return reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: chiaveBinaria(bottone.dataset.chiave) });
        });
      }).then(function (sub) {
        var token = modulo.querySelector("input[name=csrfmiddlewaretoken]").value;
        return fetch(modulo.getAttribute("action"), { method: "POST", credentials: "same-origin", headers: { "Content-Type": "application/json", "X-CSRFToken": token }, body: JSON.stringify(sub.toJSON()) });
      }).then(function (r) {
        if (r && r.ok) {
          document.getElementById("stato-push").innerHTML = '<span class="badge verde">Attive</span> su questo dispositivo.';
          esito.textContent = "Notifiche attivate.";
        }
      });
    }).catch(function (e) { esito.textContent = "Non è stato possibile attivare le notifiche: " + e.message; });
  });
})();

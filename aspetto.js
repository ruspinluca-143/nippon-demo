/* Pagina «Aspetto e stile»: anteprima dal vivo di stile, tema e colore (si salva solo premendo «Salva»). */
(function () {
  "use strict";
  var form = document.getElementById("form-aspetto");
  if (!form) { return; }
  var radice = document.documentElement;
  form.querySelectorAll("input[name=stile]").forEach(function (r) {
    r.addEventListener("change", function () { radice.setAttribute("data-stile", r.value); });
  });
  form.querySelectorAll("input[name=tema]").forEach(function (r) {
    r.addEventListener("change", function () { radice.setAttribute("data-tema", r.value); });
  });
  var campoColore = form.querySelector("input[name=accent]");
  function colore(valore) {
    if (!/^#[0-9a-fA-F]{6}$/.test(valore)) { return; }
    if (campoColore) { campoColore.value = valore; }
    radice.style.setProperty("--accent", valore);
  }
  form.querySelectorAll("[data-colore]").forEach(function (b) { b.addEventListener("click", function () { colore(b.getAttribute("data-colore")); }); });
  if (campoColore) { campoColore.addEventListener("input", function () { colore(campoColore.value); }); }
})();

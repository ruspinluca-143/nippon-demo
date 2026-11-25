/* Gare ed eventi: copia negli appunti, selezione multipla e contatore. Nessuna dipendenza. */
(function () {
  function copia(testo, bottone) {
    var fatto = function () {
      if (!bottone) return;
      var prima = bottone.getAttribute("data-etichetta") || bottone.textContent;
      bottone.setAttribute("data-etichetta", prima);
      bottone.textContent = "Copiato";
      setTimeout(function () { bottone.textContent = prima; }, 1800);
    };
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(testo).then(fatto, function () { vecchio(testo, fatto); });
    } else {
      vecchio(testo, fatto);
    }
  }
  function vecchio(testo, fatto) {
    var t = document.createElement("textarea");
    t.value = testo; t.setAttribute("readonly", ""); t.style.position = "fixed"; t.style.opacity = "0";
    document.body.appendChild(t); t.select();
    try { document.execCommand("copy"); } catch (e) {}
    document.body.removeChild(t); fatto();
  }
  function conta() {
    var n = document.querySelectorAll("input.sel-atleta:checked").length;
    document.querySelectorAll("[data-conta]").forEach(function (el) { el.textContent = n; });
  }
  document.addEventListener("click", function (e) {
    var c = e.target.closest("[data-copia]");
    if (c) {
      e.preventDefault();
      var origine = document.querySelector(c.getAttribute("data-copia"));
      if (origine) copia("value" in origine ? origine.value : origine.textContent.trim(), c);
      return;
    }
    var s = e.target.closest("[data-seleziona]");
    if (s) {
      e.preventDefault();
      var modo = s.getAttribute("data-seleziona");
      document.querySelectorAll("input.sel-atleta").forEach(function (cb) {
        if (cb.disabled) return;
        if (modo === "tutti") cb.checked = true;
        else if (modo === "nessuno") cb.checked = false;
        else cb.checked = cb.getAttribute("data-risposta") === modo;
      });
      conta();
    }
  });
  document.addEventListener("change", function (e) { if (e.target.matches && e.target.matches("input.sel-atleta")) conta(); });
  document.addEventListener("DOMContentLoaded", conta);
})();

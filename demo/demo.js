/* Demo statica: i moduli non salvano nulla, lo si dice con un avviso. */
(function () {
  "use strict";
  function avviso(testo) {
    if (window.mostraToast) { window.mostraToast(testo, "info"); }
    else { window.alert(testo); }
  }
  // sulla finestra, in fase di cattura: arriva prima di tutti gli altri comportamenti della pagina
  window.addEventListener("submit", function (e) {
    var f = e.target;
    if (f && f.hasAttribute && f.hasAttribute("data-demo-libero")) { return; }
    e.preventDefault();
    e.stopImmediatePropagation();
    var get = ((f && f.getAttribute && f.getAttribute("method")) || "get").toLowerCase() === "get";
    avviso(get
      ? "Demo statica: filtri e ricerche non sono attivi. Qui vedi le schermate già preparate; nella versione completa funzionano."
      : "Demo statica in sola lettura: nella versione completa questa azione salva i dati. Qui non succede nulla.");
  }, true);
  window.addEventListener("click", function (e) {
    var b = e.target.closest && e.target.closest("#attiva-push, [data-installa]");
    if (!b) { return; }
    e.preventDefault();
    e.stopImmediatePropagation();
    avviso("Demo statica: le notifiche sul telefono non si attivano qui.");
  }, true);
})();

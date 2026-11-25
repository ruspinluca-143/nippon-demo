/* Nippon Club: comportamento "da app" (navigazione fluida, toast, menu rapido, numeri che salgono, installazione).
   Nessun framework: Turbo (static/js/vendor/turbo.js, licenza MIT) gestisce cambio pagina e invio moduli senza ricaricare. */
(function () {
  "use strict";
  var automatico = navigator.webdriver === true;           // collaudi automatici: si usano le pagine classiche
  if (window.Turbo && automatico) { window.Turbo.session.drive = false; }
  var ridotto = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Toast (i messaggi di Django diventano notifiche a comparsa) ---------- */
  var ICONE = {
    success: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>',
    error: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7.5v5.5M12 16.4v.1"/></svg>',
    warning: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4 3 19.5h18z"/><path d="M12 10v4.5M12 17.2v.1"/></svg>',
    info: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 11v5.5M12 7.6v.1"/></svg>'
  };
  function mostraToast(testo, tipo) {
    var box = document.getElementById("toast");
    if (!box || !testo) return;
    tipo = ICONE[tipo] ? tipo : "info";
    var t = document.createElement("div");
    t.className = "toast " + tipo;
    t.setAttribute("role", tipo === "error" ? "alert" : "status");
    t.innerHTML = '<span class="toast-ico">' + ICONE[tipo] + '</span><span class="toast-txt"></span><button type="button" class="toast-x" aria-label="Chiudi">&times;</button>';
    t.querySelector(".toast-txt").textContent = testo;
    function chiudi() { t.classList.add("esce"); setTimeout(function () { t.remove(); }, 260); }
    t.querySelector(".toast-x").addEventListener("click", chiudi);
    box.appendChild(t);
    setTimeout(chiudi, tipo === "error" ? 8000 : 4800);
    if (tipo === "success" && navigator.vibrate) { navigator.vibrate(10); }
  }
  window.mostraToast = mostraToast;
  function messaggiInToast() {
    document.querySelectorAll("ul.messaggi").forEach(function (ul) {
      ul.querySelectorAll("li").forEach(function (li) { mostraToast(li.textContent.trim(), (li.className.match(/success|error|warning|info/) || ["info"])[0]); });
      ul.remove();
    });
  }

  /* ---------- Numeri che salgono (riquadri e totali) ---------- */
  function formatta(v, d) { return v.toLocaleString("it-IT", { minimumFractionDigits: d, maximumFractionDigits: d }); }
  function contaSu(el) {
    if (el.dataset.contato) return;
    el.dataset.contato = "1";
    var testo = el.textContent.trim();
    var m = testo.match(/-?\d[\d.]*(?:,\d+)?/);
    if (!m) return;
    var numero = m[0], decimali = (numero.split(",")[1] || "").length;
    var valore = parseFloat(numero.replace(/\./g, "").replace(",", "."));
    if (!isFinite(valore) || Math.abs(valore) > 1e9 || valore === 0) return;
    var prefisso = testo.slice(0, m.index), suffisso = testo.slice(m.index + numero.length), t0 = null;
    function passo(t) {
      if (t0 === null) t0 = t;
      var p = Math.min(1, (t - t0) / 750), e = 1 - Math.pow(1 - p, 3);
      el.textContent = p < 1 ? prefisso + formatta(valore * e, decimali) + suffisso : testo;
      if (p < 1) requestAnimationFrame(passo);
    }
    requestAnimationFrame(passo);
  }
  function numeri() {
    if (ridotto) return;
    var els = document.querySelectorAll(".kpi .n, [data-conta]");
    if (!("IntersectionObserver" in window)) { els.forEach(contaSu); return; }
    var oss = new IntersectionObserver(function (voci) {
      voci.forEach(function (v) { if (v.isIntersecting) { oss.unobserve(v.target); contaSu(v.target); } });
    }, { threshold: 0.4 });
    els.forEach(function (el) { oss.observe(el); });
  }

  /* ---------- Entrata a cascata dei blocchi ---------- */
  function entrata() {
    if (ridotto || document.documentElement.hasAttribute("data-turbo-preview")) return;
    var main = document.getElementById("contenuto");
    if (!main) return;
    var i = 0;
    Array.prototype.forEach.call(main.children, function (el) {
      if (el.tagName === "SCRIPT" || el.matches(".toast-box")) return;
      el.classList.add("entra");
      el.style.setProperty("--i", Math.min(i++, 9));
    });
    main.querySelectorAll(".griglia > *, .storie > *, .scorri > *").forEach(function (el, k) {
      el.classList.add("entra");
      el.style.setProperty("--i", Math.min(k, 12) + 1);
    });
    main.querySelectorAll(".tab-wrap tbody tr").forEach(function (tr, k) {
      tr.classList.add("entra-riga");
      tr.style.setProperty("--i", Math.min(k, 14));
    });
  }

  /* ---------- Foglio delle azioni rapide ---------- */
  function foglio() {
    var f = document.getElementById("foglio");
    if (!f) return;
    function apri() {
      f.hidden = false;
      requestAnimationFrame(function () { f.classList.add("aperto"); });
      document.documentElement.classList.add("blocca");
      var primo = f.querySelector("a.azione");
      if (primo && !ridotto) { setTimeout(function () { primo.focus({ preventScroll: true }); }, 50); }
    }
    function chiudi() {
      f.classList.remove("aperto");
      document.documentElement.classList.remove("blocca");
      setTimeout(function () { f.hidden = true; }, ridotto ? 0 : 280);
    }
    document.querySelectorAll("[data-foglio-apri]").forEach(function (b) { b.addEventListener("click", function (e) { e.preventDefault(); f.hidden ? apri() : chiudi(); }); });
    f.querySelectorAll("[data-foglio-chiudi], a.azione").forEach(function (b) { b.addEventListener("click", chiudi); });
    f._chiudi = chiudi;
  }

  /* ---------- Installazione come app ---------- */
  var richiestaInstalla = null;
  window.addEventListener("beforeinstallprompt", function (e) {
    e.preventDefault();
    richiestaInstalla = e;
    document.querySelectorAll("[data-installa]").forEach(function (b) { b.hidden = false; });
  });
  function installa() {
    document.querySelectorAll("[data-installa]").forEach(function (b) {
      if (richiestaInstalla) { b.hidden = false; }
      b.addEventListener("click", function () {
        if (!richiestaInstalla) { return; }
        richiestaInstalla.prompt();
        richiestaInstalla.userChoice.then(function () { richiestaInstalla = null; b.hidden = true; });
      });
    });
    var standalone = (window.matchMedia && matchMedia("(display-mode: standalone)").matches) || window.navigator.standalone;
    document.querySelectorAll("[data-gia-installata]").forEach(function (el) { el.hidden = !standalone; });
  }

  /* ---------- Azioni valide per tutta la pagina (registrate una volta sola) ---------- */
  if (!window.__nipponInit) {
    window.__nipponInit = true;
    document.addEventListener("click", function (e) {
      // chiude i menu a tendina quando si tocca fuori
      document.querySelectorAll("details.menu-utente[open], details.altro[open]").forEach(function (d) { if (!d.contains(e.target)) { d.removeAttribute("open"); } });
      // un tocco leggero (vibrazione) sui pulsanti, dove il dispositivo lo permette
      if (navigator.vibrate && e.target.closest && e.target.closest(".btn, .fab, .bottom a, a.azione, .storia")) { navigator.vibrate(6); }
    });
    document.addEventListener("keydown", function (e) {
      if (e.key !== "Escape") { return; }
      var f = document.getElementById("foglio");
      if (f && !f.hidden && f._chiudi) { f._chiudi(); }
      document.querySelectorAll("details.menu-utente[open], details.altro[open]").forEach(function (d) { d.removeAttribute("open"); });
    });
    // Niente codice scritto dentro le pagine (la politica di sicurezza lo vieta): i comportamenti si dichiarano con attributi data-*
    //   data-conferma="Testo"      sul modulo: chiede conferma prima di inviare
    //   data-copia-testo="#id"     sul pulsante: copia il testo dell'elemento indicato
    //   data-auto-invio            su un campo: invia il modulo appena cambia
    document.addEventListener("submit", function (e) {
      var f = e.target;
      if (f && f.hasAttribute && f.hasAttribute("data-conferma") && !window.confirm(f.getAttribute("data-conferma"))) { e.preventDefault(); }
    }, true);
    document.addEventListener("click", function (e) {
      var b = e.target.closest && e.target.closest("[data-copia-testo]");
      if (!b) { return; }
      var el = document.querySelector(b.getAttribute("data-copia-testo"));
      if (!el) { return; }
      var testo = ((el.value !== undefined && el.tagName !== "SPAN") ? el.value : el.textContent).trim();
      var etichetta = b.getAttribute("data-etichetta") || b.textContent;
      b.setAttribute("data-etichetta", etichetta);
      var fatto = function () { b.textContent = "Copiato ✓"; setTimeout(function () { b.textContent = etichetta; }, 1800); };
      if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(testo).then(fatto, fatto); }
      else { var r = document.createRange(); r.selectNodeContents(el); var s = window.getSelection(); s.removeAllRanges(); s.addRange(r); try { document.execCommand("copy"); } catch (x) {} fatto(); }
    });
    document.addEventListener("change", function (e) {
      var c = e.target;
      if (c && c.hasAttribute && c.hasAttribute("data-auto-invio") && c.form) { c.form.requestSubmit(); }
    });
    // il pulsante premuto mostra che sta lavorando (e non si preme due volte)
    document.addEventListener("submit", function (e) {
      if (e.defaultPrevented || e.target.hasAttribute("data-senza-attesa")) { return; }
      var b = e.submitter || e.target.querySelector("button[type=submit]");
      if (b && !b.classList.contains("attesa")) { b.classList.add("attesa"); setTimeout(function () { b.classList.remove("attesa"); }, 12000); }
    });
    document.addEventListener("turbo:before-fetch-request", function () { document.documentElement.classList.add("naviga"); });
    document.addEventListener("turbo:load", function () { document.documentElement.classList.remove("naviga"); });
    if ("serviceWorker" in navigator && !automatico && location.protocol.indexOf("http") === 0) {
      
    }
  }

  function avvia() {
    messaggiInToast();
    entrata();
    numeri();
    foglio();
    installa();
  }
  // Ogni pagina (cioe' ogni nuovo <body>) si avvia una volta sola, con o senza Turbo.
  function avviaUnaVolta() {
    if (!document.body || document.body.dataset.avviato) { return; }
    document.body.dataset.avviato = "1";
    avvia();
  }
  document.addEventListener("turbo:load", avviaUnaVolta);
  if (document.readyState === "loading") { document.addEventListener("DOMContentLoaded", function () { setTimeout(avviaUnaVolta, 0); }); }
  else { setTimeout(avviaUnaVolta, 0); }
})();

// Iscrizione: filtra i corsi in base a sede e disciplina, e mostra i dati del tutore solo se servono.
(function () {
  var sede = document.getElementById("id_i-sede");
  var disc = document.getElementById("id_i-disciplina");
  var corso = document.getElementById("id_i-corso");
  if (sede && disc && corso) {
    var tutte = Array.prototype.slice.call(corso.options).map(function (o) { return o.cloneNode(true); });
    var filtra = function () {
      var s = sede.value, d = disc.value, scelto = corso.value;
      corso.innerHTML = "";
      tutte.forEach(function (o) {
        if (!o.value || ((!s || o.dataset.sede === s) && (!d || o.dataset.disciplina === d))) corso.add(o.cloneNode(true));
      });
      var esiste = Array.prototype.some.call(corso.options, function (o) { return o.value === scelto; });
      corso.value = esiste ? scelto : "";
    };
    sede.addEventListener("change", filtra);
    disc.addEventListener("change", filtra);
    filtra();
  }
  var radio = document.querySelectorAll('input[name="t-chi_sono"]');
  var blocco = document.getElementById("dati-tutore");
  if (radio.length && blocco) {
    var aggiorna = function () {
      var v = document.querySelector('input[name="t-chi_sono"]:checked');
      blocco.classList.toggle("hidden", !v || v.value !== "tutore");
    };
    radio.forEach(function (r) { r.addEventListener("change", aggiorna); });
    aggiorna();
  }
})();

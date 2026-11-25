document.getElementById("indietro").addEventListener("click", function () { if (history.length > 1) { history.back(); } else { location.href = "index.html"; } });

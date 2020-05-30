socket.on('nombre users', function (nbr) {
    document.getElementById("nbr-player").innerText = `${nbr} ${nbr == 1 ? "Joueur" : "Joueurs"} connecté`
});
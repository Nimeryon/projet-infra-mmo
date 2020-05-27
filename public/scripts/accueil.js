socket.on('nombre users', function (nbr) {
    document.getElementById("nbr-player").innerText = `${nbr} Joueurs connecté !`
});
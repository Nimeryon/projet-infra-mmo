function sendMessage() {
    let input = document.querySelector(".input-message");
    let message = input.value;
    input.value = "";
    if (message != "") {
        socket.emit('chat message', message);
    }
}

// Récupération message chat
socket.on('chat message', function (msg) {
    let ul = document.querySelector(".messages");
    let nbr_messages = ul.childElementCount;
    if (nbr_messages == 20) {
        ul.removeChild(ul.firstChild);
    }
    let li = document.createElement("li");
    let p = document.createElement("p");
    p.innerText = msg;
    li.appendChild(p);
    ul.appendChild(li);
});

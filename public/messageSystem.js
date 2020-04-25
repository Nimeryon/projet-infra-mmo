var socket = io();

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
    let li = document.createElement("li");
    li.innerText = msg;
    ul.appendChild(li);
});
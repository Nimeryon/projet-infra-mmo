function sendMessage() {
    let input = document.querySelector(".input-message");
    let message = input.value;
    input.value = "";
    if (message != "") {
        socket.emit('chat message', message);
    }
}

function createMessage(id, msg) {
    let ul = document.querySelector(".messages");
    let li = document.createElement("li");
    let p = document.createElement("p");
    p.innerText = `${id}: ${msg}`;
    li.appendChild(p);
    ul.appendChild(li);
}

// Récupération message chat
socket.on('chat message', function (data) {
    createMessage(data.id, data.msg);
});
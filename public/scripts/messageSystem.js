function activateChat() {
    let app_chat = document.getElementById("app-chat");
    if (app_chat.style.display == "none" || !app_chat.style.display) {
        app_chat.style.display = "block";
    }
    else {
        app_chat.style.display = "none";
    }
}

function sendMessage() {
    let input = document.getElementById("input-message");
    let message = input.value;
    input.value = "";
    if (message != "") {
        socket.emit('chat message', message);
        document.getElementById("app-screen").focus();
    }
}

function createMessage(id, msg) {
    let ul = document.getElementById("messages");
    let li = document.createElement("li");
    let p = document.createElement("p");
    if (ul.childElementCount > 25) {
        ul.removeChild(ul.firstChild);
    }
    p.innerText = `${id}: ${msg}`;
    li.appendChild(p);
    ul.appendChild(li);
}

// Récupération message chat
socket.on('chat message', function (data) {
    createMessage(data.id, data.msg);
});
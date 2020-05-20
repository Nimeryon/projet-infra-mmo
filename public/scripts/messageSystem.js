var chatDisplayed = true;
function activateChat() {
    if (!chatDisplayed) {
        $("#app-chat").slideUp("fast");
        chatDisplayed = true;
    }
    else {
        $("#app-chat").slideDown("fast");
        chatDisplayed = false;
    }
}

function testActiveChat() {
    let message_input = document.getElementById("input-message");
    return document.activeElement != message_input;
}

function sendMessage() {
    let input = document.getElementById("input-message");
    let message = input.value;
    input.value = "";
    if (message != "") {
        socket.emit('chat message', message);
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
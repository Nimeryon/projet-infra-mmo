var current_player = null;

function sendInit() {
    let pseudo = document.getElementById("playerNameInput").value;
    if (pseudo != "" && pseudo.length > 5) {
        document.getElementById("game").style.display = "flex";
        document.getElementById("startMenuWrapper").style.display = "none";
        socket.emit('player ready', pseudo);
    } else {
        alert("Le pseudo ne doit pas être vide et doit être d'au moins 5 caractères !");
    }
}

function testActiveChat() {
    let message_input = document.querySelector(".input-message");
    return document.activeElement != message_input;
}

let keyMap = {
    90: "Z",
    81: "Q",
    83: "S",
    68: "D",
    38: "^",
    37: "<",
    40: "v",
    39: ">",
    32: "Space",
    84: "T",
    13: "Enter"
};

var ctx = document.getElementById("ctx").getContext("2d");
ctx.font = "30px Arial";

socket.on('init', function (player) {
    current_player = player;

    socket.on('update', function (packet) {
        ctx.clearRect(0, 0, 500, 500);
        for (var i = 0; i < packet.players.length; i++) {
            let player = packet.players[i];
            if (player.id == current_player.id) {
                current_player = player;
            }
            ctx.fillRect(player.x - 10, player.y - 10, 20, 20);
        }

        for (var i = 0; i < packet.bullets.length; i++) {
            let bullet = packet.bullets[i];
            ctx.fillRect(bullet.x - 5, bullet.y - 5, 10, 10);
        }
    });

    document.onkeydown = function (e) {
        if (testActiveChat()) {
            if (keyMap[e.keyCode] == "Z" || keyMap[e.keyCode] == "^") {
                socket.emit('input', { key: "up", state: true });
            }
            else if (keyMap[e.keyCode] == "S" || keyMap[e.keyCode] == "v") {
                socket.emit('input', { key: "down", state: true });
            }
            else if (keyMap[e.keyCode] == "Q" || keyMap[e.keyCode] == "<") {
                socket.emit('input', { key: "left", state: true });
            }
            else if (keyMap[e.keyCode] == "D" || keyMap[e.keyCode] == ">") {
                socket.emit('input', { key: "right", state: true });
            }
        }
    }

    document.onkeyup = function (e) {
        if (keyMap[e.keyCode] == "Z" || keyMap[e.keyCode] == "^") {
            socket.emit('input', { key: "up", state: false });
        }
        else if (keyMap[e.keyCode] == "S" || keyMap[e.keyCode] == "v") {
            socket.emit('input', { key: "down", state: false });
        }
        else if (keyMap[e.keyCode] == "Q" || keyMap[e.keyCode] == "<") {
            socket.emit('input', { key: "left", state: false });
        }
        else if (keyMap[e.keyCode] == "D" || keyMap[e.keyCode] == ">") {
            socket.emit('input', { key: "right", state: false });
        }
        else if (keyMap[e.keyCode] == "T") {
            document.getElementsByClassName("input-message")[0].focus();
        }
    }

    document.onmousedown = function (e) {
        if (testActiveChat()) {
            socket.emit('input', { key: 'shoot', state: true });
        }
    }
    document.onmouseup = function (e) {
        socket.emit('input', { key: 'shoot', state: false });
    }

    document.onmousemove = function (e) {
        if (testActiveChat()) {
            var x = -current_player.x + e.clientX;
            var y = -current_player.y + e.clientY;
            var angle = Math.atan2(y, x) / Math.PI * 180;
            socket.emit('input', { key: 'mouseAngle', state: angle });
        }
    }
});
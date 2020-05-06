PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;

const app = new PIXI.Application(
    {
        width: 1080,
        height: 720,
        backgroundColor: 0xAAAAAA
    }
);

const renderer = PIXI.autoDetectRenderer(window.innerWidth, window.innerHeight);

window.onresize = function (event) {
    var w = window.innerWidth;
    var h = window.innerHeight;

    //this part resizes the canvas but keeps ratio the same
    renderer.view.style.width = w + "px";
    renderer.view.style.height = h + "px";

    //this part adjusts the ratio:
    renderer.resize(w, h);
}

const scale = 3;

const divAppScreen = document.createElement("div");
divAppScreen.className = "app-screen";
divAppScreen.appendChild(app.view);
document.getElementById("game").appendChild(divAppScreen);

const loader = new PIXI.Loader();
// Chargement sprites joueur
loader.add('player_sprites_01', "sprites/players/spr_player_01.png");
loader.add('player_sprites_02', "sprites/players/spr_player_02.png");
loader.add('player_sprites_03', "sprites/players/spr_player_03.png");
loader.add('player_sprites_04', "sprites/players/spr_player_04.png");
loader.add('player_sprites_05', "sprites/players/spr_player_05.png");
loader.add('player_sprites_06', "sprites/players/spr_player_06.png");
loader.add('player_sprites_07', "sprites/players/spr_player_07.png");
loader.add('player_sprites_08', "sprites/players/spr_player_08.png");
loader.add('player_sprites_09', "sprites/players/spr_player_09.png");
loader.add('player_sprites_10', "sprites/players/spr_player_10.png");
loader.add('player_sprites_11', "sprites/players/spr_player_11.png");
loader.add('player_sprites_12', "sprites/players/spr_player_12.png");
loader.add('player_sprites_13', "sprites/players/spr_player_13.png");
loader.add('player_sprites_14', "sprites/players/spr_player_14.png");
loader.add('player_sprites_15', "sprites/players/spr_player_15.png");
loader.add('player_sprites_16', "sprites/players/spr_player_16.png");
loader.add('player_sprites_17', "sprites/players/spr_player_17.png");
loader.add('player_sprites_18', "sprites/players/spr_player_18.png");
loader.add('player_sprites_19', "sprites/players/spr_player_19.png");
loader.add('player_sprites_20', "sprites/players/spr_player_20.png");
// Chargement sons
// loader.add('sound_music_01', "sounds/red_carpet_wooden_floor.mp3");
// Chargement tilesets
loader.add('tileset_water', "sprites/tilesets/water.png");
loader.add('tileset_waterfall', "sprites/tilesets/waterfall.png");
loader.add('tileset_allin', "sprites/tilesets/allin.png");
loader.add('tileset_dirt', "sprites/tilesets/dirt.png");
loader.add('tileset_flower', "sprites/tilesets/flower.png");
loader.add('tileset_light_shadow', "sprites/tilesets/light_shadow.png");
loader.add('tileset_wall', "sprites/tilesets/wall.png");
loader.add('tileset_grass', "sprites/tilesets/grass.png");
// Execution
loader.load((loader, resources) => {
    var current_player = null;

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

    // var ctx = document.getElementById("ctx").getContext("2d");
    // ctx.font = "30px Arial";

    socket.on('init', function (player) {
        current_player = player;

        socket.on('update', function (packet) {
            // ctx.clearRect(0, 0, 500, 500);
            // for (var i = 0; i < packet.players.length; i++) {
            //     let player = packet.players[i];
            //     if (player.id == current_player.id) {
            //         current_player = player;
            //     }
            //     ctx.fillRect(player.x - 10, player.y - 10, 20, 20);
            // }

            // for (var i = 0; i < packet.bullets.length; i++) {
            //     let bullet = packet.bullets[i];
            //     ctx.fillRect(bullet.x - 5, bullet.y - 5, 10, 10);
            // }
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
});

loader.onProgress.add(e => {
    console.log(Math.ceil(e.progress));
    document.getElementById("loading-percentage").innerText = `${Math.ceil(e.progress)}%`
});

loader.onComplete.add(e => {
    // socket.emit('finish loading');
    $(".loader-wrapper").fadeOut("slow");
});

app.loader.onError.add((error) => console.error(error));
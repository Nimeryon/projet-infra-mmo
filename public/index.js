/*

MOVE TO

*/


PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;

const app = new PIXI.Application(
    {
        width: 1080,
        height: 720,
        backgroundColor: 0xAAAAAA,
        // resizeTo: window
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
document.querySelector(".game").appendChild(divAppScreen);

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
loader.add('sound_music_01', "sounds/red_carpet_wooden_floor.mp3");
// Execution
loader.load((loader, resources) => {
    const packetsArray = [];
    const players = {};

    class Player {
        constructor(playerData) {
            this.id = playerData.id;
            this.direction = 0;
            this.moving = false;
            this.speed = 4;

            this.generateSprite(playerData.sprite_number);

            this.sprite = new PIXI.AnimatedSprite(this.player_animation_walk_front);
            this.sprite.id = playerData.id;
            this.sprite.x = playerData.x;
            this.sprite.y = playerData.y;
            this.sprite.animationSpeed = 0.1;
            this.sprite.anchor.set(.5);
            this.sprite.scale.x = scale;
            this.sprite.scale.y = scale;
            app.stage.addChild(this.sprite);
        }

        generateSprite(sprite_number) {
            this.player_sprite_textures = [];

            let frame_count = 0;
            let player_sprite = `player_sprites_${sprite_number}`;
            for (let y = 0; y < 4; y++) {
                for (let x = 0; x < 3; x++) {
                    this.player_sprite_textures[frame_count] = new PIXI.Texture(resources[player_sprite].texture,
                        new PIXI.Rectangle(x * 32, y * 32, 32, 32)
                    );
                    frame_count++;
                }
            }

            this.player_animation_walk_front = [this.player_sprite_textures[1], this.player_sprite_textures[0], this.player_sprite_textures[1], this.player_sprite_textures[2]];
            this.player_animation_walk_left = [this.player_sprite_textures[4], this.player_sprite_textures[3], this.player_sprite_textures[4], this.player_sprite_textures[5]];
            this.player_animation_walk_right = [this.player_sprite_textures[7], this.player_sprite_textures[6], this.player_sprite_textures[7], this.player_sprite_textures[8]];
            this.player_animation_walk_back = [this.player_sprite_textures[10], this.player_sprite_textures[9], this.player_sprite_textures[10], this.player_sprite_textures[11]];
        }

        move(delta = 1, dir = 0) {
            this.changeSprite(dir);
            this.sprite.play();

            if (!this.moving) {
                this.moving = true;
            }

            switch (this.direction) {
                case 0:
                    this.sprite.y += this.speed * delta;
                    break;

                case 1:
                    this.sprite.x -= this.speed * delta;
                    break;

                case 2:
                    this.sprite.y -= this.speed * delta;
                    break;

                case 3:
                    this.sprite.x += this.speed * delta;
                    break;

                default: break;
            }
        }

        changeSprite(dir = 0) {
            if (dir != this.direction) {
                this.direction = dir;
                switch (this.direction) {
                    case 0:
                        this.sprite.textures = this.player_animation_walk_front;
                        break;

                    case 1:
                        this.sprite.textures = this.player_animation_walk_left;
                        break;

                    case 2:
                        this.sprite.textures = this.player_animation_walk_back;
                        break;

                    case 3:
                        this.sprite.textures = this.player_animation_walk_right;
                        break;

                    default: break;
                }
            }
        }
    }

    let keyMap = {
        90: "Z",
        81: "Q",
        83: "S",
        68: "D",
        38: "^",
        37: "<",
        40: "V",
        39: ">",
        32: "Space"
    };

    class listenKeys {
        constructor() {
            this.keys = {};
            this.listenKeys();
        }

        on(key, fonction) {
            if (this.keys[key[0]] || this.keys[key[1]]) {
                fonction();
            } else {
                return false;
            };
        }

        listenKeys() {
            const keysPressed = e => {
                this.keys[keyMap[e.keyCode]] = true;
            };

            const keysReleased = e => {
                this.keys[keyMap[e.keyCode]] = false;
            };

            window.onkeydown = keysPressed;
            window.onkeyup = keysReleased;
        }
    }

    const listener = new listenKeys();

    function lerp(start, end, amt) {
        return (1 - amt) * start + amt * end
    }


    function createPlayer(playerdata) {
        players[playerdata.id] = new Player(playerdata);
    }

    function interPolate() {
        if (packetsArray.length < 5) return;

        const past = 140;
        const now = Date.now();
        const renderTime = now - past;

        const t1 = packetsArray[1].timestamp;
        const t2 = packetsArray[0].timestamp;

        if (renderTime <= t2 && renderTime >= t1) {
            // total time from t1 to t2
            const total = t2 - t1;
            // how far between t1 and t2 this entity is as of 'renderTime'
            const portion = renderTime - t1;
            // fractional distance between t1 and t2
            const ratio = portion / total;

            const t1_Players = packetsArray[0].data;
            const t2_Players = packetsArray[1].data;

            t1_Players.forEach(current_player => {
                const t2_Player = t2_Players.filter(item => current_player.id === item.id)[0];
                if (!t2_Player) return;

                const interpX = lerp(t2_Player.x, current_player.x, ratio);
                const interpY = lerp(t2_Player.y, current_player.y, ratio);
                const dir = t2_Player.dir;

                const cords = { x: interpX, y: interpY };

                if (current_player.id !== player.id) {
                    editPlayerPosition(current_player, cords, dir);
                }
            });
            packetsArray.slice();
        }
    }

    function getCurrentPlayer(id) {
        return players[id];
    }

    function editPlayerPosition(current_player, cords, dir) {
        const playerSprite = getCurrentPlayer(current_player.id);
        if (!playerSprite) {
            createPlayer(current_player);
            const newPlayerSprite = getCurrentPlayer(current_player.id);
            if (newPlayerSprite.direction != dir) {
                newPlayerSprite.changeSprite(dir);
            }
            if (Math.floor(newPlayerSprite.sprite.x) == Math.floor(cords.x) && Math.floor(newPlayerSprite.sprite.y) == Math.floor(cords.y)) {
                newPlayerSprite.moving = false;
            } else {
                if (newPlayerSprite.moving == false) {
                    newPlayerSprite.moving = true;
                }
                newPlayerSprite.sprite.x = cords.x;
                newPlayerSprite.sprite.y = cords.y;
                newPlayerSprite.sprite.play();
            }
        } else {
            if (playerSprite.direction != dir) {
                playerSprite.changeSprite(dir);
            }
            if (Math.floor(playerSprite.sprite.x) == Math.floor(cords.x) && Math.floor(playerSprite.sprite.y) == Math.floor(cords.y)) {
                playerSprite.moving = false;
            } else {
                if (playerSprite.moving == false) {
                    playerSprite.moving = true;
                }
                playerSprite.sprite.x = cords.x;
                playerSprite.sprite.y = cords.y;
                playerSprite.sprite.play();
            }
        }
    }

    function sendData() {
        let data = {
            id: player.id,
            x: player.sprite.x,
            y: player.sprite.y,
            dir: player.direction
        };

        socket.emit('update user', data);
    }

    resources.sound_music_01.sound.play({
        loop: true
    });

    var player;
    socket.on('init', function (data, sprite_number) {
        player = new Player(data, sprite_number);
        // Listen for animate update
        app.ticker.add(delta => {
            interPolate();

            // Tester si la moindre touche est préssée pour tester si le joueur bouge
            let pressedKey = false;
            for (let key in listener.keys) {
                if (listener.keys[key]) {
                    pressedKey = true;
                }
            }

            if (!pressedKey) {
                if (player.moving) {
                    player.moving = false;
                }

                if (player.sprite.texture == player.sprite.textures[0] || player.sprite.texture == player.sprite.textures[2]) {
                    player.sprite.stop();
                }
            }

            Array.from(Object.values(players)).forEach(current_player => {
                if (current_player.moving == false) {
                    if (current_player.sprite.texture == current_player.sprite.textures[0] || current_player.sprite.texture == current_player.sprite.textures[2]) {
                        current_player.sprite.stop();
                    }
                }
            });

            // mouvement joueur
            listener.on(["Z", "^"], () => {
                player.move(delta, 2);
                sendData();
            });

            listener.on(["S", "V"], () => {
                player.move(delta, 0);
                sendData();
            });

            listener.on(["Q", "<"], () => {
                player.move(delta, 1);
                sendData();
            });

            listener.on(["D", ">"], () => {
                player.move(delta, 3);
                sendData();
            });
        });
    });

    socket.on('update', (data) => {
        // console.log(data);
        packetsArray.unshift(data);
    });
});

loader.onProgress.add(e => {
    console.log(Math.ceil(e.progress));
});

loader.onComplete.add(e => {
    socket.emit('finish loading');
});


app.loader.onError.add((error) => console.error(error));
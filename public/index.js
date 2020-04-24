/*

MOVE TO

*/


PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;

const app = new PIXI.Application(
    {
        width: 1080,
        height: 720,
        backgroundColor: 0xAAAAAA,
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
    const player_sprite_textures = [];

    let frame_count = 0;
    for (let y = 0; y < 4; y++) {
        for (let x = 0; x < 3; x++) {
            player_sprite_textures[frame_count] = new PIXI.Texture(resources.player_sprites_19.texture,
                new PIXI.Rectangle(x * 32, y * 32, 32, 32)
            );
            frame_count++;
        }
    }

    let player_animation_walk_front = [player_sprite_textures[1], player_sprite_textures[0], player_sprite_textures[1], player_sprite_textures[2]];
    let player_animation_walk_left = [player_sprite_textures[4], player_sprite_textures[3], player_sprite_textures[4], player_sprite_textures[5]];
    let player_animation_walk_right = [player_sprite_textures[7], player_sprite_textures[6], player_sprite_textures[7], player_sprite_textures[8]];
    let player_animation_walk_back = [player_sprite_textures[10], player_sprite_textures[9], player_sprite_textures[10], player_sprite_textures[11]];

    class Player {
        constructor(playerData) {
            this.id = playerData.id;
            this.direction = 0;
            this.moving = false;
            this.speed = 4;

            this.sprite = new PIXI.AnimatedSprite(player_animation_walk_front);
            this.sprite.x = playerData.x;
            this.sprite.y = playerData.y;
            this.sprite.animationSpeed = 0.1;
            this.sprite.anchor.set(.5);
            this.sprite.scale.x = scale;
            this.sprite.scale.y = scale;
            app.stage.addChild(this.sprite);
            // return this.sprite;
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

        changeSprite(dir = 0, anim = "walk") {
            if (dir != this.direction) {
                this.direction = dir;
                switch (this.direction) {
                    case 0:
                        this.sprite.textures = player_animation_walk_front;
                        break;

                    case 1:
                        this.sprite.textures = player_animation_walk_left;
                        break;

                    case 2:
                        this.sprite.textures = player_animation_walk_back;
                        break;

                    case 3:
                        this.sprite.textures = player_animation_walk_right;
                        break;

                    default: break;
                }
            }
        }
    }

    class Player_ghost {
        constructor(x, y) {
            this.sprite = new PIXI.Sprite(player_sprite_textures[1]);
            this.sprite.x = x;
            this.sprite.y = y;
            this.sprite.anchor.set(.5);
            return this.sprite;
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
            // key.forEach(element => {
            //     if (this.keys[element]) {
            //         fonction();
            //     }
            // })
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

    // const rect = new PIXI.Graphics();
    // rect.beginFill();
    // rect.drawRect(0, 0, app.screen.width, app.screen.height);
    // rect.endFill();
    // rect.alpha = 0;
    // app.stage.addChild(rect);

    // const ghost_players = []

    const listener = new listenKeys();

    // function dash(/*event*/) {
    //     // let pos_x = event.data.global.x;
    //     // let pos_y = event.data.global.y;
    //     let pos_x = app.renderer.plugins.interaction.mouse.global.x;
    //     let pos_y = app.renderer.plugins.interaction.mouse.global.y;
    //     let old_x = player.sprite.x;
    //     let old_y = player.sprite.y;

    //     let dist_x = Math.ceil(Math.abs(pos_x) - Math.abs(old_x));
    //     let dist_y = Math.ceil(Math.abs(pos_y) - Math.abs(old_y));
    //     let dist = Math.floor(Math.sqrt(Math.abs(Math.floor(dist_x * dist_x) - Math.floor(dist_y * dist_y))));

    //     // console.log(Math.floor(dist_x), Math.floor(dist_y), dist);

    //     player.sprite.x = pos_x;
    //     player.sprite.y = pos_y;

    //     let nbr_ghost = Math.ceil(dist / 48);

    //     if (dist > 20) {
    //         for (let x = 0; x < nbr_ghost; x++) {
    //             let ghost = new Player_ghost(old_x + ((dist_x / nbr_ghost) * x), old_y + ((dist_y / nbr_ghost) * x));
    //             ghost_players.push(ghost);
    //             app.stage.addChild(ghost);
    //         }
    //     }
    // }

    // app.stage.interactive = true;
    // app.stage.buttonMode = true;
    // app.stage.on('pointerdown', dash);

    resources.sound_music_01.sound.play({
        loop: true
    });

    var player;
    socket.on('init', function (data) {
        console.log(data);
        player = new Player(data);
        // Listen for animate update
        app.ticker.add(delta => {
            // mouvement joueur
            listener.on(["Z", "^"], () => {
                player.move(delta, 2);
            });

            listener.on(["S", "V"], () => {
                player.move(delta, 0);
            });

            listener.on(["Q", "<"], () => {
                player.move(delta, 1);
            });

            listener.on(["D", ">"], () => {
                player.move(delta, 3);
            });

            // Tester si la moindre touche est préssée pour tester si le joueur bouge
            let pressedKey = false;
            for (let key in listener.keys) {
                if (listener.keys[key]) {
                    pressedKey = true;
                }
            }

            if (!pressedKey) {
                player.moving = false;
                player.sprite.stop();
            }

            // listener.on(["Space", null], () => {
            //     dash();
            // });

            // ghost_players.forEach(ghost_player => {
            //     if (ghost_player.alpha > 0) {
            //         ghost_player.alpha -= 0.065 * delta;
            //     } else {
            //         app.stage.removeChild(ghost_player)
            //         ghost_player.destroy();
            //         ghost_players.splice(ghost_players.indexOf(ghost_player), 1);
            //     }
            // });
        });
    });
});

loader.onProgress.add(e => {
    console.log(Math.ceil(e.progress));
});

loader.onComplete.add(e => {
    socket.emit('finish loading');
});


app.loader.onError.add((error) => console.error(error));
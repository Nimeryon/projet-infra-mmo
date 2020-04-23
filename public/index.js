const app = new PIXI.Application(
    {
        width: 800,
        height: 600,
        backgroundColor: 0xAAAAAA
    }
);

const divAppScreen = document.createElement("div");
divAppScreen.className = "app-screen";
divAppScreen.appendChild(app.view);
document.querySelector(".game").appendChild(divAppScreen);

const loader = new PIXI.Loader();
loader.add('player_sprites', "sprites/spr_player_01.png");
loader.load((loader, resources) => {
    const player_sprite_textures = [];

    let frame_count = 0;
    for (let y = 0; y < 4; y++) {
        for (let x = 0; x < 3; x++) {
            player_sprite_textures[frame_count] = new PIXI.Texture(resources.player_sprites.texture,
                new PIXI.Rectangle(x * 32, y * 32, 32, 32)
            );
            frame_count++;
        }
    }

    let player_animation_front = [player_sprite_textures[0], player_sprite_textures[1], player_sprite_textures[2], player_sprite_textures[1]];
    let player_animation_left = [player_sprite_textures[3], player_sprite_textures[4], player_sprite_textures[5], player_sprite_textures[4]];
    let player_animation_right = [player_sprite_textures[6], player_sprite_textures[7], player_sprite_textures[8], player_sprite_textures[7]];
    let player_animation_back = [player_sprite_textures[9], player_sprite_textures[10], player_sprite_textures[11], player_sprite_textures[10]];

    class Player {
        constructor(x, y) {
            this.direction = 0;
            this.moving = false;

            this.sprite = new PIXI.AnimatedSprite(player_animation_front);
            this.sprite.x = x;
            this.sprite.y = y;
            this.sprite.animationSpeed = 0.2;
            this.sprite.anchor.set(.5);
            this.sprite.scale.x = 3;
            this.sprite.scale.y = 3;
            this.sprite.play();
            // return this.sprite;
        }

        moveUp(delta = 1) {
            this.sprite.y -= 4 * delta;
            if (this.direction != 2 && this.moving != true) {
                this.moving = true;
                this.direction = 2;
                this.sprite.textures = player_animation_back;
                this.sprite.play();
            }
        }

        moveDown(delta = 1) {
            this.sprite.y += 4 * delta;
            if (this.direction != 0 && this.moving != true) {
                this.moving = true;
                this.direction = 0;
                this.sprite.textures = player_animation_front;
                this.sprite.play();
            }
        }

        moveLeft(delta = 1) {
            this.sprite.x -= 4 * delta;
            if (this.direction != 1 && this.moving != true) {
                this.moving = true;
                this.direction = 1;
                this.sprite.textures = player_animation_left;
                this.sprite.play();
            }

        }

        moveRight(delta = 1) {
            this.sprite.x += 4 * delta;
            if (this.direction != 3 && this.moving != true) {
                this.moving = true;
                this.direction = 3;
                this.sprite.textures = player_animation_right;
                this.sprite.play();
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

    const player = new Player(app.screen.width / 2, app.screen.height / 2);
    app.stage.addChild(player.sprite);

    console.log(player);

    const rect = new PIXI.Graphics();
    rect.beginFill();
    rect.drawRect(0, 0, app.screen.width, app.screen.height);
    rect.endFill();
    rect.alpha = 0;
    app.stage.addChild(rect);

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

    // Listen for animate update
    app.ticker.add(delta => {
        // Tester si la moindre touche est préssée pour tester si le joueur bouge
        let pressedKey = false;
        for (let key in listener.keys) {
            if (listener.keys[key]) {
                pressedKey = true;
            }
        }

        if (pressedKey) player.moving = false;

        // mouvement joueur
        listener.on(["Z", "^"], () => {
            player.moveUp(delta);
        });

        listener.on(["S", "V"], () => {
            player.moveDown(delta);
        });

        listener.on(["Q", "<"], () => {
            player.moveLeft(delta);
        });

        listener.on(["D", ">"], () => {
            player.moveRight(delta);
        });

        listener.on(["Space", null], () => {
            dash();
        })

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

app.loader.onError.add((error) => console.error(error));
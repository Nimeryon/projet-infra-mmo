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
    const packetsArray = [];
    const players = {};

    var view_size = [1280, 720];

    var view_x = 0;
    var view_y = 0;

    class Player {
        constructor(playerData, scale) {
            this.id = playerData.id;
            this.direction = 0;
            this.moving = false;
            this.speed = 4;

            this.generateSprite(playerData.sprite_number);

            this.sprite = createAnimatedSprite(this.player_animation_walk_front, playerData.x, playerData.y, 1, 0, { x: scale, y: scale}, 0.1, false);
            this.sprite.id = playerData.id;
            this.sprite.anchor.set(.5);
            app.stage.addChild(this.sprite);
        }

        testCollisionWorld(dir) {
            switch (dir) {
                case 0:
                    return this.sprite.y + this.speed > 12 && this.sprite.y + this.speed < view_size[1] - 32;

                case 1:
                    return this.sprite.x - this.speed > 12 && this.sprite.x - this.speed < view_size[0] - 12;

                case 2:
                    return this.sprite.y - this.speed > 12 && this.sprite.y - this.speed < view_size[1] - 32;

                case 3:
                    return this.sprite.x + this.speed > 12 && this.sprite.x + this.speed < view_size[0] - 12;

                default: break;
            }
        }

        generateSprite(sprite_number) {
            let player_sprite = `player_sprites_${sprite_number}`;
            this.player_sprite_textures = generateTextures(resources[player_sprite].texture, 3, 4, 32, 32).textures;

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

            if (this.testCollisionWorld(this.direction)) {
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
        32: "Space",
        84: "T"
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
                // console.log(e.keyCode);
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
        players[playerdata.id] = new Player(playerdata, scale);
    }

    function interPolate() {
        const players_array = Array.from(Object.values(players));
        players_array.forEach(current_player => {
            if (current_player.moving == false) {
                if (current_player.sprite.texture == current_player.sprite.textures[0] || current_player.sprite.texture == current_player.sprite.textures[2]) {
                    current_player.sprite.stop();
                }
            }
        });

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
            createPlayer(current_player, scale);
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

    function generateTextures(texture, nbr_tile_x, nbr_tile_y, tile_size_x, tile_size_y) {
        let textures = [];
        let frame_count = 0;
        for (let y = 0; y < nbr_tile_y; y++) {
            for (let x = 0; x < nbr_tile_x; x++) {
                textures[frame_count] = new PIXI.Texture(texture,
                    new PIXI.Rectangle(x * tile_size_x, y * tile_size_y, tile_size_x, tile_size_y)
                );
                frame_count++;
            }
        }
        return {
            textures: textures,
            nbr_frame: frame_count
        }
    }

    function createSprite(texture, x, y, alpha = 1, angle = 0, scale = { x: 1, y: 1 }) {
        let sprite = new PIXI.Sprite(texture);
        sprite.x = x;
        sprite.y = y;
        sprite.alpha = alpha;
        sprite.angle = angle;
        sprite.scale.x = scale.x;
        sprite.scale.y = scale.y;
        return sprite;
    }

    function createAnimatedSprite(textures, x, y, alpha = 1, angle = 0, scale = { x: 1, y: 1 }, animSpeed = 1, play = true) {
        let sprite = new PIXI.AnimatedSprite(textures);
        sprite.x = x;
        sprite.y = y;
        sprite.alpha = alpha;
        sprite.angle = angle;
        sprite.scale.x = scale.x;
        sprite.scale.y = scale.y;
        sprite.animationSpeed = animSpeed;
        if (play) {
            sprite.play();
        }
        return sprite;
    }

    function generateLayer(container, tileset, scale, layer, nbr_tile_x, nbr_tile_y, tile_size_x, tile_size_y) {
        let layer_container = new PIXI.Container();
        for (let y = 0; y < nbr_tile_y; y++) {
            for (let x = 0; x < nbr_tile_x; x++) {
                let tile = layer[y][x];
                if (tile != 0) {
                    let sprite = createSprite(tileset[tile - 1], x * (tile_size_x * scale), y * (tile_size_y * scale), 1, 0, {x: scale, y: scale});
                    layer_container.addChild(sprite);
                }
            }
        }
        container.addChild(layer_container);
    }

    function generateMap(map, tileset, scale) {
        view_size = [(map.width * 32) * scale, (map.height * 32) * scale];
        let map_container = new PIXI.Container();
        generateLayer(map_container, tileset, scale, map.back_layer, map.width, map.height, 32, 32);
        generateLayer(map_container, tileset, scale, map.middle_layer, map.width, map.height, 32, 32);
        generateLayer(map_container, tileset, scale, map.decoration_layer, map.width, map.height, 32, 32);
        return map_container;
    }

    const tileset = generateTextures(resources['tileset_grass'].texture, 8, 6, 32, 32);

    const maps = {
        spawn: {
            width: 20,
            height: 14,
            back_layer: [
                [6, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 8],
                [14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 16],
                [14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 16],
                [14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 16],
                [14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 16],
                [14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 16],
                [14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 16],
                [14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 16],
                [14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 16],
                [14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 16],
                [14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 16],
                [14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 16],
                [14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 16],
                [22, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 24]
            ],
            middle_layer: [
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
            ],
            decoration_layer: [
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
            ],
            collision_layer: [
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
            ]
        }
    }

    resources.sound_music_01.sound.play({
        loop: true
    });

    var player;
    const message_input = document.querySelector(".input-message");

    socket.on('init', function (data) {
        app.stage.addChild(generateMap(maps.spawn, tileset.textures, scale));
        player = new Player(data, scale);
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

            if (document.activeElement != message_input) {
                // mouvement joueur
                listener.on(["Z", "^"], () => {
                    player.move(delta, 2);
                    sendData();
                });

                listener.on(["S", "V"], () => {
                    player.move(delta, 0);
                    sendData();0
                });

                listener.on(["Q", "<"], () => {
                    player.move(delta, 1);
                    sendData();
                });

                listener.on(["D", ">"], () => {
                    player.move(delta, 3);
                    sendData();
                });

                listener.on(["T", null], () => {
                    document.getElementsByClassName("input-message")[0].focus();
                });
                
                if (player.sprite.x + view_x > app.view.width - 32 * scale * 3) {
                    view_x = Math.max(
                        app.view.width - ((maps.spawn.width * 32) * scale),
                        app.view.width - player.sprite.x - 32 * scale * 3
                    );
                }
                if (player.sprite.x + view_x < 32 * scale * 3) {
                    view_x = Math.min(0, -player.sprite.x + 32 * scale * 3);
                }
                if (player.sprite.y + view_y > app.view.height - 32 * scale * 2) {
                    view_y = Math.max(
                        app.view.height - ((maps.spawn.height * 32) * scale),
                        app.view.height - player.sprite.y - 32 * scale * 2
                    );
                }
                if (player.sprite.y + view_y < 32 * scale * 1.5) {
                    view_y = Math.min(0, -player.sprite.y + 32 * scale * 1.5);
                }

                if (app.stage.x != view_x || app.stage.y != view_y) {
                    app.stage.x = view_x;
                    app.stage.y = view_y;
                }
            }
        });
    });

    socket.on('update', (data) => {
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
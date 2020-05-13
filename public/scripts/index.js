PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;

var app = new PIXI.Application(
    {
        width: 1080,
        height: 720,
        view: document.getElementById("app-screen"),
        backgroundColor: 0xCCD1D1
    }
);

// const renderer = PIXI.autoDetectRenderer(window.innerWidth, window.innerHeight, document.getElementById("app-screen"));
document.getElementById("app-screen").style.width = window.innerWidth + "px";
document.getElementById("app-screen").style.height = window.innerHeight + "px";

window.onresize = function (event) {
    let w = window.innerWidth;
    let h = window.innerHeight;

    document.getElementById("app-screen").style.width = w + "px";
    document.getElementById("app-screen").style.height = h + "px";
}

const scale = 3;

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
// Chargement sprites armes
loader.add('weapon_sprites_01', "sprites/weapons/spr_weapon_01.png");
loader.add('weapon_sprites_02', "sprites/weapons/spr_weapon_02.png");
// Chargement sons
loader.add('sound_music_01', "sounds/red_carpet_wooden_floor.mp3");
loader.add('sound_shoot', "sounds/shoot.mp3");
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
    // Global var
    var setFullScreen = false;
    var current_player = null;
    var player_list = [];
    var bullet_list = [];
    var maps = $.getJSON("models/maps.json", function (data) {
        maps = data;
    });
    var layers = null;
    var map_layer = null;
    var view_x = 0;
    var view_y = 0;
    var keyMap = {
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

    // Class
    class Entity {
        constructor(id, parent_id, x, y, map) {
            this.id = id;
            this.parent_id = parent_id;
            this.x = x;
            this.y = y;
            this.map = map;
        }
    }

    class Player extends Entity {
        constructor(id, parent_id, pseudo, x, y, scale, hp, maxHP, score, sprite_number, map) {
            super(id, parent_id, x, y, map);

            this.scale = scale;

            this.hp = hp;
            this.maxHP = maxHP

            this.hp_text = new PIXI.Text(`HP : ${this.hp}`, { fontSize: 14 });
            this.hp_text.x = this.x - (16 * this.scale / 2);
            this.hp_text.y = this.y - (24 * this.scale);
            // app.stage.addChild(this.hp_text);

            this.score = score;

            this.pseudo = pseudo;
            this.generateSprite(sprite_number);

            this.sprite = createAnimatedSprite(this.player_animation_walk_front, x, y, 1, 0, { x: this.scale, y: this.scale }, 0.1, false);
            this.sprite.id = id;
            this.sprite.anchor.set(.5);

            // app.stage.addChild(this.sprite);
            player_list[id] = this;
        }

        update(x, y, hp, moving, direction) {
            this.x = x;
            this.y = y;

            this.sprite.x = this.x;
            this.sprite.y = this.y;
            this.sprite.zIndex = this.y;

            this.updateHP(hp, this.x, this.y);
            this.updateSprite(moving, direction);
        }

        updateHP(hp, x, y) {
            if (this.hp != hp) {
                this.hp = hp;
                this.hp_text.text = `HP : ${this.hp}`;
            }

            this.hp_text.x = x - (16 * this.scale / 2);
            this.hp_text.y = y - (24 * this.scale);
        }

        updateSprite(moving, direction) {
            if (this.direction != direction) {
                this.direction = direction;
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

            if (moving) {
                this.moving = true;
                this.sprite.play();
            }
            else {
                this.moving = false;
                this.sprite.stop();
                this.sprite.texture = this.sprite.textures[0];
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

        die() {
            this.sprite.destroy();
            this.hp_text.destroy();
            delete player_list[this.id];
        }
    }

    class Bullet extends Entity {
        constructor(id, parent_id, x, y, scale, angle, map) {
            super(id, parent_id, x, y, map);

            this.sprite = createSprite(resources.weapon_sprites_02.texture, x, y, 1, angle + 45, { x: scale, y: scale });
            this.sprite.id = id;
            this.sprite.anchor.set(0.5);

            bullet_list[id] = this;
        }

        update(x, y) {
            this.x = x;
            this.y = y;

            this.sprite.x = this.x;
            this.sprite.y = this.y;
            this.sprite.zIndex = this.y;
        }

        die() {
            this.sprite.destroy();
            delete bullet_list[this.id];
        }
    }

    // Function
    function testActiveChat() {
        let message_input = document.getElementById("input-message");
        return document.activeElement != message_input;
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

    function updateCurrentPlayerScore(score) {
        if (current_player.score != score) {
            current_player.score = score;
            current_player.score_text.text = `Score : ${current_player.score}`;
        }
    }

    function updateCurrentMap(map) {
        current_player.map = map;
        changeMapLayer(maps[map], tileset.textures, scale);
        for (let i in player_list) {
            player_list[i].die();
        }

        for (let i in bullet_list) {
            bullet_list[i].die();
        }
    }

    function generateLayer(container, tileset, scale, layer, nbr_tile_x, nbr_tile_y, tile_size_x, tile_size_y) {
        let layer_container = new PIXI.Container();
        for (let y = 0; y < nbr_tile_y; y++) {
            for (let x = 0; x < nbr_tile_x; x++) {
                let tile = layer[y][x];
                if (tile != 0) {
                    let sprite = createSprite(tileset[tile - 1], x * (tile_size_x * scale), y * (tile_size_y * scale), 1, 0, { x: scale, y: scale });
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
        return map_container;
    }

    function changeMapLayer(map, tileset, scale) {
        if (map_layer != null) {
            map_layer.destroy();
        }
        map_layer = generateMap(map, tileset, scale);
        map_layer.zIndex = 0;
        layers.addChild(map_layer);
    }

    const tileset = generateTextures(resources['tileset_grass'].texture, 8, 12, 32, 32);

    socket.on('init', function (player) {
        layers = new PIXI.Container();
        layers.sortableChildren = true;
        app.stage.addChild(layers);
        changeMapLayer(maps[player.map], tileset.textures, scale);
        let bullet_layer = new PIXI.Container();
        bullet_layer.sortableChildren = true;
        bullet_layer.zIndex = 1;
        layers.addChild(bullet_layer);
        let player_layer = new PIXI.Container();
        player_layer.sortableChildren = true;
        player_layer.zIndex = 2;
        layers.addChild(player_layer);
        let UI_layer = new PIXI.Container();
        UI_layer.zIndex = 3;
        layers.addChild(UI_layer);

        // Current player
        current_player = player;
        current_player.score_text = new PIXI.Text(`Score : ${current_player.score}`, { fontSize: 24 });
        current_player.score_text.x = 20;
        current_player.score_text.y = 20;
        UI_layer.addChild(current_player.score_text);

        socket.on('update', function (packet) {
            // Joueur
            for (var i = 0; i < packet.players.length; i++) {
                let player = packet.players[i];
                if (current_player.id == player.id) {
                    current_player.x = player.x;
                    current_player.y = player.y;
                    current_player.hp = player.hp;
                    current_player.direction = player.direction;
                    current_player.moving = player.moving;
                    if (current_player.map != player.map) {
                        updateCurrentMap(player.map);
                    }
                    updateCurrentPlayerScore(player.score);

                    if (current_player.x + view_x > app.view.width - 32 * scale * 3) {
                        view_x = Math.max(
                            app.view.width - ((maps.spawn.width * 32) * scale),
                            app.view.width - current_player.x - 32 * scale * 3
                        );
                    }
                    if (current_player.x + view_x < 32 * scale * 3) {
                        view_x = Math.min(0, -current_player.x + 32 * scale * 3);
                    }
                    if (current_player.y + view_y > app.view.height - 32 * scale * 2) {
                        view_y = Math.max(
                            app.view.height - ((maps.spawn.height * 32) * scale),
                            app.view.height - current_player.y - 32 * scale * 2
                        );
                    }
                    if (current_player.y + view_y < 32 * scale * 1.5) {
                        view_y = Math.min(0, -current_player.y + 32 * scale * 1.5);
                    }

                    if (app.stage.x != view_x || app.stage.y != view_y) {
                        app.stage.x = view_x;
                        UI_layer.x = -view_x;
                        app.stage.y = view_y;
                        UI_layer.y = -view_y;
                    }
                }

                if (player.map == current_player.map) {
                    if (!player_list[player.id]) {
                        new Player(player.id, null, player.pseudo, player.x, player.y, scale, player.hp, player.maxHP, player.score, player.sprite_number, player.moving, player.direction, player.map);
                        player_layer.addChild(player_list[player.id].sprite);
                        player_layer.addChild(player_list[player.id].hp_text);
                    }
                    else {
                        player_list[player.id].update(player.x, player.y, player.hp, player.moving, player.direction);
                    }
                }
                else {
                    if (player_list[player.id]) {
                        player_list[player.id].die();
                    }
                }
            }

            // Supprimer les joueurs déconnecté ou qui ont changé de map
            for (let player_id in player_list) {
                let find = false;
                for (let i = 0; i < packet.players.length; i++) {
                    if (player_list[player_id].id == packet.players[i].id) {
                        find = true;
                    }
                }
                if (!find) {
                    player_list[player_id].die();
                }
            }

            // Bullet
            for (var i = 0; i < packet.bullets.length; i++) {
                let bullet = packet.bullets[i];
                if (bullet.map == current_player.map) {
                    if (!bullet_list[bullet.id]) {
                        new Bullet(bullet.id, bullet.parent_id, bullet.x, bullet.y, scale, bullet.angle, bullet.map);
                        bullet_layer.addChild(bullet_list[bullet.id].sprite);
                        // resources.sound_shoot.sound.play();
                    }
                    else {
                        bullet_list[bullet.id].update(bullet.x, bullet.y);
                    }
                }
            }

            // Supprimer les balles supprimé
            for (let bullet_id in bullet_list) {
                let find = false;
                for (let i = 0; i < packet.bullets.length; i++) {
                    if (bullet_list[bullet_id].id == packet.bullets[i].id) {
                        find = true;
                    }
                }
                if (!find) {
                    bullet_list[bullet_id].die();
                }
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

                if (keyMap[e.keyCode] == "Enter") {
                    if (!setFullScreen) {
                        if (document.documentElement.requestFullscreen) {
                            document.documentElement.requestFullscreen();
                        } else if (document.documentElement.mozRequestFullScreen) {
                            document.documentElement.mozRequestFullScreen();
                        } else if (document.documentElement.webkitRequestFullscreen) {
                            document.documentElement.webkitRequestFullscreen();
                        } else if (document.documentElement.msRequestFullscreen) {
                            document.documentElement.msRequestFullscreen();
                        }
                        setFullScreen = true;
                    }
                    else {
                        if (document.exitFullscreen) {
                            document.exitFullscreen();
                        } else if (document.mozCancelFullScreen) {
                            document.mozCancelFullScreen();
                        } else if (document.webkitExitFullscreen) {
                            document.webkitExitFullscreen();
                        } else if (document.msExitFullscreen) {
                            document.msExitFullscreen();
                        }
                        setFullScreen = false;
                    }
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
                if (testActiveChat()) {
                    document.getElementById("input-message").focus();
                }
            }
        }

        document.onmousedown = function (e) {
            if (testActiveChat()) {
                socket.emit('input', { key: 'shoot', state: true });
            }
        }

        document.ontouchstart = function (e) {
            if (!setFullScreen) {
                if (document.documentElement.requestFullscreen) {
                    document.documentElement.requestFullscreen();
                } else if (document.documentElement.mozRequestFullScreen) {
                    document.documentElement.mozRequestFullScreen();
                } else if (document.documentElement.webkitRequestFullscreen) {
                    document.documentElement.webkitRequestFullscreen();
                } else if (document.documentElement.msRequestFullscreen) {
                    document.documentElement.msRequestFullscreen();
                }
                setFullScreen = true;
            }
            else {
                if (document.exitFullscreen) {
                    document.exitFullscreen();
                } else if (document.mozCancelFullScreen) {
                    document.mozCancelFullScreen();
                } else if (document.webkitExitFullscreen) {
                    document.webkitExitFullscreen();
                } else if (document.msExitFullscreen) {
                    document.msExitFullscreen();
                }
                setFullScreen = false;
            }
        }

        document.onmouseup = function (e) {
            socket.emit('input', { key: 'shoot', state: false });
        }

        document.getElementById("change-map").onclick = function (e) {
            socket.emit('change-map');
        }

        var mouseAngleInterval = setInterval(function () {
            let mousePos = app.renderer.plugins.interaction.mouse.global;
            var x = (-current_player.x + mousePos.x) - view_x;
            var y = (-current_player.y + mousePos.y) - view_y;

            var angle = Math.atan2(y, x) / Math.PI * 180;
            socket.emit('input', { key: 'mouseAngle', state: angle });
        }, 1000 / 30);
    });
});

loader.onProgress.add(e => {
    // console.log(Math.ceil(e.progress));
    document.getElementById("loading-percentage").innerText = `${Math.ceil(e.progress)}%`
});

loader.onComplete.add(e => {
    $(".loader-wrapper").fadeOut("slow");
});

app.loader.onError.add((error) => console.error(error));
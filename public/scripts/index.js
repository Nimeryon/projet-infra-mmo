PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;

var ratio = 1080 / 720;

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

    let view_ratio_x = 1080 / w;
    let view_ratio_y = 720 / h;
    app.view.width = w * view_ratio_x;
    app.view.height = h * view_ratio_y;
}

// Custom cursor
app.renderer.plugins.interaction.cursorStyles.default = "url('sprites/ui/cursor.png'), auto";

const loader = new PIXI.Loader();
// Chargement sprites joueur
// Custom character builder
// Body
for (let color = 1; color < 11; color++) {
    loader.add(`player_sprite_body_male_${String(color).padStart(2, '0')}`, `sprites/players/bodyparts/male/body_${String(color).padStart(2, '0')}.png`);
    loader.add(`player_sprite_body_female_${String(color).padStart(2, '0')}`, `sprites/players/bodyparts/female/body_${String(color).padStart(2, '0')}.png`);
    // Oreilles
    loader.add(`player_sprite_ear_${String(color).padStart(2, '0')}`, `sprites/players/bodyparts/ears/ears_${String(color).padStart(2, '0')}.png`);
}
// Hair / Backhair male
for (let color = 0; color < 18; color++) {
    loader.add(`player_sprite_male_beard_${color}`, `sprites/players/bodyparts/male/beard/beard_0.png`);
    loader.add(`player_sprite_male_hair_${color}`, `sprites/players/bodyparts/male/hair/male_hair_${color}.png`);
    loader.add(`player_sprite_male_backhair_${color}`, `sprites/players/bodyparts/male/backhair/male_backhair_${color}.png`);
    loader.add(`player_sprite_female_hair_${color}`, `sprites/players/bodyparts/female/hair/female_hair_${color}.png`);
    loader.add(`player_sprite_female_backhair_${color}`, `sprites/players/bodyparts/female/backhair/female_backhair_${color}.png`);
}
// Marque faciales
for (let type = 1; type < 12; type++) {
    loader.add(`player_sprite_facialmark_${String(type).padStart(2, '0')}`, `sprites/players/bodyparts/facialmark/facialmark_${String(type).padStart(2, '0')}.png`);
}
// Oreilles spéciales et queue
for (let type = 0; type < 6; type++) {
    loader.add(`player_sprite_tail_${type}`, `sprites/players/bodyparts/tail/tail_${type}.png`);
}
for (let type = 0; type < 11; type++) {
    loader.add(`player_sprite_beastears_${type}`, `sprites/players/bodyparts/beastears/beastears_${type}.png`);
}
// Shadow
loader.add('player_sprite_shadow', "sprites/players/bodyparts/shadow.png");
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
// Chargement ui
loader.add('ui_menu_elements', "sprites/ui/menu_element.png");
loader.add('ui_frame_elements', "sprites/ui/frame.png");
loader.add('ui_empty_frame_elements', "sprites/ui/frame_empty.png");
loader.add('ui_button_icon_elements', "sprites/ui/button_icon.png");
loader.add('ui_inventory_slots', "sprites/ui/inventory_slot.png");
loader.add('ui_inventory_slots_2', "sprites/ui/inventory_slot_2.png");
loader.add('ui_inventory_icons', "sprites/ui/inventory_icon.png");
loader.add('ui_button_ring', "sprites/ui/button_ring_ui.png");
loader.add('ui_button', "sprites/ui/button_ui.png");
loader.add('ui_checkbox', "sprites/ui/checkbox.png");
loader.add('ui_slider_parts', "sprites/ui/slider_parts.png");
loader.add('ui_slider_head', "sprites/ui/slider_head.png");
// Chargement item
loader.add('items', "sprites/icons/item.png");
loader.add('items_2', "sprites/icons/item_2.png");
// Chargement particules
loader.add('particle', "sprites/particles/particle.png");
loader.add('particle_square', "sprites/particles/particle_square.png");
// Chargement monstre
loader.add('monster', "sprites/monsters/monsters.png");
// Execution
loader.load((loader, resources) => {
    // Global var
    var scale = 3;
    var tile_size = 32;
    var canDoThings = true;
    var pointer_clicked = false;
    var setFullScreen = false;
    var pressingRight = false;
    var pressingLeft = false;
    var pressingUp = false;
    var pressingDown = false;
    var pressingAttack = false;
    var current_player = null;
    var canShoot = true;
    var player_list = [];
    var bullet_list = [];
    var monster_list = [];
    var inventory_slots = [];
    var equipment_slots = [];
    var maps;
    $.ajax({
        async: false,
        url: "models/maps.json",
        success: function (data) {
            maps = data;
        }
    });
    var particles_weapon;
    $.ajax({
        async: false,
        url: "particles/weapon_break.json",
        success: function (data) {
            particles_weapon = data;
        }
    });
    var particles_walk;
    $.ajax({
        async: false,
        url: "particles/player_walk.json",
        success: function (data) {
            particles_walk = data;
        }
    });
    var layers, bullet_layer, player_layer, ui_layer, ui_inventory, inventory_container, character_generator_layer, player_particle_layer, bullet_particle_layer, equipment_container, ui_options, mobile_controll_layer, map_layer = null;
    var camera = {
        view_x: 0,
        view_y: 0
    }
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
        69: "E",
        84: "T",
        79: "O",
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
        constructor(id, parent_id, pseudo, x, y, scale, hp, maxHP, score, map, playerbodyparts) {
            super(id, parent_id, x, y, map);

            this.scale = scale;

            this.hp = hp;
            this.maxHP = maxHP;

            this.hp_text = new PIXI.Text(`HP : ${this.hp}`, { fontSize: 14 });
            this.hp_text.x = this.x - (16 * this.scale / 2);
            this.hp_text.y = this.y - (24 * this.scale);
            this.score = score;

            this.canBreath = true;
            this.breathTimer = 0;
            this.timeBreath = 300 + Math.floor(Math.random() * 300);
            this.breathing = 1;
            this.breathingIn = true;

            this.emitter = new PIXI.particles.Emitter(
                player_particle_layer,
                [resources.particle_square.texture],
                particles_walk
            );
            this.emitter.autoUpdate = true;

            this.pseudo = pseudo;
            this.bodyparts = playerbodyparts;
            this.generateSprite(this.bodyparts);

            this.character_container = new PIXI.Container();
            this.character_container.sortableChildren = true;
            this.shadow = createAnimatedSprite([PIXI.Texture.EMPTY], 0, 4, 1, 0, { x: 2, y: 2 }, 0.1, false);
            this.shadow.anchor.set(0.5);
            this.tail = createAnimatedSprite([PIXI.Texture.EMPTY], 0, 0, 1, 0, { x: 2, y: 2 }, 0.1, false);
            this.tail.anchor.set(0.5);
            this.body = createAnimatedSprite([PIXI.Texture.EMPTY], 0, 0, 1, 0, { x: 2, y: 2 }, 0.1, false);
            this.body.anchor.set(0.5);
            this.backhair = createAnimatedSprite([PIXI.Texture.EMPTY], 0, 0, 1, 0, { x: 2, y: 2 }, 0.1, false);
            this.backhair.anchor.set(0.5);
            this.ears = createAnimatedSprite([PIXI.Texture.EMPTY], 0, 0, 1, 0, { x: 2, y: 2 }, 0.1, false);
            this.ears.anchor.set(0.5);
            this.facialmark = createAnimatedSprite([PIXI.Texture.EMPTY], 0, 0, 1, 0, { x: 2, y: 2 }, 0.1, false);
            this.facialmark.anchor.set(0.5);
            this.beard = createAnimatedSprite([PIXI.Texture.EMPTY], 0, 0, 1, 0, { x: 2, y: 2 }, 0.1, false);
            this.beard.anchor.set(0.5);
            this.beastears = createAnimatedSprite([PIXI.Texture.EMPTY], 0, 0, 1, 0, { x: 2, y: 2 }, 0.1, false);
            this.beastears.anchor.set(0.5);
            this.hair = createAnimatedSprite([PIXI.Texture.EMPTY], 0, 0, 1, 0, { x: 2, y: 2 }, 0.1, false);
            this.hair.anchor.set(0.5);
            this.shadow.zIndex = 0;
            this.tail.zIndex = 1;
            this.body.zIndex = 2;
            this.backhair.zIndex = 3;
            this.ears.zIndex = 4;
            this.facialmark.zIndex = 5;
            this.beard.zIndex = 6;
            this.beastears.zIndex = 7;
            this.hair.zIndex = 8;
            this.character_container.addChild(this.shadow);
            this.character_container.addChild(this.tail);
            this.character_container.addChild(this.body);
            this.character_container.addChild(this.backhair);
            this.character_container.addChild(this.ears);
            this.character_container.addChild(this.facialmark);
            this.character_container.addChild(this.beard);
            this.character_container.addChild(this.beastears);
            this.character_container.addChild(this.hair);

            player_list[id] = this;
        }

        breath(deltaTime) {
            if (this.canBreath == false && this.breathTimer++ > this.timeBreath * deltaTime) {
                this.canBreath = true;
                this.breathTimer = 0;
            }

            if (this.canBreath) {
                if (this.breathingIn) {
                    this.breathing -= 0.01;
                    this.character_container.scale.y -= 0.0010 * deltaTime;
                    this.character_container.scale.x += 0.0005 * deltaTime;
                    if (this.breathing <= 0) {
                        this.breathingIn = false;
                    }
                }
                else {
                    this.breathing += 0.01;
                    this.character_container.scale.y += 0.0010 * deltaTime;
                    this.character_container.scale.x -= 0.0005 * deltaTime;
                    if (this.breathing >= 1) {
                        this.timeBreath = 300 + Math.floor(Math.random() * 300);
                        this.canBreath = false;
                        this.breathingIn = true;
                    }
                }
            }

        }

        update(x, y, hp, moving, direction, playerbodyparts) {
            this.x = x;
            this.y = y;

            this.character_container.x = this.x;
            this.character_container.y = this.y;
            this.character_container.zIndex = this.y + (this.character_container.getBounds().height / 2);

            this.updateHP(hp, this.x, this.y);
            this.updateSprite(moving, direction, playerbodyparts);

            if (this.moving) {
                this.emitter.updateSpawnPos(this.x - 8, this.y + 32);
                if (!this.emitter.emit) {
                    this.emitter.emit = true;
                }
            }
            else {
                if (this.emitter.emit) {
                    this.emitter.emit = false;
                }
            }
        }

        updateHP(hp, x, y) {
            if (this.hp != hp) {
                this.hp = hp;
                this.hp_text.text = `HP : ${this.hp}`;
            }

            this.hp_text.x = x - (16 * this.scale / 2);
            this.hp_text.y = y - (24 * this.scale);
            this.hp_text.zIndex = y - (24 * this.scale);
        }

        updateSprite(moving, direction, playerbodyparts) {
            if (this.bodyparts != playerbodyparts) {
                this.bodyparts = playerbodyparts;
                this.generateSprite(playerbodyparts);
            }
            if (this.direction != direction) {
                this.direction = direction;
                let spritedirection = this.direction == 0 || this.direction == 2 ? this.direction : this.direction == 1 ? 3 : 1;
                this.shadow.textures = this.player_sprite_textures.shadow[direction];
                this.tail.textures = this.player_sprite_textures.tail[spritedirection];
                this.body.textures = this.player_sprite_textures.body[spritedirection];
                this.backhair.textures = this.player_sprite_textures.backhair[spritedirection];
                this.ears.textures = this.player_sprite_textures.ears[spritedirection];
                this.facialmark.textures = this.player_sprite_textures.facialmark[spritedirection];
                this.beard.textures = this.player_sprite_textures.beard[spritedirection];
                this.beastears.textures = this.player_sprite_textures.beastears[spritedirection];
                this.hair.textures = this.player_sprite_textures.hair[spritedirection];
                if (this.direction != 2) {
                    this.shadow.zIndex = 0;
                    this.tail.zIndex = 1;
                    this.body.zIndex = 2;
                    this.backhair.zIndex = 3;
                    this.ears.zIndex = 4;
                    this.facialmark.zIndex = 5;
                    this.beard.zIndex = 6;
                    this.beastears.zIndex = 7;
                    this.hair.zIndex = 8;
                }
                else {
                    this.shadow.zIndex = 0;
                    this.tail.zIndex = 8;
                    this.body.zIndex = 5;
                    this.backhair.zIndex = 7;
                    this.ears.zIndex = 4;
                    this.facialmark.zIndex = 3;
                    this.beard.zIndex = 2;
                    this.beastears.zIndex = 6;
                    this.hair.zIndex = 1;
                }
            }

            if (moving) {
                this.moving = true;
                this.play();
            }
            else {
                this.moving = false;
                this.stop();
            }
        }

        generateSprite(playerbodyparts) {
            this.player_sprite_textures = generateCharacter(playerbodyparts);
        }

        play() {
            this.shadow.play();
            this.tail.play();
            this.body.play();
            this.backhair.play();
            this.ears.play();
            this.facialmark.play();
            this.beard.play();
            this.beastears.play();
            this.hair.play();
        }

        stop() {
            this.shadow.stop();
            this.tail.stop();
            this.body.stop();
            this.backhair.stop();
            this.ears.stop();
            this.facialmark.stop();
            this.beard.stop();
            this.beastears.stop();
            this.hair.stop();
            let spritedirection = this.direction == 0 || this.direction == 2 ? this.direction : this.direction == 1 ? 3 : 1;
            this.shadow.texture = this.player_sprite_textures.shadow[spritedirection][0];
            this.tail.texture = this.player_sprite_textures.tail[spritedirection][0];
            this.body.texture = this.player_sprite_textures.body[spritedirection][0];
            this.backhair.texture = this.player_sprite_textures.backhair[spritedirection][0];
            this.ears.texture = this.player_sprite_textures.ears[spritedirection][0];
            this.facialmark.texture = this.player_sprite_textures.facialmark[spritedirection][0];
            this.beard.texture = this.player_sprite_textures.beard[spritedirection][0];
            this.beastears.texture = this.player_sprite_textures.beastears[spritedirection][0];
            this.hair.texture = this.player_sprite_textures.hair[spritedirection][0];
        }

        die() {
            this.character_container.destroy();
            this.hp_text.destroy();
            delete player_list[this.id];
        }
    }

    class Bullet extends Entity {
        constructor(id, parent_id, x, y, scale, angle, map, emitter) {
            super(id, parent_id, x, y, map);

            this.sprite = createSprite(resources.weapon_sprites_02.texture, x, y, 1, angle + 45, { x: scale, y: scale });
            this.sprite.anchor.set(0.5);

            this.emitter = new PIXI.particles.Emitter(
                bullet_particle_layer,
                [resources.particle.texture],
                particles_weapon
            );

            bullet_list[id] = this;
        }

        update(x, y) {
            this.x = x;
            this.y = y;

            this.sprite.x = this.x;
            this.sprite.y = this.y;
            this.sprite.zIndex = this.y;
        }

        die(explode = true) {
            if (explode) {
                this.emitter.updateSpawnPos(this.x, this.y);
                this.emitter.playOnceAndDestroy();
            }
            this.sprite.destroy();
            delete bullet_list[this.id];
        }
    }

    class Monster extends Entity {
        constructor(id, x, y, hp, scale, direction, map) {
            super(id, null, x, y, map);

            this.createSprite();
            this.direction = direction;
            this.sprite = createAnimatedSprite(this.textures[this.direction], x, y, 1, 0, { x: 2, y: 2 }, 0.1, false);
            this.sprite.anchor.set(0.5);
            this.shadow = createAnimatedSprite(this.texture_shadow[this.direction], x, y, 1, 0, { x: 2, y: 2 }, 0.1, false);
            this.shadow.anchor.set(0.5);
            this.shadow.zIndex = 0;

            this.scale = scale;

            this.hp = hp;
            this.hp_text = new PIXI.Text(`HP : ${this.hp}`, { fontSize: 14 });
            this.hp_text.x = this.x - (16 * this.scale / 2);
            this.hp_text.y = this.y - (24 * this.scale);

            this.moving = false;

            monster_list[id] = this;
        }

        createSprite() {
            let monster_textures = generateTextures(resources['monster'].texture, 3, 4, 48, 48, 144 * Math.floor(Math.random() * 14), 0).textures;

            this.textures = [
                [monster_textures[1], monster_textures[0], monster_textures[1], monster_textures[2]],
                [monster_textures[4], monster_textures[3], monster_textures[4], monster_textures[5]],
                [monster_textures[7], monster_textures[6], monster_textures[7], monster_textures[8]],
                [monster_textures[10], monster_textures[9], monster_textures[10], monster_textures[11]]
            ];

            let shadow_texture = generateTextures(resources['player_sprite_shadow'].texture, 3, 4, 48, 48).textures;
            this.texture_shadow = [
                [shadow_texture[1], shadow_texture[0], shadow_texture[1], shadow_texture[2]],
                [shadow_texture[7], shadow_texture[6], shadow_texture[7], shadow_texture[8]],
                [shadow_texture[10], shadow_texture[9], shadow_texture[10], shadow_texture[11]],
                [shadow_texture[4], shadow_texture[3], shadow_texture[4], shadow_texture[5]]
            ];
        }

        update(x, y, hp, direction, moving) {
            this.x = x;
            this.y = y;

            this.updateHP(hp, this.x, this.y);

            this.sprite.x = this.x;
            this.sprite.y = this.y;
            this.shadow.x = this.x;
            this.shadow.y = this.y;
            this.sprite.zIndex = this.y + (this.sprite.getBounds().height / 2);

            if (this.direction != direction) {
                this.direction = direction;
                this.sprite.textures = this.textures[this.direction];
                this.shadow.textures = this.texture_shadow[this.direction];
            }

            if (moving) {
                this.moving = true;
                if (!this.sprite.playing || !this.shadow.playing) {
                    this.sprite.play();
                    this.shadow.play();
                }
            }
            else {
                this.moving = false;
                if (this.sprite.playing || this.shadow.playing) {
                    this.sprite.stop();
                    this.shadow.play();
                }
            }
        }

        updateHP(hp, x, y) {
            if (this.hp != hp) {
                this.hp = hp;
                this.hp_text.text = `HP : ${this.hp}`;
            }

            this.hp_text.x = x - (16 * this.scale / 2);
            this.hp_text.y = y - (24 * this.scale);
            this.hp_text.zIndex = y - (24 * this.scale);
        }

        die() {
            this.sprite.destroy();
            this.shadow.destroy();
            this.hp_text.destroy();
            delete monster_list[this.id];
        }
    }

    class Text {
        constructor(x, y, text, fontSize, anchor = { x: 0.5, y: 0.5 }) {
            this.text = new PIXI.Text(text, {
                fill: "white",
                fontFamily: "Verdana",
                fontSize: fontSize,
                fontVariant: "small-caps",
                lineJoin: "bevel",
                strokeThickness: 2.5
            });
            this.text.x = x;
            this.text.y = y;
            this.text.anchor.set(anchor.x, anchor.y);
        }
    }

    class SliderHorizontal {
        constructor(x, y, width, min, max, step, value, color, cmdover = null, cmdout = null, cmddown = null, cmdup = null, cmdchange = null) {
            var instance = this;
            this.cmdchange = cmdchange;
            this.minX = -(24 * width / 2 - 31);
            this.maxX = 24 * width / 2 - 31;
            this.range = 2 * this.maxX;
            this.min = min;
            this.max = max;
            this.valueRange = this.max - this.min;
            this.value = value;
            this.step = step;
            this.container = new PIXI.Container();
            this.container.zIndex = 5;
            this.container.interactive = true;
            this.container.buttonMode = true;
            this.container.cursor = "default";
            this.container.sortableChildren = true;
            this.container.x = x;
            this.container.y = y;
            this.container.on('pointerover', function (e) {
                if (cmdover != null) {
                    cmdover();
                }
            });
            this.container.on('pointerout', function (e) {
                if (cmdout != null) {
                    cmdout();
                }
            });
            this.container.on('pointerdown', function (e) {
                instance.clicked = true;
                if (cmddown != null) {
                    cmddown();
                }
            });
            this.container.on('pointerup', function (e) {
                if (instance.clicked) {
                    const newPosition = e.data.getLocalPosition(instance.container);
                    if (newPosition.x > instance.minX && newPosition.x < instance.maxX) {
                        instance.head.x = newPosition.x;
                        instance.value = instance.min + Math.floor(instance.valueRange * (((100 / instance.range * instance.head.x) / 100) + 0.5) + 0.5);
                    }
                    instance.change();
                    if (cmdup != null) {
                        cmdup();
                    }
                }
                instance.clicked = false;
            });
            this.container.on('pointerupoutside', function () {
                instance.clicked = false;
            });
            this.bgs = [];
            for (let i = 0; i < width; i++) {
                if (i == 0) {
                    this.bgs[i] = createSprite(ui_slider_parts.textures[1], (24 * i) - (24 * width / 2 - 12), 0, 1, 0, { x: 1, y: 1 });
                    this.bgs[i].anchor.set(0.5);
                    this.container.addChild(this.bgs[i]);

                    this.minusButton = new MiniButton((24 * i) - (24 * width / 2 - 12) + 4, 0, color, button_icons.textures[13], null, null, null, function () {
                        if (instance.value - instance.step > instance.min) {
                            instance.value -= instance.step;
                        }
                        else {
                            instance.value = instance.min;
                        }
                        instance.head.x = instance.range * ((100 / instance.valueRange * (instance.value - instance.min)) / 100) - instance.maxX;
                        instance.change();
                    }, "", false);
                    this.container.addChild(this.minusButton.container);
                }
                else if (i == width - 1) {
                    this.bgs[i] = createSprite(ui_slider_parts.textures[5], (24 * i) - (24 * width / 2 - 12), 0, 1, 0, { x: 1, y: 1 });
                    this.bgs[i].anchor.set(0.5);
                    this.container.addChild(this.bgs[i]);

                    this.plusButton = new MiniButton((24 * i) - (24 * width / 2 - 12) + 4, 0, color, button_icons.textures[12], null, null, null, function () {
                        if (instance.value + instance.step < instance.max) {
                            instance.value += instance.step;
                        }
                        else {
                            instance.value = instance.max;
                        }
                        instance.head.x = instance.range * ((100 / instance.valueRange * (instance.value - instance.min)) / 100) - instance.maxX;
                        instance.change();
                    }, "", false);
                    this.container.addChild(this.plusButton.container);
                }
                else {
                    this.bgs[i] = createSprite(ui_slider_parts.textures[3], (24 * i) - (24 * width / 2 - 12), 0, 1, 0, { x: 1, y: 1 });
                    this.bgs[i].anchor.set(0.5);
                    this.container.addChild(this.bgs[i]);
                }
            }
            this.head = createSprite(ui_slider_head.textures[0], this.range * ((100 / this.valueRange * (this.value - this.min)) / 100) - this.maxX, 0, 1, -90, { x: 1.1, y: 1.1 });
            this.head.anchor.set(0.5);
            this.head.interactive = true;
            this.head.buttonMode = true;
            this.head.cursor = "default";
            this.head.on('pointerdown', function (e) {
                instance.clicked = true;
                instance.data = e.data;
                instance.dragged = true;
            });
            this.head.on('pointermove', function () {
                if (instance.dragged) {
                    let old_value = instance.value;
                    const newPosition = instance.data.getLocalPosition(instance.head.parent);
                    if (newPosition.x > instance.maxX) {
                        instance.head.x = instance.maxX;
                    }
                    else if (newPosition.x < instance.minX) {
                        instance.head.x = instance.minX;
                    }
                    else {
                        instance.head.x = newPosition.x;
                    }
                    instance.value = instance.min + Math.floor(instance.valueRange * (((100 / instance.range * instance.head.x) / 100) + 0.5) + 0.5);
                    if (old_value != instance.value) {
                        instance.change();
                    }
                }
            });
            this.head.on('pointerup', function () {
                if (instance.clicked) {
                    instance.data = null;
                    instance.dragged = false;
                }
                instance.clicked = false;
            });
            this.head.on('pointerupoutside', function () {
                instance.data = null;
                instance.dragged = false;
                instance.clicked = false;
            });
            this.head.on('pointerover', function () {
                instance.head.scale.x = 1.2;
                instance.head.scale.y = 1.2;
            });
            this.head.on('pointerout', function () {
                instance.head.scale.x = 1.1;
                instance.head.scale.y = 1.1;
            });
            this.container.addChild(this.head);
        }

        change() {
            if (this.cmdchange != null) {
                this.cmdchange(this.value);
            }
        }
    }

    class SliderVertical {
        constructor(x, y, height, min, max, step, value, color, cmdover = null, cmdout = null, cmddown = null, cmdup = null, cmdchange = null) {
            var instance = this;
            this.cmdchange = cmdchange;
            this.minY = -(24 * height / 2 - 31);
            this.maxY = 24 * height / 2 - 31;
            this.range = 2 * this.maxY;
            this.min = min;
            this.max = max;
            this.valueRange = this.max - this.min;
            this.value = value;
            this.step = step;
            this.container = new PIXI.Container();
            this.container.zIndex = 5;
            this.container.interactive = true;
            this.container.buttonMode = true;
            this.container.cursor = "default";
            this.container.sortableChildren = true;
            this.container.x = x;
            this.container.y = y;
            this.container.on('pointerover', function (e) {
                if (cmdover != null) {
                    cmdover();
                }
            });
            this.container.on('pointerout', function (e) {
                if (cmdout != null) {
                    cmdout();
                }
            });
            this.container.on('pointerdown', function (e) {
                instance.clicked = true;
                if (cmddown != null) {
                    cmddown();
                }
            });
            this.container.on('pointerup', function (e) {
                if (instance.clicked) {
                    const newPosition = e.data.getLocalPosition(instance.container);
                    if (newPosition.y > instance.minY && newPosition.y < instance.maxY) {
                        instance.head.y = newPosition.y;
                        instance.value = instance.min + Math.floor(instance.valueRange * (((100 / instance.range * instance.head.y) / 100) + 0.5) + 0.5);
                    }
                    instance.change();
                    if (cmdup != null) {
                        cmdup();
                    }
                }
                instance.clicked = false;
            });
            this.container.on('pointerupoutside', function () {
                instance.clicked = false;
            });
            this.bgs = [];
            for (let i = 0; i < height; i++) {
                if (i == 0) {
                    this.bgs[i] = createSprite(ui_slider_parts.textures[0], 0, (24 * i) - (24 * height / 2 - 12), 1, 0, { x: 1, y: 1 });
                    this.bgs[i].anchor.set(0.5);
                    this.container.addChild(this.bgs[i]);

                    this.minusButton = new MiniButton(4, (24 * i) - (24 * height / 2 - 12), color, button_icons.textures[13], null, null, null, function () {
                        if (instance.value - instance.step > instance.min) {
                            instance.value -= instance.step;
                        }
                        else {
                            instance.value = instance.min;
                        }
                        instance.head.y = instance.range * ((100 / instance.valueRange * (instance.value - instance.min)) / 100) - instance.maxY;
                        instance.change();
                    }, "", false);
                    this.container.addChild(this.minusButton.container);
                }
                else if (i == height - 1) {
                    this.bgs[i] = createSprite(ui_slider_parts.textures[4], 0, (24 * i) - (24 * height / 2 - 12), 1, 0, { x: 1, y: 1 });
                    this.bgs[i].anchor.set(0.5);
                    this.container.addChild(this.bgs[i]);

                    this.plusButton = new MiniButton(4, (24 * i) - (24 * height / 2 - 12), color, button_icons.textures[12], null, null, null, function () {
                        if (instance.value + instance.step < instance.max) {
                            instance.value += instance.step;
                        }
                        else {
                            instance.value = instance.max;
                        }
                        instance.head.y = instance.range * ((100 / instance.valueRange * (instance.value - instance.min)) / 100) - instance.maxY;
                        instance.change();
                    }, "", false);
                    this.container.addChild(this.plusButton.container);
                }
                else {
                    this.bgs[i] = createSprite(ui_slider_parts.textures[2], 0, (24 * i) - (24 * height / 2 - 12), 1, 0, { x: 1, y: 1 });
                    this.bgs[i].anchor.set(0.5);
                    this.container.addChild(this.bgs[i]);
                }
            }
            this.head = createSprite(ui_slider_head.textures[0], 0, this.range * ((100 / this.valueRange * (this.value - this.min)) / 100) - this.maxY, 1, 0, { x: 1.1, y: 1.1 });
            this.head.anchor.set(0.5);
            this.head.interactive = true;
            this.head.buttonMode = true;
            this.head.cursor = "default";
            this.head.on('pointerdown', function (e) {
                instance.clicked = true;
                instance.data = e.data;
                instance.dragged = true;
            });
            this.head.on('pointermove', function () {
                if (instance.dragged) {
                    let old_value = instance.value;
                    const newPosition = instance.data.getLocalPosition(instance.head.parent);
                    if (newPosition.y > instance.maxY) {
                        instance.head.y = instance.maxY;
                    }
                    else if (newPosition.y < instance.minY) {
                        instance.head.y = instance.minY;
                    }
                    else {
                        instance.head.y = newPosition.y;
                    }
                    instance.value = instance.min + Math.floor(instance.valueRange * (((100 / instance.range * instance.head.y) / 100) + 0.5) + 0.5);
                    if (old_value != instance.value) {
                        instance.change();
                    }
                }
            });
            this.head.on('pointerup', function () {
                if (instance.clicked) {
                    instance.data = null;
                    instance.dragged = false;
                }
                instance.clicked = false;
            });
            this.head.on('pointerupoutside', function () {
                instance.data = null;
                instance.dragged = false;
                instance.clicked = false;
            });
            this.head.on('pointerover', function () {
                instance.head.scale.x = 1.2;
                instance.head.scale.y = 1.2;
            });
            this.head.on('pointerout', function () {
                instance.head.scale.x = 1.1;
                instance.head.scale.y = 1.1;
            });
            this.container.addChild(this.head);
        }

        change() {
            if (this.cmdchange != null) {
                this.cmdchange(this.value);
            }
        }
    }

    class CheckBox {
        constructor(x, y, checked, cmdover = null, cmdout = null, cmddown = null, cmdup = null, cmdckeck = null, cmduncheck = null) {
            var instance = this;
            this.cmdckeck = cmdckeck;
            this.cmduncheck = cmduncheck;
            this.checked = checked;
            this.checkboxs = [];
            this.container = new PIXI.Container();
            this.container.zIndex = 5;
            this.container.interactive = true;
            this.container.buttonMode = true;
            this.container.cursor = "default";
            this.container.sortableChildren = true;
            this.container.x = x;
            this.container.y = y;
            this.container.on('pointerover', function () {
                instance.overed = true;
                if (instance.checked) {
                    instance.bg.texture = ui_checkbox.textures[3];
                }
                else {
                    instance.bg.texture = ui_checkbox.textures[2];
                }

                if (cmdover != null) {
                    cmdover();
                }
            });
            this.container.on('pointerout', function () {
                instance.overed = false;
                if (instance.checked) {
                    instance.bg.texture = ui_checkbox.textures[1];
                }
                else {
                    instance.bg.texture = ui_checkbox.textures[0];
                }

                if (cmdout != null) {
                    cmdout();
                }
            });
            this.container.on('pointerdown', function () {
                instance.clicked = true;
                if (cmddown != null) {
                    cmddown();
                }
            });
            this.container.on('pointerup', function () {
                if (instance.clicked) {
                    if (instance.checked) {
                        instance.uncheck();
                    }
                    else {
                        instance.check();
                    }

                    if (cmdup != null) {
                        cmdup();
                    }
                }
                instance.clicked = false;
            });
            this.container.on('pointerupoutside', function () {
                instance.clicked = false;
            });

            if (this.checked) {
                this.bg = createSprite(ui_checkbox.textures[1], 0, 0, 1, 0, { x: 1.25, y: 1.25 });
            }
            else {
                this.bg = createSprite(ui_checkbox.textures[0], 0, 0, 1, 0, { x: 1.25, y: 1.25 });
            }
            this.bg.anchor.set(0.5);
            this.container.addChild(this.bg);
        }

        check() {
            this.checked = true;
            if (this.cmdckeck) {
                this.cmdckeck();
            }
            if (this.overed) {
                this.bg.texture = ui_checkbox.textures[3];
            }
            else {
                this.bg.texture = ui_checkbox.textures[1];
            }
            for (let i = 0; i < this.checkboxs.length; i++) {
                if (this.checkboxs[i].checked) {
                    this.checkboxs[i].uncheck(true);
                }
            }
        }

        uncheck(force = false) {
            if (force || this.checkboxs.length < 1) {
                this.checked = false;
                if (this.cmduncheck) {
                    this.cmduncheck();
                }
                if (this.overed) {
                    this.bg.texture = ui_checkbox.textures[2];
                }
                else {
                    this.bg.texture = ui_checkbox.textures[0];
                }
            }
        }

        addCheckbox(checkbox) {
            this.checkboxs.push(checkbox);
        }
    }

    class SquareButton {
        constructor(x, y, texture, text, force = false, cmdover = null, cmdout = null, cmddown = null, cmdup = null) {
            var instance = this;
            this.text = text;
            this.container = new PIXI.Container();
            this.container.zIndex = 5;
            this.container.interactive = true;
            this.container.buttonMode = true;
            this.container.cursor = "default";
            this.container.sortableChildren = true;
            this.container.x = x;
            this.container.y = y;
            this.container.on('pointerover', function () {
                instance.bg.scale.x = 1.1;
                instance.bg.scale.y = 1.1;
                instance.texture.scale.x = 1.1;
                instance.texture.scale.y = 1.1;
                instance.text_text = new PIXI.Text(instance.text, { fontSize: 11, fill: 0x000000 });
                instance.text_text.y = 24;
                instance.text_text.anchor.set(0.5, 0);
                instance.container.addChild(instance.text_text);
                if (cmdover != null) {
                    cmdover();
                }
            });
            this.container.on('pointerout', function () {
                instance.bg.scale.x = 1;
                instance.bg.scale.y = 1;
                instance.texture.scale.x = 1;
                instance.texture.scale.y = 1;
                instance.text_text.destroy();
                if (cmdout != null) {
                    cmdout();
                }
            });
            this.container.on('pointerdown', function () {
                instance.clicked = true;
                instance.bg.texture = menu_elements.textures[1];
                if (cmddown != null) {
                    cmddown();
                }
            });
            this.container.on('pointerup', function () {
                if (instance.clicked) {
                    instance.bg.texture = menu_elements.textures[0];
                    if (cmdup != null) {
                        cmdup();
                    }
                }
                instance.clicked = false;
            });
            this.container.on('pointerupoutside', function () {
                instance.bg.texture = menu_elements.textures[0];
                if (force) {
                    if (cmdup != null) {
                        cmdup();
                    }
                }
                instance.clicked = false;
            });
            this.bg = createSprite(menu_elements.textures[0], 0, 0, 1, 0, { x: 1, y: 1 });
            this.bg.anchor.set(0.5);
            this.bg.zIndex = 0;
            this.container.addChild(this.bg);
            this.texture = createSprite(menu_elements.textures[texture], 0, 0, 1, 0, { x: 1, y: 1 });
            this.texture.anchor.set(0.5);
            this.texture.zIndex = 1;
            this.container.addChild(this.texture);
        }
    }

    class Button {
        constructor(x, y, text, width, cmdover = null, cmdout = null, cmddown = null, cmdup = null) {
            var instance = this;
            this.container = new PIXI.Container();
            this.container.zIndex = 5;
            this.container.interactive = true;
            this.container.buttonMode = true;
            this.container.cursor = "default";
            this.container.sortableChildren = true;
            this.container.x = x;
            this.container.y = y;
            this.container.on('pointerover', function () {
                for (let i = 0; i < instance.bgs.length; i++) {
                    instance.bgs[i].sprite.texture = instance.bgs[i].textures[1];
                }
                if (cmdover != null) {
                    cmdover();
                }
            });
            this.container.on('pointerout', function () {
                for (let i = 0; i < instance.bgs.length; i++) {
                    instance.bgs[i].sprite.texture = instance.bgs[i].textures[0];
                }
                if (cmdout != null) {
                    cmdout();
                }
            });
            this.container.on('pointerdown', function () {
                instance.clicked = true;
                for (let i = 0; i < instance.bgs.length; i++) {
                    instance.bgs[i].sprite.texture = instance.bgs[i].textures[2];
                }
                if (cmddown != null) {
                    cmddown();
                }
            });
            this.container.on('pointerup', function () {
                if (instance.clicked) {
                    for (let i = 0; i < instance.bgs.length; i++) {
                        instance.bgs[i].sprite.texture = instance.bgs[i].textures[1];
                    }
                    if (cmdup != null) {
                        cmdup();
                    }
                }
                instance.clicked = false;
            });
            this.container.on('pointerupoutside', function () {
                for (let i = 0; i < instance.bgs.length; i++) {
                    instance.bgs[i].sprite.texture = instance.bgs[i].textures[0];
                }
                instance.clicked = false;
            });
            this.bgs = [];
            for (let x = 0; x < width; x++) {
                if (x == 0) {
                    this.bgs[x] = {
                        sprite: createSprite(ui_button.textures[0], (x * 40) - (40 * width / 2 - 20), 0, 1, 0, { x: 1, y: 1.2 }),
                        textures: [ui_button.textures[0], ui_button.textures[3], ui_button.textures[6]]
                    }
                    this.bgs[x].sprite.anchor.set(0.5);
                    this.bgs[x].sprite.zIndex = 0;
                    this.container.addChild(this.bgs[x].sprite);
                }
                else if (x == width - 1) {
                    this.bgs[x] = {
                        sprite: createSprite(ui_button.textures[2], (x * 40) - (40 * width / 2 - 20), 0, 1, 0, { x: 1, y: 1.2 }),
                        textures: [ui_button.textures[2], ui_button.textures[5], ui_button.textures[8]]
                    }
                    this.bgs[x].sprite.anchor.set(0.5);
                    this.bgs[x].sprite.zIndex = 0;
                    this.container.addChild(this.bgs[x].sprite);
                }
                else {
                    this.bgs[x] = {
                        sprite: createSprite(ui_button.textures[1], (x * 40) - (40 * width / 2 - 20), 0, 1, 0, { x: 1, y: 1.2 }),
                        textures: [ui_button.textures[1], ui_button.textures[4], ui_button.textures[7]]
                    }
                    this.bgs[x].sprite.anchor.set(0.5);
                    this.bgs[x].sprite.zIndex = 0;
                    this.container.addChild(this.bgs[x].sprite);
                }
            }
            this.text = new PIXI.Text(text, {
                fill: "white",
                fontFamily: "Verdana",
                fontSize: 18,
                fontVariant: "small-caps",
                lineJoin: "bevel",
                strokeThickness: 2.5
            });
            this.text.anchor.set(0.5);
            this.text.zIndex = 1;
            this.text.x = 0;
            this.text.y = -2;
            this.container.addChild(this.text);
        }
    }

    class MiniButton {
        constructor(x, y, color, texture, cmdover = null, cmdout = null, cmddown = null, cmdup = null, text, ring = true) {
            var instance = this;
            this.text = text;
            this.container = new PIXI.Container();
            this.container.zIndex = 5;
            this.container.interactive = true;
            this.container.buttonMode = true;
            this.container.cursor = "default";
            this.container.on('pointerover', function () {
                instance.bg.texture = instance.textures[1]
                instance.text_text = new PIXI.Text(instance.text, { fontSize: 11, fill: 0x000000 });
                instance.text_text.x = instance.container.width / 2;
                instance.text_text.y = instance.bg.y + 16;
                instance.text_text.anchor.set(0.5, 0);
                instance.container.addChild(instance.text_text);
                if (cmdover != null) {
                    cmdover();
                }
            });
            this.container.on('pointerout', function () {
                instance.bg.texture = instance.textures[0]
                instance.text_text.destroy();
                if (cmdout != null) {
                    cmdout();
                }
            });
            this.container.on('pointerdown', function () {
                instance.clicked = true;
                instance.bg.texture = instance.textures[2]
                if (cmddown != null) {
                    cmddown();
                }
            });
            this.container.on('pointerup', function () {
                if (instance.clicked) {
                    instance.bg.texture = instance.textures[1]
                    if (cmdup != null) {
                        cmdup();
                    }
                }
                instance.clicked = false;
            });
            this.container.on('pointerupoutside', function () {
                instance.clicked = false;
            });

            this.textures = [button_icons.textures[color], button_icons.textures[color + 8], button_icons.textures[color + 16]];
            if (ring) {
                this.bgRing = createSprite(resources['ui_button_ring'].texture, 8, 8, 1, 0, { x: 1.1, y: 1.1 });
                this.bgRing.anchor.set(0.5);
                this.container.addChild(this.bgRing);
            }
            this.bg = createSprite(this.textures[0], 8, 8, 1, 0, { x: 1.1, y: 1.1 });
            this.bg.anchor.set(0.5);
            this.icon = createSprite(texture, 8, 8, 1, 0, { x: 1, y: 1 });
            this.icon.anchor.set(0.5);
            this.container.addChild(this.bg);
            this.container.addChild(this.icon);
            this.container.x = x - (this.container.width / 2) - 3;
            this.container.y = y - (this.container.height / 2);
        }
    }

    class ScrollableContainer {
        constructor(x, y, width, height, sliderHeight, cmdover = null, cmdout = null, cmddown = null, cmdup = null) {
            var instance = this;
            this.ui = new UIContainer(x, y, width, height, 1, cmdover, cmdout, cmddown, cmdup);
            this.container = this.ui.container;

            this.childCount = 0;

            this.mask = new PIXI.Sprite(PIXI.Texture.WHITE);
            this.mask.zIndex = 1
            this.mask.width = this.container.width;
            this.mask.height = this.container.height;
            this.container.addChild(this.mask);
            this.container.mask = this.mask;

            this.slider = new SliderVertical(this.container.width - 20, this.container.height / 2, sliderHeight, 0, 100, 5, 0, 1, null, null, null, null, function (value) {
                instance.insideContainer.y = -((instance.insideContainer.getBounds().height - (instance.mask.getBounds().height - 24)) * (value / 100));
            });
            this.slider.zIndex = 5;
            this.container.addChild(this.slider.container);

            this.insideContainer = new PIXI.Container();
            this.insideContainer.x = 0;
            this.insideContainer.y = 0;
            this.insideContainer.zIndex = 3;
            this.container.addChild(this.insideContainer);

            this.createBackground(width, height);
        }

        addChild(child) {
            this.childCount++;
            this.insideContainer.addChild(child);
        }

        createBackground(width, height) {
            let sprite_mask;
            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    switch (x) {
                        case 0:
                            switch (y) {
                                case 0:
                                    sprite_mask = createSprite(menu_empty_frame_elements.textures[3], 32 * x, 32 * y, 1, 0, { x: 1, y: 1 });
                                    sprite_mask.zIndex = 11;
                                    this.container.addChild(sprite_mask);
                                    break;

                                case height - 1:
                                    sprite_mask = createSprite(menu_empty_frame_elements.textures[9], 32 * x, 32 * y, 1, 0, { x: 1, y: 1 });
                                    sprite_mask.zIndex = 11;
                                    this.container.addChild(sprite_mask);
                                    break;

                                default:
                                    sprite_mask = createSprite(menu_empty_frame_elements.textures[6], 32 * x, 32 * y, 1, 0, { x: 1, y: 1 });
                                    sprite_mask.zIndex = 11;
                                    this.container.addChild(sprite_mask);
                                    break;
                            }
                            break;

                        case width - 1:
                            switch (y) {
                                case 0:
                                    sprite_mask = createSprite(menu_empty_frame_elements.textures[5], 32 * x, 32 * y, 1, 0, { x: 1, y: 1 });
                                    sprite_mask.zIndex = 11;
                                    this.container.addChild(sprite_mask);
                                    break;

                                case height - 1:
                                    sprite_mask = createSprite(menu_empty_frame_elements.textures[11], 32 * x, 32 * y, 1, 0, { x: 1, y: 1 });
                                    sprite_mask.zIndex = 11;
                                    this.container.addChild(sprite_mask);
                                    break;

                                default:
                                    sprite_mask = createSprite(menu_empty_frame_elements.textures[8], 32 * x, 32 * y, 1, 0, { x: 1, y: 1 });
                                    sprite_mask.zIndex = 11;
                                    this.container.addChild(sprite_mask);
                                    break;
                            }
                            break;

                        default:
                            switch (y) {
                                case 0:
                                    sprite_mask = createSprite(menu_empty_frame_elements.textures[4], 32 * x, 32 * y, 1, 0, { x: 1, y: 1 });
                                    sprite_mask.zIndex = 11;
                                    this.container.addChild(sprite_mask);
                                    break;

                                case height - 1:
                                    sprite_mask = createSprite(menu_empty_frame_elements.textures[10], 32 * x, 32 * y, 1, 0, { x: 1, y: 1 });
                                    sprite_mask.zIndex = 11;
                                    this.container.addChild(sprite_mask);
                                    break;

                                default:
                                    sprite_mask = createSprite(menu_empty_frame_elements.textures[7], 32 * x, 32 * y, 1, 0, { x: 1, y: 1 });
                                    sprite_mask.zIndex = 11;
                                    this.container.addChild(sprite_mask);
                                    break;
                            }
                            break
                    }
                }
            }
        }
    }

    class UIContainer {
        constructor(x, y, width, height, alpha, cmdover = null, cmdout = null, cmddown = null, cmdup = null) {
            var instance = this;
            this.alpha = alpha;
            this.container = new PIXI.Container();
            this.container.sortableChildren = true;
            this.container.x = x - (width * 32 / 2);
            this.container.y = y - (height * 32 / 2);
            this.container.alpha = 0;
            this.container.interactiveChildren = false;
            this.container.on('pointerover', function () {
                if (cmdover != null) {
                    cmdover();
                }
            });
            this.container.on('pointerout', function () {
                if (cmdout != null) {
                    cmdout();
                }
            });
            this.container.on('pointerdown', function () {
                instance.clicked = true;
                if (cmddown != null) {
                    cmddown();
                }
            });
            this.container.on('pointerup', function () {
                if (instance.clicked) {
                    if (cmdup != null) {
                        cmdup();
                    }
                }
                instance.clicked = false;
            });
            this.container.on('pointerupoutside', function () {
                instance.clicked = false;
            });

            this.createBackground(width, height);

            this.hide = true;
        }

        createBackground(width, height) {
            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    switch (x) {
                        case 0:
                            switch (y) {
                                case 0:
                                    this.container.addChild(createSprite(menu_frame_elements.textures[3], 32 * x, 32 * y, 1, 0, { x: 1, y: 1 }));
                                    break;

                                case height - 1:
                                    this.container.addChild(createSprite(menu_frame_elements.textures[9], 32 * x, 32 * y, 1, 0, { x: 1, y: 1 }));
                                    break;

                                default:
                                    this.container.addChild(createSprite(menu_frame_elements.textures[6], 32 * x, 32 * y, 1, 0, { x: 1, y: 1 }));
                                    break;
                            }
                            break;

                        case width - 1:
                            switch (y) {
                                case 0:
                                    this.container.addChild(createSprite(menu_frame_elements.textures[5], 32 * x, 32 * y, 1, 0, { x: 1, y: 1 }));
                                    break;

                                case height - 1:
                                    this.container.addChild(createSprite(menu_frame_elements.textures[11], 32 * x, 32 * y, 1, 0, { x: 1, y: 1 }));
                                    break;

                                default:
                                    this.container.addChild(createSprite(menu_frame_elements.textures[8], 32 * x, 32 * y, 1, 0, { x: 1, y: 1 }));
                                    break;
                            }
                            break;

                        default:
                            switch (y) {
                                case 0:
                                    this.container.addChild(createSprite(menu_frame_elements.textures[4], 32 * x, 32 * y, 1, 0, { x: 1, y: 1 }));
                                    break;

                                case height - 1:
                                    this.container.addChild(createSprite(menu_frame_elements.textures[10], 32 * x, 32 * y, 1, 0, { x: 1, y: 1 }));
                                    break;

                                default:
                                    this.container.addChild(createSprite(menu_frame_elements.textures[7], 32 * x, 32 * y, 1, 0, { x: 1, y: 1 }));
                                    break;
                            }
                            break
                    }
                }
            }
        }

        hideShow(cmd = null) {
            if (this.hide) {
                this.container.interactive = true;
                this.container.buttonMode = true;
                this.container.interactiveChildren = true;
                this.container.alpha = this.alpha;
                this.container.cursor = "default";
                this.hide = false;
            }
            else {
                this.container.interactive = false;
                this.container.interactiveChildren = false;
                this.container.buttonMode = false;
                this.container.alpha = 0;
                this.hide = true;
                if (cmd != null) {
                    cmd();
                }
            }
        }
    }

    class InventorySlot {
        constructor(x, y, textures) {
            var instance = this;
            this.textures = textures;
            this.item = null;
            this.container = new PIXI.Container();
            this.container.interactive = true;
            this.container.buttonMode = true;
            this.container.cursor = "default";
            this.container.zIndex = 1;
            this.bg = createSprite(textures[0], x, y, 1, 0, { x: 1, y: 1 });
            this.bg.anchor.set(0.5);
            this.container.addChild(this.bg);
            this.container.on('pointerover', function () {
                instance.bg.texture = textures[2];
            });
            this.container.on('pointerout', function () {
                instance.bg.texture = textures[0];
            });
            this.container.on('pointerdown', function () {
                instance.clicked = true;
                instance.bg.texture = textures[1];
            });
            this.container.on('pointerup', function () {
                if (instance.clicked) {
                    instance.bg.texture = textures[2];
                }
                instance.clicked = false;
            });
            this.container.on('pointerupoutside', function () {
                instance.clicked = false;
            });
        }

        addItem(item, count) {
            this.item = new InventoryItem(this, this.bg.x, this.bg.y, item, count);
            inventory_container.addChild(this.item.item);
            inventory_container.addChild(this.item.count_text);
        }

        deleteItem() {
            this.item.die();
            this.item = null;
        }
    }

    class InventoryItem {
        constructor(parent, x, y, item, count) {
            var instance = this;
            this.parent = parent;
            this.count = count;
            this.itemID = item;
            this.text = this.count < 1000000 ? this.count < 10000 ? this.count : `${Math.floor(this.count / 1000)}k` : `${(this.count / 1000000).toFixed(1)}M`;
            this.count_text = new PIXI.Text(this.text, {
                fill: "white",
                fontFamily: "Verdana",
                fontSize: 12,
                fontVariant: "small-caps",
                lineJoin: "bevel",
                strokeThickness: 2.5
            });
            this.count_text.x = x + 17;
            this.count_text.y = y;
            this.count_text.anchor.set(1, 0);
            this.count_text.zIndex = 2;
            this.item = createSprite(item_icons.textures[item], x, y, 1, 0, { x: 2, y: 2 });
            this.item.zIndex = 1;
            this.item.anchor.set(0.5);
            this.item.interactive = true;
            this.item.buttonMode = true;
            this.item.cursor = "default";
            this.item.on('pointerdown', function (e) {
                instance.clicked = true;
                instance.data = e.data;
                instance.dragged = true;
                instance.item.zIndex = 3;
                instance.count_text.zIndex = 4;
                instance.parent.bg.texture = instance.parent.textures[1];
            });
            this.item.on('pointerup', function () {
                if (instance.clicked) {
                    if (instance.dragged) {
                        instance.oldPos = {
                            x: instance.parent.bg.x,
                            y: instance.parent.bg.y
                        }
                        let changed = false;
                        for (let i = 0; i < inventory_slots.length; i++) {
                            if (instance.item.x > inventory_slots[i].bg.x - 19 && instance.item.x < inventory_slots[i].bg.x + 19 && instance.item.y > inventory_slots[i].bg.y - 19 && instance.item.y < inventory_slots[i].bg.y + 19) {
                                if (inventory_slots[i].item == null && inventory_slots[i].item != instance) {
                                    socket.emit('update inventory', {
                                        type: "move",
                                        slot: inventory_slots.indexOf(instance.parent),
                                        targetSlot: i
                                    });
                                    instance.parent.item = null;
                                    instance.parent.bg.texture = instance.parent.textures[0];
                                    instance.changeSlot(inventory_slots[i]);
                                    instance.parent.bg.texture = instance.parent.textures[2];
                                    changed = true;
                                    break;
                                }
                                else if (inventory_slots[i].item != null && inventory_slots[i].item != instance) {
                                    socket.emit('update inventory', {
                                        type: "move",
                                        slot: inventory_slots.indexOf(instance.parent),
                                        targetSlot: i
                                    });
                                    instance.parent.bg.texture = instance.parent.textures[0];
                                    if (!instance.changerCount(i)) {
                                        inventory_slots[i].item.changeSlot(instance.parent);
                                    }
                                    else {
                                        instance.parent.item = null;
                                    }
                                    instance.changeSlot(inventory_slots[i]);
                                    instance.parent.bg.texture = instance.parent.textures[2];
                                    changed = true;
                                    break;
                                }
                            }
                        }
                        if (!changed) {
                            instance.item.x = instance.oldPos.x;
                            instance.item.y = instance.oldPos.y;
                            instance.count_text.x = instance.oldPos.x + 17;
                            instance.count_text.y = instance.oldPos.y;
                        }
                        instance.data = null;
                        instance.dragged = false;
                        instance.item.zIndex = 1;
                        instance.count_text.zIndex = 2;
                    }
                    instance.parent.bg.texture = instance.parent.textures[2];
                }
                instance.clicked = false;
            });
            this.item.on('pointerupoutside', function () {
                instance.clicked = false;
                if (instance.dragged) {
                    instance.oldPos = {
                        x: instance.parent.bg.x,
                        y: instance.parent.bg.y
                    }
                    let changed = false;
                    for (let i = 0; i < inventory_slots.length; i++) {
                        if (instance.item.x > inventory_slots[i].bg.x - 19 && instance.item.x < inventory_slots[i].bg.x + 19 && instance.item.y > inventory_slots[i].bg.y - 19 && instance.item.y < inventory_slots[i].bg.y + 19) {
                            if (inventory_slots[i].item == null && inventory_slots[i].item != instance) {
                                socket.emit('update inventory', {
                                    type: "move",
                                    slot: inventory_slots.indexOf(instance.parent),
                                    targetSlot: i
                                });
                                instance.parent.item = null;
                                instance.parent.bg.texture = instance.parent.textures[0];
                                instance.changeSlot(inventory_slots[i]);
                                instance.parent.bg.texture = instance.parent.textures[2];
                                changed = true;
                                break;
                            }
                            else if (inventory_slots[i].item != null && inventory_slots[i].item != instance) {
                                socket.emit('update inventory', {
                                    type: "move",
                                    slot: inventory_slots.indexOf(instance.parent),
                                    targetSlot: i
                                });
                                instance.parent.bg.texture = instance.parent.textures[0];
                                if (!instance.changerCount(i)) {
                                    inventory_slots[i].item.changeSlot(instance.parent);
                                }
                                else {
                                    instance.parent.item = null;
                                }
                                instance.changeSlot(inventory_slots[i]);
                                instance.parent.bg.texture = instance.parent.textures[1];
                                changed = true;
                                break;
                            }
                        }
                    }
                    if (!changed) {
                        instance.item.x = instance.oldPos.x;
                        instance.item.y = instance.oldPos.y;
                        instance.count_text.x = instance.oldPos.x + 17;
                        instance.count_text.y = instance.oldPos.y;
                    }
                    instance.data = null;
                    instance.dragged = false;
                    instance.item.zIndex = 1;
                    instance.count_text.zIndex = 2;
                }
                instance.parent.bg.texture = instance.parent.textures[0];
            });
            this.item.on('pointermove', function () {
                if (instance.dragged) {
                    const newPosition = instance.data.getLocalPosition(instance.item.parent);
                    for (let i = 0; i < inventory_slots.length; i++) {
                        inventory_slots[i].bg.texture = inventory_slots[i].textures[0];
                        if (newPosition.x > inventory_slots[i].bg.x - 19 && newPosition.x < inventory_slots[i].bg.x + 19 && newPosition.y > inventory_slots[i].bg.y - 19 && newPosition.y < inventory_slots[i].bg.y + 19) {
                            inventory_slots[i].bg.texture = inventory_slots[i].textures[2];
                        }
                    }
                    instance.item.x = newPosition.x;
                    instance.item.y = newPosition.y;
                    instance.count_text.x = newPosition.x + 17;
                    instance.count_text.y = newPosition.y;
                }
            });
            this.item.on('pointerover', function () {
                instance.parent.bg.texture = instance.parent.textures[2];
            });
            this.item.on('pointerout', function () {
                instance.parent.bg.texture = instance.parent.textures[0];
            });
        }

        changerCount(targetSlot) {
            if (this.itemID == inventory_slots[targetSlot].item.itemID) {
                this.count += inventory_slots[targetSlot].item.count;
                this.count_text.text = this.count < 1000000 ? this.count < 10000 ? this.count : `${Math.floor(this.count / 1000)}k` : `${(this.count / 1000000).toFixed(1)}M`;
                inventory_slots[targetSlot].deleteItem();
                return true;
            }
            return false;
        }

        isTargetNull(slot) {
            if (inventory_slots[slot].item != null) {
                return true;
            }
            return false;
        }

        changeSlot(slot) {
            this.item.x = slot.bg.x;
            this.item.y = slot.bg.y;
            this.count_text.x = slot.bg.x + 17;
            this.count_text.y = slot.bg.y;
            this.parent = slot;
            this.parent.item = this;
        }

        die() {
            this.item.destroy();
            this.count_text.destroy();
        }
    }

    class EquipmentSlot {
        constructor(x, y, textures, type) {
            var instance = this;
            this.textures = textures;
            this.item = null;
            this.container = new PIXI.Container();
            this.container.interactive = true;
            this.container.buttonMode = true;
            this.container.cursor = "default";
            this.container.zIndex = 1;
            this.bg = createSprite(textures[0], x, y, 1, 0, { x: 1.5, y: 1.5 });
            this.bg.anchor.set(0.5);
            this.type = createSprite(ui_inventory_icons.textures[type], x, y, 1, 0, { x: 1.3, y: 1.3 });
            this.type.anchor.set(0.5);
            this.container.addChild(this.bg);
            this.container.addChild(this.type);
            this.container.on('pointerover', function () {
                instance.bg.texture = textures[2];
            });
            this.container.on('pointerout', function () {
                instance.bg.texture = textures[0];
            });
            this.container.on('pointerdown', function () {
                instance.clicked = true;
                instance.bg.texture = textures[1];
            });
            this.container.on('pointerup', function () {
                if (instance.clicked) {
                    instance.bg.texture = textures[2];
                }
                instance.clicked = false;
            });
        }
    }

    class EquipmentItem {

    }

    // Function
    function generateTextures(texture, nbr_tile_x, nbr_tile_y, tile_size_x, tile_size_y, offset_x = 0, offset_y = 0) {
        let textures = [];
        let frame_count = 0;
        for (let y = 0; y < nbr_tile_y; y++) {
            for (let x = 0; x < nbr_tile_x; x++) {
                textures[frame_count] = new PIXI.Texture(texture,
                    new PIXI.Rectangle(offset_x + (x * tile_size_x), offset_y + (y * tile_size_y), tile_size_x, tile_size_y)
                );
                frame_count++;
            }
        }
        return {
            textures: textures,
            nbr_frame: frame_count
        }
    }

    function createSprite(texture, x, y, alpha = 1, angle = 0, scale = { x: 1, y: 1 }, cursor = null) {
        let sprite = new PIXI.Sprite(texture);
        sprite.x = x;
        sprite.y = y;
        sprite.alpha = alpha;
        sprite.angle = angle;
        sprite.scale.x = scale.x;
        sprite.scale.y = scale.y;
        if (cursor) {
            sprite.cursor = cursor;
        }
        return sprite;
    }

    function createAnimatedSprite(textures, x, y, alpha = 1, angle = 0, scale = { x: 1, y: 1 }, animSpeed = 1, play = true, cursor = null) {
        let sprite = new PIXI.AnimatedSprite(textures);
        sprite.x = x;
        sprite.y = y;
        sprite.alpha = alpha;
        sprite.angle = angle;
        sprite.scale.x = scale.x;
        sprite.scale.y = scale.y;
        sprite.animationSpeed = animSpeed;
        if (cursor) {
            sprite.cursor = cursor;
        }
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
        resetLayer();
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

    function resetLayer() {
        while (bullet_layer.children[0]) {
            bullet_layer.removeChild(bullet_layer.children[0]);
        }
        while (player_layer.children[0]) {
            player_layer.removeChild(player_layer.children[0]);
        }

        for (let i in player_list) {
            player_list[i].emitter.cleanup();
            player_list[i].emitter.emit = false;
            player_list[i].emitter.destroy();
            player_list[i].die();
        }

        for (let i in bullet_list) {
            bullet_list[i].emitter.cleanup();
            bullet_list[i].emitter.emit = false;
            bullet_list[i].emitter.destroy();
            bullet_list[i].die(false);
        }

        for (let i in monster_list) {
            monster_list[i].die();
        }
    }

    function generateCharacter(bodyparts) {
        let bodyparts_texture = {
            body: null,
            hair: null,
            backhair: null,
            ears: null,
            facialmark: null,
            beard: null,
            beastears: null,
            tail: null,
            shadow: null
        }

        if (bodyparts.body.sexe == 0) {
            let body_texture = generateTextures(resources[`player_sprite_body_male_${String(bodyparts.body.color).padStart(2, '0')}`].texture, 3, 4, 48, 48).textures;
            bodyparts_texture.body = [
                [body_texture[1], body_texture[0], body_texture[1], body_texture[2]],
                [body_texture[7], body_texture[6], body_texture[7], body_texture[8]],
                [body_texture[10], body_texture[9], body_texture[10], body_texture[11]],
                [body_texture[4], body_texture[3], body_texture[4], body_texture[5]]
            ];
        }
        else if (bodyparts.body.sexe == 1) {
            let body_texture = generateTextures(resources[`player_sprite_body_female_${String(bodyparts.body.color).padStart(2, '0')}`].texture, 3, 4, 48, 48).textures;
            bodyparts_texture.body = [
                [body_texture[1], body_texture[0], body_texture[1], body_texture[2]],
                [body_texture[7], body_texture[6], body_texture[7], body_texture[8]],
                [body_texture[10], body_texture[9], body_texture[10], body_texture[11]],
                [body_texture[4], body_texture[3], body_texture[4], body_texture[5]]
            ];
        }

        if (bodyparts.body.sexe == 0) {
            if (bodyparts.hair.type == 0) {
                bodyparts_texture.hair = [
                    [PIXI.Texture.EMPTY],
                    [PIXI.Texture.EMPTY],
                    [PIXI.Texture.EMPTY],
                    [PIXI.Texture.EMPTY]
                ];
            }
            else {
                let hair_texture = generateTextures(resources[`player_sprite_male_hair_${bodyparts.hair.color}`].texture, 3, 4, 48, 48, (bodyparts.hair.type - 1) * 144, 0).textures;
                bodyparts_texture.hair = [
                    [hair_texture[1], hair_texture[0], hair_texture[1], hair_texture[2]],
                    [hair_texture[7], hair_texture[6], hair_texture[7], hair_texture[8]],
                    [hair_texture[10], hair_texture[9], hair_texture[10], hair_texture[11]],
                    [hair_texture[4], hair_texture[3], hair_texture[4], hair_texture[5]]
                ];
            }

            if (bodyparts.backhair.type == 0) {
                bodyparts_texture.backhair = [
                    [PIXI.Texture.EMPTY],
                    [PIXI.Texture.EMPTY],
                    [PIXI.Texture.EMPTY],
                    [PIXI.Texture.EMPTY]
                ];
            }
            else {
                let backhair_texture = generateTextures(resources[`player_sprite_male_backhair_${bodyparts.backhair.color}`].texture, 3, 4, 48, 48, (bodyparts.backhair.type - 1) * 144, 0).textures;
                bodyparts_texture.backhair = [
                    [backhair_texture[1], backhair_texture[0], backhair_texture[1], backhair_texture[2]],
                    [backhair_texture[7], backhair_texture[6], backhair_texture[7], backhair_texture[8]],
                    [backhair_texture[10], backhair_texture[9], backhair_texture[10], backhair_texture[11]],
                    [backhair_texture[4], backhair_texture[3], backhair_texture[4], backhair_texture[5]]
                ];
            }
        }
        else if (bodyparts.body.sexe == 1) {
            if (bodyparts.hair.type == 0) {
                bodyparts_texture.hair = [
                    [PIXI.Texture.EMPTY],
                    [PIXI.Texture.EMPTY],
                    [PIXI.Texture.EMPTY],
                    [PIXI.Texture.EMPTY]
                ];
            }
            else {
                let hair_texture = generateTextures(resources[`player_sprite_female_hair_${bodyparts.hair.color}`].texture, 3, 4, 48, 48, (bodyparts.hair.type - 1) * 144, 0).textures;
                bodyparts_texture.hair = [
                    [hair_texture[1], hair_texture[0], hair_texture[1], hair_texture[2]],
                    [hair_texture[7], hair_texture[6], hair_texture[7], hair_texture[8]],
                    [hair_texture[10], hair_texture[9], hair_texture[10], hair_texture[11]],
                    [hair_texture[4], hair_texture[3], hair_texture[4], hair_texture[5]]
                ];
            }

            if (bodyparts.backhair.type == 0) {
                bodyparts_texture.backhair = [
                    [PIXI.Texture.EMPTY],
                    [PIXI.Texture.EMPTY],
                    [PIXI.Texture.EMPTY],
                    [PIXI.Texture.EMPTY]
                ];
            }
            else {
                let backhair_texture = generateTextures(resources[`player_sprite_female_backhair_${bodyparts.backhair.color}`].texture, 3, 4, 48, 48, (bodyparts.backhair.type - 1) * 144, 0).textures;
                bodyparts_texture.backhair = [
                    [backhair_texture[1], backhair_texture[0], backhair_texture[1], backhair_texture[2]],
                    [backhair_texture[7], backhair_texture[6], backhair_texture[7], backhair_texture[8]],
                    [backhair_texture[10], backhair_texture[9], backhair_texture[10], backhair_texture[11]],
                    [backhair_texture[4], backhair_texture[3], backhair_texture[4], backhair_texture[5]]
                ];
            }
        }

        if (bodyparts.ears.type == 0) {
            bodyparts_texture.ears = [
                [PIXI.Texture.EMPTY],
                [PIXI.Texture.EMPTY],
                [PIXI.Texture.EMPTY],
                [PIXI.Texture.EMPTY]
            ];
        }
        else if (bodyparts.ears.type == 1) {
            let ears_texture = generateTextures(resources[`player_sprite_ear_${String(bodyparts.body.color).padStart(2, '0')}`].texture, 3, 4, 48, 48).textures;
            bodyparts_texture.ears = [
                [ears_texture[1], ears_texture[0], ears_texture[1], ears_texture[2]],
                [ears_texture[7], ears_texture[6], ears_texture[7], ears_texture[8]],
                [ears_texture[10], ears_texture[9], ears_texture[10], ears_texture[11]],
                [ears_texture[4], ears_texture[3], ears_texture[4], ears_texture[5]]
            ];
        }

        if (bodyparts.facialmark.type == 0) {
            bodyparts_texture.facialmark = [
                [PIXI.Texture.EMPTY],
                [PIXI.Texture.EMPTY],
                [PIXI.Texture.EMPTY],
                [PIXI.Texture.EMPTY]
            ];
        }
        else {
            let facialmask_texture = generateTextures(resources[`player_sprite_facialmark_${String(bodyparts.facialmark.type).padStart(2, '0')}`].texture, 3, 4, 48, 48).textures;
            bodyparts_texture.facialmark = [
                [facialmask_texture[1], facialmask_texture[0], facialmask_texture[1], facialmask_texture[2]],
                [facialmask_texture[7], facialmask_texture[6], facialmask_texture[7], facialmask_texture[8]],
                [facialmask_texture[10], facialmask_texture[9], facialmask_texture[10], facialmask_texture[11]],
                [facialmask_texture[4], facialmask_texture[3], facialmask_texture[4], facialmask_texture[5]]
            ];
        }

        if (bodyparts.beard.type == 0) {
            bodyparts_texture.beard = [
                [PIXI.Texture.EMPTY],
                [PIXI.Texture.EMPTY],
                [PIXI.Texture.EMPTY],
                [PIXI.Texture.EMPTY]
            ];
        }
        else {
            if (bodyparts.body.sexe == 0) {
                let beard_texture = generateTextures(resources[`player_sprite_male_beard_${bodyparts.beard.color}`].texture, 3, 4, 48, 48, (bodyparts.beard.type - 1) * 144, 0).textures;
                bodyparts_texture.beard = [
                    [beard_texture[1], beard_texture[0], beard_texture[1], beard_texture[2]],
                    [beard_texture[7], beard_texture[6], beard_texture[7], beard_texture[8]],
                    [beard_texture[10], beard_texture[9], beard_texture[10], beard_texture[11]],
                    [beard_texture[4], beard_texture[3], beard_texture[4], beard_texture[5]]
                ];
            }
            else if (bodyparts.body.sexe == 1) {
                bodyparts_texture.beard = [
                    [PIXI.Texture.EMPTY],
                    [PIXI.Texture.EMPTY],
                    [PIXI.Texture.EMPTY],
                    [PIXI.Texture.EMPTY]
                ];
            }
        }

        if (bodyparts.beastears.type == 0) {
            bodyparts_texture.beastears = [
                [PIXI.Texture.EMPTY],
                [PIXI.Texture.EMPTY],
                [PIXI.Texture.EMPTY],
                [PIXI.Texture.EMPTY]
            ];
        }
        else {
            let beastears_texture = generateTextures(resources[`player_sprite_beastears_${bodyparts.beastears.type - 1}`].texture, 3, 4, 48, 48).textures;
            bodyparts_texture.beastears = [
                [beastears_texture[1], beastears_texture[0], beastears_texture[1], beastears_texture[2]],
                [beastears_texture[7], beastears_texture[6], beastears_texture[7], beastears_texture[8]],
                [beastears_texture[10], beastears_texture[9], beastears_texture[10], beastears_texture[11]],
                [beastears_texture[4], beastears_texture[3], beastears_texture[4], beastears_texture[5]]
            ];
        }

        if (bodyparts.tail.type == 0) {
            bodyparts_texture.tail = [
                [PIXI.Texture.EMPTY],
                [PIXI.Texture.EMPTY],
                [PIXI.Texture.EMPTY],
                [PIXI.Texture.EMPTY]
            ];
        }
        else {
            let tail_texture = generateTextures(resources[`player_sprite_tail_${bodyparts.tail.type - 1}`].texture, 3, 4, 48, 48).textures;
            bodyparts_texture.tail = [
                [tail_texture[1], tail_texture[0], tail_texture[1], tail_texture[2]],
                [tail_texture[7], tail_texture[6], tail_texture[7], tail_texture[8]],
                [tail_texture[10], tail_texture[9], tail_texture[10], tail_texture[11]],
                [tail_texture[4], tail_texture[3], tail_texture[4], tail_texture[5]]
            ];
        }

        let shadow_texture = generateTextures(resources['player_sprite_shadow'].texture, 3, 4, 48, 48).textures;
        bodyparts_texture.shadow = [
            [shadow_texture[1], shadow_texture[0], shadow_texture[1], shadow_texture[2]],
            [shadow_texture[7], shadow_texture[6], shadow_texture[7], shadow_texture[8]],
            [shadow_texture[10], shadow_texture[9], shadow_texture[10], shadow_texture[11]],
            [shadow_texture[4], shadow_texture[3], shadow_texture[4], shadow_texture[5]]
        ];

        return bodyparts_texture;
    }

    function createMenuCharacterGenerator() {
        character_generator_layer = new UIContainer(app.screen.width / 2, app.screen.height / 2, 15, 21, 1,
            function () {
                canShoot = false;
            },
            function () {
                canShoot = true;
            }, null, null);
        ui_layer.addChild(character_generator_layer.container);

        let animate = false;
        let bodyparts = {
            angle: 0,
            body: {
                sexe: 0,
                color: 2
            },
            hair: {
                type: 0,
                color: 0
            },
            backhair: {
                type: 0,
                color: 0
            },
            ears: {
                type: 0
            },
            facialmark: {
                type: 0
            },
            beastears: {
                type: 0
            },
            tail: {
                type: 0
            },
            beard: {
                type: 0,
                color: 0
            }
        };

        function setTexture(bodyparts_texture) {
            tail.textures = bodyparts_texture.tail[bodyparts.angle];
            body.textures = bodyparts_texture.body[bodyparts.angle];
            backhair.textures = bodyparts_texture.backhair[bodyparts.angle];
            ears.textures = bodyparts_texture.ears[bodyparts.angle];
            facialmark.textures = bodyparts_texture.facialmark[bodyparts.angle];
            beard.textures = bodyparts_texture.beard[bodyparts.angle];
            beastears.textures = bodyparts_texture.beastears[bodyparts.angle];
            hair.textures = bodyparts_texture.hair[bodyparts.angle];
            shadow.textures = bodyparts_texture.shadow[bodyparts.angle];

            if (animate) {
                tail.play();
                body.play();
                backhair.play();
                ears.play();
                facialmark.play();
                beard.play();
                beastears.play();
                hair.play();
                shadow.play();
            }
            else {
                tail.stop();
                body.stop();
                backhair.stop();
                ears.stop();
                facialmark.stop();
                beard.stop();
                beastears.stop();
                hair.stop();
                shadow.stop();
                tail.texture = tail.textures[0];
                body.texture = body.textures[0];
                backhair.texture = backhair.textures[0];
                ears.texture = ears.textures[0];
                facialmark.texture = facialmark.textures[0];
                beard.texture = beard.textures[0];
                beastears.texture = beastears.textures[0];
                hair.texture = hair.textures[0];
                shadow.texture = shadow.textures[0];
            }
        }

        let character_view = new UIContainer(96, 136 - 4, 5, 7, 1, null, null, null, null);
        character_view.hideShow();
        let character_container = new PIXI.Container();
        character_container.sortableChildren = true;
        character_view.container.addChild(character_container);
        let shadow = createAnimatedSprite([PIXI.Texture.EMPTY], character_view.container.width / 2, character_view.container.height / 2 - 8, 1, 0, { x: 3, y: 3 }, 0.1, false);
        shadow.anchor.set(0.5);
        let tail = createAnimatedSprite([PIXI.Texture.EMPTY], character_view.container.width / 2, character_view.container.height / 2 - 16, 1, 0, { x: 3, y: 3 }, 0.1, false);
        tail.anchor.set(0.5);
        let body = createAnimatedSprite([PIXI.Texture.EMPTY], character_view.container.width / 2, character_view.container.height / 2 - 16, 1, 0, { x: 3, y: 3 }, 0.1, false);
        body.anchor.set(0.5);
        let backhair = createAnimatedSprite([PIXI.Texture.EMPTY], character_view.container.width / 2, character_view.container.height / 2 - 16, 1, 0, { x: 3, y: 3 }, 0.1, false);
        backhair.anchor.set(0.5);
        let ears = createAnimatedSprite([PIXI.Texture.EMPTY], character_view.container.width / 2, character_view.container.height / 2 - 16, 1, 0, { x: 3, y: 3 }, 0.1, false);
        ears.anchor.set(0.5);
        let facialmark = createAnimatedSprite([PIXI.Texture.EMPTY], character_view.container.width / 2, character_view.container.height / 2 - 16, 1, 0, { x: 3, y: 3 }, 0.1, false);
        facialmark.anchor.set(0.5);
        let beard = createAnimatedSprite([PIXI.Texture.EMPTY], character_view.container.width / 2, character_view.container.height / 2 - 16, 1, 0, { x: 3, y: 3 }, 0.1, false);
        beard.anchor.set(0.5);
        let beastears = createAnimatedSprite([PIXI.Texture.EMPTY], character_view.container.width / 2, character_view.container.height / 2 - 16, 1, 0, { x: 3, y: 3 }, 0.1, false);
        beastears.anchor.set(0.5);
        let hair = createAnimatedSprite([PIXI.Texture.EMPTY], character_view.container.width / 2, character_view.container.height / 2 - 16, 1, 0, { x: 3, y: 3 }, 0.1, false);
        hair.anchor.set(0.5);
        shadow.zIndex = 0;
        tail.zIndex = 1;
        body.zIndex = 2;
        backhair.zIndex = 3;
        ears.zIndex = 4;
        facialmark.zIndex = 5;
        beard.zIndex = 6;
        beastears.zIndex = 7;
        hair.zIndex = 8;
        character_container.addChild(shadow);
        character_container.addChild(tail);
        character_container.addChild(body);
        character_container.addChild(backhair);
        character_container.addChild(ears);
        character_container.addChild(facialmark);
        character_container.addChild(beard);
        character_container.addChild(beastears);
        character_container.addChild(hair);
        let minusButton = new MiniButton(28, character_view.container.height - 14, 0, button_icons.textures[14], null, null, null, function () {
            if (bodyparts.angle == 0) {
                bodyparts.angle = 3;
            }
            else {
                bodyparts.angle--;
            }

            if (bodyparts.angle == 2) {
                shadow.zIndex = 0;
                tail.zIndex = 8;
                body.zIndex = 5;
                backhair.zIndex = 7;
                ears.zIndex = 4;
                facialmark.zIndex = 3;
                beard.zIndex = 2;
                beastears.zIndex = 6;
                hair.zIndex = 1;
            }
            else {
                shadow.zIndex = 0;
                tail.zIndex = 1;
                body.zIndex = 2;
                backhair.zIndex = 3;
                ears.zIndex = 4;
                facialmark.zIndex = 5;
                beard.zIndex = 6;
                beastears.zIndex = 7;
                hair.zIndex = 8;
            }
            setTexture(generateCharacter(bodyparts));
        }, "", true);
        character_view.container.addChild(minusButton.container);
        let plusButton = new MiniButton(character_view.container.width - 12, character_view.container.height - 14, 0, button_icons.textures[15], null, null, null, function () {
            if (bodyparts.angle == 3) {
                bodyparts.angle = 0;
            }
            else {
                bodyparts.angle++;
            }

            if (bodyparts.angle == 2) {
                shadow.zIndex = 0;
                tail.zIndex = 8;
                body.zIndex = 5;
                backhair.zIndex = 7;
                ears.zIndex = 4;
                facialmark.zIndex = 3;
                beard.zIndex = 2;
                beastears.zIndex = 6;
                hair.zIndex = 1;
            }
            else {
                shadow.zIndex = 0;
                tail.zIndex = 1;
                body.zIndex = 2;
                backhair.zIndex = 3;
                ears.zIndex = 4;
                facialmark.zIndex = 5;
                beard.zIndex = 6;
                beastears.zIndex = 7;
                hair.zIndex = 8;
            }
            setTexture(generateCharacter(bodyparts));
        }, "", true);
        character_view.container.addChild(plusButton.container);
        character_generator_layer.container.addChild(character_view.container);

        setTexture(generateCharacter(bodyparts));

        let male_options = new ScrollableContainer(character_generator_layer.container.width / 2, character_generator_layer.container.height / 2 + 112 - 12, 14, 11, 13, null, null, null, null);
        male_options.ui.hideShow();
        character_generator_layer.container.addChild(male_options.container);
        let male_options_text = new Text(8, 8, "Options Homme", 16, { x: 0, y: 0 });
        male_options.addChild(male_options_text.text);

        let female_options = new UIContainer(character_generator_layer.container.width / 2, character_generator_layer.container.height / 2 + 112 - 12, 14, 11, 1, null, null, null, null);
        character_generator_layer.container.addChild(female_options.container);
        let female_options_text = new Text(8, 8, "Options Femme", 16, { x: 0, y: 0 });
        female_options.container.addChild(female_options_text.text);

        let choose_sex_male_checkbox = new CheckBox(character_generator_layer.container.width / 3 + 40, 40 - 4, true, null, null, null, null, function () {
            male_options.ui.hideShow();
            female_options.hideShow();

            bodyparts.body.sexe = 0;
            bodyparts.hair.type = slider_hair_male.value;
            bodyparts.backhair.type = slider_backhair_male.value;
            bodyparts.ears.type = slider_ears_male.value;
            bodyparts.facialmark.type = slider_facialmark_male.value;
            bodyparts.beard.type = slider_beard_male.value;
            bodyparts.beastears.type = slider_beastears_male.value;
            bodyparts.tail.type = slider_tail_male.value;
            setTexture(generateCharacter(bodyparts));
        }, null);
        let male_text = new Text(character_generator_layer.container.width / 3 + 64, 40 - 4, "Homme", 14, { x: 0, y: 0.5 });
        character_generator_layer.container.addChild(male_text.text);
        let choose_sex_female_checkbox = new CheckBox((character_generator_layer.container.width / 3) * 2 + 40, 40 - 4, false, null, null, null, null, function () {
            male_options.ui.hideShow();
            female_options.hideShow();

            bodyparts.body.sexe = 1;
            bodyparts.hair.type = slider_hair_female.value;
            bodyparts.backhair.type = slider_backhair_female.value;
            bodyparts.ears.type = slider_ears_female.value;
            bodyparts.facialmark.type = slider_facialmark_female.value;
            bodyparts.beard.type = 0;
            bodyparts.beastears.type = slider_beastears_female.value;
            bodyparts.tail.type = slider_tail_female.value;
            setTexture(generateCharacter(bodyparts));
        }, null);
        let female_text = new Text((character_generator_layer.container.width / 3) * 2 + 64, 40 - 4, "Femme", 14, { x: 0, y: 0.5 });
        character_generator_layer.container.addChild(female_text.text);
        choose_sex_male_checkbox.addCheckbox(choose_sex_female_checkbox);
        choose_sex_female_checkbox.addCheckbox(choose_sex_male_checkbox);
        character_generator_layer.container.addChild(choose_sex_male_checkbox.container);
        character_generator_layer.container.addChild(choose_sex_female_checkbox.container);

        let slider_skin_color = new SliderHorizontal(character_generator_layer.container.width / 2 + 82, 100 - 4, 11, 1, 10, 1, 2, 0, null, null, null, null, function (value) {
            bodyparts.body.color = value;
            setTexture(generateCharacter(bodyparts));
        });
        character_generator_layer.container.addChild(slider_skin_color.container);
        let slider_skin_color_text = new Text(character_generator_layer.container.width / 3 + 32, 76 - 4, "Couleur de peau :", 14, { x: 0, y: 0.5 });
        character_generator_layer.container.addChild(slider_skin_color_text.text);

        let slider_hair_color = new SliderHorizontal(character_generator_layer.container.width / 2 + 82, 148 - 4, 11, 0, 17, 1, 0, 0, null, null, null, null, function (value) {
            bodyparts.hair.color = value;
            setTexture(generateCharacter(bodyparts));
        });
        character_generator_layer.container.addChild(slider_hair_color.container);
        let slider_hair_color_text = new Text(character_generator_layer.container.width / 3 + 32, 124 - 4, "Couleur de cheveux avant :", 14, { x: 0, y: 0.5 });
        character_generator_layer.container.addChild(slider_hair_color_text.text);
        let slider_backhair_color = new SliderHorizontal(character_generator_layer.container.width / 2 + 82, 196 - 4, 11, 0, 17, 1, 0, 0, null, null, null, null, function (value) {
            bodyparts.backhair.color = value;
            setTexture(generateCharacter(bodyparts));
        });
        character_generator_layer.container.addChild(slider_backhair_color.container);
        let slider_backhair_color_text = new Text(character_generator_layer.container.width / 3 + 32, 172 - 4, "Couleur de cheveux arrière :", 14, { x: 0, y: 0.5 });
        character_generator_layer.container.addChild(slider_backhair_color_text.text);
        let animate_checkbox = new CheckBox(character_generator_layer.container.width / 3 + 40, 228 - 4, false, null, null, null, null, function () {
            animate = true;
            setTexture(generateCharacter(bodyparts));
        }, function () {
            animate = false;
            setTexture(generateCharacter(bodyparts));
        });
        character_generator_layer.container.addChild(animate_checkbox.container);
        let animate_checkbox_text = new Text(character_generator_layer.container.width / 3 + 64, 228 - 4, "Sprite animée", 14, { x: 0, y: 0.5 });
        character_generator_layer.container.addChild(animate_checkbox_text.text);

        // options male 
        let slider_hair_male = new SliderHorizontal(male_options.container.width / 2, 72, 12, 0, 17, 1, 0, 0, null, null, null, null, function (value) {
            bodyparts.hair.type = value;
            setTexture(generateCharacter(bodyparts));
        });
        male_options.addChild(slider_hair_male.container);
        let slider_hair_male_text = new Text(male_options.container.width / 2 - 144, 48, "Cheveux avant :", 14, { x: 0, y: 0.5 });
        male_options.addChild(slider_hair_male_text.text);
        let slider_backhair_male = new SliderHorizontal(male_options.container.width / 2, 120, 12, 0, 18, 1, 0, 0, null, null, null, null, function (value) {
            bodyparts.backhair.type = value;
            setTexture(generateCharacter(bodyparts));
        });
        male_options.addChild(slider_backhair_male.container);
        let slider_backhair_male_text = new Text(male_options.container.width / 2 - 144, 96, "Cheveux arrière :", 14, { x: 0, y: 0.5 });
        male_options.addChild(slider_backhair_male_text.text);
        let slider_ears_male = new SliderHorizontal(male_options.container.width / 2, 168, 12, 0, 1, 1, 0, 0, null, null, null, null, function (value) {
            bodyparts.ears.type = value;
            setTexture(generateCharacter(bodyparts));
        });
        male_options.addChild(slider_ears_male.container);
        let slider_ears_male_text = new Text(male_options.container.width / 2 - 144, 144, "Oreilles :", 14, { x: 0, y: 0.5 });
        male_options.addChild(slider_ears_male_text.text);
        let slider_facialmark_male = new SliderHorizontal(male_options.container.width / 2, 216, 12, 0, 11, 1, 0, 0, null, null, null, null, function (value) {
            bodyparts.facialmark.type = value;
            setTexture(generateCharacter(bodyparts));
        });
        male_options.addChild(slider_facialmark_male.container);
        let slider_facialmark_male_text = new Text(male_options.container.width / 2 - 144, 192, "Marque faciale :", 14, { x: 0, y: 0.5 });
        male_options.addChild(slider_facialmark_male_text.text);
        let slider_beastears_male = new SliderHorizontal(male_options.container.width / 2, 264, 12, 0, 11, 1, 0, 0, null, null, null, null, function (value) {
            bodyparts.beastears.type = value;
            setTexture(generateCharacter(bodyparts));
        });
        male_options.addChild(slider_beastears_male.container);
        let slider_beastears_male_text = new Text(male_options.container.width / 2 - 144, 240, "Oreilles spéciales :", 14, { x: 0, y: 0.5 });
        male_options.addChild(slider_beastears_male_text.text);
        let slider_tail_male = new SliderHorizontal(male_options.container.width / 2, 312, 12, 0, 5, 1, 0, 0, null, null, null, null, function (value) {
            bodyparts.tail.type = value;
            setTexture(generateCharacter(bodyparts));
        });
        male_options.addChild(slider_tail_male.container);
        let slider_tail_male_text = new Text(male_options.container.width / 2 - 144, 288, "Queue :", 14, { x: 0, y: 0.5 });
        male_options.addChild(slider_tail_male_text.text);
        let slider_beard_male = new SliderHorizontal(male_options.container.width / 2, 360, 12, 0, 10, 1, 0, 0, null, null, null, null, function (value) {
            bodyparts.beard.type = value;
            setTexture(generateCharacter(bodyparts));
        });
        male_options.addChild(slider_beard_male.container);
        let slider_beard_male_text = new Text(male_options.container.width / 2 - 144, 336, "Barbe :", 14, { x: 0, y: 0.5 });
        male_options.addChild(slider_beard_male_text.text);

        // options female
        let slider_hair_female = new SliderHorizontal(female_options.container.width / 2, 72, 12, 0, 15, 1, 0, 0, null, null, null, null, function (value) {
            bodyparts.hair.type = value;
            setTexture(generateCharacter(bodyparts));
        });
        female_options.container.addChild(slider_hair_female.container);
        let slider_hair_female_text = new Text(female_options.container.width / 2 - 144, 48, "Cheveux avant :", 14, { x: 0, y: 0.5 });
        female_options.container.addChild(slider_hair_female_text.text);
        let slider_backhair_female = new SliderHorizontal(female_options.container.width / 2, 120, 12, 0, 20, 1, 0, 0, null, null, null, null, function (value) {
            bodyparts.backhair.type = value;
            setTexture(generateCharacter(bodyparts));
        });
        female_options.container.addChild(slider_backhair_female.container);
        let slider_backhair_female_text = new Text(female_options.container.width / 2 - 144, 96, "Cheveux arrière :", 14, { x: 0, y: 0.5 });
        female_options.container.addChild(slider_backhair_female_text.text);
        let slider_ears_female = new SliderHorizontal(female_options.container.width / 2, 168, 12, 0, 1, 1, 0, 0, null, null, null, null, function (value) {
            bodyparts.ears.type = value;
            setTexture(generateCharacter(bodyparts));
        });
        female_options.container.addChild(slider_ears_female.container);
        let slider_ears_female_text = new Text(female_options.container.width / 2 - 144, 144, "Oreilles :", 14, { x: 0, y: 0.5 });
        female_options.container.addChild(slider_ears_female_text.text);
        let slider_facialmark_female = new SliderHorizontal(female_options.container.width / 2, 216, 12, 0, 11, 1, 0, 0, null, null, null, null, function (value) {
            bodyparts.facialmark.type = value;
            setTexture(generateCharacter(bodyparts));
        });
        female_options.container.addChild(slider_facialmark_female.container);
        let slider_facialmark_female_text = new Text(female_options.container.width / 2 - 144, 192, "Marque faciale :", 14, { x: 0, y: 0.5 });
        female_options.container.addChild(slider_facialmark_female_text.text);
        let slider_beastears_female = new SliderHorizontal(male_options.container.width / 2, 264, 12, 0, 11, 1, 0, 0, null, null, null, null, function (value) {
            bodyparts.beastears.type = value;
            setTexture(generateCharacter(bodyparts));
        });
        female_options.container.addChild(slider_beastears_female.container);
        let slider_beastears_female_text = new Text(male_options.container.width / 2 - 144, 240, "Oreilles spéciales :", 14, { x: 0, y: 0.5 });
        female_options.container.addChild(slider_beastears_female_text.text);
        let slider_tail_female = new SliderHorizontal(male_options.container.width / 2, 312, 12, 0, 5, 1, 0, 0, null, null, null, null, function (value) {
            bodyparts.tail.type = value;
            setTexture(generateCharacter(bodyparts));
        });
        female_options.container.addChild(slider_tail_female.container);
        let slider_tail_female_text = new Text(male_options.container.width / 2 - 144, 288, "Queue :", 14, { x: 0, y: 0.5 });
        female_options.container.addChild(slider_tail_female_text.text);

        // Bouton validation
        let validate_button = new Button(character_generator_layer.container.width / 2, character_generator_layer.container.height - 32, "Créer mon personnage", 9, null, null, null,
            function () {
                socket.emit('set textures', bodyparts);
            }
        );
        character_generator_layer.container.addChild(validate_button.container);
    }

    function createMobileControll() {
        mobile_controll_layer = new UIContainer(2.5 * 32, app.screen.height - 2.5 * 32, 5, 4, 0.85,
            function () {
                canShoot = false;
            },
            function () {
                canShoot = true;
            },
            null, null);
        ui_layer.addChild(mobile_controll_layer.container);

        let left = new SquareButton(mobile_controll_layer.container.width / 2 - 48, mobile_controll_layer.container.height / 2 + 24, 9, "", false,
            function () {
                if (pointer_clicked && canDoThings && testActiveChat()) {
                    left.bg.texture = menu_elements.textures[1];
                    socket.emit('input', { key: 'left', state: true });
                    pressingLeft = true;
                    canShoot = false;
                }
            },
            function () {
                left.bg.texture = menu_elements.textures[0];
                socket.emit('input', { key: "left", state: false });
                pressingLeft = false;
                canShoot = true;
            },
            function () {
                if (canDoThings && testActiveChat()) {
                    socket.emit('input', { key: 'left', state: true });
                    pressingLeft = true;
                    canShoot = false;
                }
            },
            function () {
                socket.emit('input', { key: "left", state: false });
                pressingLeft = false;
                canShoot = true;
            });
        let right = new SquareButton(mobile_controll_layer.container.width / 2 + 48, mobile_controll_layer.container.height / 2 + 24, 7, "", false,
            function () {
                if (pointer_clicked && canDoThings && testActiveChat()) {
                    right.bg.texture = menu_elements.textures[1];
                    socket.emit('input', { key: 'right', state: true });
                    pressingRight = true;
                    canShoot = false;
                }
            },
            function () {
                right.bg.texture = menu_elements.textures[0];
                socket.emit('input', { key: "right", state: false });
                pressingRight = false;
                canShoot = true;
            },
            function () {
                if (canDoThings && testActiveChat()) {
                    socket.emit('input', { key: 'right', state: true });
                    pressingRight = true;
                    canShoot = false;
                }
            },
            function () {
                socket.emit('input', { key: "right", state: false });
                pressingRight = false;
                canShoot = true;
            });
        let up = new SquareButton(mobile_controll_layer.container.width / 2, mobile_controll_layer.container.height / 2 - 24, 8, "", true,
            function () {
                if (pointer_clicked && canDoThings && testActiveChat()) {
                    up.bg.texture = menu_elements.textures[1];
                    socket.emit('input', { key: 'up', state: true });
                    pressingUp = true;
                    canShoot = false;
                }
            },
            function () {
                up.bg.texture = menu_elements.textures[0];
                socket.emit('input', { key: "up", state: false });
                pressingUp = false;
                canShoot = true;
            },
            function () {
                if (canDoThings && testActiveChat()) {
                    socket.emit('input', { key: 'up', state: true });
                    pressingUp = true;
                    canShoot = false;
                }
            },
            function () {
                socket.emit('input', { key: "up", state: false });
                pressingUp = false;
                canShoot = true;
            });
        let down = new SquareButton(mobile_controll_layer.container.width / 2, mobile_controll_layer.container.height / 2 + 24, 10, "", true,
            function () {
                if (pointer_clicked && canDoThings && testActiveChat()) {
                    down.bg.texture = menu_elements.textures[1];
                    socket.emit('input', { key: 'down', state: true });
                    pressingDown = true;
                    canShoot = false;
                }
            },
            function () {
                down.bg.texture = menu_elements.textures[0];
                socket.emit('input', { key: "down", state: false });
                pressingDown = false;
                canShoot = true;
            },
            function () {
                if (canDoThings && testActiveChat()) {
                    socket.emit('input', { key: 'down', state: true });
                    pressingDown = true;
                    canShoot = false;
                }
            },
            function () {
                socket.emit('input', { key: "down", state: false });
                pressingDown = false;
                canShoot = true;
            });
        mobile_controll_layer.container.addChild(left.container);
        mobile_controll_layer.container.addChild(right.container);
        mobile_controll_layer.container.addChild(up.container);
        mobile_controll_layer.container.addChild(down.container);
    }

    function createOptions() {
        ui_options = new UIContainer(app.screen.width / 2, app.screen.height / 2, 8, 16, 1,
            function () {
                canShoot = false;
            },
            function () {
                canShoot = true;
            },
            null, null);

        let mobile_controll_check = new CheckBox(ui_options.container.width / 2 - 74, ui_options.container.height / 2, false, null, null, null, null,
            function () {
                mobile_controll_layer.hideShow();
            },
            function () {
                mobile_controll_layer.hideShow();
            }
        );
        ui_options.container.addChild(mobile_controll_check.container);

        let mobile_controll_text = new PIXI.Text("Contrôle pour mobile", {
            fill: "white",
            fontFamily: "Verdana",
            fontSize: 12,
            fontVariant: "small-caps",
            lineJoin: "bevel",
            strokeThickness: 2.5
        });
        mobile_controll_text.x = ui_options.container.width / 2 + 10;
        mobile_controll_text.y = ui_options.container.height / 2;
        mobile_controll_text.anchor.set(0.5);
        ui_options.container.addChild(mobile_controll_text);

        let button_quit = new Button(ui_options.container.width / 2, ui_options.container.height - 32, "Quitter", 5, null, null, null, function () {
            window.location = "/";
        });
        ui_options.container.addChild(button_quit.container);

        ui_layer.addChild(ui_options.container);
    }

    function createMenuButtons() {
        let menu_options = new SquareButton(app.screen.width - 24, 24, 4, "(O) Options", false,
            function () {
                canShoot = false;
            },
            function () {
                canShoot = true;
            },
            null,
            function () {
                if (!ui_inventory.hide) {
                    ui_inventory.hideShow();
                }
                ui_options.hideShow();
            }
        );
        ui_layer.addChild(menu_options.container);

        let menu_message = new SquareButton(app.screen.width - 72, 24, 3, "(T) Chat", false,
            function () {
                canShoot = false;
            },
            function () {
                canShoot = true;
            },
            null,
            function () {
                activateChat();
            }
        );
        ui_layer.addChild(menu_message.container);

        let menu_inventory = new SquareButton(app.screen.width - 120, 24, 5, "(E) Inventaire", false,
            function () {
                canShoot = false;
            },
            function () {
                canShoot = true;
            },
            null,
            function () {
                if (!ui_options.hide) {
                    ui_options.hideShow();
                }
                ui_inventory.hideShow();
            }
        );
        ui_layer.addChild(menu_inventory.container);

        let menu_changemap = new SquareButton(app.screen.width - 168, 24, 2, "Changer de map", false,
            function () {
                canShoot = false;
            },
            function () {
                canShoot = true;
            },
            null,
            function () {
                socket.emit('change-map');
            }
        );
        ui_layer.addChild(menu_changemap.container);

        let menu_fullscreen = new SquareButton(app.screen.width - 216, 24, 6, "(Entrée) Plein écran", false,
            function () {
                canShoot = false;
            },
            function () {
                canShoot = true;
            },
            null,
            function () {
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
        );
        ui_layer.addChild(menu_fullscreen.container);

        let menu_generator = new SquareButton(app.screen.width - 264, 24, 4, "Générateur", false,
            function () {
                canShoot = false;
            },
            function () {
                canShoot = true;
            },
            null,
            function () {
                character_generator_layer.hideShow();
            }
        );
        ui_layer.addChild(menu_generator.container);
    }

    function createInventory() {
        let inventory_slots_index = 0;
        ui_inventory = new UIContainer(app.screen.width / 2, app.screen.height / 2, 20, 16, 1,
            function () {
                canShoot = false;
            },
            function () {
                canShoot = true;
            }, null, null);
        let groupButton = new MiniButton(10 * 32 + 24, 34, 3, button_icons.textures[4], null, null, null,
            function () {
                socket.emit('sort inventory', "groupe");
            },
            "Grouper");
        let sortPlusButton = new MiniButton(10 * 32 + 24, 82, 3, button_icons.textures[12], null, null, null,
            function () {
                socket.emit('sort inventory', "plus");
            },
            "Trier +");
        let sortMoinsButton = new MiniButton(10 * 32 + 24, 130, 3, button_icons.textures[13], null, null, null,
            function () {
                socket.emit('sort inventory', "moins");
            },
            "Trier -");
        ui_inventory.container.addChild(groupButton.container);
        ui_inventory.container.addChild(sortMoinsButton.container);
        ui_inventory.container.addChild(sortPlusButton.container);
        inventory_container = new PIXI.Container();
        inventory_container.sortableChildren = true;
        inventory_container.zIndex = 1;
        inventory_container.x = 32;
        inventory_container.y = 32;
        ui_inventory.container.addChild(inventory_container);
        let width = 8;
        let height = 9;
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                switch (x) {
                    case 0:
                        switch (y) {
                            case 0:
                                inventory_slots[inventory_slots_index] = new InventorySlot(38 * x, 38 * y, [ui_inventory_slots_2.textures[0], ui_inventory_slots_2.textures[9], ui_inventory_slots_2.textures[18]]);
                                inventory_container.addChild(inventory_slots[inventory_slots_index].container);
                                break;

                            case height:
                                inventory_slots[inventory_slots_index] = new InventorySlot(38 * x, 38 * y, [ui_inventory_slots_2.textures[6], ui_inventory_slots_2.textures[15], ui_inventory_slots_2.textures[24]]);
                                inventory_container.addChild(inventory_slots[inventory_slots_index].container);
                                break;

                            default:
                                inventory_slots[inventory_slots_index] = new InventorySlot(38 * x, 38 * y, [ui_inventory_slots_2.textures[3], ui_inventory_slots_2.textures[12], ui_inventory_slots_2.textures[21]]);
                                inventory_container.addChild(inventory_slots[inventory_slots_index].container);
                                break;
                        }
                        break;

                    case width:
                        switch (y) {
                            case 0:
                                inventory_slots[inventory_slots_index] = new InventorySlot(38 * x, 38 * y, [ui_inventory_slots_2.textures[2], ui_inventory_slots_2.textures[11], ui_inventory_slots_2.textures[20]]);
                                inventory_container.addChild(inventory_slots[inventory_slots_index].container);
                                break;

                            case height:
                                inventory_slots[inventory_slots_index] = new InventorySlot(38 * x, 38 * y, [ui_inventory_slots_2.textures[8], ui_inventory_slots_2.textures[17], ui_inventory_slots_2.textures[26]]);
                                inventory_container.addChild(inventory_slots[inventory_slots_index].container);
                                break;

                            default:
                                inventory_slots[inventory_slots_index] = new InventorySlot(38 * x, 38 * y, [ui_inventory_slots_2.textures[5], ui_inventory_slots_2.textures[14], ui_inventory_slots_2.textures[23]]);
                                inventory_container.addChild(inventory_slots[inventory_slots_index].container);
                                break;
                        }
                        break;

                    default:
                        switch (y) {
                            case 0:
                                inventory_slots[inventory_slots_index] = new InventorySlot(38 * x, 38 * y, [ui_inventory_slots_2.textures[1], ui_inventory_slots_2.textures[10], ui_inventory_slots_2.textures[19]]);
                                inventory_container.addChild(inventory_slots[inventory_slots_index].container);
                                break;

                            case height:
                                inventory_slots[inventory_slots_index] = new InventorySlot(38 * x, 38 * y, [ui_inventory_slots_2.textures[7], ui_inventory_slots_2.textures[16], ui_inventory_slots_2.textures[25]]);
                                inventory_container.addChild(inventory_slots[inventory_slots_index].container);
                                break;

                            default:
                                inventory_slots[inventory_slots_index] = new InventorySlot(38 * x, 38 * y, [ui_inventory_slots_2.textures[4], ui_inventory_slots_2.textures[13], ui_inventory_slots_2.textures[22]]);
                                inventory_container.addChild(inventory_slots[inventory_slots_index].container);
                                break;
                        }
                        break
                }
                inventory_slots_index++;
            }

            equipment_container = new UIContainer(8 * 64, 192, 7, 11, 1, null, null, null, null);
            equipment_container.hideShow();
            equipment_container.zIndex = 0;
            ui_inventory.container.addChild(equipment_container.container);
            let casque = new EquipmentSlot(128 - 16, 64 - 16, [ui_inventory_slots.textures[0], ui_inventory_slots.textures[7], ui_inventory_slots.textures[14]], 0);
            let plastron = new EquipmentSlot(128 - 16, 128 - 16, [ui_inventory_slots.textures[0], ui_inventory_slots.textures[7], ui_inventory_slots.textures[14]], 1);
            let ceinture = new EquipmentSlot(128 - 16, 192 - 16, [ui_inventory_slots.textures[0], ui_inventory_slots.textures[7], ui_inventory_slots.textures[14]], 5);
            let bottes = new EquipmentSlot(128 - 16, 256 - 16, [ui_inventory_slots.textures[0], ui_inventory_slots.textures[7], ui_inventory_slots.textures[14]], 6);
            let arme_1 = new EquipmentSlot(96 - 16, 320 - 16, [ui_inventory_slots.textures[0], ui_inventory_slots.textures[7], ui_inventory_slots.textures[14]], 4);
            let arme_2 = new EquipmentSlot(160 - 16, 320 - 16, [ui_inventory_slots.textures[0], ui_inventory_slots.textures[7], ui_inventory_slots.textures[14]], 4);
            let bouclier = new EquipmentSlot(192 - 16, 128 - 16, [ui_inventory_slots.textures[0], ui_inventory_slots.textures[7], ui_inventory_slots.textures[14]], 3);
            let amulette = new EquipmentSlot(64 - 16, 64 - 16, [ui_inventory_slots.textures[0], ui_inventory_slots.textures[7], ui_inventory_slots.textures[14]], 2);
            let accessoire_1 = new EquipmentSlot(64 - 16, 192 - 16, [ui_inventory_slots.textures[0], ui_inventory_slots.textures[7], ui_inventory_slots.textures[14]], 7);
            let accessoire_2 = new EquipmentSlot(192 - 16, 192 - 16, [ui_inventory_slots.textures[0], ui_inventory_slots.textures[7], ui_inventory_slots.textures[14]], 7);
            equipment_container.container.addChild(casque.container);
            equipment_container.container.addChild(plastron.container);
            equipment_container.container.addChild(ceinture.container);
            equipment_container.container.addChild(bottes.container);
            equipment_container.container.addChild(arme_1.container);
            equipment_container.container.addChild(arme_2.container);
            equipment_container.container.addChild(bouclier.container);
            equipment_container.container.addChild(amulette.container);
            equipment_container.container.addChild(accessoire_1.container);
            equipment_container.container.addChild(accessoire_2.container);
        }
        ui_layer.addChild(ui_inventory.container);
    }

    function moveView() {
        if (current_player.x + camera.view_x > app.view.width - tile_size * scale * 4.5) {
            camera.view_x = Math.max(
                app.view.width - ((maps[current_player.map].width * tile_size) * scale),
                app.view.width - current_player.x - tile_size * scale * 4.5
            );
        }
        if (current_player.x + camera.view_x < tile_size * scale * 4.5) {
            camera.view_x = Math.min(0, -current_player.x + tile_size * scale * 4.5);
        }
        if (current_player.y + camera.view_y > app.view.height - tile_size * scale * 3) {
            camera.view_y = Math.max(
                app.view.height - ((maps[current_player.map].height * tile_size) * scale),
                app.view.height - current_player.y - tile_size * scale * 3
            );
        }
        if (current_player.y + camera.view_y < tile_size * scale * 2.5) {
            camera.view_y = Math.min(0, -current_player.y + tile_size * scale * 2.5);
        }

        if (app.stage.x != camera.view_x || app.stage.y != camera.view_y) {
            app.stage.x = camera.view_x;
            ui_layer.x = -camera.view_x;
            app.stage.y = camera.view_y;
            ui_layer.y = -camera.view_y;
        }
    }

    const tileset = generateTextures(resources['tileset_grass'].texture, 8, 18, 32, 32);
    const menu_elements = generateTextures(resources['ui_menu_elements'].texture, 11, 1, 48, 48);
    const menu_frame_elements = generateTextures(resources['ui_frame_elements'].texture, 3, 4, 32, 32);
    const menu_empty_frame_elements = generateTextures(resources['ui_empty_frame_elements'].texture, 3, 4, 32, 32);
    const ui_checkbox = generateTextures(resources['ui_checkbox'].texture, 2, 2, 14, 14);
    const ui_button = generateTextures(resources['ui_button'].texture, 3, 3, 40, 29);
    const ui_slider_parts = generateTextures(resources['ui_slider_parts'].texture, 2, 3, 24, 24);
    const ui_slider_head = generateTextures(resources['ui_slider_head'].texture, 1, 1, 12, 15);
    const ui_inventory_slots = generateTextures(resources['ui_inventory_slots'].texture, 7, 3, 40, 40);
    const ui_inventory_slots_2 = generateTextures(resources['ui_inventory_slots_2'].texture, 3, 9, 38, 38);
    const ui_inventory_icons = generateTextures(resources['ui_inventory_icons'].texture, 4, 2, 32, 32);
    const button_icons = generateTextures(resources['ui_button_icon_elements'].texture, 8, 3, 16, 16);
    const item_icons_1 = generateTextures(resources['items'].texture, 8, 9, 16, 16);
    const item_icons_2 = generateTextures(resources['items_2'].texture, 8, 9, 16, 16);
    const item_icons = {
        textures: item_icons_1.textures.concat(item_icons_2.textures),
        nbr_frame: item_icons_1.nbr_frame + item_icons_2.nbr_frame
    };

    socket.on('init', function (player) {
        // Layers
        layers = new PIXI.Container();
        layers.sortableChildren = true;
        app.stage.addChild(layers);
        bullet_layer = new PIXI.Container();
        bullet_layer.sortableChildren = true;
        bullet_layer.zIndex = 2;
        layers.addChild(bullet_layer);
        bullet_particle_layer = new PIXI.ParticleContainer();
        bullet_particle_layer.zIndex = 1;
        bullet_particle_layer.sortableChildren = true;
        layers.addChild(bullet_particle_layer);
        player_layer = new PIXI.Container();
        player_layer.sortableChildren = true;
        player_layer.zIndex = 4;
        layers.addChild(player_layer);
        player_particle_layer = new PIXI.ParticleContainer();
        player_particle_layer.zIndex = 3;
        player_particle_layer.sortableChildren = true;
        layers.addChild(player_particle_layer);
        ui_layer = new PIXI.Container();
        ui_layer.zIndex = 5;
        layers.addChild(ui_layer);

        changeMapLayer(maps[player.map], tileset.textures, scale);
        createMenuCharacterGenerator();
        createMobileControll();
        createOptions();
        createInventory();
        createMenuButtons();

        // Current player
        current_player = player;
        current_player.score_text = new PIXI.Text(`Score : ${current_player.score}`, { fontSize: 24 });
        current_player.score_text.x = 20;
        current_player.score_text.y = 20;
        ui_layer.addChild(current_player.score_text);

        for (let i = 0; i < current_player.inventory.length; i++) {
            current_player.inventory[i] != null ? inventory_slots[i].addItem(current_player.inventory[i][0], current_player.inventory[i][1]) : null;
        }

        socket.on('update inventory', function (inventory) {
            current_player.inventory = inventory;
            for (let i = 0; i < inventory_slots.length; i++) {
                if (inventory_slots[i].item != null) {
                    inventory_slots[i].deleteItem();
                }
                current_player.inventory[i] != null ? inventory_slots[i].addItem(current_player.inventory[i][0], current_player.inventory[i][1]) : null;
            }
        });

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
                    current_player.bodyparts = player.bodyparts;
                    if (current_player.map != player.map) {
                        updateCurrentMap(player.map);
                    }
                    updateCurrentPlayerScore(player.score);
                }

                if (player.map == current_player.map) {
                    if (!player_list[player.id]) {
                        player_list[player.id] = new Player(player.id, null, player.pseudo, player.x, player.y, scale, player.hp, player.maxHP, player.score, player.map, player.bodyparts);
                        player_layer.addChild(player_list[player.id].character_container);
                        player_layer.addChild(player_list[player.id].hp_text);
                    }
                    else {
                        player_list[player.id].update(player.x, player.y, player.hp, player.moving, player.direction, player.bodyparts);
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

            // Supprimer les balles supprimées
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

            // Monster
            for (var i = 0; i < packet.monsters.length; i++) {
                let monster = packet.monsters[i];
                if (monster.map == current_player.map) {
                    if (!monster_list[monster.id]) {
                        new Monster(monster.id, monster.x, monster.y, monster.hp, 2, monster.direction, monster.map);
                        player_layer.addChild(monster_list[monster.id].sprite);
                        player_layer.addChild(monster_list[monster.id].shadow);
                        player_layer.addChild(monster_list[monster.id].hp_text);
                    }
                    else {
                        monster_list[monster.id].update(monster.x, monster.y, monster.hp, monster.direction, monster.moving);
                    }
                }
            }

            // Supprimer les monstres supprimées
            for (let monster_id in monster_list) {
                let find = false;
                for (let i = 0; i < packet.monsters.length; i++) {
                    if (monster_list[monster_id].id == packet.monsters[i].id) {
                        find = true;
                    }
                }
                if (!find) {
                    monster_list[monster_id].die();
                }
            }

            moveView();
        });

        app.ticker.add(function (deltaTime) {
            for (let i in player_list) {
                player_list[i].breath(deltaTime);
            }
        });

        window.addEventListener('keydown', function (e) {
            if (canDoThings && testActiveChat()) {
                if (keyMap[e.keyCode] == "Z" || keyMap[e.keyCode] == "^") {
                    socket.emit('input', { key: "up", state: true });
                    pressingUp = true;
                }
                else if (keyMap[e.keyCode] == "S" || keyMap[e.keyCode] == "v") {
                    socket.emit('input', { key: "down", state: true });
                    pressingDown = true;
                }
                else if (keyMap[e.keyCode] == "Q" || keyMap[e.keyCode] == "<") {
                    socket.emit('input', { key: "left", state: true });
                    pressingLeft = true;
                }
                else if (keyMap[e.keyCode] == "D" || keyMap[e.keyCode] == ">") {
                    socket.emit('input', { key: "right", state: true });
                    pressingRight = true;
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
        });

        window.addEventListener('keyup', function (e) {
            if (keyMap[e.keyCode] == "Z" || keyMap[e.keyCode] == "^") {
                socket.emit('input', { key: "up", state: false });
                pressingUp = false;
            }
            else if (keyMap[e.keyCode] == "S" || keyMap[e.keyCode] == "v") {
                socket.emit('input', { key: "down", state: false });
                pressingDown = false;
            }
            else if (keyMap[e.keyCode] == "Q" || keyMap[e.keyCode] == "<") {
                socket.emit('input', { key: "left", state: false });
                pressingLeft = false;
            }
            else if (keyMap[e.keyCode] == "D" || keyMap[e.keyCode] == ">") {
                socket.emit('input', { key: "right", state: false });
                pressingRight = false;
            }
            else if (keyMap[e.keyCode] == "E") {
                if (testActiveChat()) {
                    if (!ui_options.hide) {
                        ui_options.hideShow();
                        ui_inventory.hideShow();
                    }
                    else {
                        ui_inventory.hideShow(function () {
                            canShoot = true;
                        });
                    }
                }
            }
            else if (keyMap[e.keyCode] == "O") {
                if (testActiveChat()) {
                    if (!ui_inventory.hide) {
                        ui_inventory.hideShow();
                        ui_options.hideShow();
                    }
                    else {
                        ui_options.hideShow(function () {
                            canShoot = true;
                        });
                    }
                }
            }
            else if (keyMap[e.keyCode] == "T") {
                if (testActiveChat()) {
                    activateChat();
                }
            }
        });

        window.addEventListener('pointerdown', function (e) {
            pointer_clicked = true;
            if (canDoThings && testActiveChat() && canShoot) {
                socket.emit('input', { key: 'shoot', state: true });
                pressingAttack = true;
            }
        });

        window.addEventListener('pointerup', function (e) {
            pointer_clicked = false;
            socket.emit('input', { key: 'shoot', state: false });
            pressingAttack = false;
        });

        document.addEventListener('pointerenter', function (e) {
            canDoThings = true;
        });

        document.addEventListener('pointerleave', function (e) {
            pointer_clicked = false;
            canDoThings = false;
            socket.emit('input', { key: "right", state: false });
            pressingRight = false;

            socket.emit('input', { key: "left", state: false });
            pressingLeft = false;

            socket.emit('input', { key: "up", state: false });
            pressingUp = false;

            socket.emit('input', { key: "down", state: false });
            pressingDown = false;

            socket.emit('input', { key: 'shoot', state: false });
            pressingAttack = false;
        });

        var mouseAngleInterval = setInterval(function () {
            let mousePos;
            if (app.renderer.plugins.interaction.eventData.data) {
                mousePos = app.renderer.plugins.interaction.eventData.data.global;
            }
            else {
                mousePos = { x: 0, y: 0 };
            }

            var x = (-current_player.x + mousePos.x) - camera.view_x;
            var y = (-current_player.y + mousePos.y) - camera.view_y;

            var angle = Math.atan2(y, x) / Math.PI * 180;
            socket.emit('input', { key: 'mouseAngle', state: angle });
        }, 1000 / 15);
    });
});

loader.onProgress.add(e => {
    document.getElementById("loading-percentage").innerText = `${Math.ceil(e.progress)}%`
});

loader.onComplete.add(e => {
    $(".loader-wrapper").fadeOut("slow");
    $("#game").show();
    socket.emit("player ready");
});

app.loader.onError.add((error) => console.error(error));
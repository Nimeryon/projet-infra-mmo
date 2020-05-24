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

    let view_ratio_x = 1080 / (h * 1.5);
    let view_ratio_y = 720 / h;
    app.view.width = h * 1.5 * view_ratio_x;
    app.view.height = h * view_ratio_y;
}

// Custom cursor
app.renderer.plugins.interaction.cursorStyles.default = "url('sprites/ui/cursor.png'), auto";

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
loader.add('player_sprite', "sprites/players/player.png");
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
loader.add('ui_button_icon_elements', "sprites/ui/button_icon.png");
loader.add('ui_inventory_slots', "sprites/ui/inventory_slot.png");
loader.add('ui_inventory_slots_2', "sprites/ui/inventory_slot_2.png");
loader.add('ui_inventory_icons', "sprites/ui/inventory_icon.png");
loader.add('ui_button_ring', "sprites/ui/button_ui.png");
loader.add('ui_equipment_icons', "sprites/ui/inventory_icon.png");
// Chargement item
loader.add('items', "sprites/icons/item.png");
loader.add('items_2', "sprites/icons/item_2.png");
// Chargement particules
loader.add('particle', "sprites/particles/particle.png");
// Execution
loader.load((loader, resources) => {
    // Global var
    var scale = 3;
    var tile_size = 32;
    var setFullScreen = false;
    var current_player = null;
    var canShoot = true;
    var player_list = [];
    var bullet_list = [];
    var inventory_slots = [];
    var equipment_slots = [];
    var maps = $.getJSON("models/maps.json", function (data) {
        maps = data;
    });
    var particles_weapon = $.getJSON("particles/weapon_break.json", function (data) {
        particles_weapon = data;
    });
    var particles_death = $.getJSON("particles/player_death.json", function (data) {
        particles_death = data;
    });
    var layers, bullet_layer, player_layer, ui_layer, ui_inventory, inventory_container, equipment_container, map_layer = null;
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
            this.maxHP = maxHP;

            this.hp_text = new PIXI.Text(`HP : ${this.hp}`, { fontSize: 14 });
            this.hp_text.x = this.x - (16 * this.scale / 2);
            this.hp_text.y = this.y - (24 * this.scale);

            this.score = score;

            // this.breathing = 1;
            // this.breathingIn = true;

            this.pseudo = pseudo;
            this.generateSprite(sprite_number);

            this.sprite = createAnimatedSprite(this.player_animation_walk_front, x, y, this.alpha, 0, { x: this.scale, y: this.scale }, 0.1, false);
            this.sprite.id = id;
            this.sprite.anchor.set(0.5);

            // app.stage.addChild(this.sprite);
            player_list[id] = this;
        }

        // breath(deltaTime) {
        //     if (this.breathingIn) {
        //         this.breathing -= 0.01;
        //         this.sprite.scale.y -= 0.001 * deltaTime;
        //         if (this.breathing <= 0) {
        //             this.breathingIn = false;
        //         }
        //     }
        //     else {
        //         this.breathing += 0.01;
        //         this.sprite.scale.y += 0.001 * deltaTime;
        //         if (this.breathing >= 1) {
        //             this.breathingIn = true;
        //         }
        //     }
        // }

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
            this.hp_text.zIndex = y - (24 * this.scale);
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

            this.emitter = new PIXI.particles.Emitter(
                bullet_layer,
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

        die() {
            this.emitter.updateSpawnPos(this.x, this.y);
            this.emitter.playOnceAndDestroy();
            this.sprite.destroy();
            delete bullet_list[this.id];
        }
    }

    // Function
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

    class MiniButton {
        constructor(x, y, color, texture, cmdover = null, cmdout = null, cmddown = null, cmdup = null, text) {
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
                cmdover();
            });
            this.container.on('pointerout', function () {
                instance.bg.texture = instance.textures[0]
                instance.text_text.destroy();
                cmdout();
            });
            this.container.on('pointerdown', function () {
                instance.bg.texture = instance.textures[2]
                cmddown();
            });
            this.container.on('pointerup', function () {
                instance.bg.texture = instance.textures[1]
                cmdup();
            });
            this.textures = [button_icons.textures[color], button_icons.textures[color + 8], button_icons.textures[color + 16]];
            this.bgRing = createSprite(resources['ui_button_ring'].texture, 8, 8, 1, 0, { x: 1.1, y: 1.1 });
            this.bgRing.anchor.set(0.5);
            this.bg = createSprite(this.textures[0], 8, 8, 1, 0, { x: 1.1, y: 1.1 });
            this.bg.anchor.set(0.5);
            this.icon = createSprite(texture, 8, 8, 1, 0, { x: 1, y: 1 });
            this.icon.anchor.set(0.5);
            this.container.addChild(this.bgRing);
            this.container.addChild(this.bg);
            this.container.addChild(this.icon);
            this.container.x = x - (this.container.width / 2) - 3;
            this.container.y = y - (this.container.height / 2);
        }
    }

    class UIContainer {
        constructor(x, y, width, height, cmdover = null, cmdout = null, cmddown = null, cmdup = null, changerShoot = true) {
            var instance = this;
            this.changerShoot = changerShoot
            this.container = new PIXI.Container();
            this.container.sortableChildren = true;
            this.container.x = x - (width * 32 / 2);
            this.container.y = y - (height * 32 / 2);
            this.container.alpha = 0;
            this.container.interactiveChildren = false;
            this.container.on('pointerover', function () {
                if (instance.changerShoot) {
                    canShoot = false;
                }
                cmdover();
            });
            this.container.on('pointerout', function () {
                if (instance.changerShoot) {
                    canShoot = true;
                }
                cmdout();
            });
            this.container.on('pointerdown', function () {
                cmddown();
            });
            this.container.on('pointerup', function () {
                cmdup();
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

        hideShow(resetShoot) {
            if (this.hide) {
                this.container.interactive = true;
                this.container.buttonMode = true;
                this.container.interactiveChildren = true;
                this.container.alpha = 0.9;
                this.container.cursor = "default";
                this.hide = false;
            }
            else {
                this.container.interactive = false;
                this.container.interactiveChildren = false;
                this.container.buttonMode = false;
                this.container.alpha = 0;
                this.hide = true;
                if (resetShoot) {
                    canShoot = true;
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
                instance.bg.texture = textures[1];
            });
            this.container.on('pointerup', function () {
                instance.bg.texture = textures[2];
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
                instance.data = e.data;
                instance.dragged = true;
                instance.item.zIndex = 3;
                instance.count_text.zIndex = 4;
                instance.parent.bg.texture = instance.parent.textures[1];
            });
            this.item.on('pointerup', function () {
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
            });
            this.item.on('pointerupoutside', function () {
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
                this.text_text.text = this.count < 1000000 ? this.count < 10000 ? this.count : `${Math.floor(this.count / 1000)}k` : `${(this.count / 1000000).toFixed(1)}M`;
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
                instance.bg.texture = textures[1];
            });
            this.container.on('pointerup', function () {
                instance.bg.texture = textures[2];
            });
        }

        // addItem(item, count) {
        //     this.item = new EquipmentItem(this, this.bg.x, this.bg.y, item, count);
        //     inventory_container.addChild(this.item.item);
        // }

        // deleteItem() {
        //     this.item.die();
        //     this.item = null;
        // }
    }

    class EquipmentItem {

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

    function createMenuElements(texture, x, y, scale, scale_hover, alpha, angle, text, command) {
        let info_text = null;
        let menu_element_container = new PIXI.Container();
        let menu_element_bg = createSprite(menu_elements.textures[0], x, y, alpha, angle, scale)
        menu_element_bg.anchor.set(0.5);
        let menu_element = createSprite(texture, x, y, alpha, angle, scale);
        menu_element.anchor.set(0.5);
        menu_element_container.interactive = true;
        menu_element_container.buttonMode = true;
        menu_element_container.cursor = "default";
        menu_element_container.on('pointerdown', function (e) {
            menu_element_bg.texture = menu_elements.textures[1];
        });
        menu_element_container.on('pointerup', function (e) {
            command();
            menu_element_bg.texture = menu_elements.textures[0];
        });
        menu_element_container.on('pointerover', function (e) {
            menu_element.scale.x = scale_hover.x;
            menu_element.scale.y = scale_hover.y;
            menu_element_bg.scale.x = scale_hover.x;
            menu_element_bg.scale.y = scale_hover.y;
            canShoot = false;
            info_text = new PIXI.Text(text, { fontSize: 12, fill: 0x000000 });
            info_text.x = x;
            info_text.y = y + 32;
            info_text.anchor.set(0.5);
            menu_element_container.addChild(info_text);
        });
        menu_element_container.on('pointerout', function (e) {
            menu_element.scale.x = scale.x;
            menu_element.scale.y = scale.y;
            menu_element_bg.scale.x = scale.x;
            menu_element_bg.scale.y = scale.y;
            menu_element_bg.texture = menu_elements.textures[0];
            canShoot = true;
            info_text.destroy();
        });
        menu_element_container.addChild(menu_element_bg);
        menu_element_container.addChild(menu_element);
        ui_layer.addChild(menu_element_container);
        return menu_element_container;
    }

    function createInventory() {
        let inventory_slots_index = 0;
        ui_inventory = new UIContainer(app.screen.width / 2, app.screen.height / 2, 20, 16,
            function () {
                return;
            },
            function () {
                return;
            },
            function () {
                return;
            },
            function () {
                return;
            }
        );
        let groupButton = new MiniButton(10 * 32 + 24, 34, 3, button_icons.textures[4],
            function () {
                return;
            },
            function () {
                return;
            },
            function () {
                return;
            },
            function () {
                socket.emit('sort inventory', "groupe");
            },
            "Grouper");
        let sortPlusButton = new MiniButton(10 * 32 + 24, 82, 3, button_icons.textures[12],
            function () {
                return;
            },
            function () {
                return;
            },
            function () {
                return;
            },
            function () {
                socket.emit('sort inventory', "plus");
            },
            "Trier +");
        let sortMoinsButton = new MiniButton(10 * 32 + 24, 130, 3, button_icons.textures[13],
            function () {
                return;
            },
            function () {
                return;
            },
            function () {
                return;
            },
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

            equipment_container = new UIContainer(8 * 64, 192, 7, 11,
                function () {
                    return;
                },
                function () {
                    return;
                },
                function () {
                    return;
                },
                function () {
                    return;
                },
                false
            );
            equipment_container.hideShow(true);
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
    const menu_elements = generateTextures(resources['ui_menu_elements'].texture, 7, 1, 48, 48);
    const menu_frame_elements = generateTextures(resources['ui_frame_elements'].texture, 3, 4, 32, 32);
    const ui_inventory_slots = generateTextures(resources['ui_inventory_slots'].texture, 7, 3, 40, 40);
    const ui_inventory_slots_2 = generateTextures(resources['ui_inventory_slots_2'].texture, 3, 9, 38, 38);
    const ui_equipment_icons = generateTextures(resources['ui_equipment_icons'].texture, 4, 2, 32, 32);
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
        changeMapLayer(maps[player.map], tileset.textures, scale);
        bullet_layer = new PIXI.Container();
        bullet_layer.sortableChildren = true;
        bullet_layer.zIndex = 1;
        layers.addChild(bullet_layer);
        player_layer = new PIXI.Container();
        player_layer.sortableChildren = true;
        player_layer.zIndex = 2;
        layers.addChild(player_layer);
        ui_layer = new PIXI.Container();
        ui_layer.zIndex = 3;
        layers.addChild(ui_layer);

        createInventory();

        // Draw menu
        let menu_options = createMenuElements(menu_elements.textures[4], app.screen.width - 24, 24, { x: 1, y: 1 }, { x: 1.1, y: 1.1 }, 1, 0, "Options", function () {
            return;
        });

        let menu_message = createMenuElements(menu_elements.textures[3], app.screen.width - 72, 24, { x: 1, y: 1 }, { x: 1.1, y: 1.1 }, 1, 0, "(T) Chat", function () {
            activateChat();
        });

        let menu_inventory = createMenuElements(menu_elements.textures[5], app.screen.width - 120, 24, { x: 1, y: 1 }, { x: 1.1, y: 1.1 }, 1, 0, "(E) Inventaire", function () {
            ui_inventory.hideShow(false);
        });

        let menu_changemap = createMenuElements(menu_elements.textures[2], app.screen.width - 168, 24, { x: 1, y: 1 }, { x: 1.1, y: 1.1 }, 1, 0, "Changer de map", function () {
            socket.emit('change-map');
        });

        let menu_fullscreen = createMenuElements(menu_elements.textures[6], app.screen.width - 216, 24, { x: 1, y: 1 }, { x: 1.1, y: 1.1 }, 1, 0, "(Entrée) Plein écran", function () {
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
        });

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
                    if (current_player.map != player.map) {
                        updateCurrentMap(player.map);
                    }
                    updateCurrentPlayerScore(player.score);
                }

                if (player.map == current_player.map) {
                    if (!player_list[player.id]) {
                        player_list[player.id] = new Player(player.id, null, player.pseudo, player.x, player.y, scale, player.hp, player.maxHP, player.score, player.sprite_number, player.moving, player.direction, player.map);
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

            moveView();
        });

        // app.ticker.add(function (deltaTime) {
        //     for (let i in player_list) {
        //         player_list[i].breath(deltaTime);
        //     }
        // });

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
            else if (keyMap[e.keyCode] == "E") {
                if (testActiveChat()) {
                    ui_inventory.hideShow(true);
                }
            }
            else if (keyMap[e.keyCode] == "T") {
                if (testActiveChat()) {
                    activateChat();
                }
            }
        }

        document.onpointerdown = function (e) {
            if (testActiveChat() && canShoot) {
                socket.emit('input', { key: 'shoot', state: true });
            }
        }

        document.onpointerup = function (e) {
            socket.emit('input', { key: 'shoot', state: false });
        }

        var mouseAngleInterval = setInterval(function () {
            let mousePos = app.renderer.plugins.interaction.mouse.global;
            var x = (-current_player.x + mousePos.x) - camera.view_x;
            var y = (-current_player.y + mousePos.y) - camera.view_y;

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
/*

MOVE TO

*/
var timeGlobA = Date.now();
var scale = 3;

PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;

const app = new PIXI.Application(
    {
        width: 64 * 8,
        height: 64 * 18,
        backgroundColor: 0xAAAAAA,
        // resizeTo: window
    }
);

const divAppScreen = document.createElement("div");
divAppScreen.className = "app-screen";
divAppScreen.appendChild(app.view);
document.querySelector(".game").appendChild(divAppScreen);

const loader = new PIXI.Loader();
// Chargement tilesets
loader.add('tileset_water', "sprites/tilesets/water.png");
loader.add('tileset_waterfall', "sprites/tilesets/waterfall.png");
loader.add('tileset_allin', "sprites/tilesets/allin.png");
loader.add('tileset_dirt', "sprites/tilesets/dirt.png");
loader.add('tileset_flower', "sprites/tilesets/flower.png");
loader.add('tileset_light_shadow', "sprites/tilesets/light_shadow.png");
loader.add('tileset_wall', "sprites/tilesets/wall.png");
loader.add('tileset_grass', "sprites/tilesets/grass.png");
// Chargement item
loader.add('items', "sprites/icons/item.png");
loader.add('items_2', "sprites/icons/item_2.png");
// Execution
loader.load((loader, resources) => {
    let timeA = Date.now();

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

    function generateTextures(texture, nbr_tile_x, nbr_tile_y, tile_size_x, tile_size_y, notATile = []) {
        let textures = [];
        let frame_count = 0;
        for (let y = 0; y < nbr_tile_y; y++) {
            for (let x = 0; x < nbr_tile_x; x++) {
                if (notATile.indexOf(frame_count) == -1) {
                    textures[frame_count] = new PIXI.Texture(texture,
                        new PIXI.Rectangle(x * tile_size_x, y * tile_size_y, tile_size_x, tile_size_y)
                    );
                }
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

    const item_icons_1 = generateTextures(resources['items'].texture, 8, 9, 16, 16);
    const item_icons_2 = generateTextures(resources['items_2'].texture, 8, 9, 16, 16);
    const item_icons = {
        textures: item_icons_1.textures.concat(item_icons_2.textures),
        nbr_frame: item_icons_1.nbr_frame + item_icons_2.nbr_frame
    };

    let itemid = 0;
    for (let y = 0; y < 18; y++) {
        for (let x = 0; x < 8; x++) {
            let sprite = createSprite(item_icons.textures[itemid], 64 * x, 64 * y, 1, 0, { x: scale, y: scale });
            let text = new Text(64 * x + 64, 64 * y + 64, itemid, 20, { x: 1, y: 1 });
            app.stage.addChild(sprite);
            app.stage.addChild(text.text);
            itemid++;
        }
    }
});

loader.onProgress.add(e => {
    console.log(Math.ceil(e.progress));
});

app.loader.onError.add((error) => console.error(error));
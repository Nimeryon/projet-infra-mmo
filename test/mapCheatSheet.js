/*

MOVE TO

*/
PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;

const app = new PIXI.Application(
    {
        width: 32 * 8 * 3 * 3,
        height: 32 * (6 * 23) * 3,
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
// Execution
loader.load((loader, resources) => {
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
                    let sprite = createSprite(tileset[tile - 1], x * (tile_size_x * scale.x), y * (tile_size_y * scale.y), 1, 0, {x: scale.x, y: scale.y});
                    layer_container.addChild(sprite);
                }
            }
        }
        container.addChild(layer_container);
    }

    function generateMap(map, tileset) {
        let scale = {
            x: 1520 / (32 * map.width),
            y: 734 / (32 * map.height)
        }
        let map_container = new PIXI.Container();
        generateLayer(map_container, tileset, scale, map.back_layer, map.width, map.height, 32, 32);
        generateLayer(map_container, tileset, scale, map.middle_layer, map.width, map.height, 32, 32);
        generateLayer(map_container, tileset, scale, map.decoration_layer, map.width, map.height, 32, 32);
        return map_container;
    }

    function generateMapFile(width = 10, height = 8) {
        let map = {
            width: width,
            height: height
        }

        let layer = [];
        for (let y = 0; y < height; y++) {
            let line = [];
            for (let x = 0; x < width; x++) {
                line[x] = Math.floor(Math.random() * (8 * 42))
            }
            layer[y] = line;
        }
        map.back_layer = layer;
        return map
    }

    function generateTileset(textures) {
        let tileset = [];
        let notATile = [1111, 1159, 1207, 1255, 1303, 1351, 1399, 1447, 1495, 1543, 1591, 1639, 1687, 1735, 1783, 1831, 1879, 1927, 1975, 2023, 2071, 2119];
        let texture_index = 0;
        let count = 0;
        for (let texture_i = 0; texture_i < textures.length; texture_i++) {
            for (let y = 0; y < textures[texture_i].height; y++) {
                for (let x = 0; x < textures[texture_i].width; x++) {
                    if (notATile.indexOf(count) == -1) {
                        tileset[texture_index] = new PIXI.Texture(textures[texture_i].texture,
                            new PIXI.Rectangle(x * 32, y * 32, 32, 32)
                        );
                        texture_index++;
                    }
                    count++;
                }
            }
        }
        return tileset;
    }

    function generateAnimatedTileset(textures) {
        let tileset = [];
        let texture_index = 0;
        let count = 0;
        for (let texture_i = 0; texture_i < textures.length; texture_i++) {
            for (let nbr_frame = 0; nbr_frame < textures[texture_i.nbr_frame]; i++) {
                for (let y = 0; y < textures[texture_i].height; y++) {
                    for (let x = 0; x < textures[texture_i].width; x++) {
                        if (notATile.indexOf(count) == -1) {
                            tileset[texture_index] = new PIXI.Texture(textures[texture_i].texture,
                                new PIXI.Rectangle(x * 32, y * 32, 32, 32)
                            );
                            texture_index++;
                        }
                        count++;
                    }
                }
            }
        }
        return tileset;
    }

    let tileset_textures = [
        {
            texture: resources['tileset_allin'].texture,
            width: 8,
            height: 133
        },
        {
            texture: resources['tileset_grass'].texture,
            width: 8,
            height: 6 * 11
        },
        {
            texture: resources['tileset_wall'].texture,
            width: 8,
            height: 6 * 2
        },
        {
            texture: resources['tileset_dirt'].texture,
            width: 8,
            height: 6 * 7
        },
        {
            texture: resources['tileset_flower'].texture,
            width: 8,
            height: 6 * 2
        },
        {
            texture: resources['tileset_light_shadow'].texture,
            width: 8,
            height: 6
        }
    ]

    let animated_tileset_textures = [
        {
            texture: 'tileset_water',
            nbr_frame: 8,
            width: 8,
            height: 6 * 3
        },
        {
            texture: 'tileset_waterfall',
            nbr_frame: 4,
            width: 8,
            height: 6 * 8
        }
    ]

    let animated_tileset = generateAnimatedTileset(animated_tileset_textures);
    let tileset = generateTileset(tileset_textures);

    let notATile = [1111, 1159, 1207, 1255, 1303, 1351, 1399, 1447, 1495, 1543, 1591, 1639, 1687, 1735, 1783, 1831, 1879, 1927, 1975, 2023, 2071, 2119];
    let text_count = 0;
    let count = 0;
    for (let y = 0; y < (6 * 23 + .5) * 2; y++) {
        for (let x = 0; x < 8; x++) {
            if (notATile.indexOf(count) == -1) {
                if (text_count <= 1063) {
                    let sprite = createSprite(tileset[text_count], x * 32 * 3, y * 32 * 3, 1, 0, {x: 3, y: 3});
                    app.stage.addChild(sprite);
                    let text = new PIXI.Text(String(text_count));
                    text.x = 32 * 3 * x + (32 * 3 / 2);
                    text.y = 32 * 3 * y + (32 * 3 / 2);
                    text.anchor.set(0.5);
                    app.stage.addChild(text);
                } else {
                    let sprite = createSprite(tileset[text_count], (x + 8) * 32 * 3, (y - (6 * 22 + 1)) * 32 * 3, 1, 0, {x: 3, y: 3});
                    app.stage.addChild(sprite);
                    let text = new PIXI.Text(String(text_count));
                    text.x = 32 * 3 * (x + 8) + (32 * 3 / 2);
                    text.y = 32 * 3 * (y - (6 * 22 + 1)) + (32 * 3 / 2);
                    text.anchor.set(0.5);
                    app.stage.addChild(text);
                }
                text_count++;
            }
            count++;
        }
    }
});

loader.onProgress.add(e => {
    console.log(Math.ceil(e.progress));
});

app.loader.onError.add((error) => console.error(error));
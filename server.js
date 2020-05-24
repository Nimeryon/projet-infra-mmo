const express = require('express');
const app = express();
const serveur = require('http').createServer(app);
const io = require('socket.io')(serveur);
const helmet = require('helmet');

// Connection base de donnée
// const mongojs = require('mongojs');
// const config = require('./config.json');
// const db = mongojs(`mongodb://${config.pseudo}:${config.mdp}@1897958c-bfe4-4b1b-8108-c813ac5c8b08.mmo-project-3867.mongo.dbs.scalingo.com:38358/mmo-project-3867?replicaSet=mmo-project-3867-rs0&ssl=true`);
// db.collections(function (err, collections) {
//     console.log(collections);
// });

// ==================================================================================================================
//  ____  ____  ____  _  _  ____  _  _  ____ 
// / ___)(  __)(  _ \/ )( \(  __)/ )( \(  _ \
// \___ \ ) _)  )   /\ \/ / ) _) ) \/ ( )   /
// (____/(____)(__\_) \__/ (____)\____/(__\_)
// ==================================================================================================================

// utilisation de helmet et désactivation de l'entête signifiant l'utilisation d'express
app.use(helmet());
app.disable("x-powered-by");

// Utilisation du dossier public
app.use(express.static(__dirname + '/public'));

// Renvoie du fichier index.html lorsque la route par défault est utilisé
app.get("/", function (req, res) {
    res.sendFile('index.html');
});

// Allumage du serveur sur le port 3000
serveur.listen(process.env.PORT || 3000, function () {
    console.log("Le serveur est accesible sur l'adresse suivante : *:3000");
});

// ==================================================================================================================
//   ___   __   _  _        ____  ____          __  ____  _  _  _  _ 
//  / __) /  \ ( \/ )      (  __)(_  _)       _(  )(  __)/ )( \( \/ )
// ( (__ (  O )/ \/ \       ) _)   )(        / \) \ ) _) ) \/ ( )  ( 
//  \___) \__/ \_)(_/      (____) (__)       \____/(____)\____/(_/\_)
// ==================================================================================================================

var socket_list = [];
var player_list = [];
var bullet_list = [];
var maps = require('./public/models/maps.json');
var items = require('./public/models/items.json');
var items_type_config = require('./public/models/items_type_config.json');
var scale = 3;
var tile_size = 32;
var server_frameRate = 25;

class Entity {
    constructor(id, parent_id, x, y, size, map, speed) {
        this.id = id;
        this.parent_id = parent_id;
        this.x = x;
        this.y = y;
        this.size = size;
        this.speed = speed;
        this.spdX = 0;
        this.spdY = 0;
        this.changeMap(map);
        this.calcBounds();
        this.calcTilePos();
    }

    changeMap(map) {
        if (this.map != map) {
            this.map = map;
            this.collision_layer = maps[this.map].collision_layer;
        }
    }

    calcBounds() {
        this.bounds = {
            minX: this.x - this.size.minX,
            maxX: this.x + this.size.maxX,
            minY: this.y - this.size.minY,
            maxY: this.y + this.size.maxY
        }
    }

    calcTilePos() {
        this.tileX = Math.floor(this.x / (tile_size * scale));
        this.tileY = Math.floor(this.y / (tile_size * scale));
    }

    getBoundsGrid(tileY, tileX) {
        let tile = this.collision_layer[tileY][tileX];
        if (tile == 1) {
            return {
                minX: tileX * tile_size * scale,
                maxX: (tile_size * scale) + (tileX * tile_size * scale),
                minY: tileY * tile_size * scale,
                maxY: (tile_size * scale) + (tileY * tile_size * scale)
            }
        }
        return null;
    }

    testBoundsCollisions(bounds) {
        if (this.bounds.minX < bounds.maxX && this.bounds.maxX > bounds.minX && this.bounds.maxY > bounds.minY && this.bounds.minY < bounds.maxY) {
            return true;
        }
        return false;
    }

    testWorldCollision() {
        // Collision with map border
        if (this.bounds.minX + this.spdX < 0) {
            this.spdX = 0 - this.bounds.minX;
        }

        if (this.bounds.maxX + this.spdX > maps[this.map].width * tile_size * scale) {
            this.spdX = (maps[this.map].width * tile_size * scale) - this.bounds.maxX;
        }

        if (this.bounds.minY + this.spdY < 0) {
            this.spdY = 0 - this.bounds.minY;
        }

        if (this.bounds.maxY + this.spdY > maps[this.map].height * tile_size * scale) {
            this.spdY = (maps[this.map].height * tile_size * scale) - this.bounds.maxY;
        }
    }

    testCollisionTop() {
        // side
        let tileTop = this.tileY > 0 ? this.getBoundsGrid(this.tileY - 1, this.tileX) : null;

        // corner
        let tileTopLeft = this.tileY > 0 && this.tileX > 0 ? this.getBoundsGrid(this.tileY - 1, this.tileX - 1) : null;
        let tileTopRight = this.tileY > 0 && this.tileX < (maps[this.map].width - 1) ? this.getBoundsGrid(this.tileY - 1, this.tileX + 1) : null;


        // Collision with map object topDown
        if (tileTopRight && this.bounds.maxX > tileTopRight.minX && this.bounds.minY + this.spdY < tileTopRight.maxY) {
            this.spdY = tileTopRight.maxY - this.bounds.minY;
            return;
        }

        if (tileTop && this.bounds.minY + this.spdY < tileTop.maxY) {
            this.spdY = tileTop.maxY - this.bounds.minY;
            return;
        }

        if (tileTopLeft && this.bounds.minX < tileTopLeft.maxX && this.bounds.minY + this.spdY < tileTopLeft.maxY) {
            this.spdY = tileTopLeft.maxY - this.bounds.minY;
            return false;
        }
    }

    testCollisionBottom() {
        // side
        let tileBottom = this.tileY < (maps[this.map].height - 1) ? this.getBoundsGrid(this.tileY + 1, this.tileX) : null;

        // corner
        let tileBottomLeft = this.tileY < (maps[this.map].height - 1) && this.tileX > 0 ? this.getBoundsGrid(this.tileY + 1, this.tileX - 1) : null;
        let tileBottomRight = this.tileY < (maps[this.map].height - 1) && this.tileX < (maps[this.map].width - 1) ? this.getBoundsGrid(this.tileY + 1, this.tileX + 1) : null;

        // Collision with map object topDown
        if (tileBottomRight && this.bounds.maxX > tileBottomRight.minX && this.bounds.maxY + this.spdY > tileBottomRight.minY) {
            this.spdY = tileBottomRight.minY - this.bounds.maxY;
            return false;
        }

        if (tileBottom && this.bounds.maxY + this.spdY > tileBottom.minY) {
            this.spdY = tileBottom.minY - this.bounds.maxY;
            return;
        }

        if (tileBottomLeft && this.bounds.minX < tileBottomLeft.maxX && this.bounds.maxY + this.spdY > tileBottomLeft.minY) {
            this.spdY = tileBottomLeft.minY - this.bounds.maxY;
            return false;
        }
    }

    testCollisionLeft() {
        // side
        let tileLeft = this.tileX > 0 ? this.getBoundsGrid(this.tileY, this.tileX - 1) : null;

        // corner
        let tileTopLeft = this.tileY > 0 && this.tileX > 0 ? this.getBoundsGrid(this.tileY - 1, this.tileX - 1) : null;
        let tileBottomLeft = this.tileY < (maps[this.map].height - 1) && this.tileX > 0 ? this.getBoundsGrid(this.tileY + 1, this.tileX - 1) : null;

        // Collision with map object side
        if (tileTopLeft && this.bounds.minY < tileTopLeft.maxY && this.bounds.minX + this.spdX < tileTopLeft.maxX) {
            this.spdX = tileTopLeft.maxX - this.bounds.minX;
            return;
        }

        if (tileLeft && this.bounds.minX + this.spdX < tileLeft.maxX) {
            this.spdX = tileLeft.maxX - this.bounds.minX;
            return;
        }

        if (tileBottomLeft && this.bounds.maxY > tileBottomLeft.minY && this.bounds.minX + this.spdX < tileBottomLeft.maxX) {
            this.spdX = tileBottomLeft.maxX - this.bounds.minX;
            return;
        }
    }

    testCollisionRight() {
        // side
        let tileRight = this.tileX < (maps[this.map].width - 1) ? this.getBoundsGrid(this.tileY, this.tileX + 1) : null;

        // corner
        let tileTopRight = this.tileY > 0 && this.tileX < (maps[this.map].width - 1) ? this.getBoundsGrid(this.tileY - 1, this.tileX + 1) : null;
        let tileBottomRight = this.tileY < (maps[this.map].height - 1) && this.tileX < (maps[this.map].width - 1) ? this.getBoundsGrid(this.tileY + 1, this.tileX + 1) : null;

        // Collision with map object side
        if (tileTopRight && this.bounds.minY < tileTopRight.maxY && this.bounds.maxX + this.spdX > tileTopRight.minX) {
            this.spdX = tileTopRight.minX - this.bounds.maxX;
            return;
        }

        if (tileRight && this.bounds.maxX + this.spdX > tileRight.minX) {
            this.spdX = tileRight.minX - this.bounds.maxX;
            return;
        }

        if (tileBottomRight && this.bounds.maxY > tileBottomRight.minY && this.bounds.maxX + this.spdX > tileBottomRight.minX) {
            this.spdX = tileBottomRight.minX - this.bounds.maxX;
            return;
        }
    }

    updatePosition() {
        this.testWorldCollision();
        this.testCollisionBottom();
        this.testCollisionLeft();
        this.testCollisionRight();
        this.testCollisionTop();

        this.x += this.spdX;
        this.y += this.spdY;

        this.calcTilePos();
    }

    update() {
        this.updatePosition();
        this.calcBounds();
    }

    getDistance(point) {
        return Math.sqrt(Math.pow(this.x - point.x, 2) + Math.pow(this.y - point.y, 2));
    }
}

class Player extends Entity {
    constructor(id, parent_id, pseudo, x, y, size, map, speed) {
        // Hérite de la classe Entity
        super(id, parent_id, x, y, size, map, speed);

        this.pseudo = pseudo;

        this.sprite_number = String(Math.floor(Math.random() * 20) + 1).padStart(2, '0');

        this.pressingRight = false;
        this.pressingLeft = false;
        this.pressingUp = false;
        this.pressingDown = false;

        this.pressingAttack = false;
        this.timeBtwAttack = 25;
        this.timer = 0;
        this.canShoot = true;
        this.mouseAngle = 0;

        this.direction = 0;
        this.moving = false;

        this.speed = speed;
        this.maxHP = 10;
        this.hp = 10;
        this.score = 0;

        this.inventory = new Inventory(8, 9);
    }

    updateSpeed() {
        let moving_1;
        let moving_2;
        if (this.pressingUp && this.pressingDown) {
            this.spdY = 0;
            moving_1 = false;
        }
        else if (this.pressingUp) {
            this.spdY = -this.speed;
            moving_1 = true;
            this.direction = 2;
        }
        else if (this.pressingDown) {
            this.spdY = this.speed;
            moving_1 = true;
            this.direction = 0;
        }
        else {
            this.spdY = 0;
            moving_1 = false;
        }

        if (this.pressingLeft && this.pressingRight) {
            this.spdX = 0;
            moving_2 = false;
        }
        else if (this.pressingLeft) {
            this.spdX = -this.speed;
            moving_2 = true;
            this.direction = 1;
        }
        else if (this.pressingRight) {
            this.spdX = this.speed;
            moving_2 = true;
            this.direction = 3;
        }
        else {
            this.spdX = 0;
            moving_2 = false;
        }

        if (moving_1 || moving_2) {
            this.moving = true;
        }
        else {
            this.moving = false;
        }
    }

    shoot() {
        let bullet_id = Math.random();
        bullet_list[bullet_id] = new Bullet(bullet_id, this.id, this.x, this.y, { minX: 1, minY: 1, maxX: 1, maxY: 1 }, this.mouseAngle, this.map, 24);
    }

    update() {
        this.updateSpeed();
        this.updatePosition();
        if (this.moving && this.spdX == 0 && this.spdY == 0) {
            this.moving = false;
        }
        this.calcTilePos();
        this.calcBounds();

        if (this.pressingAttack && this.canShoot) {
            this.canShoot = false;
            this.shoot();
        }

        if (this.canShoot == false && this.timer++ > this.timeBtwAttack / server_frameRate) {
            this.canShoot = true;
            this.timer = 0;
        }
    }
}

class Bullet extends Entity {
    constructor(id, parent_id, x, y, size, angle, map, speed) {
        // Hérite de la classe Entity
        super(id, parent_id, x, y, size, map, speed);

        this.angle = angle;
        this.speed = speed;

        this.spdX = Math.cos(this.angle / 180 * Math.PI) * this.speed;
        this.spdY = Math.sin(this.angle / 180 * Math.PI) * this.speed;

        this.timeToDie = 300 - Math.floor(Math.random() * 100);
        this.timer = 0;
    }

    updatePosition() {
        let old_spdX = this.spdX;
        let old_spdY = this.spdY;
        this.testWorldCollision();
        this.testCollisionBottom();
        this.testCollisionLeft();
        this.testCollisionRight();
        this.testCollisionTop();

        if (this.spdX != old_spdX || this.spdY != old_spdY) {
            this.die();
        }

        this.x += this.spdX;
        this.y += this.spdY;

        this.calcTilePos();
    }

    live() {
        for (let i in player_list) {
            if (player_list[i].id != this.parent_id && this.map == player_list[i].map) {
                if (this.testBoundsCollisions(player_list[i].bounds)) {
                    if (player_list[i].hp > 1) {
                        player_list[i].hp--;
                    }
                    else {
                        player_list[i].score--;
                        player_list[i].hp = player_list[i].maxHP;
                        player_list[i].x = maps[player_list[i].map].spawnPoint.x;
                        player_list[i].y = maps[player_list[i].map].spawnPoint.y;
                        player_list[this.parent_id].score++;
                    }
                    this.die();
                }
            }
        }

        if (this.timer++ < this.timeToDie / server_frameRate) {
            this.update();
        }
        else {
            this.die();
        }
    }

    die() {
        delete bullet_list[this.id];
    }
}

class Inventory {
    constructor(sizeX, sizeY) {
        this.inventory = [];
        for (let i = 0; i < sizeX * sizeY; i++) {
            this.inventory.push(null);
        }
    }

    sort() {
        for (let slot_index = 0; slot_index < this.inventory.length; slot_index++) {
            if (!this.isSlotFree(slot_index)) {
                for (let i = 0; i < this.inventory.length; i++) {
                    if (!this.isSlotFree(i)) {
                        if (slot_index != i && this.inventory[slot_index][0] == this.inventory[i][0]) {
                            this.inventory[slot_index][1] += this.inventory[i][1];
                            this.inventory[i] = null;
                        }
                    }
                }
                if (this.getFirstFree() != slot_index) {
                    [this.inventory[slot_index], this.inventory[this.getFirstFree()]] = [this.inventory[this.getFirstFree()], this.inventory[slot_index]];
                }
            }
        }
    }

    sortPlus() {
        this.sort();
        for (let slot_index = 0; slot_index < this.inventory.length; slot_index++) {
            if (!this.isSlotFree(slot_index)) {
                for (let i = 0; i < this.inventory.length; i++) {
                    if (!this.isSlotFree(i)) {
                        if (this.inventory[slot_index][1] > this.inventory[i][1]) {
                            [this.inventory[i], this.inventory[slot_index]] = [this.inventory[slot_index], this.inventory[i]];
                        }
                    }
                }
            }
        }
    }

    sortMoins() {
        this.sort();
        for (let slot_index = 0; slot_index < this.inventory.length; slot_index++) {
            if (!this.isSlotFree(slot_index)) {
                for (let i = 0; i < this.inventory.length; i++) {
                    if (!this.isSlotFree(i)) {
                        if (this.inventory[slot_index][1] < this.inventory[i][1]) {
                            [this.inventory[i], this.inventory[slot_index]] = [this.inventory[slot_index], this.inventory[i]];
                        }
                    }
                }
            }
        }
    }

    getLastfree() {
        for (let i = this.inventory.length - 1; i <= 0; i--) {
            if (this.inventory[i] == null) {
                return i
            }
        }
        return -1
    }

    getFirstFree() {
        for (let i = 0; i < this.inventory.length; i++) {
            if (this.inventory[i] == null) {
                return i
            }
        }
        return -1
    }

    getItem(itemID) {
        for (let i = 0; i < this.inventory.length; i++) {
            if (this.inventory[i][0] == itemID) {
                return i
            }
        }
        return -1
    }

    isSlotFree(slot) {
        if (this.inventory[slot] != null) {
            return false;
        }
        return true;
    }

    addItem(itemID, count) {
        let slot = this.getFirstFree();
        if (slot != -1) {
            this.inventory[slot] = [itemID, count];
        }
    }

    moveItem(slot, targetSlot) {
        if (!this.isSlotFree(targetSlot)) {
            if (this.inventory[slot][0] == this.inventory[targetSlot][0]) {
                this.inventory[slot][1] += this.inventory[targetSlot][1];
                this.inventory[targetSlot] = null;
            }
        }
        [this.inventory[slot], this.inventory[targetSlot]] = [this.inventory[targetSlot], this.inventory[slot]];
    }
}

// Cherche la connexion d'un client
io.on('connection', function (socket) {
    console.log("Quelqu'un vient de se connecter");

    socket.on('login request', function (data) {
        socket.emit('login answer', { state: true, username: data.username });
        // db.account.find({ username: data.username, password: data.password }, function (err, res) {
        //     if (err) console.log(err);

        //     res = res[0];

        //     if (res != null) {
        //         socket.emit('login answer', { state: true, username: data.username });
        //         console.log(`utilisateur: ${data.username} vient de se connecter`);
        //     }
        //     else {
        //         socket.emit('login answer', { state: false });
        //     }
        // });
    });

    socket.on('signin request', function (data) {
        socket.emit('signin answer', { state: true, username: data.username });
        // db.account.find({ username: data.username }, function (err, res) {
        //     if (err) console.log(err);

        //     res = res[0];

        //     if (res != null) {
        //         socket.emit('signin answer', { state: false });
        //     }
        //     else {
        //         db.account.insert({ username: data.username, password: data.password });
        //         socket.emit('signin answer', { state: true, username: data.username });
        //         console.log(`utilisateur: ${data.username} vient d'être créé`);
        //     }
        // });
    });

    socket.on('player ready', function (pseudo) {
        io.emit('chat message', { id: "Serveur", msg: `${pseudo} vient de se connecter !` });
        socket.id = Math.random();
        socket_list[socket.id] = socket;
        let player_map = ["spawn", "spawn1", "spawn2"][Math.floor(Math.random() * 3)];
        player_list[socket.id] = new Player(socket.id, false, pseudo, maps[player_map].spawnPoint.x, maps[player_map].spawnPoint.y, { minX: 16, minY: 0, maxX: 16, maxY: 46 }, player_map, 12);
        for (let i = 0; i < 8 * 9; i++) {
            player_list[socket.id].inventory.addItem(Math.floor(Math.random() * 144), Math.floor(Math.random() * 99999));
        }
        socket.emit('init', {
            id: player_list[socket.id].id,
            x: player_list[socket.id].x,
            y: player_list[socket.id].y,
            hp: player_list[socket.id].hp,
            maxHP: player_list[socket.id].maxHP,
            score: player_list[socket.id].score,
            moving: player_list[socket.id].moving,
            direction: player_list[socket.id].direction,
            map: player_list[socket.id].map,
            inventory: player_list[socket.id].inventory.inventory
        });

        socket.on('input', function (data) {
            if (data.key == "up") {
                player_list[socket.id].pressingUp = data.state;
            }
            else if (data.key == "down") {
                player_list[socket.id].pressingDown = data.state;
            }
            else if (data.key == "left") {
                player_list[socket.id].pressingLeft = data.state;
            }
            else if (data.key == "right") {
                player_list[socket.id].pressingRight = data.state;
            }
            else if (data.key == "shoot") {
                player_list[socket.id].pressingAttack = data.state;
            }
            else if (data.key == "mouseAngle") {
                player_list[socket.id].mouseAngle = data.state;
            }
        });

        socket.on('chat message', function (data) {
            if (data[0] == "/") {
                let command = data.substring(1).split(" ")[0];
                let args = data.substring(1).split(" ").slice(1);
                switch (command) {
                    case "msg":
                        let msg_target = null;
                        for (let i in player_list) {
                            if (player_list[i].pseudo == args[0]) {
                                msg_target = {
                                    pseudo: player_list[i].pseudo,
                                    id: player_list[i].id
                                }
                                break;
                            }
                        }

                        if (msg_target) {
                            if (args.length < 2 || args[1] == "") {
                                socket.emit('chat message', { id: "Serveur", msg: "Il n'y as pas de message." });
                            }
                            else {
                                socket.emit('chat message', { id: `À ${msg_target.pseudo}`, msg: args[1] });
                                socket_list[msg_target.id].emit('chat message', { id: `De ${msg_target.pseudo}`, msg: args[1] });
                            }
                        }
                        else {
                            socket.emit('chat message', { id: "Serveur", msg: "Cette utilisateur n'as pas étais trouvé." });
                        }
                        break;

                    default:
                        socket.emit('chat message', { id: "Serveur", msg: "Cette commande n'existe pas." });
                        break;
                }
            }
            else {
                io.emit('chat message', { id: `(${player_list[socket.id].map}) ${player_list[socket.id].pseudo}`, msg: data });
            }
        });

        socket.on('change-map', function () {
            player_list[socket.id].changeMap(["spawn", "spawn1", "spawn2"][Math.floor(Math.random() * 3)]);
            player_list[socket.id].x = maps[player_list[socket.id].map].spawnPoint.x;
            player_list[socket.id].y = maps[player_list[socket.id].map].spawnPoint.y;
        });

        socket.on('update inventory', function (data) {
            if (data.type == "move") {
                player_list[socket.id].inventory.moveItem(data.slot, data.targetSlot);
            }
        });

        socket.on('sort inventory', function (type) {
            switch (type) {
                case "groupe":
                    player_list[socket.id].inventory.sort();
                    break;

                case "moins":
                    player_list[socket.id].inventory.sortMoins();
                    break;

                case "plus":
                    player_list[socket.id].inventory.sortPlus();
                    break;

                default: break;
            }
            socket.emit('update inventory', player_list[socket.id].inventory.inventory);
        });
    });

    socket.on('disconnect', function () {
        console.log("Quelqu'un vient de se déconnecter");
        if (player_list[socket.id]) {
            io.emit('chat message', { id: "Serveur", msg: `${player_list[socket.id].pseudo} vient de se déconnecter !` });
        }
        delete player_list[socket.id];
    });
});

io.on('error', function (err) {
    console.log(err);
});

setInterval(function () {
    var packet = {
        timeStamp: Date.now(),
        players: [],
        bullets: []
    };

    for (let i in player_list) {
        let player = player_list[i];
        player.update();
        packet.players.push({
            id: player.id,
            pseudo: player.pseudo,
            x: player.x,
            y: player.y,
            spdX: player.spdX,
            spdY: player.spdY,
            sprite_number: player.sprite_number,
            hp: player.hp,
            score: player.score,
            moving: player.moving,
            direction: player.direction,
            map: player.map
        });
    }

    for (let i in bullet_list) {
        let bullet = bullet_list[i];
        bullet.live();
        packet.bullets.push({
            id: bullet.id,
            x: bullet.x,
            y: bullet.y,
            parent_id: bullet.parent_id,
            spdX: bullet.spdX,
            spdY: bullet.spdY,
            angle: bullet.angle,
            map: bullet.map
        });
    }

    io.emit('update', packet);
}, 1000 / server_frameRate);
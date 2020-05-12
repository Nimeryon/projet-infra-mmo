const express = require('express');
const app = express();
const serveur = require('http').createServer(app);
const io = require('socket.io')(serveur);
const helmet = require('helmet');

// Connection base de donnée
// const mongojs = require('mongojs');
// const db = mongojs('192.168.43.87:27017/mmo-project', ['account', 'progress']);

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
var map_size = {
    width: 20 * 32 * 3,
    height: 14 * 32 * 3
};
var server_frameRate = 25;

class Entity {
    constructor(id, parent_id, x, y, map) {
        this.id = id;
        this.parent_id = parent_id;
        this.x = x;
        this.y = y;
        this.spdX = 0;
        this.spdY = 0;
        this.map = map;
    }

    updatePosition() {
        if (this.x + this.spdX > 0 && this.x + this.spdX < map_size.width) {
            this.x += this.spdX;
        }

        if (this.y + this.spdY > 0 && this.y + this.spdY < map_size.height) {
            this.y += this.spdY;
        }
    }

    update() {
        this.updatePosition();
    }

    getDistance(point) {
        return Math.sqrt(Math.pow(this.x - point.x, 2) + Math.pow(this.y - point.y, 2));
    }
}

class Player extends Entity {
    constructor(id, parent_id, pseudo, x, y, map) {
        // Hérite de la classe Entity
        super(id, parent_id, x, y, map);

        this.pseudo = pseudo;

        this.sprite_number = String(Math.floor(Math.random() * 20) + 1).padStart(2, '0');

        this.pressingRight = false;
        this.pressingLeft = false;
        this.pressingUp = false;
        this.pressingDown = false;

        this.pressingAttack = false;
        this.mouseAngle = 0;

        this.direction = 0;
        this.moving = false;

        this.speed = 15;
        this.maxHP = 10;
        this.hp = 10;
        this.score = 0;
    }

    updateSpeed() {
        let moving_1;
        let moving_2;
        if (this.pressingUp) {
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

        if (this.pressingLeft) {
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
        bullet_list[bullet_id] = new Bullet(bullet_id, this.id, this.x, this.y, this.mouseAngle, this.map);
    }

    update() {
        this.updateSpeed();
        this.updatePosition();

        if (this.pressingAttack) {
            this.shoot();
        }
    }
}

class Bullet extends Entity {
    constructor(id, parent_id, x, y, angle, map) {
        // Hérite de la classe Entity
        super(id, parent_id, x, y, map);

        this.angle = angle;
        this.speed = 12;

        this.spdX = Math.cos(this.angle / 180 * Math.PI) * this.speed;
        this.spdY = Math.sin(this.angle / 180 * Math.PI) * this.speed;

        this.timeToDie = 400 - Math.floor(Math.random() * 100);
        this.timer = 0;
    }

    live() {
        for (let i in player_list) {
            if (player_list[i].id != this.parent_id && this.map == player_list[i].map) {
                // console.log(this.getDistance({ x: player_list[i].x, y: player_list[i].y }));
                if (this.getDistance({ x: player_list[i].x, y: player_list[i].y }) < 32) {
                    this.die();
                    if (player_list[i].hp > 1) {
                        player_list[i].hp--;
                    }
                    else {
                        player_list[i].hp = player_list[i].maxHP;
                        player_list[i].x = Math.floor(Math.random() * 1080);
                        player_list[i].y = Math.floor(Math.random() * 720);
                        player_list[this.parent_id].score++;
                    }
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
        let player_map = ["spawn", "spawn1"][Math.floor(Math.random() * 2)];
        player_list[socket.id] = new Player(socket.id, false, pseudo, 250, 250, player_map);
        socket.emit('init', {
            id: player_list[socket.id].id,
            x: player_list[socket.id].x,
            y: player_list[socket.id].y,
            hp: player_list[socket.id].hp,
            maxHP: player_list[socket.id].maxHP,
            score: player_list[socket.id].score,
            moving: player_list[socket.id].moving,
            direction: player_list[socket.id].direction,
            map: player_list[socket.id].map
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
            player_list[socket.id].map = ["spawn", "spawn1"][Math.floor(Math.random() * 2)];
            player_list[socket.id].x = 250;
            player_list[socket.id].y = 250;
        });

        socket.on('disconnect', function () {
            console.log("Quelqu'un vient de se déconnecter");
            if (player_list[socket.id]) {
                io.emit('chat message', { id: "Serveur", msg: `${player_list[socket.id].pseudo} vient de se déconnecter !` });
            }
            delete player_list[socket.id];
        });
    });
});

io.on('error', function (err) {
    console.log(err);
});

setInterval(function () {
    var packet = {
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
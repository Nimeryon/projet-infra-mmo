const express = require('express');
const app = express();
const serveur = require('http').createServer(app);
const io = require('socket.io')(serveur);
const helmet = require('helmet');

// Connection base de donnée
const mongojs = require('mongojs');
const db = mongojs('localhost:27017/mmo-project', ['account', 'progress']);

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
serveur.listen(3000, function () {
    console.log("Le serveur est accesible sur l'adresse suivante : *:3000");
});

// ==================================================================================================================
//   ___   __   _  _        ____  ____          __  ____  _  _  _  _ 
//  / __) /  \ ( \/ )      (  __)(_  _)       _(  )(  __)/ )( \( \/ )
// ( (__ (  O )/ \/ \       ) _)   )(        / \) \ ) _) ) \/ ( )  ( 
//  \___) \__/ \_)(_/      (____) (__)       \____/(____)\____/(_/\_)
// ==================================================================================================================

var player_list = [];
var bullet_list = [];
var server_frameRate = 25;
var DEBUG_MODE = true;

class Entity {
    constructor(id, parent_id, x, y) {
        this.id = id;
        this.parent_id = parent_id;
        this.x = x;
        this.y = y;
        this.spdX = 0;
        this.spdY = 0;
    }

    updatePosition() {
        this.x += this.spdX;
        this.y += this.spdY;
    }

    update() {
        this.updatePosition();
    }

    getDistance(point) {
        return Math.sqrt(Math.pow(this.x - point.x, 2) + Math.pow(this.y - point.y, 2));
    }
}

class Player extends Entity {
    constructor(id, parent_id, pseudo, x, y) {
        // Hérite de la classe Entity
        super(id, parent_id, x, y);

        this.pseudo = pseudo;

        this.sprite_number = String(Math.floor(Math.random() * 20) + 1).padStart(2, '0');

        this.pressingRight = false;
        this.pressingLeft = false;
        this.pressingUp = false;
        this.pressingDown = false;

        this.pressingAttack = false;
        this.mouseAngle = 0;

        this.speed = 15;
        this.maxHP = 10;
        this.hp = 10;
        this.score = 0;
    }

    updateSpeed() {
        if (this.pressingUp) {
            this.spdY = -this.speed;
        }
        else if (this.pressingDown) {
            this.spdY = this.speed;
        }
        else {
            this.spdY = 0;
        }

        if (this.pressingLeft) {
            this.spdX = -this.speed;
        }
        else if (this.pressingRight) {
            this.spdX = this.speed;
        }
        else {
            this.spdX = 0;
        }
    }

    shoot() {
        let bullet_id = Math.random();
        bullet_list[bullet_id] = new Bullet(bullet_id, this.id, this.x, this.y, this.mouseAngle);
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
    constructor(id, parent_id, x, y, angle) {
        // Hérite de la classe Entity
        super(id, parent_id, x, y);

        this.angle = angle;
        this.speed = 12;

        this.spdX = Math.cos(this.angle / 180 * Math.PI) * this.speed;
        this.spdY = Math.sin(this.angle / 180 * Math.PI) * this.speed;

        this.timeToDie = 400 - Math.floor(Math.random() * 100);
        this.timer = 0;
    }

    live() {
        for (let i in player_list) {
            if (player_list[i].id != this.parent_id) {
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
        db.account.find({ username: data.username, password: data.password }, function (err, res) {
            if (err) console.log(err);

            res = res[0];

            if (res != null) {
                socket.emit('login answer', { state: true, username: data.username });
                console.log(`utilisateur: ${data.username} vient de se connecter`);
            }
            else {
                socket.emit('login answer', { state: false });
            }
        });
    });

    socket.on('signin request', function (data) {
        db.account.find({ username: data.username }, function (err, res) {
            if (err) console.log(err);

            res = res[0];

            if (res != null) {
                socket.emit('signin answer', { state: false });
            }
            else {
                db.account.insert({ username: data.username, password: data.password });
                socket.emit('signin answer', { state: true, username: data.username });
                console.log(`utilisateur: ${data.username} vient d'être créé`);
            }
        });
    });

    socket.on('player ready', function (pseudo) {
        socket.id = Math.random();
        player_list[socket.id] = new Player(socket.id, false, pseudo, 250, 250);
        socket.emit('init', {
            id: player_list[socket.id].id,
            x: player_list[socket.id].x,
            y: player_list[socket.id].y,
            hp: player_list[socket.id].hp,
            maxHP: player_list[socket.id].maxHP,
            score: player_list[socket.id].score
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
            io.emit('chat message', { id: player_list[socket.id].pseudo, msg: data });
        });

        socket.on('eval server', function (data) {
            if (!DEBUG_MODE) return;

            console.log(eval(data));
        });

        socket.on('disconnect', function () {
            console.log("Quelqu'un vient de se déconnecter");
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
            score: player.score
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
            angle: bullet.angle
        });
    }

    io.emit('update', packet);
}, 1000 / server_frameRate);
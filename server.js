const express = require("express");
const app = express();
var helmet = require('helmet');
var http = require('http').createServer(app);
var io = require('socket.io')(http);

app.use(helmet());
app.disable('x-powered-by');
app.use(express.static('public'));

const port = 3000;
const host = '192.168.43.60';

app.get("/", (req, res) => {
    res.sendFile('index.hmtl');
});

const roomScreen = [1080, 720];
const playersData = {
    players: {},
    nbr_player: 0
};
const updateRate = 10;

function createPlayer() {
    const player = {
        id: Math.random().toString(36).substring(7),
        x: Math.floor(Math.random() * (roomScreen[0] - 32)) + 16,
        y: Math.floor(Math.random() * (roomScreen[1] - 32)) + 16,
        dir: 0,
        sprite_number: String(Math.floor(Math.random() * 20) + 1).padStart(2, '0')
    };
    playersData.players[player.id] = player;
    playersData.nbr_player++;
    return player;
}

function getPlayersData() {
    return {
        timestamp: Date.now(),
        data: Array.from(Object.values(playersData.players))
    };
}

setInterval(() => {
    io.emit('update', getPlayersData());
}, 1000 / updateRate);

io.on('connection', function (socket) {
    console.log("Quelqu'un viens de ce connecter");

    socket.on('finish loading', () => {
        let player = createPlayer();
        socket.id = player.id;
        socket.emit('init', player);
        io.emit('chat message', `Quelqu'un viens de ce connecter, ${playersData.nbr_player}`);
    });

    socket.on('update user', function (data) {
        playersData.players[data.id].x = data.x;
        playersData.players[data.id].y = data.y;
        playersData.players[data.id].dir = data.dir;
    });

    socket.on('chat message', function (msg) {
        io.emit('chat message', msg);
    });

    socket.on('disconnect', function () {
        delete playersData.players[socket.id];
        playersData.nbr_player--;

        console.log("Quelqu'un viens de ce déconnecter");
        io.emit('chat message', `Quelqu'un viens de ce déconnecter, ${playersData.nbr_player}`)
    });
});

io.on('error', function (err) {
    console.log(err);
});

http.listen(3000, '192.168.43.60' || 'localhost', function () {
    console.log("le serveur est sur l'URL : http://" + host + ":" + port);
});
const express = require("express");
const app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

app.use(express.static('public'));

const port = 3000;
const host = "127.0.0.1";

app.get("/", (req, res) => {
    res.sendFile('index.hmtl');
});

const roomScreen = [1080, 720];

function createPlayer() {
    const player = {
        id: Math.random().toString(36).substring(7),
        x: Math.floor(Math.random() * roomScreen[0]),
        y: Math.floor(Math.random() * roomScreen[1])
    };
    return player;
}

io.on('connection', function (socket) {
    console.log('a user connected');

    socket.on('finish loading', () => {
        socket.emit('init', createPlayer());
    });

    socket.on('chat message', function (msg) {
        io.emit('chat message', msg);
    });

    socket.on('disconnect', function () {
        console.log('user disconnected');
    });
});

http.listen(3000, function () {
    console.log("le serveur est sur l'URL : http://" + host + ":" + port)
});
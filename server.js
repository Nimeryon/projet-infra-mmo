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

io.on('connection', function (socket) {
    console.log('a user connected');

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
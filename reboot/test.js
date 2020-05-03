// Connection base de donnée
const mongojs = require('mongojs');
const db = mongojs('192.168.43.87:27017/mmo-project', ['account', 'progress']);

db.account.find({ username: "Nimerya" }, function (err, res) {
    console.log(err, res);
});
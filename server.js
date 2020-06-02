const express = require('express');
const app = express();
const session = require('express-session');
const mongoStore = require('connect-mongo')(session);
const serveur = require('http').createServer(app);
const io = require('socket.io')(serveur);
const helmet = require('helmet');
const config = require('./config.json');
const bodyParser = require('body-parser');

// Generate String
function getRandomString(length) {
    var randomChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var result = '';
    for (var i = 0; i < length; i++) {
        result += randomChars.charAt(Math.floor(Math.random() * randomChars.length));
    }
    return result;
}

// Mail
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: config.email,
        pass: config.emailMdp
    }
});

function sendMail(email, hash, pseudo) {
    let url = `http://localhost:3000/validate_account?hash=${hash}`;
    let html = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"><html style="width:100%;font-family:helvetica, 'helvetica neue', arial, verdana, sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;padding:0;Margin:0;"><head><meta charset="UTF-8"><meta content="width=device-width, initial-scale=1" name="viewport"><meta name="x-apple-disable-message-reformatting"><meta http-equiv="X-UA-Compatible" content="IE=edge"><meta content="telephone=no" name="format-detection"><title>New email</title> <!--[if gte mso 9]><style>sup { font-size: 100% !important; }</style><![endif]--> <!--[if !mso]><!-- --><link href="https://fonts.googleapis.com/css?family=Lato:400,400i,700,700i" rel="stylesheet"> <!--<![endif]--><style type="text/css">
    @media only screen and (max-width:600px) {p, ul li, ol li, a { font-size:17px!important; line-height:150%!important } h1 { font-size:26px!important; text-align:center; line-height:120%!important } h2 { font-size:24px!important; text-align:left; line-height:120%!important } h3 { font-size:20px!important; text-align:left; line-height:120%!important } h1 a { font-size:26px!important; text-align:center } h2 a { font-size:24px!important; text-align:left } h3 a { font-size:20px!important; text-align:left } .es-menu td a { font-size:16px!important } .es-header-body p, .es-header-body ul li, .es-header-body ol li, .es-header-body a { font-size:16px!important } .es-footer-body p, .es-footer-body ul li, .es-footer-body ol li, .es-footer-body a { font-size:17px!important } .es-infoblock p, .es-infoblock ul li, .es-infoblock ol li, .es-infoblock a { font-size:12px!important } *[class="gmail-fix"] { display:none!important } .es-m-txt-c, 
    .es-m-txt-c h1, .es-m-txt-c h2, .es-m-txt-c h3 { text-align:center!important } .es-m-txt-r, .es-m-txt-r h1, .es-m-txt-r h2, .es-m-txt-r h3 { text-align:right!important } .es-m-txt-l, .es-m-txt-l h1, .es-m-txt-l h2, .es-m-txt-l h3 { text-align:left!important } .es-m-txt-r img, .es-m-txt-c img, .es-m-txt-l img { display:inline!important } .es-button-border { display:inline-block!important } a.es-button { font-size:14px!important; display:inline-block!important } .es-btn-fw { border-width:10px 0px!important; text-align:center!important } .es-adaptive table, .es-btn-fw, .es-btn-fw-brdr, .es-left, .es-right { width:100%!important } .es-content table, .es-header table, .es-footer table, .es-content, .es-footer, .es-header { width:100%!important; max-width:600px!important } .es-adapt-td { display:block!important; width:100%!important } .adapt-img { width:100%!important; height:auto!important } .es-m-p0 { padding:0px!important } .es-m-p0r { 
    padding-right:0px!important } .es-m-p0l { padding-left:0px!important } .es-m-p0t { padding-top:0px!important } .es-m-p0b { padding-bottom:0!important } .es-m-p20b { padding-bottom:20px!important } .es-mobile-hidden, .es-hidden { display:none!important } .es-desk-hidden { display:table-row!important; width:auto!important; overflow:visible!important; float:none!important; max-height:inherit!important; line-height:inherit!important } .es-desk-menu-hidden { display:table-cell!important } table.es-table-not-adapt, .esd-block-html table { width:auto!important } table.es-social { display:inline-block!important } table.es-social td { display:inline-block!important } }#outlook a {	padding:0;}.ExternalClass {	width:100%;}.ExternalClass,.ExternalClass p,.ExternalClass span,.ExternalClass font,.ExternalClass td,.ExternalClass div {	line-height:100%;}.es-button {	mso-style-priority:100!important;	text-decoration:none!important;	transition:all 
    100ms ease-in;}a[x-apple-data-detectors] {	color:inherit!important;	text-decoration:none!important;	font-size:inherit!important;	font-family:inherit!important;	font-weight:inherit!important;	line-height:inherit!important;}.es-button:hover {	background:#555555!important;	border-color:#555555!important;}.es-desk-hidden {	display:none;	float:left;	overflow:hidden;	width:0;	max-height:0;	line-height:0;	mso-hide:all;}</style></head><body style="width:100%;font-family:helvetica, 'helvetica neue', arial, verdana, sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;padding:0;Margin:0;"><div class="es-wrapper-color" style="background-color:#F1F1F1;"><table class="es-wrapper" width="100%" cellspacing="0" cellpadding="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;padding:0;Margin:0;width:100%;height:100%;background-repeat:repeat;background-position:center top;">
    <tr style="border-collapse:collapse;"><td valign="top" style="padding:0;Margin:0;"><table class="es-content" cellspacing="0" cellpadding="0" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%;"><tr style="border-collapse:collapse;"><td align="center" style="padding:0;Margin:0;"><table class="es-content-body" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:#333333;" width="600" cellspacing="0" cellpadding="0" bgcolor="#333333" align="center"><tr style="border-collapse:collapse;"><td align="left" style="Margin:0;padding-top:40px;padding-bottom:40px;padding-left:40px;padding-right:40px;"><table width="100%" cellspacing="0" cellpadding="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;"><tr style="border-collapse:collapse;">
    <td width="520" valign="top" align="center" style="padding:0;Margin:0;"><table width="100%" cellspacing="0" cellpadding="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;"><tr style="border-collapse:collapse;"><td align="center" style="padding:0;Margin:0;padding-bottom:10px;padding-top:40px;"><h1 style="Margin:0;line-height:36px;mso-line-height-rule:exactly;font-family:lato, 'helvetica neue', helvetica, arial, sans-serif;font-size:30px;font-style:normal;font-weight:bold;color:#FEFAFA;">Bienvenue ${pseudo}</h1><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-size:15px;font-family:helvetica, 'helvetica neue', arial, verdana, sans-serif;line-height:23px;color:#FEFAFA;">Dans le monde de Kingdom of Nalleor</p></td></tr><tr style="border-collapse:collapse;">
    <td esdev-links-color="#757575" align="center" style="Margin:0;padding-top:10px;padding-bottom:20px;padding-left:30px;padding-right:30px;"><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-size:15px;font-family:helvetica, 'helvetica neue', arial, verdana, sans-serif;line-height:23px;color:#757575;">Nous te souhaitons de passer un agréable moment.</p></td></tr><tr style="border-collapse:collapse;"><td align="center" style="padding:0;Margin:0;padding-top:10px;padding-bottom:20px;"><span class="es-button-border" style="border-style:solid;border-color:#26A4D3;background:#26A4D3 none repeat scroll 0% 0%;border-width:0px;display:inline-block;border-radius:50px;width:auto;">
    <a href=${url} class="es-button" target="_blank" style="mso-style-priority:100 !important;text-decoration:none;transition:all 100ms ease-in;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:arial, 'helvetica neue', helvetica, sans-serif;font-size:14px;color:#FFFFFF;border-style:solid;border-color:#26A4D3;border-width:15px 30px;display:inline-block;background:#26A4D3 none repeat scroll 0% 0%;border-radius:50px;font-weight:bold;font-style:normal;line-height:17px;width:auto;text-align:center;">Valider mon compte</a></span></td></tr></table></td></tr></table></td></tr></table></td></tr></table></td></tr></table></div></body>
    </html>`;

    let mailOptions = {
        from: "Kingdom of Nalleor",
        to: email,
        subject: 'Bienvenue dans Kingdom of Nalleor',
        html: html
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}

// Connexion base de donnée
const mongojs = require('mongojs');
const db = mongojs(`mongodb+srv://${config.pseudo}:${config.mdp}@mmo-project-anpkb.mongodb.net/mmo-project?retryWrites=true&w=majority`, ['account', 'blog']);

// Modification de la variable inGame de tous les joueurs à false lors du démarrage du serveur histoire de ne pas bloquer l'accès aux joueurs
db.account.update({}, { $set: { inGame: false } }, function (err, res) {
    if (err) console.log(err);
});

// ==================================================================================================================
//  ____  ____  ____  _  _  ____  _  _  ____ 
// / ___)(  __)(  _ \/ )( \(  __)/ )( \(  _ \
// \___ \ ) _)  )   /\ \/ / ) _) ) \/ ( )   /
// (____/(____)(__\_) \__/ (____)\____/(__\_)
// ==================================================================================================================
// middleWare session pour express et socketIO
var sessionMiddleware = session({
    name: "sid",
    store: new mongoStore({
        url: `mongodb+srv://${config.pseudo}:${config.mdp}@mmo-project-anpkb.mongodb.net/mmo-project?retryWrites=true&w=majority`
    }),
    secret: config.secret,
    resave: false,
    saveUninitialized: false
});

// utilisation de helmet et désactivation de l'entête signifiant l'utilisation d'express
app.use(helmet());
app.disable("x-powered-by");

// Utilisation du middleware pour express et socketio
app.use(sessionMiddleware);
io.use(function (socket, next) {
    sessionMiddleware(socket.request, socket.request.res || {}, next);
})

app.use(bodyParser.urlencoded({
    extended: true
}));

app.get('/*', function (req, res, next) {
    if (req.path.indexOf(".html") != -1) {
        res.redirect(req.path.split('.html')[0]);
    }
    else {
        next();
    }
});

app.use(express.static(__dirname + '/public'));

app.route('/validate_account')
    .get(function (req, res) {
        if (req.query.hash) {
            db.account.updateOne({ activationHash: req.query.hash }, { $set: { active: true }, $unset: { "activationHash": "" } }, function (err, res) {
                if (err) console.log(err);
                req.session.alert = 'Votre compte a été activé avec succés';
            });
        }
        res.redirect('/');
    });

app.route('/')
    .get(function (req, res) {
        res.sendFile(__dirname + '/public/index.hmtl');
    });

app.route('/game')
    .get(function (req, res) {
        const { token } = req.session;
        if (token) {
            db.account.findOne({ token: token }, function (err, data) {
                if (err) console.log(err);
                if (data.inGame == true) {
                    req.session.alert = "Quelqu'un joue déjà sur ce compte";
                    res.redirect('/');
                }
                else {
                    db.account.updateOne({ token: token }, { $set: { inGame: true } }, function (err, res) {
                        if (err) console.log(err);
                    });
                    res.sendFile(__dirname + '/public/game.html');
                }
            });
        }
        else {
            req.session.alert = "Vous devez être connecté pour pouvoir jouer";
            res.redirect('/login');
        }
    });

app.route('/profil')
    .get(function (req, res) {
        const { token } = req.session;
        if (token) {
            res.sendFile(__dirname + '/public/profil.html');
        }
        else {
            res.redirect('/');
        }
    });

app.route('/login')
    .get(function (req, res) {
        const { token } = req.session;
        if (token) {
            res.redirect('/');
        }
        else {
            res.sendFile(__dirname + '/public/login.html');
        }
    })
    .post(function (req, res) {
        const { username, password } = req.body;
        db.account.findOne({ username: username, password: password }, function (err, data) {
            if (err) console.log(err);

            if (data) {
                req.session.token = data.token;
                req.session.username = data.username;
                res.send({
                    redirect: "/"
                });
                console.log(`utilisateur: ${data.username} vient de se connecter`);
            }
            else {
                res.send({
                    error: "Le nom d'utilisateur ou le mot de passe est incorrect"
                });
            }
        });
    });

app.route('/signin')
    .get(function (req, res) {
        const { token } = req.session;
        if (token) {
            res.redirect('/');
        }
        else {
            res.sendFile(__dirname + '/public/signin.html');
        }
    })
    .post(function (req, res) {
        const { email, username, password } = req.body;
        db.account.findOne({ $or: [{ email: email }, { username: username }] }, function (err, data) {
            if (err) console.log(err);

            if (data) {
                res.send({
                    error: "Email ou nom d'utilisateur déjà utilisé"
                });
            }
            else {
                let activationHash = getRandomString(128);
                let token = getRandomString(128);
                db.account.insertOne({ email: email, username: username, password: password, active: false, activationHash: activationHash, token: token });
                sendMail(email, activationHash, username);
                req.session.token = token;
                req.session.username = username;
                req.session.alert = `Un mail de validation vous a été envoyé sur l'adresse ${email}`;
                res.send({
                    redirect: "/"
                });
                console.log(`utilisateur: ${username} vient d'être créé`);
            }
        });
    });

app.route('/signin')
    .get(function (req, res) {
        const { token } = req.session;
        if (token) {
            res.sendFile(__dirname + '/public/game.html');
        }
        else {
            res.redirect('/');
        }
    });

app.route('/logout')
    .get(function (req, res) {
        const { token, username } = req.session;
        if (token) {
            req.session.destroy(function (err) {
                if (err) {
                    return res.redirect('/');
                }
            });

            console.log(`utilisateur: ${username} vient de se déconnecter`);
            res.clearCookie('sid');
            res.redirect('/');
        }
        else {
            res.redirect('/');
        }
    })
    .post(function (req, res) {

    });

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
        bullet_list[bullet_id] = new Bullet(bullet_id, this.id, this.x, this.y, 300 - Math.floor(Math.random() * 100), { minX: 3, minY: 3, maxX: 3, maxY: 3 }, this.mouseAngle, this.map, 24);
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
    constructor(id, parent_id, x, y, lifetime, size, angle, map, speed, onDie = null) {
        // Hérite de la classe Entity
        super(id, parent_id, x, y, size, map, speed);

        this.onDie = onDie;

        this.angle = angle;
        this.speed = speed;

        this.spdX = Math.cos(this.angle / 180 * Math.PI) * this.speed;
        this.spdY = Math.sin(this.angle / 180 * Math.PI) * this.speed;

        this.timeToDie = lifetime;
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
        if (this.onDie != null) {
            this.onDie();
        }
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

// Fonctions
function getPlayerCount() {
    let count = 0;
    for (let i in player_list) {
        count++;
    }
    return count;
}

// Cherche la connexion d'un client
io.on('connection', function (socket) {
    console.log("Quelqu'un vient de se connecter");
    socket.id = getRandomString(32);
    socket_list[socket.id] = socket;

    socket.on('welcome', function () {
        socket.emit('nombre users', getPlayerCount());
    });

    socket.on('getNav', function () {
        const { token } = socket.request.session;
        if (token) {
            socket.emit('nav', [
                [
                    "/",
                    "Accueil"
                ],
                [
                    "/profil",
                    socket.request.session.username
                ],
                [
                    "/logout",
                    "Déconnexion"
                ]
            ]
            );
        }
        else {
            socket.emit('nav', [
                [
                    "/login",
                    "Connexion"
                ],
                [
                    "/",
                    "Accueil"
                ],
                [
                    "/signin",
                    "Inscription"
                ]
            ]
            );
        }
    });

    socket.on('getGame', function () {
        const { token } = socket.request.session;
        if (token) {
            db.account.findOne({ token: token }, function (err, data) {
                if (err) console.log(err);
                if (data.inGame == true) {
                    socket.emit('alert', "Quelqu'un joue déjà sur ce compte");
                    socket.emit('redirect', "/");
                }
                else {
                    socket.emit('redirect', "/game");
                }
            });
        }
        else {
            socket.emit('alert', "Vous devez être connecté pour pouvoir jouer");
            socket.emit('redirect', "/login");
        }
    });

    socket.on('player ready', function () {
        let pseudo = socket.request.session.username;
        io.emit('chat message', { id: "Serveur", msg: `${pseudo} vient de se connecter !` });
        let player_map = ["spawn", "spawn1", "spawn2"][Math.floor(Math.random() * 3)];
        player_list[socket.id] = new Player(socket.id, false, pseudo, maps[player_map].spawnPoint.x, maps[player_map].spawnPoint.y, { minX: 16, minY: 0, maxX: 16, maxY: 46 }, player_map, 12);
        for (let i = 0; i < 8 * 9; i++) {
            player_list[socket.id].inventory.addItem(Math.floor(Math.random() * 144), Math.floor(Math.random() * 99999));
        }
        io.emit('nombre users', getPlayerCount());
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
                                socket_list[msg_target.id].emit('chat message', { id: `De ${player_list[socket.id].pseudo}`, msg: args[1] });
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
            db.account.updateOne({ token: socket.request.session.token }, { $set: { inGame: false } }, function (err, res) {
                if (err) console.log(err);
            });
            delete player_list[socket.id];
        }
        delete socket_list[socket.id];
        io.emit('nombre users', getPlayerCount());
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

    for (let i in player_list) {
        socket_list[player_list[i].id].emit('update', packet);
    }
}, 1000 / server_frameRate);
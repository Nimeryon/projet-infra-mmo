# Project infra mmo
## Présentation : 
Bonjour, voici mon projet de petit mmo, toujours en cours de developpement.
Les fonctionnalités plus avancées comme le gameplay arriveront dans les semaines ou mois à venir.
Bonne journée à vous ^^
(WIP)
Disponible sur https://kingdomofnalleor.herokuapp.com/

Pour faire fonctionner votre propre version, veuillez remplir le fichier config.json.
Pseudo: identifiant de connexion à votre base de données MongoDB
Mdp: Mot de passe de votre base de données MondoDB
Email: Email servant à envoyer les mails de vérification
Emailmdp: Mot de passe de l'email
Secret: Clé de criptage pour les variables session sur le serveur

---
## Installation pour Ubuntu : 
### Prérequis : 

- Mettre à jour le tout : 
```
sudo apt-get update
sudo apt-get upgrade
```

- Installer les prérequis : 
```
sudo apt-get install nginx -y
sudo apt-get install nodejs -y
sudo apt-get install npm -y
sudo apt-get install curl -y
sudo apt-get install ufw -y
```

---
### Configurer nginx : 
- Se rendre dans le dossier de nginx :
```
cd /etc/nginx/
```
- Supprimer la configuration par défault : 
```
sudo rm sites-available/default
sudo rm sites-enabled/default
```
- Création des certificats ssl permettant la mise en place du https : 
```
sudo mkdir ssl
sudo chmod 700 ssl/
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout /etc/nginx/ssl/cert.key -out /etc/nginx/ssl/cert.crt
(Passer le remplissage des informations, elles ne sont pas importantes dans notre cas)
```
- Créer la configuration du serveur nginx : 
```
sudo touch sites-available/mmo-project.conf
```
- Ouvrir le fichier de configuration avec votre éditeur préférée et y coller le code suivant en remplaçant les cases [IP local] par votre ip local, fonctionne aussi avec localhost : 
```
upstream express_server {
    server [IP local]:3000;
}

upstream monitoring {
    server [IP local]:19999;
}

server {
    listen      80;
    listen [::]:80;

    server_name www.mmo-project.com mmo-project.com;

    location /stub_status {
        stub_status;
        allow 127.0.0.1;
        deny all;
    }
}

server {
    listen      443 ssl;
    listen [::]:443 ssl;

    server_name www.mmo-project.com mmo-project.com;

    ssl_certificate     /etc/nginx/ssl/cert.crt;
    ssl_certificate_key /etc/nginx/ssl/cert.key;

    location / {
        proxy_pass http://express_server;
    }

    location /monitoring {
        proxy_pass http://monitoring/;
    }
}
```
- Créer un lien symbolique de la configuration dans sites-enabled : 
```
sudo ln sites-available/mmo-roject.conf sites-enabled/
```
- Tester la configuration du fichier : 
```
sudo nginx -t
```
- Si la commande est réussi passer à la suite, redémarrer nginx :
```
sudo systemctl restart nginx
```

---
### Installer et configurer netdata : 
```
bash <(curl -Ss https://my-netdata.io/kickstart.sh) --stable-channel
cd /etc/netdata
```
- Créer et éditer le fichier python.d/nginx.conf avec vi, vim ou nano (au choix ^^)
```
sudo vi python.d/nginx.conf
```
- Puis entrer :
```
localhost:
    name : 'local'
    url  : 'http://localhost/stub_status'
```
- Configurer l'ip de netdata afin de pouvoir y accéder sur notre réseau avec d'autres machines : 
```
sudo vi netdata.conf

```
- Rechercher la partie [web] et remplacer # bind to =  * par : 
```
bind to = 127.0.0.1,[IP local]
```
- Redémarrer Netdata
```
sudo systemctl restart netdata
```

---
### Installer et configurer mongodb : 

- Installation
```
wget -qO - https://www.mongodb.org/static/pgp/server-4.2.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu bionic/mongodb-org/4.2 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-4.2.list
sudo apt-get update
sudo apt-get install -y mongodb-org
```
- Configurer mongodb pour que le serveur démarre lors du démarrage de l'ordinateur : 
```
sudo systemctl enable mongod
```
- Editer le fichier de configuration de mondodb : 
```
sudo vi /etc/mondod.conf
```
- Dans la partie net, décommenter bindIp est y ajouter votre ip local : 
```
net:
  port: 27017
  bindIp: 127.0.0.1,[IP local]
```
- Redémarrer mongodb : 
```
sudo systemctl restart mongod
```
- Création de la base de données : 
```
mongo
use mmo-project
db.createCollection("account");
db.createCollection("progress");
```

---
### Configuration du pare-feu : 
- Autoriser les ports 80 et 443 : 
```
sudo ufw allow http
sudo ufw allow https
```
- Bloquer les ports 3000, 19999 et 27017 pour éviter que les utilisateurs sur le réseau puisse utiliser nos applications sans passer par le reverse proxy : 
```
sudo ufw deny 3000
sudo ufw deny 19999
sudo ufw deny 27017
```
- Activer les règles de pare-feu au démarrage :
```
sudo ufw enable
```

### Clonage du projet et lancement : 
- Se rendre dans votre dossier favori 
```
git clone git@github.com:Nimeryon/projet-infra-mmo.git
cd projet-infra-mmo
```
- Installer toutes les dépendances nécessaires au fonctionnement de nodejs : 
```
npm install
```
- Démarrer le serveur : 
```
npm run start
```
- Le serveur dévrait être accessible sur l'adresse suivante : 
> `https://localhost ou https://[IP local]`
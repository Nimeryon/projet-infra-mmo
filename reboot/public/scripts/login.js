function switchSignin() {
    document.getElementById("login-menu").style.display = "none";
    document.getElementById("form-login").reset();
    document.getElementById("signin-menu").style.display = "block";
}

function switchLogin() {
    document.getElementById("login-menu").style.display = "block";
    document.getElementById("signin-menu").style.display = "none";
    document.getElementById("form-signin").reset();
}

// Connexion
function validateLogin() {
    let username = document.getElementById("username").value;
    let password = document.getElementById("password").value;

    let error_username = document.getElementById("username-error");
    let error_password = document.getElementById("password-error");

    if (!username && !password) {
        error_username.innerText = "Aucun nom d'utilisateur";
        error_password.innerText = "Aucun mot de passe";
    }
    else if (!username) {
        error_username.innerText = "Aucun nom d'utilisateur";
        error_password.innerText = "";
    }
    else if (!password) {
        error_username.innerText = "";
        error_password.innerText = "Aucun mot de passe";
    }
    else {
        error_username.innerText = "";
        error_password.innerText = "";

        socket.emit('login request', { username: username, password: password });
    }
}

socket.on('login answer', function (data) {
    if (data.username && data.password) {
        sendInit();
    }
});

// Création de compte
var usernameOk = false;
var passwordOk = false;
var password2Ok = false;

function testUsername() {
    let username = document.getElementById("username-signin").value;
    let error_username = document.getElementById("username-signin-error");
    if (!username) {
        error_username.innerText = "Aucun nom d'utilisateur";
        usernameOk = false;
    }
    else if (username.length <= 4) {
        error_username.innerText = "Le nom d'utilisateur est trop court";
        usernameOk = false;
    }
    else if (username.length > 20) {
        error_username.innerText = "Le nom d'utilisateur est trop long";
        usernameOk = false;
    }
    else {
        error_username.innerText = "";
        usernameOk = true;
    }
}

function testPassword() {
    let regex = RegExp("^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$");
    let password = document.getElementById("password-signin").value;
    let error_password = document.getElementById("password-signin-error");
    if (!password) {
        error_password.innerText = "Aucun mot de passe";
        passwordOk = false;
    }
    else if (!regex.test(password)) {
        error_password.innerText = "Le mot de passe n'est pas valide";
        passwordOk = false;
    }
    else {
        error_password.innerText = "";
        passwordOk = true;
    }
}

function testPassword2() {
    let password = document.getElementById("password-signin").value;
    let password2 = document.getElementById("password-signin-2").value;
    let error_password2 = document.getElementById("password-signin-2-error");
    if (password2 != password) {
        error_password2.innerText = "Les mots de passe ne correspondent pas";
        password2Ok = false;
    }
    else {
        error_password2.innerText = "";
        password2Ok = true;
    }
}

function validateCreation() {
    testUsername();
    testPassword();
    testPassword2();

    if (sernameOk && passwordOk && password2Ok) {
        let username = document.getElementById("username-signin").value;
        let password = document.getElementById("password-signin").value;

        socket.emit('signin request', { username: username, password: password });
    }
}

socket.on('signin answer', function (data) {
    if (data.state) {
        sendInit(data.username);
    }
});

// Lancement de la requête pour lancer le jeux
function sendInit(username) {
    document.getElementById("game").style.display = "flex";
    document.getElementById("startMenuWrapper").style.display = "none";
    socket.emit('player ready', username);
}
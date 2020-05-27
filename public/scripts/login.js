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

    error_username.innerText = "";
    error_password.innerText = "";
    socket.emit('login request', { username: username, password: SHA256(password) });
}

socket.on('login answer', function (data) {
    if (data.state) {
        sendInit(data.username);
    }
    else {
        document.getElementById("password").value = "";

        document.getElementById("username-error").innerText = "Un problême est survenue avec le nom d'utilisateur ou le mot de passe";
        document.getElementById("password-error").innerText = "Un problême est survenue avec le nom d'utilisateur ou le mot de passe";
    }
});

// Création de compte
var initSent = false;
var emailOk = false;
var usernameOk = false;
var passwordOk = false;
var password2Ok = false;

function testEmail() {
    let email = document.getElementById("email-signin").value;
    let error_email = document.getElementById("email-signin-error");
    error_email = innerText = "";
    emailOk = true;
}

function testUsername() {
    let username = document.getElementById("username-signin").value;
    let error_username = document.getElementById("username-signin-error");
    if (username.length <= 4) {
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
    if (!regex.test(password)) {
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
    testEmail();
    testUsername();
    testPassword();
    testPassword2();

    if (emailOk && usernameOk && passwordOk && password2Ok) {
        let email = document.getElementById("email-signin").value;
        let username = document.getElementById("username-signin").value;
        let password = SHA256(document.getElementById("password-signin").value);

        socket.emit('signin request', { email: email, username: username, password: password });
    }
}

socket.on('signin answer', function (data) {
    if (data.state) {
        sendInit(data.username);
    }
    else {
        document.getElementById("password-signin").value = "";
        document.getElementById("password-signin-2").value = "";

        document.getElementById("email-signin-error").innerText = "Cet email ou nom d'utilisateur est déjà utilisé !";
        document.getElementById("username-signin-error").innerText = "Cet email ou nom d'utilisateur est déjà utilisé !";
    }
});

// Lancement de la requête pour lancer le jeux
function sendInit(username) {
    if (!initSent) {
        document.getElementById("game").style.display = "block";
        document.getElementById("startMenuWrapper").style.display = "none";
        socket.emit('player ready', username);
    }
    initSent = true;
}
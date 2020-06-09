var changeUsername, changeMail, changePassword = false;
var viewUsername, viewMail, viewPassword = false;

function hideShow(id) {
    if (id == "change-username") {
        $("#form-mail").hide();
        $("#form-password").hide();
        viewMail = false;
        viewPassword = false;

        if (viewUsername) {
            $("#form-username").hide();
            viewUsername = false;
        }
        else {
            $("#form-username").show();
            viewUsername = true;
        }
    }
    else if (id == "change-mail") {
        $("#form-password").hide();
        $("#form-username").hide();
        viewUsername = false;
        viewPassword = false;

        if (viewMail) {
            $("#form-mail").hide();
            viewMail = false;
        }
        else {
            $("#form-mail").show();
            viewMail = true;
        }
    }
    else if (id == "change-password") {
        $("#form-mail").hide();
        $("#form-username").hide();
        viewUsername = false;
        viewMail = false;

        if (viewPassword) {
            $("#form-password").hide();
            viewPassword = false;
        }
        else {
            $("#form-password").show();
            viewPassword = true;
        }
    }
}

function usernameformvalidation() {
    let username = $(".new-username").val();
    let password = $("#form-username .password").val();

    if (username.length < 4) {
        $("#form-username .password").val("");
        return $("#error").text("Nom d'utilisateur trop court");
    }
    else if (username.length > 32) {
        $("#form-username .password").val("");
        return $("#error").text("Nom d'utilisateur trop long");
    }

    $.post("/newusername",
        {
            username: username,
            password: SHA256(password)
        },
        function (data, status, jqXHR) {
            if (data.alert) {
                alert(data.alert);
            }

            if (data.redirect) {
                window.location = data.redirect;
            }

            if (data.error) {
                $("#form-username .password").val("");
                $("#error").text(data.error);
            }
        }
    );
}

function mailformvalidation() {
    let mail = $(".new-mail").val();
    let password = $("#form-mail .password").val();

    $.post(
        "/newmail",
        {
            mail: mail,
            password: SHA256(password),
        },
        function (data, status, jqXHR) {
            if (data.alert) {
                alert(data.alert);
            }

            if (data.redirect) {
                window.location = data.redirect;
            }

            if (data.error) {
                $("#form-username .password").val("");
                $("#error").text(data.error);
            }
        }
    );
}

function passwordformvalidation() {
    let password = $("#form-password .password").val();
    let newpassword = $("#form-password .new-password").val();
    let password_verification = $("#form-password .new-password-2").val();
    let regexPassword = RegExp("^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$");

    if (!regexPassword.test(newpassword)) {
        $("#form-password").trigger("reset");
        return $("#error").text("Le mot de passe n'est pas assez sécurisé");
    } else if (password_verification != newpassword) {
        $("#form-password").trigger("reset");
        return $("#error").text("Les mots de passe ne correspondent pas");
    }

    $.post(
        "/newpassword",
        {
            newpassword: SHA256(newpassword),
            password: SHA256(password),
        },
        function (data, status, jqXHR) {
            if (data.alert) {
                alert(data.alert);
            }

            if (data.redirect) {
                window.location = data.redirect;
            }

            if (data.error) {
                $("#form-username .password").val("");
                $("#error").text(data.error);
            }
        }
    );
}

function deleteAccount() {
    if (confirm("Êtes vous vraiment sûr de vouloir nous quitter ?")) {
        if (confirm("Vraiment vraiment sûr ?")) {
            alert("Nous sommes désolés de vous voir partir et espérons vous revoir un jour.");
            socket.emit('deleteAccount');
        }
    }
}
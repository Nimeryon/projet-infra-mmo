function signinformvalidation() {
    let regexPassword = RegExp("^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$");
    let email = $("#email-signin").val();
    let username = $("#username-signin").val();
    let password = $("#password-signin").val();
    let password_verification = $("#password-signin-2").val();

    if (username.length < 4) {
        $('#form-signin').trigger("reset");
        return $("#error").text("Nom d'utilisateur trop court");
    }
    else if (username.length > 32) {
        $('#form-signin').trigger("reset");
        return $("#error").text("Nom d'utilisateur trop long");
    }
    else if (!regexPassword.test(password)) {
        $('#form-signin').trigger("reset");
        return $("#error").text("Le mot de passe n'est pas assez sécurisé");
    }
    else if (password_verification != password) {
        $('#form-signin').trigger("reset");
        return $("#error").text("Les mots de passe ne correspondent pas");
    }

    $.post("/signin",
        {
            email: email,
            username: username,
            password: SHA256(password)
        },
        function (data, status, jqXHR) {
            if (data.redirect) {
                window.location = data.redirect;
            }
            else if (data.error) {
                $('#form-signin').trigger("reset");
                $("#error").text(data.error);
            }
        }
    );
}

function loginformvalidation() {
    let username = $("#username").val();
    let password = $("#password").val();
    $.post("/login",
        {
            username: username,
            password: SHA256(password)
        },
        function (data, status, jqXHR) {
            if (data.redirect) {
                window.location = data.redirect;
            }
            else if (data.error) {
                $("#error").text(data.error);
                $("#username").val("");
                $("#password").val("");
            }
        }
    );
}
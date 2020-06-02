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
            if (data.redirect) {
                window.location = data.redirect;
            }
            else if (data.error) {
                $("#form-username .password").val("");
                $("#error").text(data.error);
            }
            else if (data.alert) {
                alert(data.alert);
                window.location.reload();
            }
        }
    );
}

function mailformvalidation() {

}

function passwordformvalidation() {

}
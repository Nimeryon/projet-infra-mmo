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

}

function mailformvalidation() {

}

function passwordformvalidation() {

}
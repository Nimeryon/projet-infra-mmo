function getNav() {
    $.get("/getNav",
        function (data, status, jqXHR) {
            if (data.link) {
                for (let i = 0; i < data.link.length; i++) {
                    let li = document.createElement("li");
                    let a = document.createElement("a");
                    a.href = data.link[i][0];
                    a.innerText = data.link[i][1];
                    li.appendChild(a);
                    document.getElementById("link").appendChild(li);
                }
            }
        }
    );
}

function getAlert() {
    $.get("/getAlert",
        function (data, status, jqXHR) {
            if (data.alert) {
                alert(data.alert);
            }
        }
    );
}

function getGame() {
    $.get("/getGame",
        function (data, status, jqXHR) {
            if (data.redirect) {
                window.location = data.redirect;
            }
        }
    );
}

function get() {
    getNav();
    getAlert();
}
function getNav() {
    socket.emit('getNav');
}

function getGame() {
    socket.emit('getGame');
}

function get() {
    getNav();
}

socket.on('nav', function (data) {
    for (let i = 0; i < data.length; i++) {
        let li = document.createElement("li");
        let a = document.createElement("a");
        a.href = data[i][0];
        a.innerText = data[i][1];
        li.appendChild(a);
        document.getElementById("link").appendChild(li);
    }
});

socket.on('alert', function (data) {
    console.log('data');
    alert(data);
});

socket.on('redirect', function (data) {
    window.location = data;
});
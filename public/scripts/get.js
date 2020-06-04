function getNav() {
    socket.emit('getNav');
}

function getArticle() {
    socket.emit('getArticle');
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

socket.on('article', function (data) {
    console.log(data);
    data.forEach(article => {
        let divArticle = document.createElement('div');
        divArticle.id = "article";
        let divtitre_date = document.createElement('div');
        divtitre_date.id = "titre-date";
        let titre = document.createElement('h2');
        let date = document.createElement('span');
        titre.innerText = article.title;
        date.innerText = article.date;
        divtitre_date.appendChild(titre);
        divtitre_date.appendChild(date);
        divArticle.appendChild(divtitre_date);
        let content = document.createElement('div');
        content.id = "article-content";
        content.innerHTML = article.article;
        divArticle.appendChild(content);
        document.getElementById('article-content').appendChild(divArticle);
    });
});
function newArticle() {
    newTitle = $("#new-title").val();
    instantDate = Date.now()
    newImg = $("#new-img").val();
    newText = $("#new-text").val();

    $.post("/article",
        {
            titre: newTitle,
            date: instantDate,
            img: newImg,
            text: newText,
        },
        function (data, status, jqXHR) {
            if (data.redirect) {
                window.location = data.redirect;
            }
            else {

            }
        }
    );
}
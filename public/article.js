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

ClassicEditor
    .create(document.querySelector(".editor"), {
        toolbar: {
            items: [
                '|',
                'heading',
                'bold',
                'italic',
                'link',
                'bulletedList',
                'numberedList',
                '|',
                'indent',
                'outdent',
                'alignment',
                '|',
                'imageUpload',
                'blockQuote',
                'insertTable',
                'mediaEmbed',
                '|',
                'fontColor',
                'fontSize',
                '|',
                'horizontalLine',
                '|',
                'undo',
                'redo'
            ]
        },
        language: 'fr',
        image: {
            toolbar: [
                'imageTextAlternative',
                'imageStyle:full',
                'imageStyle:side'
            ]
        },
        table: {
            contentToolbar: [
                'tableColumn',
                'tableRow',
                'mergeTableCells'
            ]
        },
        licenseKey: '',

    })
    .then(editor => {
        window.editor = editor;
    })
    .catch(error => {
        console.error('Oops, something gone wrong!');
        console.error('Please, report the following error in the https://github.com/ckeditor/ckeditor5 with the build id and the error stack trace:');
        console.warn('Build id: 68ruokdtyzcq-rllgfekr2iaw');
        console.error(error);
    });
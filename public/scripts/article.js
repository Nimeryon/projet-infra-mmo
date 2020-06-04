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

function newArticle() {
    let saveData = window.editor.getData();
    $.post("/create_article",
        {
            data: saveData,
            title: $("#title").val()
        },
        function (data, status, jqXHR) {
            if (data.alert) {
                alert(data.alert);
            }

            if (data.redirect) {
                window.location = data.redirect;
            }
        }
    );
}
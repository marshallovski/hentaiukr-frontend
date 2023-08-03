document.addEventListener('DOMContentLoaded', function () {
    const pages = document.getElementsByClassName('image');
    for (const page of pages) {
        if (page.loaded) {
            page.removeAttribute('height');
        } else {
            page.addEventListener('load', function () {
                page.removeAttribute('height');
            })
        }
    }
})

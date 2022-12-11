let zoomed = false

function cache_progress(page) {
    localStorage.setItem(document.location.pathname, page);
}

function preloadImage(src) {
    if (!this.preloaded) {
        this.preloaded = {}
    }

    let img = this.preloaded[src]
    if (img) {
        return img
    }

    img = new Image();
    img.src = src
    img.id = "page"
    this.preloaded[src] = img

    return img
}

function preloadFunc(page, pages) {
    const preloadSize = 3

    return function () {
        const len = pages.length

        for (let i = page + 1; i < page + preloadSize && i < len; i++) {
            preloadImage(pages[i].src);
        }

        for (let i = page - 1; i > page - preloadSize && i > 0; i--) {
            preloadImage(pages[i].src);
        }
    }
}

function preload(page, pages) {
    const display = document.querySelector('#page')
    if (display.complete) {
        preloadFunc(page, pages)()
    } else {
        display.addEventListener('load', preloadFunc(page, pages), { once: true })
    }
}

function update(page, pages) {
    $("#page").replaceWith(preloadImage(pages[page].src))
    $("#page-selector").val(page + 1)

    $("html, body").animate({ scrollTop: 0 }, 300);
    helpers.updateSearchQuery('page', page + 1)
    cache_progress(page)
    preload(page, pages)
}

function func_prev() {
    if (page > 0) {
        page -= 1

        update(page, pages)
    }
}

function func_next() {
    if (page < pages.length - 1) {
        page += 1

        update(page, pages)
    }
}

function func_zoom() {
    $("#main").toggleClass("fit-height")

    zoomed = !zoomed
    localStorage.setItem('reader-full', zoomed)
}

function init() {
    page = helpers.decodeSearchQuery(window.location.search).page
    if (page) {
        page = page - 1
        if (isNaN(page) || page < 0) {
            page = 0
        } else if (page >= pages) {
            page = pages - 1
        }
    } else {
        page = localStorage.getItem(document.location.pathname);
        if (page !== null) {
            page = parseInt(page)
        } else {
            page = 0
        }
    }

    update(page, pages)
    if (localStorage.getItem('reader-full') === 'true') {
        func_zoom()
    }

    $("#page-prev").click(func_prev)
    $("#page-next").click(func_next)
    $("#page-first").click(() => {
        page = 0
        update(page, pages)
    })
    $("#page-last").click(() => {
        page = pages.length - 1
        update(page, pages)
    })

    $("#prev-page-overlay").click(func_prev)
    $("#next-page-overlay").click(func_next)

    $("#page-zoom").click(func_zoom)

    document.onkeydown = checkKey;

    document.addEventListener('click', function (event) {
        if (event.target == document.getElementById("page")) {
            if (event.clientX > $(window).width() / 2) {
                func_next()
            } else {
                func_prev()
            }
        }
    });

    $("#page-selector").on('change', function () {
        page = this.value - 1
        update(page, pages);
    });

    function checkKey(e) {
        e = e || window.event;

        if (e.keyCode == "37") {
            func_prev()
        } else if (e.keyCode == "39") {
            func_next()
        }
    }
}

document.addEventListener('DOMContentLoaded', init)

let zoomed = false

function cacheProgress(page) {
    localStorage.setItem(document.location.pathname, page);
}

class Reader {
    constructor(elems, pages, page) {
        this
    }
}

function newReader(elems, pages, page) {
    return {
        elems: elems,
        pages: pages,
        page: page,
        preloadSize: 3,
        preloaded: {},
        zoomed: false,

        Zoom: function () {
            this.elems.main.classList.toggle('fit-height');
            this.zoomed = !this.zoomed;
            localStorage.setItem('reader:zoomed', zoomed);
        },

        Next: function () {
            if (this.page >= pages.length - 1) {
                return
            }

            this.update(this.page + 1);
        },

        Prev: function () {
            if (this.page <= 0) {
                return
            }

            this.update(this.page - 1);
        },

        First: function () {
            this.update(0);
        },

        Last: function () {
            this.update(this.pages.length - 1);
        },

        update: function (page) {
            this.page = page;

            this.setPageImage(this.buildImage(this.pages[page].src));
            this.elems.page_selector.val = page + 1

            $("html, body").animate({ scrollTop: 0 }, 300);
            helpers.updateSearchQuery('page', page + 1)

            cacheProgress(page)
            this.updatePreload()
        },

        setPageImage: function (newImg) {
            this.elems.page.replaceWith(newImg);
            this.elems.page = newImg;
        },

        updatePreload: function () {
            // start preloading only after current image has been loaded
            if (this.elems.page.complete) {
                this.preloadFunc(this, this.page)
            } else {
                this.elems.page.addEventListener('load', () => { this.preloadFunc(this, this.page) }, { once: true })
            }
        },

        preloadFunc: function (self, page) {
            for (let i = page + 1; i < page + self.preloadSize && i < self.pages.length; i++) {
                self.buildImage(self.pages[i].src);
            }

            for (let i = page - 1; i > page - self.preloadSize && i > 0; i--) {
                self.buildImage(self.pages[i].src);
            }
        },

        buildImage: function (src) {
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
    }
}

function getCurrentPage(length) {
    const queryPage = helpers.decodeSearchQuery(window.location.search).page
    if (queryPage) {
        return helpers.mustIntInRange(queryPage, 1, length) - 1 // query parameter indexes start with 1
    }

    // value not in query params fallback to storage and default
    return helpers.mustIntInRange(localStorage.getItem(document.location.pathname), 0, length - 1)
}


function init() {
    const page = getCurrentPage(pages.length)

    const elems = {
        main: document.getElementById('main'),
        page: document.getElementById('page'),
        page_selector: document.getElementById('page-selector'),
    }

    const reader = newReader(elems, pages, page);

    reader.update(page);
    if (localStorage.getItem('reader:zoomed') === 'true') {
        reader.Zoom()
    }

    document.getElementById('page-zoom').addEventListener('click', () => { reader.Zoom() })
    document.getElementById('page-prev').addEventListener('click', () => { reader.Prev() })
    document.getElementById('page-next').addEventListener('click', () => { reader.Next() })
    document.getElementById('page-first').addEventListener('click', () => { reader.First() })
    document.getElementById('page-last').addEventListener('click', () => { reader.Last() })

    document.getElementById('page-container').addEventListener('click', function (event) {
        if (event.clientX > window.innerWidth / 2) {
            reader.Next()
        } else {
            reader.Prev()
        }
    });

    const keyListener = newKeyListener(document)

    keyListener.registerKey(['KeyA', 'ArrowLeft'], () => { reader.Prev() })
    keyListener.registerKey(['KeyD', 'ArrowRight'], () => { reader.Next() })
}

document.addEventListener('DOMContentLoaded', init)

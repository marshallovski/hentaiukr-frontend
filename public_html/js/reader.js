class Pager { // this duplicates code in search.js // should reuse
    constructor(numberOfPages, onChange, controllers) {
        this.lastPage = numberOfPages - 1;
        this.currentPage = 0;
        this.controllers = controllers;
        this.onChange = onChange;

        this._initListeners(controllers);
        this._updateControllersState();
    }

    setPage(page) {
        if (page < 0 || page > this.lastPage || page === this.currentPage) return;

        this.currentPage = page;
        this.onChange(page);
        this._updateControllersState();
    }

    _next() { this.setPage(this.currentPage + 1); }
    _prev() { this.setPage(this.currentPage - 1); }
    _first() { this.setPage(0); }
    _last() { this.setPage(this.lastPage); }

    _updateControllersState() {
        if (this.currentPage === 0) {
            this.controllers.first.classList.add('inactive');
            this.controllers.prev.classList.add('inactive');
        } else {
            this.controllers.first.classList.remove('inactive');
            this.controllers.prev.classList.remove('inactive');
        }

        if (this.currentPage === this.lastPage) {
            this.controllers.last.classList.add('inactive');
            this.controllers.next.classList.add('inactive');
        } else {
            this.controllers.last.classList.remove('inactive');
            this.controllers.next.classList.remove('inactive');
        }
        this.controllers.pageSelector.value = this.currentPage + 1
    }

    _initListeners(controllers) {
        controllers.pageSelector.addEventListener('change', (e) => this.setPage(e.target.value - 1));
        controllers.first.addEventListener('click', (e) => this._first());
        controllers.last.addEventListener('click', (e) => this._last());
        controllers.next.addEventListener('click', (e) => this._next());
        controllers.prev.addEventListener('click', (e) => this._prev());
    }
}

class Reader {
    constructor(pages, mainContainer, imageContainer, zoomed) {
        this.pages = pages;
        this.mainContainer = mainContainer;
        this.imageContainer = imageContainer;
        this.zoomed = zoomed;
        this.preloadSize = 3;
        this.preloaded = {};

        if (zoomed) this.zoom();
    }

    zoom() {
        this.mainContainer.classList.toggle('fit-height')
        this.zoomed = !this.zoomed;
        localStorage.setItem('reader:zoomed', this.zoomed);
    }

    update(page) {
        this.imageContainer.src = this._buildImage(this.pages[page].src).src
        window.scrollTo({ top: 0 });

        document.location.hash = page + 1
        localStorage.setItem(document.location.pathname, page);

        this._updatePreload(page)
    }

    _updatePreload(page) {
        // start preloading only after current image has been loaded
        if (this.imageContainer.complete) {
            this._preloadFunc(this, page)
        } else {
            this.imageContainer.addEventListener('load', () => { this._preloadFunc(this, page) }, { once: true })
        }
    }

    _preloadFunc(self, page) {
        for (let i = page + 1; i < page + self.preloadSize && i < self.pages.length; i++) {
            self._buildImage(self.pages[i].src);
        }

        for (let i = page - 1; i > page - self.preloadSize && i > 0; i--) {
            self._buildImage(self.pages[i].src);
        }
    }

    _buildImage(src) {
        let img = this.preloaded[src]
        if (!img) {
            img = new Image();
            img.src = src
            img.id = "page"
            this.preloaded[src] = img
        }

        return img
    }
}

function getCurrentPage(length) {
    const queryPage = document.location.hash.slice(1)
    if (queryPage) {
        return helpers.mustIntInRange(queryPage, 1, length) - 1 // query parameter indexes start with 1
    }

    // value not in query params fallback to storage and default
    return helpers.mustIntInRange(localStorage.getItem(document.location.pathname), 0, length - 1)
}

function getZommedStatus() {
    return localStorage.getItem('reader:zoomed') === 'true'
}

document.addEventListener('DOMContentLoaded', function () {
    const currentPage = getCurrentPage(pages.length);
    const zoomed = getZommedStatus();

    const mainContainer = document.getElementById('main');
    const imageContainer = document.getElementById('page');
    const reader = new Reader(pages, mainContainer, imageContainer, zoomed);
    const pager = new Pager(pages.length, (page) => reader.update(page), {
        pageSelector: document.getElementById('page-selector'),
        prev: document.getElementById('page-prev'),
        next: document.getElementById('page-next'),
        first: document.getElementById('page-first'),
        last: document.getElementById('page-last'),
    });

    document.getElementById('page-zoom').addEventListener('click', () => { reader.zoom() })

    const keyListener = newKeyListener(document)

    keyListener.registerKey(['KeyA', 'ArrowLeft'], () => { pager._prev() })
    keyListener.registerKey(['KeyD', 'ArrowRight'], () => { pager._next() })

    document.getElementById('page-container').addEventListener('click', function (event) {
        if (event.clientX > window.innerWidth / 2) pager._next(); else pager._prev()
    });

    pager.setPage(currentPage);
    reader.update(currentPage);
})

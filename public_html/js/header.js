class Header {
    constructor(self, searchBtn, searchField) {
        this.self = self;
        this.searchBtn = searchBtn;
        this.searchField = searchField;
        this.prevDirection = 0;
        this.prevScroll = window.scrollY || document.documentElement.scrollTop;

        const headerHeightPX = getComputedStyle(this.self).marginBottom;
        this.offset = +headerHeightPX.substr(0, headerHeightPX.length - 2);

        this.searchField.value = new URLSearchParams(document.location.search).get('query');
    }


    onScroll() {
        const currScroll = window.scrollY || document.documentElement.scrollTop;
        let currDirection = 0;

        if (currScroll > this.prevScroll) {
            currDirection = 1;
        } else if (currScroll < this.prevScroll) {
            currDirection = -1;
        }

        if (Math.abs(this.prevScroll - currScroll) < this.offset * 2) {
            return
        }

        if (currDirection === 1) {
            this.self.classList.add('head-hidden')
            this.prevDirection = currDirection
        } else if (currDirection === -1) {
            this.self.classList.remove('head-hidden')
            this.prevDirection = currDirection
        }

        this.prevScroll = currScroll
    }

    randomPage(objects) {
        const searchSection = this._searchSection();

        let sections = searchSection.split(',');
        if (searchSection === 'all') {
            sections = ['manga', 'video', 'korean'];
        }

        const category = objects[sections[helpers.randInt(sections.length)]]
        const object = category[helpers.randInt(category.length)];

        window.location.href = object.url;
    }

    onSearch() {
        const baseURL = '/search/';

        window.location.href = baseURL +
            '?section=' + this._searchSection() +
            '&query=' + encodeURIComponent(this.searchField.value);
    }

    _searchSection() {
        return new URLSearchParams(document.location.search).get('section') || this.searchBtn.dataset.searchSections || 'all';
    }
}

document.addEventListener('DOMContentLoaded', async function () {
    const headerElem = document.getElementById("header-elem");
    const searchBtn = document.getElementById("search-btn");
    const searchField = document.getElementById("search-npt");
    const randomBtn = document.getElementById("random-btn");

    const header = new Header(headerElem, searchBtn, searchField);
    const keyListener = newKeyListener(searchField);
    const objects = await helpers.getJSON('/search/objects.json');

    window.addEventListener('scroll', () => header.onScroll());
    searchBtn.addEventListener('click', () => header.onSearch());
    randomBtn.addEventListener('click', () => header.randomPage(objects));
    keyListener.registerKey(['Enter', 'NumpadEnter'], () => header.onSearch());
})

const ALL_SECTIONS = 'all'

class HTMLGenerator {
    thumbnails(objects) {
        let html = ''
        for (let i = 0; i < objects.length; i++) {
            html += `
            <div id="${i}" class="pager-item-select object-cover hidden">
                <a href="${objects[i].url}">
                    <div class="image">
                        <img id="img-${i}" src="/assets/main/placeholder.webp" data-src="${objects[i].thumb}"/>
                    </div>
                    <div class="name">
                        <h3>${objects[i].name}</h3>
                    </div>
                </a>
            </div>`
        }
        return html
    }

    selector(number) {
        let html = ''
        for (let i = 1; i <= number; i++) {
            html += `
            <option class="dropup-page">
                <span>${i}</span>
            </option>`
        }
        return html
    }
}

class Searcher {
    constructor(objects) {
        const formattedObjects = objects;
        for (const key in objects) {
            const category = objects[key];
            for (const i in category) {
                category[i].tags = new Set(category[i].tags.map(tag => tag.toLowerCase()));
                category[i].add_date = Date.parse(category[i].add_date);
            }

            formattedObjects[key] = category;
        }

        this.objects = formattedObjects;
    }

    search(params) {
        if (params.id) {
            const obj = this._search_id(params.id, params.sections);

            if (obj) {
                document.location.href = obj.url;
            }

            return [];
        }

        let searchObjects = [];
        for (const i in params.sections) {
            searchObjects = searchObjects.concat(this.objects[params.sections[i]]);
        }

        if (params.whiteTags.size > 0) {
            searchObjects = this._filterByWhiteTag(searchObjects, params.whiteTags)
        }

        if (params.blackTags.size > 0) {
            searchObjects = this._filterByBlackTag(searchObjects, params.blackTags)
        }

        if (params.queryTokens.length > 0) {
            this._setScores(searchObjects, params.queryTokens, params.whiteTags.size === 0)

            searchObjects = searchObjects.filter(obj => obj.score >= 2);
        }

        searchObjects.sort(function (a, b) {
            // score first priority
            if (a.score > b.score) return -1;
            if (b.score > a.score) return 1;

            // upload second priority
            if (a.add_date > b.add_date) return -1;
            if (b.add_date > a.add_date) return 1;

            return 0;
        });

        return searchObjects;
    }

    _search_id(id, sections) {
        const prioritySections = ['manga', 'video', 'korean'];

        sections.sort((a, b) => {
            return prioritySections.indexOf(a) > prioritySections.indexOf(b);
        })

        const category = this.objects[sections[0]];

        for (let i = 1; i < category.length; i++) {
            if (category[i].id == id) {
                return category[i];
            }
        }

        return false
    }

    _filterByWhiteTag(objects, tags) {
        let idx = 0;
        for (const i in objects) {
            let found = true;
            for (const whiteTag of tags) {
                if (!objects[i].tags.has(whiteTag)) {
                    found = false;
                    break;
                }
            }
            if (!found) {
                continue;
            }

            objects[idx] = objects[i];
            idx++;
        }

        return objects.slice(0, idx);
    }

    _filterByBlackTag(objects, tags) {
        let idx = 0;
        for (const i in objects) {
            let skip = false;
            for (const tag of objects[i].tags) {
                if (tags.has(tag)) {
                    skip = true;
                    break;
                }
            }
            if (skip) {
                continue;
            }

            objects[idx] = objects[i];
            idx++;
        }

        return objects.slice(0, idx);
    }

    _setScores(objects, tokens, checkTags) {
        const scores = {
            name: 10,
            team: 7,
            author: 3,
            studio: 3,
            tags: 2,
            short: 0.5,
        }

        const shortTokens = [];
        for (const token of tokens) {
            if (token.length > 5) {
                shortTokens.push(token.slice(0, 4));
            }
        }

        for (const i in objects) {
            let score = 0;

            for (const key in objects[i]) {
                let value = objects[i][key];
                if (!value) continue;

                if (key == 'tags') {
                    if (!checkTags) {
                        continue;
                    } else {
                        value = Array.from(value).join(', ');
                    }
                }

                value = String(value).toLowerCase();
                const multiplier = scores[key] || 1;

                for (const token of tokens) {
                    score += multiplier * this._tokenScore(token, value);
                }

                for (const token of shortTokens) {
                    score += multiplier * scores.short * this._tokenScore(token, value);
                }
            }

            objects[i].score = score;
        }
    }

    _tokenScore(token, string) {
        const fullWord = 1;
        const startsWith = 0.8;
        const middle = 0.3;
        const requireFullWord = 3;

        const pos = string.indexOf(token);
        if (pos === -1) return 0; // not found

        const distanceToPrevSpace = pos - string.lastIndexOf(' ', pos);
        if (distanceToPrevSpace === 1) { // start of word
            let nextSpacePos = string.indexOf(' ', pos);
            nextSpacePos = (nextSpacePos !== -1) ? nextSpacePos : string.length;

            if (nextSpacePos - pos - token.length === 0) {
                return fullWord;
            } else {
                if (token.length >= requireFullWord) {
                    return startsWith;
                }
            }
        }

        if (distanceToPrevSpace <= token.length) {
            return middle;
        }

        return 0;
    }
}

class Pager {
    constructor(items, itemsPerPage, controllers) {
        this.itemsPerPage = itemsPerPage;
        this.lastPage = Math.ceil(items.length / itemsPerPage) - 1;
        this.currentPage = 0;
        this.controllers = controllers;

        this.items = items.map(item => {
            item.img = document.getElementById('img-' + item.id)
            return item
        });
        this.nowShown = this.items.slice(0, itemsPerPage);

        this._show(this.nowShown);
        this._initListeners(controllers);
        this._updateControllersState();
    }

    _show(items) {
        for (const item of items) {
            item.classList.remove('hidden');
            item.img.src = item.img.dataset.src;
        }
    }

    _hide(items) {
        for (const item of items) {
            item.classList.add('hidden');
        }
    }

    _setPage(page) {
        if (page < 0 || page > this.lastPage || page === this.currentPage) return;

        console.log('Page: ' + page)
        this.currentPage = page;

        const willShow = this.items.slice(page * this.itemsPerPage, (page + 1) * this.itemsPerPage);
        this._show(willShow);
        this._hide(this.nowShown);
        this.nowShown = willShow;

        this._updateControllersState();
    }

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

    _next() { this._setPage(this.currentPage + 1); }
    _prev() { this._setPage(this.currentPage - 1); }
    _first() { this._setPage(0); }
    _last() { this._setPage(this.lastPage); }

    _initListeners(controllers) {
        controllers.pageSelector.addEventListener('change', (e) => this._setPage(e.target.value - 1));
        controllers.first.addEventListener('click', (e) => this._first());
        controllers.last.addEventListener('click', (e) => this._last());
        controllers.next.addEventListener('click', (e) => this._next());
        controllers.prev.addEventListener('click', (e) => this._prev());
    }
}


function parseQuery() {
    const queryParams = new URLSearchParams(document.location.search)
        ;
    // check selected sections
    let sections = queryParams.get('section') || 'all';

    if (sections === 'all') {
        sections = 'manga,video,korean';
    }

    sections = sections.split(',');

    // get query parameters
    let fullQuery = queryParams.get('query');
    if (fullQuery) {
        fullQuery = decodeURIComponent(fullQuery).toLowerCase().split(' ');
    } else {
        fullQuery = [];
    }


    // check if we got id in query
    if (fullQuery.length == 1) {
        const id = parseInt(fullQuery[0])
        if (!isNaN(id)) {
            return {
                sections: sections,
                id: id,
            }
        }
    }

    // parse query tokens for tags and words
    const whiteTags = new Set();
    const blackTags = new Set();
    const queryTokens = [];

    for (let i = 0; i < fullQuery.length; i++) {
        if (fullQuery[i].startsWith('+')) {
            whiteTags.add(fullQuery[i].slice(1).replace('_', ' '));
        } else if (fullQuery[i].startsWith('-')) {
            blackTags.add(fullQuery[i].slice(1).replace('_', ' '));
        } else {
            queryTokens.push(fullQuery[i]);
        }
    }

    return {
        sections: sections,
        whiteTags: whiteTags,
        blackTags: blackTags,
        queryTokens: queryTokens,
    }
}

document.addEventListener('DOMContentLoaded', async function () {
    // retrieve and filter objects
    const objects = await helpers.getJSON('/search/objects.json');

    const searcher = new Searcher(objects);
    let filtered = [];

    try {
        filtered = searcher.search(parseQuery());
    } catch (err) {
        console.error(err);
    }

    console.log(filtered);
    if (filtered.length === 0) {
        const notFound = document.getElementById('not-found');
        const paging = document.getElementById('paging');
        notFound.classList.remove('hidden');
        paging.classList.add('hidden');

        return;
    }

    // generate html of found objects
    const resultsArea = document.getElementById('results');
    const pageSelector = document.getElementById('page-selector');
    const pages = Math.ceil(filtered.length / resultsArea.dataset.objectsPerPage);

    const htmlGenerator = new HTMLGenerator();
    resultsArea.insertAdjacentHTML('beforeend', htmlGenerator.thumbnails(filtered));
    pageSelector.insertAdjacentHTML('beforeend', htmlGenerator.selector(pages));

    // apply paging to results
    const pagingOver = [].slice.call(document.getElementsByClassName('pager-item-select'));
    const pager = new Pager(pagingOver, +resultsArea.dataset.objectsPerPage, {
        pageSelector: pageSelector,
        prev: document.getElementById('page-prev'),
        next: document.getElementById('page-next'),
        first: document.getElementById('page-first'),
        last: document.getElementById('page-last'),
    });
})

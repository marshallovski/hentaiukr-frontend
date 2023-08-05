document.addEventListener('DOMContentLoaded', function () {
    const themeToggler = document.getElementById('theme-toggle')
    const verticalReaderToggler = document.getElementById('vertical-reader-toggle')
    const hideBlacklistedTagsToggler = document.getElementById('hide-blacklisted-tags')

    themeToggler.checked = theme.isDark();
    themeToggler.addEventListener('click', theme.toggle)

    verticalReaderToggler.checked = (localStorage.getItem('reader-vertical') || 'true') === 'true';
    verticalReaderToggler.addEventListener('click', () => localStorage.setItem('reader-vertical', verticalReaderToggler.checked))

    hideBlacklistedTagsToggler.checked = (localStorage.getItem('hide-blacklisted-tags') || 'false') === 'true';
    hideBlacklistedTagsToggler.addEventListener('click', () => localStorage.setItem('hide-blacklisted-tags', hideBlacklistedTagsToggler.checked))

    initBlacklitedTagsMultiselect();
})

async function initBlacklitedTagsMultiselect() {
    const tags = await (await fetch('/tags/tags.json')).json();
    const blacklistedTags = JSON.parse(localStorage.getItem('blacklisted-tags') || '[]');

    const multi = new Multiselect(
        tags,
        document.getElementById('add-backlisted-tag-btn'),
        document.getElementById('blacklisted-tags'),
        document.getElementById('add-backlisted-tag-sel'),
    )
    multi.onUpdate = () => { localStorage.setItem('blacklisted-tags', JSON.stringify(Array.from(multi.selected))) }
    multi.setSelected(blacklistedTags);
}

class Multiselect {
    constructor(items, button, target, selector) {
        this.items = items;
        this.button = button;
        this.target = target;
        this.selector = selector;
        this.selected = new Set();

        for (const item of items) {
            this.selector.appendChild(this._newOption(item.id, item.name));
        }

        this._initListeners();
    }

    _initListeners() {
        this.selector.addEventListener('change', () => { this._add(+this.selector.value); this.selector.value = this.items = '-1' })
    }

    setSelected(itemIDs) {
        if (!itemIDs || itemIDs.length === undefined) {
            return;
        }

        for (const id of itemIDs) {
            this._add(id);
        }
    }

    _add(id) {
        this.selected.add(id);

        let name = '';
        for (var i = 0; i < this.selector.length; i++) {
            if (this.selector.options[i].value == id) {
                name = this.selector.options[i].innerHTML;
                this.selector.options[i].hidden = true;
                break;
            }
        }

        this.target.appendChild(this._newSelected(id, name));

        this._onAdd();
    }

    _onAdd() {
        this.onAdd?.();
        this.onUpdate?.();
    }

    _onDelete() {
        this.onDelete?.();
        this.onUpdate?.();
    }

    _newOption(id, name) {
        const opt = document.createElement('option');
        opt.value = id;
        opt.innerHTML = name;

        return opt;
    }

    _newSelected(id, name) {
        const item = document.createElement('div');
        item.classList.add('item');

        const itemName = document.createElement('div');
        itemName.innerHTML = name;
        itemName.classList.add('name');
        item.appendChild(itemName);

        const itemDelete = document.createElement('div');
        itemDelete.classList.add('delete');
        item.appendChild(itemDelete);

        const deleteIcon = document.createElement('img');
        deleteIcon.src = '/assets/icons/close.png';
        deleteIcon.classList.add('icon')
        itemDelete.appendChild(deleteIcon);

        itemDelete.addEventListener('click', () => {
            this.selected.delete(id);
            item.remove();
            for (var i = 0; i < this.selector.length; i++) {
                if (this.selector.options[i].value == id) {
                    this.selector.options[i].hidden = false;
                    break;
                }
            }

            this._onDelete();
        })

        return item;
    }
}

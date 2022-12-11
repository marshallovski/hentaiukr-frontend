const searchbox = {
    execute: function () {
        const query = document.getElementById('search-input').value
        window.location.href = window.location.origin + '/search/?query=' + query;
    },

    onEnter: function (e) {
        e = e || window.event;
        const searchInputField = document.getElementById('search-input')

        if (e.keyCode != "13") {
            return
        }

        if (searchInputField !== document.activeElement) {
            return
        }

        searchbox.execute()
    },
}

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('search-button').addEventListener('click', searchbox.execute)
    document.onkeydown = searchbox.onEnter;
})
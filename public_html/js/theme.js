const theme = {
    isDark: function () {
        return JSON.parse(localStorage.getItem('dark-mode-set'))
    },
    toggle: function () {
        const darkModeSet = document.body.classList.toggle('dark-mode');
        localStorage.setItem('dark-mode-set', darkModeSet);
    },
    init: function () {
        if (theme.isDark()) {
            document.body.classList.add('dark-mode')
        }
    }
}

document.addEventListener('DOMContentLoaded', theme.init)
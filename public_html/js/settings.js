document.addEventListener('DOMContentLoaded', function () {
    const themeToggler = document.getElementById('theme-toggle')
    const verticalReaderToggler = document.getElementById('vertical-reader-toggle')

    themeToggler.checked = theme.isDark();
    themeToggler.addEventListener('click', theme.toggle)

    verticalReaderToggler.checked = (localStorage.getItem('reader-vertical') || 'true') === 'true';
    verticalReaderToggler.addEventListener('click', () => localStorage.setItem('reader-vertical', verticalReaderToggler.checked))
})

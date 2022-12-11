

document.addEventListener('DOMContentLoaded', function () {
    const themeToggler = document.getElementById('theme-toggle')

    if (theme.isDark()) { themeToggler.checked = true; }
    themeToggler.addEventListener('click', theme.toggle)
})
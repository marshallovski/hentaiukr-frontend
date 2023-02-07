const theme = {
    isDark: function () {
        return JSON.parse(localStorage.getItem('dark-mode-set'))
    },
    toggle: function () {
        const darkModeSet = document.body.classList.toggle('dark-mode');
        localStorage.setItem('dark-mode-set', darkModeSet);
    },
    init: function () {
        theme.drop_local_storage()
        if (theme.isDark()) {
            document.body.classList.add('dark-mode')
        }
    },

    drop_local_storage: function () {
        const version = 0.1
        const storageKey = 'storage-key-version'

        let currentVersion = JSON.parse(localStorage.getItem(storageKey))
        if (currentVersion === undefined || currentVersion === null) {
            currentVersion = 0.0
        }

        if (currentVersion >= version) {
            return
        }

        const shouldKeep = [
            'dark-mode-set',
        ]

        const temp = {}
        for (const i in shouldKeep) {
            temp[shouldKeep[i]] = localStorage.getItem(shouldKeep[i])
        }

        localStorage.clear()

        for (const key in temp) {
            localStorage.setItem(key, temp[key])
        }

        localStorage.setItem(storageKey, JSON.stringify(version))
        console.log('local_storage cleared. set version', version)
    },
}

document.addEventListener('DOMContentLoaded', theme.init)

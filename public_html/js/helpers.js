const iosDeviceOS = 'ios';
const androidDeviceOS = 'android';
const macosDeviceOS = 'macos';
const windowsPhoneDeviceOS = 'windows';
const linuxDeviceOS = 'linux';

document.addEventListener('DOMContentLoaded', function () {
    const elems = document.querySelectorAll(".should-remove")
    elems.forEach(e => {
        e.remove()
    })
})

const helpers = {
    decodeSearchQuery: function (query) {
        if (!query.length) {
            return {}
        }

        query = query.slice(1).split('&')

        let params = {}
        for (var i = 0; i < query.length; i++) {
            const [key, value] = query[i].split('=')

            if (params[key]) {
                params[key].push(value)
            } else {
                params[key] = [value]
            }
        }

        return params
    },

    encodeSearchQuery: function (params) {
        if ($.isEmptyObject(params)) {
            return ''
        }

        let query = []
        for (const [key, value] of Object.entries(params)) {
            for (const val of value) {
                query.push(key + '=' + val)
            }
        }

        return '?' + query.join('&')
    },

    updateSearchQuery: function (key, value) {
        path = window.location

        params = helpers.decodeSearchQuery(path.search)
        helpers.setSearchQueryParam(params, key, value)

        newPath = path.origin + path.pathname + helpers.encodeSearchQuery(params) + path.hash
        window.history.replaceState('', '', newPath)
    },

    setSearchQueryParam: function (params, key, value) {
        if (!$.isArray(value)) {
            value = [value]
        }

        params[key] = value
    },

    getDeviceOS: function () {
        var userAgent = navigator.userAgent || navigator.vendor || window.opera;

        if (/windows phone/i.test(userAgent)) {
            return windowsPhoneDeviceOS;
        }

        if (/android/i.test(userAgent)) {
            return androidDeviceOS;
        }

        if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
            return iosDeviceOS;
        }

        return "unknown";
    },

    convertRemToPixels: function (rem) {
        return rem * parseFloat(getComputedStyle(document.documentElement).fontSize);
    },
}
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
        if (Object.keys(params).length === 0) {
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
        if (value.constructor !== Array) {
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

    getElementsMapByClassName: function (className) {
        let map = {};
        [].slice.call(document.getElementsByClassName(className)).forEach(function (v) {
            map[v.id] = v;
        });

        return map
    },

    objectFromKeysAndValues: function (keys, values) {
        const result = {};
        for (let i = 0; i < keys.length; i++) {
            result[keys[i]] = values[i];
        }

        return result;
    },

    randInt: function (n) {
        return (n * Math.random()) << 0
    },

    randomProperty: function (obj) {
        const keys = Object.keys(obj);

        return obj[keys[this.randInt(keys.length)]];
    },

    scrollToTop: function (after) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setTimeout(() => window.scrollTo(0, 0), 500)
    },

    mustIntInRange: function (value, min, max) {
        const int = parseInt(value)

        if (isNaN(int)) {
            return min
        }

        if (int < min) {
            return min
        }

        if (int > max) {
            return max
        }

        return int
    },

    getJSON: async function (path) {
        const response = await fetch(path);
        const data = await response.json();

        return data;
    },
}

function newKeyListener(elem) {
    const listener = {
        registry: {},
        listen: function (e) {
            const func = this.registry[e.code]
            if (!func) {
                return
            }

            func()
        },

        registerKey: function (keys, func) {
            if (keys.constructor === Array) {
                for (const i in keys) {
                    this.registry[keys[i]] = func
                }

                return
            }

            this.registry[keys] = func
        }
    };

    elem?.addEventListener('keydown', (e) => listener.listen(e))

    return listener
}

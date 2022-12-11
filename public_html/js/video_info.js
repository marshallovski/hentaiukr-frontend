let mapping = {}
let activeID = null

function progress_valid(p) {
    if (p === undefined || p === null) {
        return false
    }

    if (p.episodes === undefined || p.episodes === null) {
        return false
    }

    if (p.current === undefined || p.current === null) {
        return false
    }

    return true
}

function set_progress(key) {
    let obj = get_progress()

    obj.current = key

    localStorage.setItem(
        document.location.pathname,
        JSON.stringify(obj),
    );
}

function set_progress_time(key, time) {
    let obj = get_progress()

    obj.episodes[key] = time

    localStorage.setItem(
        document.location.pathname,
        JSON.stringify(obj),
    );
}

function get_progress() {
    let obj = JSON.parse(localStorage.getItem(document.location.pathname));
    if (progress_valid(obj)) {
        return obj
    }

    return { episodes: {} }
}

function getID(el) {
    return parseInt(el.id.split('-')[1])
}

function compare_ids(a, b) {
    const intA = getID(a)
    const intB = getID(b)

    if (intA < intB) {
        return -1
    } else if (intA > intB) {
        return 1
    }

    throw new Error('Same ids are not possible: ' + intA + ', ', intB)
}

function switch_to_episode(mapping, key, episode) {
    return e => {
        set_progress_time(activeID, mapping[activeID].player.currentTime)
        mapping[activeID].switch.classList.remove('active')
        mapping[activeID].episode.classList.remove('active')
        mapping[activeID].player.pause()

        const obj = get_progress(key)
        episode.switch.classList.add('active')
        episode.episode.classList.add('active')
        episode.player.currentTime = obj.episodes[key]

        activeID = key
        set_progress(key)
    }
}

function initPlur(episodes) {
    const players = episodes.map(function (ep) {
        return new Plyr(ep, {
            title: ep.dataset.title,
            controls: ['play', 'progress', 'current-time', 'duration', 'mute', 'volume', 'captions', 'settings', 'download', 'fullscreen'],
            setting: ['captions', 'quality', 'speed', 'loop'],
            autopause: true,
            invertTime: false,
        })
    });

    return players
}

document.addEventListener('DOMContentLoaded', function () {
    let episodes = [].slice.call(document.getElementsByClassName('episode'))
    let switches = [].slice.call(document.getElementsByClassName('switch'))

    episodes.sort(compare_ids)
    switches.sort(compare_ids)

    if (episodes.length != switches.length) {
        throw new Error('Switches do not correspond to episode')
    }

    const players = initPlur(episodes)

    for (let i = 0; i < switches.length; i++) {
        mapping[getID(switches[i])] = {
            switch: switches[i],
            episode: episodes[i],
            player: players[i],
        }
    }

    activeID = getID(episodes[0])

    episodes[0].classList.add('active')
    switches[0].classList.add('active')

    for (const [key, val] of Object.entries(mapping)) {
        val.switch.addEventListener('click', switch_to_episode(mapping, key, val))
        val.player.on('seeking', e => { set_progress_time(key, val.player.currentTime) })
        val.player.on('pause', e => { set_progress_time(key, val.player.currentTime) })
    }

    let progress = get_progress()
    if (progress_valid(progress) && mapping[progress.current] !== undefined) {
        switch_to_episode(mapping, progress.current, mapping[progress.current])()

        mapping[progress.current].player.on('ready', e => {
            setTimeout(function () {
                mapping[progress.current].player.currentTime = progress.episodes[progress.current]
            }, 500);
        })
    } else {
        switch_to_episode(mapping, activeID, mapping[activeID])()
    }
});

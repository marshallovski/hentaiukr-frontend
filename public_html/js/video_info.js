async function loadVideoInfo(switches) {
    const path = './plur.cfg.json';
    const response = await fetch(path);
    const info = await response.json();

    return helpers.objectFromKeysAndValues(Object.keys(switches), info);
}

function getStorage(ids) {
    const storage = JSON.parse(localStorage.getItem(document.location.pathname))

    if (storage !== undefined && storage !== null) {
        return storage;
    }

    const newStorage = {
        currentID: ids[0],
        episodes: Object.fromEntries(ids.map(x => [x, {}])),
    }

    saveStorage(newStorage)

    return newStorage
}

function saveStorage(storage) {
    localStorage.setItem(document.location.pathname, JSON.stringify(storage))
}

function set_progress_time(player) {
    let storage = getStorage()

    storage.episodes[storage.currentID].time = player.currentTime

    saveStorage(storage)
}

function setTime(player, timestamp) {
    setTimeout(function () { player.currentTime = timestamp || 0 }, 500);
}

function switch_to_episode(player, id, episode_info) {
    return function (e) {
        let storage = getStorage()

        if (id === storage.currentID) {
            return
        }

        storage.episodes[storage.currentID].time = player.currentTime
        storage.currentID = id

        player.source = episode_info
        setTime(player, storage.episodes[storage.currentID]?.time)

        saveStorage(storage)
    }
}

function newPlyrConfig() {
    return {
        title: 'Example Title',
        setting: ['captions', 'quality', 'speed', 'loop'],
        controls: ['play', 'progress', 'current-time', 'duration', 'mute', 'volume', 'captions', 'settings', 'download', 'fullscreen'],
        autopause: true,
        invertTime: false,
        quality: { default: 720, options: [1080, 720, 480] },
    }
}

async function init() {
    const player = new Plyr('#episiode', newPlyrConfig());
    const switches = helpers.getElementsMapByClassName('switch');
    const ids = Object.keys(switches);
    const info = await loadVideoInfo(switches);
    const storage = getStorage(ids);

    player.on('seeking', e => { set_progress_time(player) })
    player.on('pause', e => { set_progress_time(player) })

    player.source = info[storage.currentID]
    setTime(player, storage.episodes[storage.currentID]?.time)

    for (const id in switches) {
        switches[id].addEventListener('click', switch_to_episode(player, id, info[id]))
    }
}

document.addEventListener('DOMContentLoaded', () => init());

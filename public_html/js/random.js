function generateRandom(n) {
    const covers = document.getElementsByClassName('object-cover')
    let shuffled = Array.from(covers)
    shuffled.sort(() => 0.5 - Math.random());

    let selected = shuffled.slice(0, n);
    let res = document.getElementById('random')

    selected.forEach(obj => {
        let elem = createElementFromHTML(obj.outerHTML)
        elem.classList.remove('hidden')
        elem.id = 'rand-' + elem.id

        let img = elem.childNodes[1].childNodes[1].childNodes[1]
        img.src = thumbs[img.id.split('-')[1]]
        img.id = 'rand-' + img.id

        res.insertAdjacentHTML('beforeend', elem.outerHTML)
    })
}

function initRandom() {
    if (!JSON.parse(localStorage.getItem('main-random-enabled'))) {
        document.getElementById('random-group').classList.add('row-hidden')
    }
}

function toggleRandom() {
    const mainRandomSet = document.getElementById('random-group').classList.toggle('row-hidden');
    localStorage.setItem('main-random-enabled', !mainRandomSet);
}

function initRandomListeners() {
    document.getElementById('page-selector').addEventListener('page-changed', function (e) {
        if (e.detail.page != 0) {
            document.getElementById('random-group').classList.add('hidden')
        } else {
            document.getElementById('random-group').classList.remove('hidden')
        }
    })

    document.getElementById('toggle-random').addEventListener('click', toggleRandom)
}

document.addEventListener('DOMContentLoaded', function () {

    generateRandom(10)
    initRandom()
    initRandomListeners()
})
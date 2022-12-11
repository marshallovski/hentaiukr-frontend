function filterByQuery(objects, query) {
    query = query.join(' ').toLowerCase().split(' ')
    let shortQuery = query.map(q => {
        if (q.length < 5) {
            return q
        }

        return q.slice(0, q.length - 2)
    })

    let refs = []

    objects.forEach(obj => {
        obj.tags = obj.tags?.join(' ')

        const fields = [
            String(obj.id),
            obj.ukr_name?.toLowerCase(),
            obj.eng_name?.toLowerCase(),
            obj.orig_name?.toLowerCase(),
            obj.author?.toLowerCase(),
            obj.team.name?.toLowerCase(),
            obj.tags?.toLowerCase()
        ]

        let score = 0;
        let found = false

        for (let i = 0; i < fields.length; i++) {
            for (let j = 0; j < query.length; j++) {
                if (fields[i]?.includes(query[j])) {
                    score += 1
                    found = true
                } else if (fields[i]?.includes(shortQuery[j])) {
                    score += 0.5
                    found = true
                }
            }
        }

        if (found) {
            let newObj = Object(null)
            newObj.obj = obj
            newObj.score = score
            refs.push(newObj)
        }
    })

    refs.sort((a, b) => (a.score < b.score) ? 1 : ((b.score < a.score) ? -1 : 0))
    objects = []

    refs.forEach(ref => objects.push(ref.obj))

    return objects
}

let pages = 1
let objects_num = 0

function filterByTag(objects, tags) {
    return objects.filter(function (obj) {
        let contains = true
        for (let i = 0; i < tags.length; i++) {
            if (!obj.tags.includes(tags[i])) {
                contains = false
                break
            }
        }
        return contains
    })
}

function generateHTML(objects) {
    let html = ''
    for (let i = 0; i < objects.length; i++) {
        html += `
            <div id="${i}" class="object-cover hidden">
                <a href="${objects[i].url}">
                    <div class="image">
                        <img id="img-${i}" src="/assets/main/placeholder.webp" , alt="${objects[i].name}" />
                    </div>
                    <div class="name">
                        <div>${objects[i].name}</div>
                    </div>
                </a>
            </div>`
    }
    return html
}

function getThumbnails(objects) {
    const thumbnails = {}
    for (let i = 0; i < objects.length; i++) {
        thumbnails[i] = objects[i].thumb
    }
    return thumbnails
}

function generatePageSelector(number) {
    let html = ''
    for (let i = 0; i < number; i++) {
        html += `
            <option class="dropup-page">
                <span>${i + 1}</span>
            </option>`
    }
    return html
}

function showNotFound() {
    document.getElementById('not-found').classList.remove('hidden')
}

document.addEventListener('DOMContentLoaded', function () {
    try {
        const params = new URLSearchParams(document.location.search)
        const tags = params.getAll('tag')
        const query = params.getAll('query')
        if (tags.length > 0) {
            objects = filterByTag(objects, tags)
        } else if (query.length > 0) {
            objects = filterByQuery(objects, query)
        }

        objects_num = objects.length
        pages = Math.ceil(objects_num / objects_per_page)
    } catch (err) {
        console.error(err)
        objects_num = 0
        pages = 1
    } finally {
        if (objects_num == 0) {
            showNotFound()
            return
        }
    }

    const covers = generateHTML(objects)
    const thumbnails = getThumbnails(objects)
    const selector = generatePageSelector(pages)

    document.getElementById('results').insertAdjacentHTML('beforeend', covers);
    document.getElementById('page-selector').insertAdjacentHTML('beforeend', selector)

    thumbs = thumbnails
})

callbacks = {}

function update(page, pages) {
    $('.not_hidden').each(function (i, obj) {
        obj.classList.remove('not_hidden')
        obj.classList.add('hidden')
    });

    let start = page * objects_per_page
    let end = start + objects_per_page
    if (end > objects_num) {
        end = objects_num
    }

    for (var i = start; i < end; i++) {
        $('#' + i).toggleClass('hidden not_hidden')

        image = $('#img-' + i)
        if (!image.hasClass('loaded')) {
            image.addClass('loaded')
            image.attr('src', thumbs[i])
        }
    }

    $("html, body").animate({ scrollTop: 0 }, 300);

    $("#page-selector").val(page + 1)
    helpers.updateSearchQuery('page', page + 1)
    updateActive(page, pages)

    document.getElementById('page-selector').dispatchEvent(new CustomEvent('page-changed', {
        detail: {
            page: page
        }
    }))
}

function updateActive(page, pages) {
    if (page === 0) {
        $("#page-prev").addClass('inactive')
        $("#page-first").addClass('inactive')
    } else {
        $("#page-prev").removeClass('inactive')
        $("#page-first").removeClass('inactive')
    }

    if (page === pages - 1) {
        $("#page-next").addClass('inactive')
        $("#page-last").addClass('inactive')
    } else {
        $("#page-next").removeClass('inactive')
        $("#page-last").removeClass('inactive')
    }
}

function funcPrev() {
    if (page > 0) {
        page -= 1

        update(page, pages)
    }
}

function funcNext() {
    if (page < pages - 1) {
        page += 1

        update(page, pages)
    }
}

function createElementFromHTML(htmlString) {
    var div = document.createElement('div');
    div.innerHTML = htmlString.trim();

    return div.firstChild;
}

function initListeners() {
    $("#page-prev").click(funcPrev)
    $("#page-next").click(funcNext)

    $("#page-first").click(() => {
        page = 0
        update(page, pages)
    })
    $("#page-last").click(() => {
        page = pages - 1
        update(page, pages)
    })

    $("#prev-page-overlay").click(funcPrev)
    $("#next-page-overlay").click(funcNext)

    $("#page-selector").on('change', function () {
        page = this.value - 1
        update(page, pages);
    });
}

$(document).ready(async function () {
    page = helpers.decodeSearchQuery(window.location.search).page
    if (page) {
        page = page - 1
        if (isNaN(page) || page < 0) {
            page = 0
        } else if (page >= pages) {
            page = pages - 1
        }
    } else {
        page = 0
    }
    update(page, pages)
    initListeners()
});


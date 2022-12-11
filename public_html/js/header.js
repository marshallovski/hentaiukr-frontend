const header = {
    prevScroll: window.scrollY || document.documentElement.scrollTop,
    prevDirection: 0,
    elem: null,
    offset: 0,
    onScroll: function () {
        const currScroll = window.scrollY || document.documentElement.scrollTop;
        let currDirection = 0;

        if (currScroll > header.prevScroll) {
            currDirection = 1;
        } else if (currScroll < header.prevScroll) {
            currDirection = -1;
        }

        if (Math.abs(header.prevScroll - currScroll) < header.offset) {
            return
        }

        if (currDirection === 1) {
            header.elem.classList.add('head-hidden')
            header.prevDirection = currDirection
        } else if (currDirection === -1) {
            header.elem.classList.remove('head-hidden')
            header.prevDirection = currDirection
        }

        header.prevScroll = currScroll
    }
}

document.addEventListener('DOMContentLoaded', function () {
    header.elem = document.getElementById("header-elem")
    const headerHeightPX = getComputedStyle(header.elem).marginBottom
    header.offset = +headerHeightPX.substr(0, headerHeightPX.length - 2)

    window.addEventListener('scroll', header.onScroll)
})
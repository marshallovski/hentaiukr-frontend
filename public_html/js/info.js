document.addEventListener('DOMContentLoaded', function () {
    if (helpers.getDeviceOS() === iosDeviceOS) {
        document.querySelector('#link-to-avif-reader')?.classList.add('hidden')
    }
})
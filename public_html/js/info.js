document.addEventListener('DOMContentLoaded', function () {
    const readerLink = document.getElementById('link-to-reader');
    const avifReaderLink = document.getElementById('link-to-avif-reader');
    const readerVertical = (localStorage.getItem('reader-vertical') || 'true') === 'true';

    if (helpers.getDeviceOS() === iosDeviceOS) {
        avifReaderLink?.classList.add('hidden')
    }

    if (readerVertical) {
        readerLink.href = 'vertical_reader.html'
    } else {
        readerLink.href = 'reader.html'
    }
})

document.addEventListener('DOMContentLoaded', function () {
    const hiddenSection = document.getElementById('hidden-section');
    const scrollAudio = document.getElementById('scroll-audio');
    const audioToggle = document.getElementById('audio-toggle');
    let audioEnabled = false;

    // Function to show hidden section on scroll
    function showHiddenSection() {
        const scrollPosition = window.scrollY || window.pageYOffset;
        if (scrollPosition > window.innerHeight) { // Check if scrolled past the first section
            hiddenSection.style.display = 'block';
        } else {
            hiddenSection.style.display = 'none';
        }
    }

    // Function to toggle audio
    function toggleAudio() {
        audioEnabled = !audioEnabled;
        if (audioEnabled) {
            scrollAudio.play().catch(error => {
                console.log('Audio play was prevented:', error);
            });
            audioToggle.textContent = 'Audio On';
        } else {
            scrollAudio.pause();
            audioToggle.textContent = 'Audio Off';
        }
    }

    // Event listener for scroll event, only for desktop devices
    function checkAndAddScrollListener() {
        if (window.innerWidth > 768) { // Check if the screen width is greater than 768px
            window.addEventListener('scroll', showHiddenSection);
        } else {
            hiddenSection.style.display = 'none'; // Ensure hidden section is hidden on mobile
            window.removeEventListener('scroll', showHiddenSection);
        }
    }

    // Toggle audio functionality
    audioToggle.addEventListener('click', toggleAudio);

    // Initial check and event listener for window resize
    checkAndAddScrollListener();
    window.addEventListener('resize', checkAndAddScrollListener);
});
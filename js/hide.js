
document.addEventListener('DOMContentLoaded', function () {
    const hiddenSection = document.getElementById('hidden-section');

    // Function to show hidden section on scroll
    function showHiddenSection() {
        const scrollPosition = window.scrollY || window.pageYOffset;
        if (scrollPosition > window.innerHeight) { // Check if scrolled past the first section
            hiddenSection.style.display = 'block';
        } else {
            hiddenSection.style.display = 'none';
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

    // Initial check and event listener for window resize
    checkAndAddScrollListener();
    window.addEventListener('resize', checkAndAddScrollListener);
});

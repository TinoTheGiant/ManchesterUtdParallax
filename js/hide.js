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

    // Event listener for scroll event
    window.addEventListener('scroll', showHiddenSection);
});
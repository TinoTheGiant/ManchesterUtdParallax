function scrollToSection() {
    const exploreSection = document.getElementById('explore') || document.querySelector('.section1');
    let targetSection = null;

    // Find the first <section> element after #explore
    if (exploreSection) {
        let next = exploreSection.nextElementSibling;
        while (next) {
            if (next.tagName && next.tagName.toUpperCase() === 'SECTION') {
                targetSection = next;
                break;
            }
            next = next.nextElementSibling;
        }
    }

    // Fallback selectors for both index.html and legends.html
    if (!targetSection) {
        targetSection = document.querySelector(
            'main section[data-slide="1"], main .sections, main .section2, main .legend1, #early90s, #siralex'
        );
    }

    if (targetSection) {
        const prefersReducedMotion =
            window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        targetSection.scrollIntoView({
            behavior: prefersReducedMotion ? 'auto' : 'smooth',
            block: 'start'
        });
    }
}

window.scrollToSection = scrollToSection;

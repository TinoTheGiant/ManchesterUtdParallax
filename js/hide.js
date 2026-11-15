(function () {
    function initHideToc() {
        const hiddenSection = document.getElementById('hidden-section') || document.querySelector('.toc');
        if (!hiddenSection) return;

        const heroSection = document.getElementById('explore') || document.querySelector('.section1');
        const footer = document.querySelector('footer');
        const container = document.querySelector('.container');
        let ticking = false;

        function getScrollTop() {
            const winScroll = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0;
            const containerScroll = container ? container.scrollTop : 0;
            return Math.max(winScroll, containerScroll);
        }

        function setTocVisible(isVisible) {
            hiddenSection.style.display = isVisible ? 'flex' : 'none';
            hiddenSection.classList.toggle('visible', isVisible);
            hiddenSection.classList.toggle('is-hidden', !isVisible);
            hiddenSection.setAttribute('aria-hidden', String(!isVisible));
        }

        function updateHiddenSectionVisibility() {
            const viewportWidth = window.innerWidth || document.documentElement.clientWidth || 1024;
            const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 800;

            // Keep TOC hidden on mobile screens
            if (viewportWidth <= 768) {
                setTocVisible(false);
                ticking = false;
                return;
            }

            // Hide when on the hero (#explore) section
            let onHero = false;
            if (heroSection) {
                const heroRect = heroSection.getBoundingClientRect();
                onHero = heroRect.bottom > viewportHeight * 0.35;
            } else {
                onHero = getScrollTop() <= viewportHeight * 0.65;
            }

            // Hide when the footer scrolls into the viewport
            let onFooter = false;
            if (footer) {
                const footerRect = footer.getBoundingClientRect();
                onFooter = footerRect.top < viewportHeight - 40;
            }

            setTocVisible(!onHero && !onFooter);
            ticking = false;
        }

        function requestUpdate() {
            if (!ticking) {
                window.requestAnimationFrame(updateHiddenSectionVisibility);
                ticking = true;
            }
        }

        // Observe hero and footer with IntersectionObserver in addition to passive scroll listeners
        if ('IntersectionObserver' in window) {
            const boundaryObserver = new IntersectionObserver(requestUpdate, {
                root: null,
                threshold: [0, 0.1, 0.35, 0.65, 1]
            });
            if (heroSection) boundaryObserver.observe(heroSection);
            if (footer) boundaryObserver.observe(footer);
        }

        window.addEventListener('scroll', requestUpdate, { passive: true });
        window.addEventListener('resize', requestUpdate, { passive: true });
        if (container) {
            container.addEventListener('scroll', requestUpdate, { passive: true });
        }

        updateHiddenSectionVisibility();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initHideToc);
    } else {
        initHideToc();
    }
})();

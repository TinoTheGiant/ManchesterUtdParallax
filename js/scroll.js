(function () {
    function initScroll() {
        const listItems = Array.from(document.querySelectorAll('.toc li, aside li'));
        const slides = Array.from(
            document.querySelectorAll('.sections, main section[data-slide]:not(#explore), main section[class*="legend"]')
        );
        const parallaxSections = Array.from(
            document.querySelectorAll('section[data-speed], .section1, .sections, main section[class*="legend"]')
        );
        const heroSection = document.getElementById('explore') || document.querySelector('.section1');
        const container = document.querySelector('.container');
        const reducedMotionQuery = window.matchMedia
            ? window.matchMedia('(prefers-reduced-motion: reduce)')
            : null;

        let ticking = false;

        function prefersReducedMotion() {
            return Boolean(reducedMotionQuery && reducedMotionQuery.matches);
        }

        function getSlideTargetForItem(li) {
            if (!li) return null;
            const link = li.querySelector('a[href^="#"]');
            if (link) {
                const hash = link.getAttribute('href');
                if (hash && hash.length > 1) {
                    const targetById = document.getElementById(hash.slice(1));
                    if (targetById) return targetById;
                }
            }
            const slideAttr = li.getAttribute('data-slide');
            if (slideAttr) {
                return document.querySelector(
                    `.sections[data-slide="${slideAttr}"], main section[data-slide="${slideAttr}"]`
                );
            }
            return null;
        }

        function setActiveListItem(activeSlide) {
            if (!listItems.length) return;

            if (!activeSlide) {
                listItems.forEach((item) => {
                    item.classList.remove('active');
                    const link = item.querySelector('a');
                    if (link) link.removeAttribute('aria-current');
                });
                return;
            }

            const slideNumber = activeSlide.getAttribute('data-slide');
            const slideId = activeSlide.id ? `#${activeSlide.id}` : '';

            listItems.forEach((item) => {
                const itemSlide = item.getAttribute('data-slide');
                const link = item.querySelector('a');
                const itemHref = link ? link.getAttribute('href') : '';
                const isMatch =
                    (slideNumber && itemSlide === slideNumber) ||
                    (slideId && itemHref === slideId);

                item.classList.toggle('active', Boolean(isMatch));
                if (link) {
                    if (isMatch) {
                        link.setAttribute('aria-current', 'location');
                    } else {
                        link.removeAttribute('aria-current');
                    }
                }
            });
        }

        // Use IntersectionObserver to mark visible sections with .in-view state class
        if ('IntersectionObserver' in window && slides.length) {
            const sectionObserver = new IntersectionObserver(
                (entries) => {
                    entries.forEach((entry) => {
                        entry.target.classList.toggle('in-view', entry.isIntersecting);
                    });
                },
                {
                    root: null,
                    rootMargin: '-10% 0px -10% 0px',
                    threshold: [0.15, 0.5]
                }
            );
            slides.forEach((slide) => sectionObserver.observe(slide));
        }

        function updateActiveSlideAndParallax() {
            const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 800;

            // Update subtle percentage-based parallax (unless reduced motion is preferred)
            if (prefersReducedMotion()) {
                parallaxSections.forEach((section) => {
                    if (section.style.backgroundPosition) {
                        section.style.backgroundPosition = '';
                    }
                    if (section.style.backgroundPositionY) {
                        section.style.backgroundPositionY = '';
                    }
                });
            } else {
                parallaxSections.forEach((section) => {
                    const rect = section.getBoundingClientRect();
                    if (rect.bottom < 0 || rect.top > viewportHeight) return;

                    const speed = parseFloat(section.getAttribute('data-speed')) || 50;
                    const viewportCenter = viewportHeight / 2;
                    const sectionCenter = rect.top + rect.height / 2;
                    const normalizedOffset = (sectionCenter - viewportCenter) / viewportHeight;
                    const isHero = section.id === 'explore' || section.classList.contains('section1');
                    const focalCenter = isHero ? 50 : 45;
                    const maxShift = Math.min(15, 750 / speed);
                    const yPercent = Math.max(25, Math.min(65, focalCenter + normalizedOffset * maxShift));
                    const yPos = `${yPercent.toFixed(2)}%`;
                    section.style.backgroundPosition = `50% ${yPos}`;
                    section.style.backgroundPositionY = yPos;
                });
            }

            if (!slides.length) {
                ticking = false;
                return;
            }

            // If still predominantly on the hero section, clear active TOC highlight
            if (heroSection) {
                const heroRect = heroSection.getBoundingClientRect();
                if (heroRect.bottom > viewportHeight * 0.55) {
                    setActiveListItem(null);
                    ticking = false;
                    return;
                }
            }

            // Find the content section occupying the viewport reading line (40% from top)
            const referenceLine = viewportHeight * 0.4;
            let currentSlide = null;

            for (const slide of slides) {
                const rect = slide.getBoundingClientRect();
                if (rect.top <= referenceLine && rect.bottom > referenceLine) {
                    currentSlide = slide;
                    break;
                }
            }

            // Fallback: choose the visible slide closest to the reference line
            if (!currentSlide) {
                let closestDistance = Infinity;
                for (const slide of slides) {
                    const rect = slide.getBoundingClientRect();
                    if (rect.bottom > 0 && rect.top < viewportHeight) {
                        const distance = Math.abs(rect.top - referenceLine);
                        if (distance < closestDistance) {
                            closestDistance = distance;
                            currentSlide = slide;
                        }
                    }
                }
            }

            setActiveListItem(currentSlide);
            ticking = false;
        }

        function onScroll() {
            if (!ticking) {
                window.requestAnimationFrame(updateActiveSlideAndParallax);
                ticking = true;
            }
        }

        // Smooth click-to-scroll for .toc li[data-slide] and links
        listItems.forEach((li) => {
            li.addEventListener('click', (event) => {
                const targetSection = getSlideTargetForItem(li);
                if (!targetSection) return;

                event.preventDefault();
                setActiveListItem(targetSection);
                targetSection.scrollIntoView({
                    behavior: prefersReducedMotion() ? 'auto' : 'smooth',
                    block: 'start'
                });

                if (targetSection.id && window.history && window.history.replaceState) {
                    window.history.replaceState(null, '', `#${targetSection.id}`);
                }
            });
        });

        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onScroll, { passive: true });
        if (container) {
            container.addEventListener('scroll', onScroll, { passive: true });
        }
        if (reducedMotionQuery && typeof reducedMotionQuery.addEventListener === 'function') {
            reducedMotionQuery.addEventListener('change', onScroll);
        }

        updateActiveSlideAndParallax();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initScroll);
    } else {
        initScroll();
    }
})();

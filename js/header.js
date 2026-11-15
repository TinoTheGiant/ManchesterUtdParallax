(function () {
    function ensureNavProgressBar(navbar) {
        let progressContainer = navbar.querySelector('.nav-progress-container');
        if (!progressContainer) {
            progressContainer = document.createElement('div');
            progressContainer.className = 'nav-progress-container';
            progressContainer.setAttribute('role', 'progressbar');
            progressContainer.setAttribute('aria-label', 'Page scroll progress');
            progressContainer.setAttribute('aria-valuemin', '0');
            progressContainer.setAttribute('aria-valuemax', '100');
            progressContainer.setAttribute('aria-valuenow', '0');
            navbar.appendChild(progressContainer);
        } else {
            if (!progressContainer.getAttribute('role')) {
                progressContainer.setAttribute('role', 'progressbar');
            }
            if (!progressContainer.getAttribute('aria-label')) {
                progressContainer.setAttribute('aria-label', 'Page scroll progress');
            }
            if (!progressContainer.getAttribute('aria-valuemin')) {
                progressContainer.setAttribute('aria-valuemin', '0');
            }
            if (!progressContainer.getAttribute('aria-valuemax')) {
                progressContainer.setAttribute('aria-valuemax', '100');
            }
            if (!progressContainer.getAttribute('aria-valuenow')) {
                progressContainer.setAttribute('aria-valuenow', '0');
            }
        }

        let progressBar =
            progressContainer.querySelector('#nav-progress-bar') ||
            document.getElementById('nav-progress-bar') ||
            progressContainer.querySelector('.nav-progress-bar');

        if (!progressBar) {
            progressBar = document.createElement('div');
            progressBar.id = 'nav-progress-bar';
            progressBar.className = 'nav-progress-bar';
            progressContainer.appendChild(progressBar);
        } else {
            progressBar.id = 'nav-progress-bar';
            if (!progressBar.classList.contains('nav-progress-bar')) {
                progressBar.classList.add('nav-progress-bar');
            }
            if (progressBar.parentNode !== progressContainer) {
                progressContainer.appendChild(progressBar);
            }
        }

        return { progressContainer, progressBar };
    }

    function initHeader() {
        if (typeof document === 'undefined' || typeof window === 'undefined') return;

        const navbar = document.getElementById('navbar') || document.querySelector('header');
        const container = document.querySelector('.container');
        if (!navbar) return;

        const { progressContainer, progressBar } = ensureNavProgressBar(navbar);
        const nativeProgress = typeof CSS !== 'undefined' &&
            CSS.supports('animation-timeline: scroll(root block)');
        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

        let lastScrollTop = 0;
        let ticking = false;

        function getScrollTop() {
            const winScroll = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0;
            const containerScroll = container ? container.scrollTop : 0;
            return Math.max(winScroll, containerScroll);
        }

        function updateScrollProgress() {
            const scrollable = document.documentElement.scrollHeight - window.innerHeight;
            const pct = scrollable > 0 ? Math.min(100, Math.max(0, (window.scrollY / scrollable) * 100)) : 0;
            if (!nativeProgress || reducedMotion.matches) {
                progressBar.style.width = pct.toFixed(2) + '%';
            } else if (progressBar.style.width) {
                progressBar.style.removeProperty('width');
            }
            progressContainer.setAttribute('aria-valuenow', String(Math.round(pct)));
        }

        function updateHeaderState() {
            const currentScroll = getScrollTop();
            if (currentScroll > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }

            if (currentScroll > lastScrollTop && currentScroll > 120) {
                navbar.classList.add('scrolling-down');
                navbar.classList.remove('scrolling-up');
            } else {
                navbar.classList.add('scrolling-up');
                navbar.classList.remove('scrolling-down');
            }

            updateScrollProgress();

            lastScrollTop = Math.max(0, currentScroll);
            ticking = false;
        }

        function handleHeaderScroll() {
            if (!ticking) {
                window.requestAnimationFrame(updateHeaderState);
                ticking = true;
            }
        }

        // Ensure active nav item matches current page
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        const navItems = navbar.querySelectorAll('#nav-links li');
        navItems.forEach((li) => {
            const link = li.querySelector('a');
            if (!link) return;
            const href = link.getAttribute('href') || '';
            if (href === currentPage || (currentPage === '' && href === 'index.html')) {
                li.classList.add('active');
                link.setAttribute('aria-current', 'page');
            }
        });

        window.addEventListener('scroll', handleHeaderScroll, { passive: true });
        window.addEventListener('resize', handleHeaderScroll, { passive: true });
        window.addEventListener('load', updateHeaderState, { passive: true });
        if (container) {
            container.addEventListener('scroll', handleHeaderScroll, { passive: true });
        }
        updateHeaderState();
    }

    if (typeof document !== 'undefined') {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initHeader);
        } else {
            initHeader();
        }
    }
})();

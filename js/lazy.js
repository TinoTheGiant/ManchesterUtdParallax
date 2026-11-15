(function () {
    function initLazyImages() {
        const scenes = document.querySelectorAll('.sections');
        if (!('IntersectionObserver' in window)) {
            scenes.forEach((scene) => scene.classList.add('scene-loaded'));
            return;
        }

        // Fetch the next photograph before its chapter reaches the viewport.
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add('scene-loaded');
                observer.unobserve(entry.target);
            });
        }, { rootMargin: `${window.innerHeight}px 0px`, threshold: 0 });

        scenes.forEach((scene) => observer.observe(scene));
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initLazyImages);
    } else {
        initLazyImages();
    }
})();

(function () {
    function initExperience() {
        const scenes = Array.from(document.querySelectorAll('main section[data-slide]'));
        if (!scenes.length || typeof HTMLDialogElement === 'undefined') return;

        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

        function currentSceneIndex() {
            const readingLine = window.innerHeight * 0.4;
            const index = scenes.findIndex((scene) => {
                const bounds = scene.getBoundingClientRect();
                return bounds.top <= readingLine && bounds.bottom > readingLine;
            });
            return index < 0 ? scenes.length - 1 : index;
        }

        function goToScene(scene) {
            scene.classList.add('scene-loaded');
            scene.scrollIntoView({
                behavior: reducedMotion.matches ? 'auto' : 'smooth',
                block: 'start'
            });
            window.history.replaceState(null, '', `#${scene.id}`);
        }

        function makeElement(tag, className, text) {
            const element = document.createElement(tag);
            if (className) element.className = className;
            if (text) element.textContent = text;
            return element;
        }

        const trigger = makeElement('button', 'chapter-trigger', 'Chapters');
        trigger.type = 'button';
        trigger.setAttribute('aria-haspopup', 'dialog');
        trigger.setAttribute('aria-controls', 'chapter-picker');
        trigger.setAttribute('aria-label', 'Open chapter navigation');

        const triggerIcon = makeElement('span', 'material-symbols-outlined', 'format_list_bulleted');
        triggerIcon.setAttribute('aria-hidden', 'true');
        trigger.prepend(triggerIcon);

        const dialog = makeElement('dialog', 'chapter-picker');
        dialog.id = 'chapter-picker';
        dialog.setAttribute('aria-labelledby', 'chapter-picker-title');

        const header = makeElement('div', 'chapter-picker-header');
        const title = makeElement('h2', null, 'Jump to a chapter');
        title.id = 'chapter-picker-title';
        const close = makeElement('button', 'chapter-picker-close');
        close.type = 'button';
        close.setAttribute('aria-label', 'Close chapter navigation');
        const closeIcon = makeElement('span', 'material-symbols-outlined', 'close');
        closeIcon.setAttribute('aria-hidden', 'true');
        close.appendChild(closeIcon);
        close.addEventListener('click', () => dialog.close());
        header.append(title, close);

        const navigation = makeElement('nav', 'chapter-picker-links');
        navigation.setAttribute('aria-label', 'All chapters');
        scenes.forEach((scene, index) => {
            const heading = scene.querySelector('h1');
            const label = index === 0 ? 'Introduction' : heading.firstChild.textContent.trim();
            const link = makeElement('a', 'chapter-picker-link');
            link.href = `#${scene.id}`;
            link.dataset.chapterIndex = String(index);
            link.append(
                makeElement('span', 'chapter-picker-number', String(index).padStart(2, '0')),
                makeElement('span', null, label)
            );
            link.addEventListener('click', (event) => {
                event.preventDefault();
                dialog.close();
                goToScene(scene);
                heading.setAttribute('tabindex', '-1');
                heading.focus({ preventScroll: true });
            });
            navigation.appendChild(link);
        });

        dialog.append(header, navigation,
            makeElement('p', 'chapter-picker-help', 'Use the up and down arrow keys to move between chapters.'));
        document.body.append(trigger, dialog);

        trigger.addEventListener('click', () => {
            const active = currentSceneIndex();
            navigation.querySelectorAll('a').forEach((link, index) => {
                if (index === active) link.setAttribute('aria-current', 'location');
                else link.removeAttribute('aria-current');
            });
            dialog.showModal();
        });

        dialog.addEventListener('click', (event) => {
            if (event.target !== dialog) return;
            const bounds = dialog.getBoundingClientRect();
            if (event.clientX < bounds.left || event.clientX > bounds.right ||
                event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
        });

        document.addEventListener('keydown', (event) => {
            if (!['ArrowDown', 'ArrowUp'].includes(event.key) || dialog.open ||
                event.altKey || event.ctrlKey || event.metaKey || event.shiftKey ||
                event.target.closest('input, textarea, select, [contenteditable="true"]')) return;

            const index = currentSceneIndex();
            const direction = event.key === 'ArrowDown' ? 1 : -1;
            const target = scenes[index + direction];
            if (!target) return;

            // Keep naturally scrolling within a chapter that is taller than the screen.
            const bounds = scenes[index].getBoundingClientRect();
            if (bounds.height > window.innerHeight + 2 &&
                (direction > 0 ? bounds.bottom > window.innerHeight + 2 : bounds.top < -2)) return;

            event.preventDefault();
            if (!event.repeat) goToScene(target);
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initExperience);
    } else {
        initExperience();
    }
})();

(function () {
    function initAudio() {
        const scrollAudio = document.getElementById('scroll-audio');
        const audioToggle = document.getElementById('audio-toggle');
        if (!scrollAudio || !audioToggle) return;

        const preferenceKey = 'united-audio-enabled';
        let wantsAudio = true;
        let playAttempt = 0;
        let waitingForInteraction = false;

        try {
            wantsAudio = window.localStorage.getItem(preferenceKey) !== 'false';
        } catch (_error) {
            // Playback still works when browser storage is unavailable.
        }

        scrollAudio.loop = true;
        scrollAudio.autoplay = wantsAudio;

        function updateAudioButton(isPlaying) {
            audioToggle.classList.toggle('playing', isPlaying);
            audioToggle.classList.toggle('active', isPlaying);
            audioToggle.setAttribute('aria-pressed', String(isPlaying));
            audioToggle.setAttribute('aria-label', isPlaying ? 'Pause stadium audio' : 'Play stadium audio');
            audioToggle.title = isPlaying ? 'Pause stadium audio' : 'Play stadium audio';

            const faIcon = audioToggle.querySelector('i[class*="fa-"], .fa-solid');
            const materialIcon = audioToggle.querySelector('.material-symbols-outlined');
            if (faIcon) {
                faIcon.className = isPlaying ? 'fa-solid fa-volume-high' : 'fa-solid fa-music';
                faIcon.setAttribute('aria-hidden', 'true');
            }
            if (materialIcon) {
                materialIcon.textContent = isPlaying ? 'volume_up' : 'music_note';
                materialIcon.setAttribute('aria-hidden', 'true');
            }
        }

        function removeInteractionListeners() {
            document.removeEventListener('pointerdown', playAfterInteraction, true);
            document.removeEventListener('keydown', playAfterInteraction, true);
            waitingForInteraction = false;
        }

        function waitForInteraction() {
            if (waitingForInteraction || !wantsAudio) return;
            waitingForInteraction = true;
            document.addEventListener('pointerdown', playAfterInteraction, true);
            document.addEventListener('keydown', playAfterInteraction, true);
        }

        async function startAudio() {
            if (!wantsAudio) return;
            const attempt = ++playAttempt;
            try {
                await scrollAudio.play();
                if (attempt !== playAttempt || !wantsAudio) {
                    if (!wantsAudio) scrollAudio.pause();
                    return;
                }
                removeInteractionListeners();
                updateAudioButton(!scrollAudio.paused);
            } catch (error) {
                if (attempt !== playAttempt || !wantsAudio) return;
                updateAudioButton(false);
                if (error && error.name === 'NotAllowedError') waitForInteraction();
            }
        }

        function playAfterInteraction(event) {
            // The audio control handles its own click, avoiding a play/pause race.
            if (audioToggle.contains(event.target)) return;
            if (event.type === 'keydown' &&
                (event.ctrlKey || event.metaKey || event.altKey ||
                 ['Tab', 'Escape', 'Shift', 'Control', 'Alt', 'Meta'].includes(event.key))) return;
            removeInteractionListeners();
            startAudio();
        }

        function toggleAudio() {
            wantsAudio = scrollAudio.paused;
            playAttempt += 1;
            removeInteractionListeners();
            try {
                window.localStorage.setItem(preferenceKey, String(wantsAudio));
            } catch (_error) {
                // A storage restriction must not prevent the mute button working.
            }
            if (wantsAudio) {
                startAudio();
            } else {
                scrollAudio.pause();
                updateAudioButton(false);
            }
        }

        audioToggle.addEventListener('click', toggleAudio);
        scrollAudio.addEventListener('play', () => updateAudioButton(true));
        scrollAudio.addEventListener('pause', () => updateAudioButton(false));
        scrollAudio.addEventListener('ended', () => updateAudioButton(false));
        scrollAudio.addEventListener('error', () => {
            removeInteractionListeners();
            updateAudioButton(false);
        });

        updateAudioButton(!scrollAudio.paused);
        if (wantsAudio) startAudio();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAudio);
    } else {
        initAudio();
    }
})();

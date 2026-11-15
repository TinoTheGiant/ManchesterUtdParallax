(function () {
    function initAudio() {
        const scrollAudio = document.getElementById('scroll-audio');
        const audioToggle = document.getElementById('audio-toggle');
        if (!scrollAudio || !audioToggle) return;

        // Normalize audio path if needed and loop background anthem
        const currentSrc = scrollAudio.getAttribute('src') || '';
        if (currentSrc.startsWith('/audio/')) {
            scrollAudio.setAttribute('src', currentSrc.slice(1));
        }
        scrollAudio.loop = true;

        let audioEnabled = false;

        function updateAudioButton(isPlaying) {
            audioEnabled = isPlaying;
            audioToggle.classList.toggle('playing', isPlaying);
            audioToggle.classList.toggle('active', isPlaying);
            audioToggle.setAttribute('aria-pressed', String(isPlaying));
            audioToggle.setAttribute('aria-label', isPlaying ? 'Pause stadium audio' : 'Play stadium audio');
            audioToggle.title = isPlaying ? 'Pause Audio' : 'Play Audio';

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

            if (!faIcon && !materialIcon) {
                audioToggle.textContent = '';
                const newMaterialIcon = document.createElement('span');
                newMaterialIcon.className = 'material-symbols-outlined';
                newMaterialIcon.setAttribute('aria-hidden', 'true');
                newMaterialIcon.textContent = isPlaying ? 'volume_up' : 'music_note';
                audioToggle.appendChild(newMaterialIcon);
            }
        }

        function toggleAudio() {
            if (scrollAudio.paused) {
                const playPromise = scrollAudio.play();
                if (playPromise !== undefined) {
                    playPromise
                        .then(() => {
                            updateAudioButton(true);
                        })
                        .catch((error) => {
                            console.warn('Audio playback was prevented by the browser:', error);
                            updateAudioButton(false);
                        });
                } else {
                    updateAudioButton(true);
                }
            } else {
                scrollAudio.pause();
                updateAudioButton(false);
            }
        }

        audioToggle.addEventListener('click', toggleAudio);
        scrollAudio.addEventListener('play', () => updateAudioButton(true));
        scrollAudio.addEventListener('pause', () => updateAudioButton(false));
        scrollAudio.addEventListener('ended', () => updateAudioButton(false));

        updateAudioButton(!scrollAudio.paused);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAudio);
    } else {
        initAudio();
    }
})();

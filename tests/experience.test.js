const { it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const audioSource = fs.readFileSync(path.join(__dirname, '../js/audio.js'), 'utf8');
const lazySource = fs.readFileSync(path.join(__dirname, '../js/lazy.js'), 'utf8');

class Events {
    constructor() { this.listeners = new Map(); }
    addEventListener(type, callback) {
        if (!this.listeners.has(type)) this.listeners.set(type, new Set());
        this.listeners.get(type).add(callback);
    }
    removeEventListener(type, callback) { this.listeners.get(type)?.delete(callback); }
    dispatch(type, properties = {}) {
        for (const callback of [...(this.listeners.get(type) || [])]) {
            callback({ type, target: this, ...properties });
        }
    }
}

function classList() {
    const values = new Set();
    return {
        add: (value) => values.add(value),
        contains: (value) => values.has(value),
        toggle: (value, enabled) => enabled ? values.add(value) : values.delete(value)
    };
}

function setupAudio({ outcomes = ['allowed'], preference = null, storageBlocked = false } = {}) {
    const audio = new Events();
    audio.paused = true;
    audio.playCalls = 0;
    audio.play = () => {
        audio.playCalls += 1;
        const outcome = outcomes.shift() || 'allowed';
        if (outcome === 'blocked') {
            const error = new Error('User interaction required');
            error.name = 'NotAllowedError';
            return Promise.reject(error);
        }
        if (outcome === 'unavailable') {
            const error = new Error('Audio is unavailable');
            error.name = 'NotSupportedError';
            return Promise.reject(error);
        }
        audio.paused = false;
        audio.dispatch('play');
        return outcome === 'allowed' ? Promise.resolve() : outcome;
    };
    audio.pause = () => {
        audio.paused = true;
        audio.dispatch('pause');
    };

    const button = new Events();
    const attributes = new Map();
    const icon = { setAttribute() {} };
    button.classList = classList();
    button.setAttribute = (name, value) => attributes.set(name, value);
    button.getAttribute = (name) => attributes.get(name);
    button.contains = (target) => target === button;
    button.querySelector = () => icon;

    const document = new Events();
    document.readyState = 'complete';
    document.getElementById = (id) => id === 'scroll-audio' ? audio : button;
    const storage = new Map(preference === null ? [] : [['united-audio-enabled', preference]]);
    const localStorage = {
        getItem(key) {
            if (storageBlocked) throw new Error('Storage is unavailable');
            return storage.get(key) ?? null;
        },
        setItem(key, value) {
            if (storageBlocked) throw new Error('Storage is unavailable');
            storage.set(key, value);
        }
    };

    vm.runInNewContext(audioSource, { document, window: { localStorage } });
    return { audio, button, document, storage };
}

const settle = () => new Promise((resolve) => setImmediate(resolve));

it('starts and loops audio on arrival when the browser permits autoplay', async () => {
    const { audio, button } = setupAudio();
    await settle();
    assert.equal(audio.playCalls, 1);
    assert.equal(audio.autoplay, true);
    assert.equal(audio.loop, true);
    assert.equal(button.getAttribute('aria-pressed'), 'true');
});

it('recovers from blocked autoplay on the first permitted interaction', async () => {
    const { audio, button, document } = setupAudio({ outcomes: ['blocked', 'allowed'] });
    await settle();
    assert.equal(button.getAttribute('aria-pressed'), 'false');
    document.dispatch('pointerdown');
    await settle();
    assert.equal(audio.playCalls, 2);
    assert.equal(button.getAttribute('aria-pressed'), 'true');
});

it('does not double-toggle the audio button or restart music after an intentional pause', async () => {
    const { audio, button, document, storage } = setupAudio({ outcomes: ['blocked', 'allowed'] });
    await settle();
    document.dispatch('pointerdown', { target: button });
    assert.equal(audio.playCalls, 1);
    button.dispatch('click');
    await settle();
    assert.equal(audio.paused, false);
    button.dispatch('click');
    document.dispatch('pointerdown');
    document.dispatch('keydown', { key: 'ArrowDown' });
    await settle();
    assert.equal(audio.paused, true);
    assert.equal(audio.playCalls, 2);
    assert.equal(storage.get('united-audio-enabled'), 'false');
});

it('respects a previously saved mute choice', async () => {
    const { audio, button, document } = setupAudio({ preference: 'false' });
    document.dispatch('pointerdown');
    await settle();
    assert.equal(audio.playCalls, 0);
    assert.equal(audio.autoplay, false);
    assert.equal(button.getAttribute('aria-pressed'), 'false');
});

it('allows playback and muting when browser storage is blocked', async () => {
    const { audio, button } = setupAudio({ storageBlocked: true });
    await settle();
    button.dispatch('click');
    assert.equal(audio.paused, true);
    assert.equal(button.getAttribute('aria-pressed'), 'false');
});

it('a late playback promise does not undo a pause', async () => {
    let resolvePlay;
    const pending = new Promise((resolve) => { resolvePlay = resolve; });
    const { audio, button } = setupAudio({ outcomes: [pending] });
    button.dispatch('click');
    resolvePlay();
    await settle();
    assert.equal(audio.paused, true);
    assert.equal(button.getAttribute('aria-pressed'), 'false');
});

it('does not keep retrying a missing or unsupported audio file on unrelated clicks', async () => {
    const { audio, document } = setupAudio({ outcomes: ['unavailable'] });
    await settle();
    document.dispatch('pointerdown');
    await settle();
    assert.equal(audio.playCalls, 1);
});

it('loads nearby chapter backgrounds without eagerly loading every photograph', () => {
    const scenes = Array.from({ length: 4 }, () => ({ classList: classList() }));
    let observer;
    class Observer {
        constructor(callback, options) {
            this.callback = callback;
            this.options = options;
            this.observed = new Set();
            observer = this;
        }
        observe(scene) { this.observed.add(scene); }
        unobserve(scene) { this.observed.delete(scene); }
    }
    vm.runInNewContext(lazySource, {
        document: { readyState: 'complete', querySelectorAll: () => scenes },
        window: { IntersectionObserver: Observer, innerHeight: 800 },
        IntersectionObserver: Observer
    });
    assert.equal(scenes.filter((scene) => scene.classList.contains('scene-loaded')).length, 0);
    observer.callback([{ target: scenes[1], isIntersecting: true }]);
    assert.equal(scenes[1].classList.contains('scene-loaded'), true);
    assert.equal(scenes[3].classList.contains('scene-loaded'), false);
    assert.equal(observer.observed.has(scenes[1]), false);
});

it('keeps all photographs available when IntersectionObserver is unsupported', () => {
    const scenes = Array.from({ length: 3 }, () => ({ classList: classList() }));
    vm.runInNewContext(lazySource, {
        document: { readyState: 'complete', querySelectorAll: () => scenes },
        window: {}
    });
    assert.ok(scenes.every((scene) => scene.classList.contains('scene-loaded')));
});

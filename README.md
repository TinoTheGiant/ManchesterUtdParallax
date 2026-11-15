# United: The History Archive

An independent Manchester United history site with full-screen parallax chapters, responsive layouts, and optional stadium audio.

## Development

Use Node.js 26. Run `npm install`, then `npm start` for the local server at `http://localhost:3000`. Run `npm test` for the integration and interaction tests.

The original HTML, CSS, and JavaScript remain editable. A Live Server extension can also preview the source pages, using the built-in club-data fallback when the API is unavailable.

## Production

Run `npm run build`. Vercel uses `vercel.json` to publish only `dist/`.

The build combines JavaScript into one minified bundle with mangled identifiers, removes source maps, minifies CSS, and fingerprints both files for caching. This provides light obfuscation whilst preserving a small bundle. Browser code remains inspectable; secrets must stay on a backend.

## Experience

- Native vertical scroll snapping, with the original parallax retained.
- A chapter picker on desktop and mobile, plus up/down keyboard navigation.
- Lazy chapter photographs, with the next scene prefetched and the introduction loaded eagerly.
- Automatic music playback when browser policy permits. If blocked, playback starts on the first eligible click, tap, or keypress. The music control remembers a pause choice across pages and visits.
- Native scroll-driven progress and cross-page view transitions in supporting browsers, with fallbacks and reduced-motion support.

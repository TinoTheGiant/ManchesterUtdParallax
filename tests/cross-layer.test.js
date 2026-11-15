const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');

const ROOT_DIR = path.resolve(__dirname, '..');

const EXPECTED_ERA_IDS = [
  'early90s',
  'mid90s',
  'late90s',
  'early2000s',
  'mid2000s',
  'late2000s',
  'early2010s',
  'mid2010s',
  'late2010s',
  'early2020s',
  'today'
];

const EXPECTED_LEGEND_IDS = [
  'siralex',
  'keane',
  'beckham',
  'scholes',
  'cantona',
  'neville',
  'ronaldo',
  'rooney',
  'ruud',
  'vandersar',
  'schmeichel',
  'solskjaer',
  'cole',
  'giggs',
  'ferdinand',
  'vidic',
  'evra'
];

function httpGet(baseUrl, urlPath) {
  return new Promise((resolve, reject) => {
    const req = http.get(`${baseUrl}${urlPath}`, (res) => {
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => {
        const body = Buffer.concat(chunks).toString('utf8');
        let json = null;
        try {
          json = JSON.parse(body);
        } catch {
          // Non-JSON response (e.g., static HTML/CSS/JS)
        }
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body,
          json
        });
      });
    });
    req.on('error', reject);
  });
}

function extractSectionIds(htmlContent, excludeIds = ['explore']) {
  const sectionRegex = /<section\b[^>]*\bid=["']([^"']+)["'][^>]*>/gi;
  const ids = [];
  let match;
  while ((match = sectionRegex.exec(htmlContent)) !== null) {
    if (!excludeIds.includes(match[1])) {
      ids.push(match[1]);
    }
  }
  return ids;
}

describe('Manchester United Cross-Layer Integration Suite', () => {
  let server;
  let baseUrl;
  let serverModule;
  let serverStartError = null;

  before(async () => {
    try {
      serverModule = require(path.join(ROOT_DIR, 'server.js'));
      assert.equal(typeof serverModule.createServer, 'function', 'server.js must export createServer()');
      server = serverModule.createServer();

      await new Promise((resolve, reject) => {
        server.once('error', reject);
        server.listen(0, '127.0.0.1', () => {
          const address = server.address();
          baseUrl = `http://127.0.0.1:${address.port}`;
          resolve();
        });
      });
    } catch (err) {
      serverStartError = err;
    }
  });

  after(async () => {
    if (server && server.listening) {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  function ensureServerRunning() {
    if (serverStartError) {
      throw serverStartError;
    }
    assert.ok(baseUrl, 'Expected test server baseUrl to be initialized');
  }

  describe('1. Backend API Layer (server.js & data/club-data.json)', () => {
    it('GET /api/health returns 200 and expected club health payload', async () => {
      ensureServerRunning();
      const res = await httpGet(baseUrl, '/api/health');
      assert.equal(res.statusCode, 200);
      assert.ok(res.json, 'Expected JSON response from /api/health');
      assert.equal(res.json.status, 'ok');
      assert.equal(res.json.club, 'Manchester United');
      assert.equal(res.json.founded, 1878);
    });

    it('GET /api/honours returns 200, summary array of major trophies, and all 11 timeline eras', async () => {
      ensureServerRunning();
      const res = await httpGet(baseUrl, '/api/honours');
      assert.equal(res.statusCode, 200);
      assert.ok(res.json, 'Expected JSON response from /api/honours');
      assert.ok(Array.isArray(res.json.summary), 'honours.summary must be an array');
      assert.ok(res.json.summary.length >= 6, 'honours.summary must list major trophy categories');

      for (const item of res.json.summary) {
        assert.equal(typeof item.competition, 'string');
        assert.equal(typeof item.count, 'number');
      }

      assert.ok(res.json.eras && typeof res.json.eras === 'object', 'honours.eras must be an object');
      for (const eraId of EXPECTED_ERA_IDS) {
        assert.ok(eraId in res.json.eras, `Missing era "${eraId}" in /api/honours eras`);
        const era = res.json.eras[eraId];
        assert.equal(typeof era.years, 'string', `Era "${eraId}" must have string years`);
        assert.equal(typeof era.majorTrophies, 'number', `Era "${eraId}" must have numeric majorTrophies`);
        assert.equal(typeof era.highlight, 'string', `Era "${eraId}" must have string highlight`);
      }
    });

    it('GET /api/legends returns 200, count: 17, and all 17 legend profiles with numeric stats', async () => {
      ensureServerRunning();
      const res = await httpGet(baseUrl, '/api/legends');
      assert.equal(res.statusCode, 200);
      assert.ok(res.json, 'Expected JSON response from /api/legends');
      assert.equal(res.json.count, 17);
      assert.ok(Array.isArray(res.json.legends), 'legends must be an array');
      assert.equal(res.json.legends.length, 17);

      const returnedIds = res.json.legends.map((l) => l.id);
      assert.deepEqual(returnedIds, EXPECTED_LEGEND_IDS);

      for (const legend of res.json.legends) {
        assert.equal(typeof legend.name, 'string', `Legend ${legend.id} must have a name`);
        assert.equal(typeof legend.appearances, 'number', `Legend ${legend.id} must have numeric appearances`);
        assert.equal(typeof legend.goals, 'number', `Legend ${legend.id} must have numeric goals`);
        assert.equal(typeof legend.trophies, 'number', `Legend ${legend.id} must have numeric trophies`);
      }
    });

    it('GET /api/matchday returns 200 with club "Manchester United" and stadium "Old Trafford"', async () => {
      ensureServerRunning();
      const res = await httpGet(baseUrl, '/api/matchday');
      assert.equal(res.statusCode, 200);
      assert.ok(res.json, 'Expected JSON response from /api/matchday');
      assert.equal(res.json.club, 'Manchester United');
      assert.equal(res.json.stadium, 'Old Trafford');
    });

    it('serves static files cleanly for /index.html, /legends.html, /css/styles.css, and /js/club-data-ui.js', async () => {
      ensureServerRunning();
      const staticPaths = [
        { path: '/index.html', marker: '<!DOCTYPE html>' },
        { path: '/legends.html', marker: '<!DOCTYPE html>' },
        { path: '/css/styles.css', marker: '--mu-red' },
        { path: '/js/club-data-ui.js', marker: '/api/honours' }
      ];

      for (const item of staticPaths) {
        const res = await httpGet(baseUrl, item.path);
        assert.equal(res.statusCode, 200, `Expected 200 for static path ${item.path}`);
        assert.ok(
          res.body.includes(item.marker),
          `Expected static response for ${item.path} to contain "${item.marker}"`
        );
      }
    });
  });

  describe('2. Frontend & Cross-Layer Wiring (index.html, legends.html, js/header.js, js/club-data-ui.js)', () => {
    const indexHtmlPath = path.join(ROOT_DIR, 'index.html');
    const legendsHtmlPath = path.join(ROOT_DIR, 'legends.html');
    const headerJsPath = path.join(ROOT_DIR, 'js', 'header.js');
    const clubDataUiPath = path.join(ROOT_DIR, 'js', 'club-data-ui.js');

    it('index.html and legends.html include club-data-ui.js, header.js, .nav-crest logo, #C70101 theme-color, #navbar progress bar, Google Fonts (Oswald, Bebas Neue, Source Sans 3, Barlow Condensed, Montserrat), Font Awesome, and Google Material Symbols (including home icon)', () => {
      const indexHtml = fs.readFileSync(indexHtmlPath, 'utf8');
      const legendsHtml = fs.readFileSync(legendsHtmlPath, 'utf8');

      for (const [pageName, html] of [
        ['index.html', indexHtml],
        ['legends.html', legendsHtml]
      ]) {
        assert.match(
          html,
          /<script\s+src=["']js\/header\.js["']\s*><\/script>/i,
          `${pageName} must include <script src="js/header.js"></script>`
        );
        assert.match(
          html,
          /<script\s+src=["']js\/club-data-ui\.js["']\s*><\/script>/i,
          `${pageName} must include <script src="js/club-data-ui.js"></script>`
        );
        assert.match(
          html,
          /<img\b[^>]*src=["']assets\/logo\.png["'][^>]*class=["'][^"']*\bnav-crest\b[^"']*["'][^>]*>/i,
          `${pageName} must include <img src="assets/logo.png" ... class="nav-crest" ...>`
        );
        assert.match(
          html,
          /<meta\s+name=["']theme-color["']\s+content=["']#(C70101|DA291C)["']\s*\/?>/i,
          `${pageName} must include <meta name="theme-color" content="#C70101"> (or #DA291C)`
        );
        assert.match(
          html,
          /<header\b[^>]*id=["']navbar["'][^>]*>[\s\S]*?<div\b[^>]*class=["'][^"']*\bnav-progress-container\b[^"']*["'][^>]*role=["']progressbar["'][^>]*>\s*<div\b[^>]*id=["']nav-progress-bar["'][^>]*class=["'][^"']*\bnav-progress-bar\b[^"']*["'][^>]*><\/div>\s*<\/div>\s*<\/header>/i,
          `${pageName} must include .nav-progress-container[role="progressbar"] > #nav-progress-bar.nav-progress-bar inside <header id="navbar">`
        );
        assert.ok(
          html.includes('Oswald') &&
            html.includes('Barlow+Condensed') &&
            html.includes('Bebas+Neue') &&
            html.includes('Montserrat') &&
            html.includes('Source+Sans+3'),
          `${pageName} must include Google Fonts link for Oswald, Barlow Condensed, Bebas Neue, Montserrat, and Source Sans 3`
        );
        assert.ok(
          html.includes('Material+Symbols+Outlined'),
          `${pageName} must include Google Material Symbols Outlined stylesheet`
        );
        assert.match(
          html,
          /<a\b[^>]*href=["']index\.html["'][^>]*>\s*<span\b[^>]*class=["'][^"']*\bmaterial-symbols-outlined\b[^"']*["'][^>]*>\s*home\s*<\/span>\s*Home\s*<\/a>/i,
          `${pageName} must include .material-symbols-outlined "home" icon inside the Home navigation link`
        );
        assert.ok(
          html.includes('emoji_events'),
          `${pageName} must include .material-symbols-outlined "emoji_events" icon for Legends`
        );
        assert.ok(
          html.includes('font-awesome') && html.includes('fa-solid'),
          `${pageName} must include Font Awesome stylesheet and fa-solid icons`
        );
      }
    });

    it('js/header.js ensures .nav-progress-container and #nav-progress-bar exist inside #navbar and dynamically updates width and aria-valuenow on scroll', () => {
      assert.ok(fs.existsSync(headerJsPath), 'js/header.js must exist');
      const headerJs = fs.readFileSync(headerJsPath, 'utf8');

      assert.ok(
        headerJs.includes('nav-progress-container') && headerJs.includes('nav-progress-bar'),
        'js/header.js must reference .nav-progress-container and #nav-progress-bar'
      );
      assert.ok(
        headerJs.includes('progressbar') && headerJs.includes('aria-valuenow'),
        'js/header.js must manage role="progressbar" and aria-valuenow on .nav-progress-container'
      );
      assert.ok(
        headerJs.includes('scrollHeight') &&
          headerJs.includes('innerHeight') &&
          headerJs.includes('style.width'),
        'js/header.js must compute scroll percentage from scrollHeight - innerHeight and update progressBar.style.width'
      );
    });

    it('every timeline section ID in index.html exists in GET /api/honours eras, and every legend section ID in legends.html exists in GET /api/legends', async () => {
      const indexHtml = fs.readFileSync(indexHtmlPath, 'utf8');
      const legendsHtml = fs.readFileSync(legendsHtmlPath, 'utf8');

      const indexSectionIds = extractSectionIds(indexHtml, ['explore']);
      const legendSectionIds = extractSectionIds(legendsHtml, ['explore']);

      assert.deepEqual(indexSectionIds, EXPECTED_ERA_IDS, 'index.html timeline section IDs must match expected 11 eras');
      assert.deepEqual(legendSectionIds, EXPECTED_LEGEND_IDS, 'legends.html section IDs must match expected 17 legends');

      ensureServerRunning();
      const honoursRes = await httpGet(baseUrl, '/api/honours');
      const legendsRes = await httpGet(baseUrl, '/api/legends');

      for (const id of indexSectionIds) {
        assert.ok(
          honoursRes.json && honoursRes.json.eras && id in honoursRes.json.eras,
          `Timeline section ID #${id} in index.html must exist in GET /api/honours eras`
        );
      }

      const apiLegendIds = new Set((legendsRes.json?.legends || []).map((l) => l.id));
      for (const id of legendSectionIds) {
        assert.ok(
          apiLegendIds.has(id),
          `Legend section ID #${id} in legends.html must exist in GET /api/legends`
        );
      }
    });

    it('js/club-data-ui.js references /api/honours, /api/legends, /api/matchday, renders #mu-honours-bar and .mu-stat-badge, and mirrors ManUtd.com #C70101 red/white palette + Oswald/Bebas Neue/Source Sans 3 fonts + Font Awesome + Google Material Symbols icons', () => {
      assert.ok(fs.existsSync(clubDataUiPath), 'js/club-data-ui.js must exist');
      const uiJs = fs.readFileSync(clubDataUiPath, 'utf8');

      assert.ok(uiJs.includes('/api/honours'), 'js/club-data-ui.js must reference /api/honours');
      assert.ok(uiJs.includes('/api/legends'), 'js/club-data-ui.js must reference /api/legends');
      assert.ok(uiJs.includes('/api/matchday'), 'js/club-data-ui.js must reference /api/matchday');
      assert.ok(uiJs.includes('mu-honours-bar'), 'js/club-data-ui.js must render #mu-honours-bar');
      assert.ok(uiJs.includes('mu-stat-badge'), 'js/club-data-ui.js must render .mu-stat-badge');
      assert.match(uiJs, /--mu-red:\s*#C70101/i, 'js/club-data-ui.js must define --mu-red: #C70101');
      assert.ok(uiJs.includes('Oswald'), 'js/club-data-ui.js must include Oswald display font');
      assert.ok(uiJs.includes('Bebas Neue'), 'js/club-data-ui.js must include Bebas Neue display font');
      assert.ok(uiJs.includes('Source Sans 3'), 'js/club-data-ui.js must include Source Sans 3 body font');
      assert.ok(uiJs.includes('fa-solid'), 'js/club-data-ui.js must include Font Awesome fa-solid icons');
      assert.ok(
        uiJs.includes('material-symbols-outlined'),
        'js/club-data-ui.js must include Google Material Symbols (.material-symbols-outlined) icons'
      );
    });
  });

  describe('3. ManUtd.com Design, Nav Progress Bar & Parallax Preservation (css/styles.css, js/scroll.js, js/audio.js)', () => {
    const cssPath = path.join(ROOT_DIR, 'css', 'styles.css');
    const scrollJsPath = path.join(ROOT_DIR, 'js', 'scroll.js');
    const audioJsPath = path.join(ROOT_DIR, 'js', 'audio.js');
    const indexHtmlPath = path.join(ROOT_DIR, 'index.html');
    const legendsHtmlPath = path.join(ROOT_DIR, 'legends.html');

    it('css/styles.css defines official ManUtd.com design tokens (--mu-red: #C70101), red #navbar, white .sections h1 headings, .nav-progress-container / #nav-progress-bar styles, Google Fonts (Oswald, Bebas Neue, Source Sans 3, Barlow Condensed, Montserrat), and Font Awesome', () => {
      const css = fs.readFileSync(cssPath, 'utf8');

      assert.match(css, /--mu-red:\s*#C70101/i, 'css/styles.css must define --mu-red: #C70101');
      assert.match(css, /--mu-charcoal:\s*#1A1A1A/i, 'css/styles.css must define --mu-charcoal: #1A1A1A');
      assert.match(css, /--mu-black:\s*#141414/i, 'css/styles.css must define --mu-black: #141414');
      assert.match(css, /--mu-white:\s*#FFFFFF/i, 'css/styles.css must define --mu-white: #FFFFFF');
      assert.match(
        css,
        /--font-display:\s*[^;]*Oswald[^;]*Bebas Neue[^;]*Barlow Condensed/i,
        'css/styles.css must define --font-display with Oswald, Bebas Neue, and Barlow Condensed'
      );
      assert.match(
        css,
        /--font-body:\s*[^;]*Source Sans 3[^;]*Montserrat/i,
        'css/styles.css must define --font-body with Source Sans 3 and Montserrat'
      );

      const navbarBlockMatch = css.match(/header,\s*#navbar\s*\{([^}]*)\}/i);
      assert.ok(navbarBlockMatch, 'css/styles.css must style header, #navbar');
      assert.match(
        navbarBlockMatch[1],
        /background-color:\s*(var\(--mu-red\)|#C70101)/i,
        '#navbar must use official ManUtd.com red background (var(--mu-red) / #C70101)'
      );

      const sectionsH1Match = css.match(/\.sections\s+h1[\s\S]*?\{([^}]*)\}/i);
      assert.ok(sectionsH1Match, 'css/styles.css must style .sections h1');
      assert.match(
        sectionsH1Match[1],
        /color:\s*(var\(--mu-white\)|#FFFFFF)/i,
        '.sections h1 must use crisp white (var(--mu-white) / #FFFFFF) rather than yellow headings'
      );

      assert.match(
        css,
        /\.nav-progress-container\s*\{[^}]*position:\s*absolute/i,
        'css/styles.css must style .nav-progress-container positioned inside #navbar'
      );
      assert.match(
        css,
        /#nav-progress-bar,\s*\.nav-progress-bar\s*\{/i,
        'css/styles.css must style #nav-progress-bar and .nav-progress-bar'
      );

      assert.ok(css.includes('Oswald'), 'css/styles.css must import/use Oswald');
      assert.ok(css.includes('Bebas Neue'), 'css/styles.css must import/use Bebas Neue');
      assert.ok(css.includes('Source Sans 3'), 'css/styles.css must import/use Source Sans 3');
      assert.ok(css.includes('Barlow Condensed'), 'css/styles.css must import/use Barlow Condensed');
      assert.ok(css.includes('Montserrat'), 'css/styles.css must import/use Montserrat');
      assert.ok(css.includes('font-awesome'), 'css/styles.css must import Font Awesome');
      assert.ok(
        css.includes('.material-symbols-outlined'),
        'css/styles.css must style .material-symbols-outlined Google icons'
      );
    });

    it('css/styles.css completely removes legacy dodgerblue, navy, and Amatic SC', () => {
      const css = fs.readFileSync(cssPath, 'utf8');

      assert.ok(!/dodgerblue/i.test(css), 'css/styles.css must not contain dodgerblue');
      assert.ok(!/\bnavy\b/i.test(css), 'css/styles.css must not contain navy');
      assert.ok(!/Amatic\s+SC/i.test(css), 'css/styles.css must not contain Amatic SC');
    });

    it('preserves background-attachment: fixed, scaled background-size rules, calibrated parallax in js/scroll.js, Font Awesome audio toggle in js/audio.js, and data-speed="50" / data-slide across all sections', () => {
      const css = fs.readFileSync(cssPath, 'utf8');
      const scrollJs = fs.readFileSync(scrollJsPath, 'utf8');
      const audioJs = fs.readFileSync(audioJsPath, 'utf8');
      const indexHtml = fs.readFileSync(indexHtmlPath, 'utf8');
      const legendsHtml = fs.readFileSync(legendsHtmlPath, 'utf8');

      assert.match(
        css,
        /background-attachment:\s*fixed/i,
        'css/styles.css must preserve background-attachment: fixed for parallax sections'
      );
      assert.match(
        css,
        /background-size:\s*contain/i,
        'css/styles.css must scale section background images properly (background-size: contain)'
      );
      assert.ok(
        scrollJs.includes('data-speed') &&
          scrollJs.includes('data-slide') &&
          scrollJs.includes('Math.max(25, Math.min(65'),
        'js/scroll.js must preserve data-speed, data-slide, and calibrated 25%-65% parallax scaling'
      );
      assert.ok(
        audioJs.includes('fa-volume-high') &&
          audioJs.includes('fa-music') &&
          audioJs.includes('volume_up') &&
          audioJs.includes('music_note'),
        'js/audio.js must toggle both Font Awesome (fa-volume-high/fa-music) and Google Material Symbols (volume_up/music_note) icons'
      );

      for (const [pageName, html, expectedTotalSections] of [
        ['index.html', indexHtml, 12],
        ['legends.html', legendsHtml, 18]
      ]) {
        const sections = html.match(/<section\b[^>]*>/gi) || [];
        assert.equal(
          sections.length,
          expectedTotalSections,
          `${pageName} must have ${expectedTotalSections} <section> elements`
        );

        sections.forEach((sectionTag, idx) => {
          assert.match(
            sectionTag,
            /\bdata-speed=["']50["']/i,
            `${pageName} section #${idx} (${sectionTag}) must preserve data-speed="50"`
          );
          assert.match(
            sectionTag,
            /\bdata-slide=["']\d+["']/i,
            `${pageName} section #${idx} (${sectionTag}) must preserve data-slide attribute`
          );
        });
      }
    });
  });
});

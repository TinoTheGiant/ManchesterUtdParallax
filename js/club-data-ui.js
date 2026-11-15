(function () {
    'use strict';

    const API_ENDPOINTS = {
        honours: '/api/honours',
        legends: '/api/legends',
        matchday: '/api/matchday'
    };

    const FALLBACK_CLUB_DATA = {
        honours: {
            club: 'Manchester United',
            totalMajorTrophies: 68,
            summary: [
                {
                    competition: 'Premier League / First Division',
                    shortName: 'League Titles',
                    count: 20
                },
                {
                    competition: 'FA Cup',
                    shortName: 'FA Cups',
                    count: 13
                },
                {
                    competition: 'EFL / League Cup',
                    shortName: 'League Cups',
                    count: 6
                },
                {
                    competition: 'UEFA Champions League / European Cup',
                    shortName: 'European Cups',
                    count: 3
                },
                {
                    competition: 'UEFA Europa League',
                    shortName: 'Europa League',
                    count: 1
                },
                {
                    competition: 'FIFA Club World Cup / Intercontinental Cup',
                    shortName: 'World Titles',
                    count: 2
                }
            ],
            eras: {
                early90s: {
                    years: '1990–1993',
                    majorTrophies: 5,
                    highlight: '1992–93 Inaugural Premier League Champions'
                },
                mid90s: {
                    years: '1993–1996',
                    majorTrophies: 5,
                    highlight: '1994 & 1996 League and FA Cup Doubles'
                },
                late90s: {
                    years: '1996–1999',
                    majorTrophies: 5,
                    highlight: '1998–99 Historic Continental Treble'
                },
                early2000s: {
                    years: '1999–2003',
                    majorTrophies: 4,
                    highlight: 'Three Premier League Titles in Four Seasons'
                },
                mid2000s: {
                    years: '2003–2007',
                    majorTrophies: 3,
                    highlight: '2004 FA Cup, 2006 League Cup & 2007 Premier League'
                },
                late2000s: {
                    years: '2007–2009',
                    majorTrophies: 6,
                    highlight: '2008 UEFA Champions League & FIFA Club World Cup'
                },
                early2010s: {
                    years: '2010–2013',
                    majorTrophies: 3,
                    highlight: 'Record 19th & 20th English Top-Flight Titles'
                },
                mid2010s: {
                    years: '2013–2016',
                    majorTrophies: 2,
                    highlight: '2015–16 FA Cup Triumph at Wembley'
                },
                late2010s: {
                    years: '2016–2019',
                    majorTrophies: 3,
                    highlight: '2017 UEFA Europa League & EFL Cup Double'
                },
                early2020s: {
                    years: '2020–2023',
                    majorTrophies: 1,
                    highlight: '2022–23 Carabao Cup Winners at Wembley'
                },
                today: {
                    years: '2023–Present',
                    majorTrophies: 1,
                    highlight: '2023–24 FA Cup Winners (13th Title)'
                }
            }
        },
        legends: [
            {
                id: 'siralex',
                name: 'Sir Alex Ferguson',
                role: 'Manager',
                years: '1986–2013',
                appearances: 1500,
                goals: 0,
                trophies: 38,
                honourHighlight: '13x Premier League & 2x UEFA Champions League'
            },
            {
                id: 'keane',
                name: 'Roy Keane',
                role: 'Midfielder / Captain',
                years: '1993–2005',
                appearances: 480,
                goals: 51,
                trophies: 17,
                honourHighlight: '7x Premier League & 1999 Treble Captain'
            },
            {
                id: 'beckham',
                name: 'David Beckham',
                role: 'Right Midfielder',
                years: '1992–2003',
                appearances: 394,
                goals: 85,
                trophies: 12,
                honourHighlight: '6x Premier League & 1999 UEFA Champions League'
            },
            {
                id: 'scholes',
                name: 'Paul Scholes',
                role: 'Central Midfielder',
                years: '1993–2013',
                appearances: 718,
                goals: 155,
                trophies: 25,
                honourHighlight: '11x Premier League & 2x UEFA Champions League'
            },
            {
                id: 'cantona',
                name: 'Eric Cantona',
                role: 'Forward',
                years: '1992–1997',
                appearances: 185,
                goals: 82,
                trophies: 9,
                honourHighlight: '4x Premier League & 2x FA Cup Winner'
            },
            {
                id: 'neville',
                name: 'Gary Neville',
                role: 'Right-Back / Captain',
                years: '1992–2011',
                appearances: 602,
                goals: 7,
                trophies: 20,
                honourHighlight: '8x Premier League & 2x UEFA Champions League'
            },
            {
                id: 'ronaldo',
                name: 'Cristiano Ronaldo',
                role: 'Forward',
                years: '2003–2009, 2021–2022',
                appearances: 346,
                goals: 145,
                trophies: 9,
                honourHighlight: "3x Premier League, 2008 UCL & 2008 Ballon d'Or"
            },
            {
                id: 'rooney',
                name: 'Wayne Rooney',
                role: 'Forward / Captain',
                years: '2004–2017',
                appearances: 559,
                goals: 253,
                trophies: 16,
                honourHighlight: 'All-Time Record Goalscorer (253 Goals)'
            },
            {
                id: 'ruud',
                name: 'Ruud van Nistelrooy',
                role: 'Striker',
                years: '2001–2006',
                appearances: 219,
                goals: 150,
                trophies: 4,
                honourHighlight: '150 Goals in 219 Games & 2002–03 Premier League'
            },
            {
                id: 'vandersar',
                name: 'Edwin van der Sar',
                role: 'Goalkeeper',
                years: '2005–2011',
                appearances: 266,
                goals: 0,
                trophies: 11,
                honourHighlight: '4x Premier League & 2008 UEFA Champions League'
            },
            {
                id: 'schmeichel',
                name: 'Peter Schmeichel',
                role: 'Goalkeeper',
                years: '1991–1999',
                appearances: 398,
                goals: 1,
                trophies: 15,
                honourHighlight: '5x Premier League & 1999 Treble Winner'
            },
            {
                id: 'solskjaer',
                name: 'Ole Gunnar Solskjær',
                role: 'Forward / Manager',
                years: '1996–2007',
                appearances: 366,
                goals: 126,
                trophies: 12,
                honourHighlight: '1999 UEFA Champions League Final Winner'
            },
            {
                id: 'cole',
                name: 'Andy Cole',
                role: 'Striker',
                years: '1995–2001',
                appearances: 275,
                goals: 121,
                trophies: 10,
                honourHighlight: '5x Premier League & 1999 Treble Winner'
            },
            {
                id: 'giggs',
                name: 'Ryan Giggs',
                role: 'Left Winger / Midfielder',
                years: '1990–2014',
                appearances: 963,
                goals: 168,
                trophies: 34,
                honourHighlight: 'All-Time Appearance Leader (963) & 13x Premier League'
            },
            {
                id: 'ferdinand',
                name: 'Rio Ferdinand',
                role: 'Centre-Back',
                years: '2002–2014',
                appearances: 455,
                goals: 8,
                trophies: 14,
                honourHighlight: '6x Premier League & 2008 UEFA Champions League'
            },
            {
                id: 'vidic',
                name: 'Nemanja Vidić',
                role: 'Centre-Back / Captain',
                years: '2006–2014',
                appearances: 300,
                goals: 21,
                trophies: 15,
                honourHighlight: '5x Premier League, 2008 UCL & 2x PL Player of the Season'
            },
            {
                id: 'evra',
                name: 'Patrice Evra',
                role: 'Left-Back',
                years: '2006–2014',
                appearances: 379,
                goals: 10,
                trophies: 14,
                honourHighlight: '5x Premier League & 2008 UEFA Champions League'
            }
        ],
        matchday: {
            club: 'Manchester United',
            stadium: 'Old Trafford',
            motto: 'Youth, Courage, Greatness',
            featuredHonour: '20-Time English Champions'
        }
    };

    function createMaterialSymbol(symbolName, extraClass) {
        const span = document.createElement('span');
        span.className = extraClass
            ? `material-symbols-outlined ${extraClass}`
            : 'material-symbols-outlined';
        span.setAttribute('aria-hidden', 'true');
        span.textContent = symbolName;
        return span;
    }

    function renderHonoursBar(honoursData, matchdayData) {
        if (typeof document === 'undefined') return null;

        const honours = honoursData || FALLBACK_CLUB_DATA.honours;
        const matchday = matchdayData || FALLBACK_CLUB_DATA.matchday;
        const summary = Array.isArray(honours.summary) && honours.summary.length
            ? honours.summary
            : FALLBACK_CLUB_DATA.honours.summary;

        let bar = document.getElementById('mu-honours-bar');
        if (!bar) {
            bar = document.createElement('div');
            bar.id = 'mu-honours-bar';
            bar.className = 'mu-honours-bar';
            bar.setAttribute('role', 'region');
            bar.setAttribute('aria-label', 'Manchester United trophy room');

            const navbar = document.getElementById('navbar') || document.querySelector('header');
            const main = document.querySelector('main.main') || document.querySelector('main');
            if (main && main.parentNode) {
                main.insertAdjacentElement('afterend', bar);
            } else if (navbar && navbar.parentNode) {
                navbar.insertAdjacentElement('afterend', bar);
            } else if (document.body) {
                document.body.appendChild(bar);
            }
        }

        const stadium = (matchday && matchday.stadium ? matchday.stadium : 'Old Trafford').toUpperCase();
        const motto = (matchday && matchday.motto ? matchday.motto : 'Youth, Courage, Greatness').toUpperCase();
        bar.textContent = '';

        const mottoWrapper = document.createElement('div');
        mottoWrapper.className = 'mu-honours-motto';

        const stadiumGoogleIcon = createMaterialSymbol('stadium', 'mu-honours-google-icon');

        const mottoText = document.createElement('span');
        mottoText.className = 'mu-honours-motto-text';
        mottoText.textContent = `${stadium} • ${motto}`;

        mottoWrapper.appendChild(stadiumGoogleIcon);
        mottoWrapper.appendChild(document.createTextNode(' '));
        mottoWrapper.appendChild(mottoText);
        mottoWrapper.appendChild(document.createTextNode(' '));

        const list = document.createElement('ul');
        list.className = 'mu-honours-list';
        list.setAttribute('aria-label', 'Major Club Trophies');

        summary.forEach((item) => {
            const li = document.createElement('li');
            li.className = 'mu-honours-item';
            if (item.competition) {
                li.setAttribute('title', item.competition);
            }

            li.appendChild(document.createTextNode(' '));

            const countSpan = document.createElement('span');
            countSpan.className = 'mu-honours-count';
            countSpan.textContent = String(item.count);

            const labelSpan = document.createElement('span');
            labelSpan.className = 'mu-honours-label';
            labelSpan.textContent = item.shortName || item.competition || '';

            li.appendChild(countSpan);
            li.appendChild(document.createTextNode(' '));
            li.appendChild(labelSpan);
            list.appendChild(li);
        });

        bar.appendChild(mottoWrapper);
        bar.appendChild(list);

        return bar;
    }

    function upsertStatBadge(sectionElement, badgeType, badgeId) {
        const heading = sectionElement.querySelector('h1');
        if (!heading) return null;

        let badge = heading.querySelector('.mu-stat-badge');
        if (!badge) {
            badge = document.createElement('span');
            badge.className = 'mu-stat-badge';
            heading.appendChild(badge);
        }
        badge.setAttribute('data-badge-type', badgeType);
        badge.setAttribute('data-section-id', badgeId);
        badge.textContent = '';
        return badge;
    }

    function appendStatPart(badge, text, className, materialSymbolName) {
        const span = document.createElement('span');
        span.className = className;
        if (materialSymbolName) {
            span.appendChild(createMaterialSymbol(materialSymbolName, 'mu-stat-google-icon'));
            span.appendChild(document.createTextNode(' '));
        }
        span.appendChild(document.createTextNode(text));
        badge.appendChild(span);
    }

    function appendSeparator(badge) {
        const sep = document.createElement('span');
        sep.className = 'mu-stat-sep';
        sep.setAttribute('aria-hidden', 'true');
        sep.textContent = '•';
        badge.appendChild(document.createTextNode(' '));
        badge.appendChild(sep);
        badge.appendChild(document.createTextNode(' '));
    }

    function renderEraBadges(honoursData) {
        if (typeof document === 'undefined') return 0;

        const honours = honoursData || FALLBACK_CLUB_DATA.honours;
        const eras = (honours && honours.eras) || FALLBACK_CLUB_DATA.honours.eras;
        let renderedCount = 0;

        Object.keys(eras).forEach((eraId) => {
            const section = document.getElementById(eraId);
            if (!section) return;

            const era = eras[eraId];
            if (!era) return;

            const badge = upsertStatBadge(section, 'era', eraId);
            if (!badge) return;

            const trophyLabel = `${era.majorTrophies} ${
                era.majorTrophies === 1 ? 'Major Trophy' : 'Major Trophies'
            }`;

            appendStatPart(badge, era.years, 'mu-stat-years');
            appendSeparator(badge);
            appendStatPart(badge, trophyLabel, 'mu-stat-trophies', 'emoji_events');
            appendSeparator(badge);
            appendStatPart(badge, era.highlight, 'mu-stat-highlight');

            renderedCount += 1;
        });

        return renderedCount;
    }

    function normalizeLegendsList(legendsPayload) {
        if (Array.isArray(legendsPayload)) {
            return legendsPayload;
        }
        if (legendsPayload && Array.isArray(legendsPayload.legends)) {
            return legendsPayload.legends;
        }
        return FALLBACK_CLUB_DATA.legends;
    }

    function renderLegendBadges(legendsPayload) {
        if (typeof document === 'undefined') return 0;

        const legendsList = normalizeLegendsList(legendsPayload);
        let renderedCount = 0;

        legendsList.forEach((legend) => {
            if (!legend || !legend.id) return;
            const section = document.getElementById(legend.id);
            if (!section) return;

            const badge = upsertStatBadge(section, 'legend', legend.id);
            if (!badge) return;

            appendStatPart(badge, legend.years, 'mu-stat-years');
            appendSeparator(badge);
            appendStatPart(badge, `${legend.appearances} Appearances`, 'mu-stat-appearances');
            appendSeparator(badge);
            appendStatPart(badge, `${legend.goals} Goals`, 'mu-stat-goals');
            appendSeparator(badge);
            appendStatPart(badge, `${legend.trophies} Major Trophies`, 'mu-stat-trophies', 'emoji_events');

            if (legend.honourHighlight) {
                badge.setAttribute('title', `${legend.role ? legend.role + ' — ' : ''}${legend.honourHighlight}`);
            }

            renderedCount += 1;
        });

        return renderedCount;
    }

    async function fetchEndpointJson(url) {
        if (typeof fetch !== 'function') return null;
        try {
            const response = await fetch(url, {
                headers: { Accept: 'application/json' }
            });
            if (!response || !response.ok) return null;
            return await response.json();
        } catch (_err) {
            return null;
        }
    }

    async function fetchClubData() {
        const [honoursRes, legendsRes, matchdayRes] = await Promise.all([
            fetchEndpointJson(API_ENDPOINTS.honours),
            fetchEndpointJson(API_ENDPOINTS.legends),
            fetchEndpointJson(API_ENDPOINTS.matchday)
        ]);

        return {
            honours: honoursRes && honoursRes.eras ? honoursRes : FALLBACK_CLUB_DATA.honours,
            legends: normalizeLegendsList(legendsRes),
            matchday: matchdayRes && matchdayRes.stadium ? matchdayRes : FALLBACK_CLUB_DATA.matchday
        };
    }

    async function initClubDataUI() {
        if (typeof document === 'undefined') return null;

        // Render immediately using built-in static fallback so file:// or static hosting works identically
        renderHonoursBar(FALLBACK_CLUB_DATA.honours, FALLBACK_CLUB_DATA.matchday);
        renderEraBadges(FALLBACK_CLUB_DATA.honours);
        renderLegendBadges(FALLBACK_CLUB_DATA.legends);

        // Hydrate from live backend API endpoints (/api/honours, /api/legends, /api/matchday) when available
        const liveData = await fetchClubData();
        renderHonoursBar(liveData.honours, liveData.matchday);
        renderEraBadges(liveData.honours);
        renderLegendBadges(liveData.legends);

        return liveData;
    }

    if (typeof document !== 'undefined') {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initClubDataUI);
        } else {
            initClubDataUI();
        }
    }

    if (typeof window !== 'undefined') {
        window.MUClubDataUI = {
            API_ENDPOINTS,
            FALLBACK_CLUB_DATA,
            initClubDataUI,
            fetchClubData,
            renderHonoursBar,
            renderEraBadges,
            renderLegendBadges
        };
    }

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = {
            API_ENDPOINTS,
            FALLBACK_CLUB_DATA,
            initClubDataUI,
            fetchClubData,
            renderHonoursBar,
            renderEraBadges,
            renderLegendBadges
        };
    }
})();

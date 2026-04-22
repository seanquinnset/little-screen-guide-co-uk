# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A static site rating children's TV shows and movies for under-5s against UK government screen time guidance. Vanilla HTML/CSS/JS — no framework, no build step required to run.

## Commands

**Run locally** (must serve over HTTP for `shows.json` fetch):
```bash
npx serve .
# or: python3 -m http.server
```

**Rebuild Tailwind CSS** (after changing Tailwind classes in `index.html` or `app.js`):
```bash
npx @tailwindcss/cli -i input.css -o tailwind.css
```

**Fetch TMDB posters/descriptions/trailers** (updates `shows.json` in place):
```bash
node fetch-posters.js YOUR_TMDB_BEARER_TOKEN
```

There are no tests or linting configured.

## Architecture

The entire app is three files: `index.html` (structure), `app.js` (logic), `style.css` (custom styles), plus `tailwind.css` (generated, gitignored).

### Data flow

`shows.json` → fetched at runtime by `app.js:init()` → stored in `allShows` array → filtered/sorted by `applyFilters()` → rendered to `#show-grid` by `render()`.

### Filtering system

Two layers of filtering work together:
1. **Top-bar controls** — search text, age dropdown, sort order (simple inputs in the controls bar)
2. **Advanced filter panel** — toggle-able chip-based filters stored in the `advancedFilters` object (type, broadcaster, tags, pace, fear, min stars)

Both layers feed into `applyFilters()` which chains all matchers. Broadcaster and tag matching use grouping maps (`BROADCASTER_GROUPS`, `TAG_MATCH_MAP`) so a single chip can match multiple raw values from the data.

### Rendering

- **Grid view**: `showCard()` generates card HTML with thumbnail, badges, stars
- **List view**: `showListRow()` generates compact row HTML
- `render()` splits shows into TV/Movies sections, applies the current view mode, and wires up click handlers to `openPanel()`
- The slide-out detail panel is built by `buildPanelContent()` with dimension rows, share buttons, and a "How we rate" accordion

### Dimensions

Shows have six rated dimensions. Three use RAG (green/amber/red) and three use stars (1-5):
- RAG: pace, emotionalContent, fearFactor, commercialPressure
- Stars: cognitive, coViewing
- `overallStars` is an editorial rating (not computed), capped by pace (red→max 2) and fear (amber→max 4)

### Show data shape

Each show in `shows.json` has: `id` (kebab-case), `name`, `type` ("show"|"movie", defaults to "show" if absent), `broadcaster`, `description`, `thumbnailUrl`, age range, episode length + RAG, `overallStars`, `dimensions` object, `tags` array, `ukGuidanceNote`, `trailerUrl`.

## Style conventions

- Tailwind utility classes are used inline in HTML and JS template literals for layout/spacing
- Custom CSS in `style.css` handles component-specific styling (cards, filter chips, RAG badges, panel, etc.)
- Colour palette: warm neutrals (`#faf7f2` bg, `#2c2c2c` text), green (`#2f5e28`), amber (`#7a5018`), red (`#8b2020`)
- Font: Nunito (loaded via Google Fonts `<link>` in HTML)

let allShows = [];
let currentView = 'grid'; // 'grid' or 'list'
let lastFiltered = [];     // keep reference for view re-render
let panelOpen = false;

const SI = {
  x:        `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.213 5.567zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>`,
  facebook: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>`,
  linkedin: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>`,
  instagram:`<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>`,
  check:    `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>`,
  email:    `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z"/></svg>`,
};

// ── Advanced filter state ────────────────────────────────────────────────────

const advancedFilters = {
  type:        new Set(),
  broadcaster: new Set(),
  tags:        new Set(),
  pace:        new Set(),
  fear:        new Set(),
  format:      new Set(),
  minStars:    0,
};

const BROADCASTER_GROUPS = {
  cbeebies:    ['cbeebies', 'abc kids', 'bbc', 'cbbc'],
  nickelodeon: ['nickelodeon', 'channel 5', 'ch5', 'nick jr'],
  disney:      ['disney', 'disney junior', 'pixar'],
  youtube:     ['youtube'],
  netflix:     ['netflix'],
};

const TAG_MATCH_MAP = {
  'stem':               ['stem', 'maths', 'numeracy', 'marine science', 'geography', 'world cultures'],
  'phonics':            ['phonics', 'reading', 'literacy'],
  'emotional-literacy': ['emotional literacy', 'emotional regulation', 'feelings', 'patience'],
  'nature':             ['nature'],
  'imagination':        ['imagination', 'imaginative play', 'fantasy', 'curiosity'],
  'co-viewing':         ['co-viewing'],
  'bedtime':            ['bedtime'],
  'calm':               ['calm', 'soothing'],
  'educational':        ['educational'],
  'friendship':         ['friendship', 'family values', 'family life', 'social situations'],
  'teamwork':           ['teamwork'],
};

// ── Bootstrap ───────────────────────────────────────────────────────────────

async function init() {
  try {
    const res = await fetch('shows.json');
    if (!res.ok) throw new Error('non-200');
    allShows = await res.json();
  } catch {
    document.getElementById('error-msg').classList.remove('hidden');
    return;
  }
  setupListeners();
  applyFilters();
}

function setupListeners() {
  document.getElementById('search').addEventListener('input', applyFilters);
  document.getElementById('age-filter').addEventListener('change', applyFilters);
  document.getElementById('sort').addEventListener('change', applyFilters);

  document.getElementById('panel-overlay').addEventListener('click', closePanel);
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      if (document.getElementById('video-modal').style.display === 'block') closeVideo();
      else closePanel();
    }
  });
  window.addEventListener('popstate', () => { if (panelOpen) closePanel(true); });

  const homeCopyBtn = document.getElementById('homepage-copy-btn');
  if (homeCopyBtn) {
    homeCopyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText('https://littlescreenguide.co.uk/').then(() => {
        homeCopyBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>';
        setTimeout(() => {
          homeCopyBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17 7h-4v2h4c1.65 0 3 1.35 3 3s-1.35 3-3 3h-4v2h4c2.76 0 5-2.24 5-5s-2.24-5-5-5zm-6 8H7c-1.65 0-3-1.35-3-3s1.35-3 3-3h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-2zm-3-4h8v2H8z"/></svg>';
        }, 1500);
      });
    });
  }

  document.getElementById('video-close').addEventListener('click', closeVideo);
  document.getElementById('video-modal').addEventListener('click', e => {
    if (e.target === document.getElementById('video-modal') || e.target.parentElement === document.getElementById('video-modal')) closeVideo();
  });

  // View toggle
  document.getElementById('view-toggle').addEventListener('click', toggleView);

  // Advanced filter listeners
  document.getElementById('filter-toggle').addEventListener('click', toggleFilterPanel);
  document.getElementById('filter-panel').addEventListener('click', handleChipClick);
  document.getElementById('filter-stars').addEventListener('click', handleStarClick);
  document.getElementById('filter-clear').addEventListener('click', clearAllFilters);
}

// ── Filtering & sorting ─────────────────────────────────────────────────────

function applyFilters() {
  const search = document.getElementById('search').value.toLowerCase().trim();
  const age    = document.getElementById('age-filter').value;
  const sort   = document.getElementById('sort').value;

  const filtered = allShows
    .filter(s =>
      (!search || s.name.toLowerCase().includes(search)) &&
      matchesAge(s, age) &&
      matchesType(s) &&
      matchesBroadcaster(s) &&
      matchesTags(s) &&
      matchesPace(s) &&
      matchesFear(s) &&
      matchesFormat(s) &&
      matchesMinStars(s)
    )
    .sort(comparator(sort));

  render(filtered, age);
}

function matchesAge(show, filter) {
  if (filter === 'all')    return true;
  if (filter === 'under2') return show.ageMinYears <= 1;
  if (filter === '2-3')    return show.ageMinYears <= 3 && show.ageMaxYears >= 2;
  if (filter === '3-5')    return show.ageMinYears <= 5 && show.ageMaxYears >= 3;
  return true;
}

function comparator(sort) {
  return (a, b) => {
    switch (sort) {
      case 'overall':   return b.overallStars - a.overallStars;
      case 'cognitive': return b.dimensions.cognitive.stars - a.dimensions.cognitive.stars;
      case 'coviewing': return b.dimensions.coViewing.stars - a.dimensions.coViewing.stars;
      case 'pace':      return ragRank(a.dimensions.pace.rag) - ragRank(b.dimensions.pace.rag);
      case 'fear':      return ragRank(a.dimensions.fearFactor.rag) - ragRank(b.dimensions.fearFactor.rag);
      case 'shortest':  return a.episodeLengthMinutes - b.episodeLengthMinutes;
      default:          return 0;
    }
  };
}

function ragRank(rag) {
  return { green: 0, amber: 1, red: 2 }[rag] ?? 1;
}

// ── Advanced filter functions ────────────────────────────────────────────────

function toggleFilterPanel() {
  const panel  = document.getElementById('filter-panel');
  const toggle = document.getElementById('filter-toggle');
  const isOpen = panel.classList.toggle('open');

  if (isOpen) {
    panel.style.maxHeight = panel.scrollHeight + 'px';
  } else {
    panel.style.maxHeight = '0';
  }
  toggle.setAttribute('aria-expanded', isOpen);
}

function handleChipClick(e) {
  const chip = e.target.closest('.filter-chip');
  if (!chip) return;

  const filter = chip.dataset.filter;
  const value  = chip.dataset.value;
  if (!filter || !value) return;

  const set = advancedFilters[filter];
  if (!set) return;

  if (set.has(value)) {
    set.delete(value);
    chip.classList.remove('active');
  } else {
    set.add(value);
    chip.classList.add('active');
  }

  updateFilterBadge();
  applyFilters();

  // Keep panel height in sync after chips may reflow
  const panel = document.getElementById('filter-panel');
  if (panel.classList.contains('open')) {
    panel.style.maxHeight = panel.scrollHeight + 'px';
  }
}

function handleStarClick(e) {
  const btn = e.target.closest('.filter-star');
  if (!btn) return;

  const star = parseInt(btn.dataset.star, 10);

  // Re-click same star clears
  advancedFilters.minStars = (advancedFilters.minStars === star) ? 0 : star;

  document.querySelectorAll('.filter-star').forEach(s => {
    s.classList.toggle('active', parseInt(s.dataset.star, 10) <= advancedFilters.minStars);
  });

  updateFilterBadge();
  applyFilters();
}

function updateFilterBadge() {
  let count = advancedFilters.type.size
            + advancedFilters.broadcaster.size
            + advancedFilters.tags.size
            + advancedFilters.pace.size
            + advancedFilters.fear.size
            + advancedFilters.format.size
            + (advancedFilters.minStars > 0 ? 1 : 0);

  const badge = document.getElementById('filter-badge');
  if (count > 0) {
    badge.textContent = count;
    badge.classList.add('filter-badge-visible');
  } else {
    badge.classList.remove('filter-badge-visible');
  }
}

function clearAllFilters() {
  advancedFilters.type.clear();
  advancedFilters.broadcaster.clear();
  advancedFilters.tags.clear();
  advancedFilters.pace.clear();
  advancedFilters.fear.clear();
  advancedFilters.format.clear();
  advancedFilters.minStars = 0;

  document.querySelectorAll('#filter-panel .filter-chip.active').forEach(c => c.classList.remove('active'));
  document.querySelectorAll('.filter-star.active').forEach(s => s.classList.remove('active'));

  updateFilterBadge();
  applyFilters();
}

function matchesType(show) {
  if (advancedFilters.type.size === 0) return true;
  const type = show.type || 'show';
  return advancedFilters.type.has(type);
}

function matchesBroadcaster(show) {
  if (advancedFilters.broadcaster.size === 0) return true;
  const bc = show.broadcaster.toLowerCase();
  for (const key of advancedFilters.broadcaster) {
    const terms = BROADCASTER_GROUPS[key] || [key];
    if (terms.some(t => bc.includes(t))) return true;
  }
  return false;
}

function matchesTags(show) {
  if (advancedFilters.tags.size === 0) return true;
  const showTags = show.tags.map(t => t.toLowerCase());
  for (const key of advancedFilters.tags) {
    const matches = TAG_MATCH_MAP[key] || [key];
    if (matches.some(m => showTags.some(st => st.includes(m)))) return true;
  }
  return false;
}

function matchesPace(show) {
  if (advancedFilters.pace.size === 0) return true;
  return advancedFilters.pace.has(show.dimensions.pace.rag);
}

function matchesFear(show) {
  if (advancedFilters.fear.size === 0) return true;
  return advancedFilters.fear.has(show.dimensions.fearFactor.rag);
}

function matchesFormat(show) {
  if (advancedFilters.format.size === 0) return true;
  return advancedFilters.format.has(show.format || 'animated');
}

function matchesMinStars(show) {
  if (advancedFilters.minStars === 0) return true;
  return show.overallStars >= advancedFilters.minStars;
}

// ── Rendering helpers ───────────────────────────────────────────────────────

function stars(n, max = 5) {
  return Array.from({ length: max }, (_, i) =>
    `<span class="${i < n ? 'star-filled' : 'star-empty'}">★</span>`
  ).join('');
}

function ragBadgeText(rag, type) {
  const map = {
    pace:     { green: 'Calm',         amber: 'Moderate',      red: 'Fast-paced' },
    emotion:  { green: 'Low concern',  amber: 'Some concern',  red: 'High concern' },
    commerce: { green: 'Minimal',      amber: 'Moderate',      red: 'High pressure' },
    fear:     { green: 'Nothing scary', amber: 'A few tense bits', red: 'Some intense moments' },
    length:   { green: 'Short',        amber: 'Medium',        red: 'Long' },
  };
  return (map[type] ?? map.pace)[rag];
}

const AVATAR_COLOURS = [
  '#8bb87e', '#7fa8c0', '#c09090', '#b8b07a',
  '#9090c0', '#c0a07a', '#8fb0a8', '#c09878',
];

function avatarColour(id) {
  const n = id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return AVATAR_COLOURS[n % AVATAR_COLOURS.length];
}

function initials(name) {
  return name.split(/\s+/).slice(0, 2).map(w => w[0]).join('').toUpperCase();
}

// ── Card template ───────────────────────────────────────────────────────────

function showCard(show, index) {
  const bg = avatarColour(show.id);

  const thumb = show.thumbnailUrl
    ? `<img src="${show.thumbnailUrl}" alt="${show.name}" class="card-thumb-img"
            onerror="this.style.display='none';this.nextElementSibling.style.display='flex'" />
       <div class="thumb-fallback" style="position:absolute;inset:0;background:${bg};display:none">${initials(show.name)}</div>`
    : `<div class="thumb-fallback" style="position:absolute;inset:0;background:${bg}">${initials(show.name)}</div>`;

  const paceLabel = ragBadgeText(show.dimensions.pace.rag, 'pace');
  const fearLabel = ragBadgeText(show.dimensions.fearFactor.rag, 'fear');

  return `
    <article class="show-card bg-white rounded-2xl shadow-sm flex flex-col overflow-hidden"
             data-show-id="${show.id}"
             role="button" tabindex="0"
             aria-label="View details for ${show.name}"
             style="animation-delay:${index * 35}ms">
      <div class="card-thumb-wrap">
        ${thumb}
      </div>
      <div class="p-4 flex flex-col gap-1.5 flex-1">
        <div class="flex items-start justify-between gap-2">
          <h2 class="text-sm font-bold leading-tight text-[#2c2c2c] flex-1">${show.name}</h2>
          <span class="rag-${show.dimensions.pace.rag} text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0">${paceLabel}</span>
        </div>
        <p class="text-xs text-[#a09888]">${show.broadcaster}</p>
        <p class="text-xs text-[#7a7060]">Ages ${show.ageMinYears}–${show.ageMaxYears}</p>
        <div class="flex items-center justify-between mt-auto pt-1">
          <div class="stars text-lg">${stars(show.overallStars)}</div>
          <span class="rag-${show.dimensions.fearFactor.rag} text-xs font-semibold px-2 py-0.5 rounded-full">${fearLabel}</span>
        </div>
      </div>
    </article>`;
}

// ── List row template ────────────────────────────────────────────────────────

function showListRow(show) {
  const bg = avatarColour(show.id);

  const thumb = show.thumbnailUrl
    ? `<img src="${show.thumbnailUrl}" alt="" class="card-thumb-img"
            onerror="this.style.display='none';this.nextElementSibling.style.display='flex'" />
       <div class="thumb-fallback" style="position:absolute;inset:0;background:${bg};display:none;font-size:0.8rem;">${initials(show.name)}</div>`
    : `<div class="thumb-fallback" style="position:absolute;inset:0;background:${bg};font-size:0.8rem;">${initials(show.name)}</div>`;

  const paceLabel = ragBadgeText(show.dimensions.pace.rag, 'pace');
  const fearLabel = ragBadgeText(show.dimensions.fearFactor.rag, 'fear');

  return `
    <article class="show-card bg-white flex overflow-hidden"
             data-show-id="${show.id}"
             role="button" tabindex="0"
             aria-label="View details for ${show.name}">
      <div class="list-thumb">${thumb}</div>
      <div class="list-info">
        <span class="list-name">${show.name}</span>
        <span class="list-meta">${show.broadcaster}</span>
        <span class="list-meta">${show.episodeLengthMinutes} min</span>
        <div class="stars text-sm">${stars(show.overallStars)}</div>
        <div class="list-badges">
          <span class="rag-${show.dimensions.pace.rag} text-xs font-semibold px-1.5 py-0.5 rounded-full">${paceLabel}</span>
          <span class="rag-${show.dimensions.fearFactor.rag} text-xs font-semibold px-1.5 py-0.5 rounded-full">${fearLabel}</span>
        </div>
      </div>
    </article>`;
}

// ── View toggle ──────────────────────────────────────────────────────────────

function toggleView() {
  currentView = currentView === 'grid' ? 'list' : 'grid';
  const iconList = document.getElementById('view-icon-list');
  const iconGrid = document.getElementById('view-icon-grid');
  const btn = document.getElementById('view-toggle');

  if (currentView === 'list') {
    iconList.style.display = 'none';
    iconGrid.style.display = 'block';
    btn.setAttribute('aria-label', 'Switch to grid view');
  } else {
    iconList.style.display = 'block';
    iconGrid.style.display = 'none';
    btn.setAttribute('aria-label', 'Switch to list view');
  }

  render(lastFiltered);
}

// ── Render grid ─────────────────────────────────────────────────────────────

function render(shows, ageFilter) {
  lastFiltered = shows;
  const container = document.getElementById('show-grid');
  const count     = document.getElementById('results-count');

  const tvShows = shows.filter(s => (s.type || 'show') !== 'movie');
  const movies  = shows.filter(s => s.type === 'movie');

  const total = shows.length;
  count.textContent = `${total} title${total !== 1 ? 's' : ''}`;

  if (total === 0) {
    container.innerHTML = `<div class="empty-state">No shows match your filters.</div>`;
    return;
  }

  const gridClasses = currentView === 'list'
    ? 'list-view'
    : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4';

  let html = '';

  if (ageFilter === 'under2') {
    html += `<div class="under2-note">
      <p class="under2-note-label">A note on under-2s</p>
      <p class="under2-note-text">UK guidance suggests avoiding solo screen time for children under 2, other than video calls and shared activities that encourage bonding, interaction and conversation. If you do use screens at this age, watching together and talking about what you see makes all the difference.</p>
    </div>`;
  }

  if (ageFilter === '2-3' || ageFilter === '3-5') {
    html += `<div class="age-note">
      <p class="age-note-label">A note on 2–5 year olds</p>
      <p class="age-note-text">UK guidance suggests trying to keep screen time to no more than one hour a day for this age group. It also helps to avoid screens at mealtimes and in the hour before bed. These are goals to aim for, not rules to stress about.</p>
    </div>`;
  }

  if (tvShows.length > 0) {
    html += `<h2 class="section-heading">TV Shows</h2>`;
    html += `<div class="show-section ${gridClasses}">`;
    html += currentView === 'list'
      ? tvShows.map(s => showListRow(s)).join('')
      : tvShows.map((s, i) => showCard(s, i)).join('');
    html += `</div>`;
  }

  if (movies.length > 0) {
    html += `<h2 class="section-heading${tvShows.length > 0 ? ' mt-4' : ''}">Movies</h2>`;
    html += `<div class="show-section ${gridClasses}">`;
    html += currentView === 'list'
      ? movies.map(s => showListRow(s)).join('')
      : movies.map((s, i) => showCard(s, i)).join('');
    html += `</div>`;
  }

  container.innerHTML = html;

  container.querySelectorAll('[data-show-id]').forEach(card => {
    card.addEventListener('click', () => openPanel(card.dataset.showId));
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openPanel(card.dataset.showId);
      }
    });
  });
}

// ── Side panel ──────────────────────────────────────────────────────────────

function openPanel(id) {
  const show = allShows.find(s => s.id === id);
  if (!show) return;

  document.getElementById('panel-content').innerHTML = buildPanelContent(show);
  document.getElementById('panel-close').addEventListener('click', closePanel);

  const overlay = document.getElementById('panel-overlay');
  const panel   = document.getElementById('show-panel');

  overlay.style.display = 'block';
  panel.style.display   = 'block';
  document.body.style.overflow = 'hidden';

  requestAnimationFrame(() => requestAnimationFrame(() => {
    panel.style.transform   = 'translateX(0)';
    overlay.style.opacity   = '1';
  }));

  history.pushState({ panel: id }, '');
  panelOpen = true;

  document.getElementById('panel-close').focus();
}

function closePanel(fromPopState = false) {
  if (!panelOpen) return;
  panelOpen = false;

  const overlay = document.getElementById('panel-overlay');
  const panel   = document.getElementById('show-panel');

  panel.style.transform = 'translateX(100%)';
  overlay.style.opacity = '0';

  panel.addEventListener('transitionend', () => {
    panel.style.display   = 'none';
    overlay.style.display = 'none';
    document.body.style.overflow = '';
  }, { once: true });

  if (!fromPopState) history.back();
}

function dimensionRow(label, value, ragType) {
  const isRag = 'rag' in value;
  const right = isRag
    ? `<span class="rag-${value.rag} text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap">${ragBadgeText(value.rag, ragType)}</span>`
    : `<div class="stars text-sm whitespace-nowrap">${stars(value.stars)}</div>`;

  return `
    <div class="dimension-row">
      <div class="flex-1 min-w-0">
        <p class="dimension-label">${label}</p>
        <p class="dimension-note">${value.note}</p>
      </div>
      ${right}
    </div>`;
}

function buildPanelContent(show) {
  const tagHtml = show.tags.length
    ? `<div class="flex flex-wrap gap-1.5 mb-4">${show.tags.map(t => `<span class="tag-pill">${t}</span>`).join('')}</div>`
    : '';

  const trailerHtml = show.trailerUrl
    ? `<button onclick="openVideo('${show.trailerUrl}')"
          style="display:inline-flex;align-items:center;gap:0.4rem;background:#e8a24a;color:white;font-size:0.8rem;font-weight:700;padding:0.4rem 0.9rem;border-radius:999px;border:none;cursor:pointer;margin-bottom:1rem;">
         <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor"><path d="M2 1.5l8 4.5-8 4.5z"/></svg>
         Watch Trailer
       </button>`
    : '';

  const thumbHtml = show.thumbnailUrl
    ? `<img src="${show.thumbnailUrl}" alt="${show.name}"
            style="width:100%;aspect-ratio:16/9;object-fit:cover;object-position:center top;border-radius:0.75rem;margin-bottom:1rem;"
            onerror="this.remove()" />`
    : '';

  return `
    <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:0.75rem;margin-bottom:1rem;padding-top:0.25rem;">
      <div style="min-width:0;">
        <h2 class="text-xl font-extrabold text-[#2c2c2c] leading-tight">${show.name}</h2>
        <p class="text-sm text-[#a09888]" style="margin-top:0.2rem;">${show.broadcaster} · Ages ${show.ageMinYears}–${show.ageMaxYears}</p>
      </div>
      <button id="panel-close"
              style="flex-shrink:0;width:2rem;height:2rem;display:flex;align-items:center;justify-content:center;border-radius:999px;border:none;background:transparent;color:#a09888;cursor:pointer;font-size:1.4rem;line-height:1;"
              aria-label="Close">×</button>
    </div>

    ${thumbHtml}
    ${trailerHtml}

    <p class="text-sm text-[#5c5446] leading-relaxed" style="margin-bottom:1rem;">${show.description}</p>

    <div style="display:flex;flex-wrap:wrap;align-items:center;gap:0.5rem;margin-bottom:1rem;">
      <span class="rag-${show.episodeLengthRag} text-xs font-semibold px-2 py-0.5 rounded-full">
        ${show.episodeLengthMinutes} min · ${{ green: 'Short', amber: 'Medium', red: 'Long' }[show.episodeLengthRag]}
      </span>
      <div class="stars text-lg">${stars(show.overallStars)}</div>
    </div>

    <div style="border-radius:0.75rem;background:#f7f4ef;border:1px solid #ece8e0;padding:0 0.75rem;margin-bottom:1rem;">
      ${dimensionRow('Pace', show.dimensions.pace, 'pace')}
      ${dimensionRow('Cognitive development', show.dimensions.cognitive, 'stars')}
      ${dimensionRow('Co-viewing value', show.dimensions.coViewing, 'stars')}
      ${dimensionRow('Emotional content', show.dimensions.emotionalContent, 'emotion')}
      ${dimensionRow('Fear factor', show.dimensions.fearFactor, 'fear')}
      ${dimensionRow('Commercial pressure', show.dimensions.commercialPressure, 'commerce')}
    </div>

    ${tagHtml}

    <div class="uk-note">
      <p class="uk-note-label">UK Guidance Note</p>
      <p class="uk-note-text">${show.ukGuidanceNote}</p>
    </div>

    <p style="margin-top:0.75rem;font-size:0.75rem;color:#b0a898;">
      Something wrong?
      <a href="https://github.com/seanquinnset/little-screen-guide-co-uk/issues/new?template=suggest-update.yml&title=Update:+${encodeURIComponent(show.name)}"
         target="_blank" rel="noopener"
         style="color:#2f5e28;text-decoration:underline;text-underline-offset:2px;font-weight:600;">
        Suggest an update
      </a>
    </p>

  `;
}

// ── Video modal ─────────────────────────────────────────────────────────────

function youtubeId(url) {
  const m = url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return m ? m[1] : null;
}

function openVideo(url) {
  const id = youtubeId(url);
  if (!id) return;

  const modal  = document.getElementById('video-modal');
  const iframe = document.getElementById('video-iframe');

  iframe.src = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`;
  modal.style.display = 'block';
  requestAnimationFrame(() => requestAnimationFrame(() => { modal.style.opacity = '1'; }));
  document.body.style.overflow = 'hidden';
}

function closeVideo() {
  const modal  = document.getElementById('video-modal');
  const iframe = document.getElementById('video-iframe');

  modal.style.opacity = '0';
  modal.addEventListener('transitionend', () => {
    modal.style.display = 'none';
    iframe.src = '';
  }, { once: true });
  document.body.style.overflow = '';
}

// ── Start ────────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', init);

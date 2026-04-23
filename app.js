let allShows = [];
let currentView = 'grid'; // 'grid' or 'list'
let lastFiltered = [];     // keep reference for view re-render

// ── Advanced filter state ────────────────────────────────────────────────────

const advancedFilters = {
  type:        new Set(),
  broadcaster: new Set(),
  tags:        new Set(),
  pace:        new Set(),
  fear:        new Set(),
  minStars:    0,
};

const BROADCASTER_GROUPS = {
  cbeebies:    ['cbeebies', 'abc kids', 'bbc', 'cbbc', 'pbs'],
  nickelodeon: ['nickelodeon', 'channel 5', 'ch5', 'nick jr'],
  disney:      ['disney', 'disney junior', 'pixar'],
  youtube:     ['youtube', 'peacock'],
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

  document.getElementById('panel-close').focus();
}

function closePanel() {
  const overlay = document.getElementById('panel-overlay');
  const panel   = document.getElementById('show-panel');

  panel.style.transform = 'translateX(100%)';
  overlay.style.opacity = '0';

  panel.addEventListener('transitionend', () => {
    panel.style.display   = 'none';
    overlay.style.display = 'none';
    document.body.style.overflow = '';
  }, { once: true });
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

    <div class="share-row">
      <span class="share-label">Share</span>
      <a href="https://twitter.com/intent/tweet?text=${encodeURIComponent('A great guide for age-appropriate children\'s TV and movies for under-5s')}&url=${encodeURIComponent('https://littlescreenguide.co.uk/')}" target="_blank" rel="noopener" class="share-btn" aria-label="Share on X" title="Share on X"><i class="ph ph-x-logo"></i></a>
      <a href="https://wa.me/?text=${encodeURIComponent('A great guide for age-appropriate children\'s TV and movies for under-5s: https://littlescreenguide.co.uk/')}" target="_blank" rel="noopener" class="share-btn" aria-label="Share on WhatsApp" title="Share on WhatsApp"><i class="ph ph-whatsapp-logo"></i></a>
      <a href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent('https://littlescreenguide.co.uk/')}" target="_blank" rel="noopener" class="share-btn" aria-label="Share on Facebook" title="Share on Facebook"><i class="ph ph-facebook-logo"></i></a>
      <button onclick="navigator.clipboard.writeText('https://littlescreenguide.co.uk/').then(()=>{this.querySelector('.ph').className='ph ph-check';setTimeout(()=>{this.querySelector('.ph').className='ph ph-link'},1500)})" class="share-btn" aria-label="Copy link" title="Copy link"><i class="ph ph-link"></i></button>
      <a href="mailto:?subject=${encodeURIComponent('A great guide for children\'s TV for under-5s')}&body=${encodeURIComponent('I found this great guide for age-appropriate children\'s TV and movies for under-5s — worth a look: https://littlescreenguide.co.uk/')}" class="share-btn" aria-label="Share via email" title="Share via email"><i class="ph ph-envelope-simple"></i></a>
    </div>

    <details class="how-we-rate">
      <summary class="how-we-rate-toggle">How we rate</summary>
      <div class="how-we-rate-body">
        <p>Ratings are based on <a href="https://www.gov.uk/government/news/new-screen-time-guidance-for-parents-of-under-5s" target="_blank" rel="noopener">UK government screen time guidance</a> for under-5s, applied across six factors.</p>
        <ul>
          <li><strong>Pace is the primary factor.</strong> The guidance explicitly recommends slow-paced content for young children. Red pace caps a show at 2 stars.</li>
          <li><strong>Amber fear factor caps a show at 4 stars</strong> — even if everything else is green.</li>
          <li><strong>5 stars</strong> is reserved for shows that score well across all six factors with no significant concerns.</li>
          <li><strong>Episode length is weighted less heavily</strong> — parents control the remote, and many shows can be watched in segments.</li>
        </ul>
        <p>These ratings are editorial, not official. Disagree with something? <a href="mailto:hello@littlescreenguide.co.uk">Email us</a> — we'd love to hear from you.</p>
      </div>
    </details>`;
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

#!/usr/bin/env node
/**
 * Usage:  node fetch-posters.js YOUR_TMDB_BEARER_TOKEN
 *
 * For each show in shows.json, queries TMDB and updates:
 *   thumbnailUrl  — poster image CDN URL
 *   description   — show overview from TMDB
 *   trailerUrl    — first YouTube trailer found in TMDB videos
 *
 * Run from the project root directory. Requires Node 18+.
 * After running, regenerate your TMDB Bearer token.
 */

const TOKEN = process.argv[2];
if (!TOKEN) {
  console.error('Usage: node fetch-posters.js YOUR_TMDB_BEARER_TOKEN');
  process.exit(1);
}

const IMG_BASE     = 'https://image.tmdb.org/t/p/w500';
const TRAILER_BASE = 'https://www.youtube.com/watch?v=';

const ENTRIES = [
  // ── TV Shows ──────────────────────────────────────────────────────────────
  { id: 'bluey',               query: 'Bluey',                        year: 2018, type: 'tv' },
  { id: 'hey-duggee',          query: 'Hey Duggee',                   year: 2014, type: 'tv' },
  { id: 'sarah-and-duck',      query: 'Sarah & Duck',                 year: 2012, type: 'tv' },
  { id: 'bing',                query: 'Bing',                         year: 2014, type: 'tv' },
  { id: 'numberblocks',        query: 'Numberblocks',                 year: 2017, type: 'tv' },
  { id: 'alphablocks',         query: 'Alphablocks',                  year: 2010, type: 'tv' },
  { id: 'in-the-night-garden', query: 'In the Night Garden',          year: 2007, type: 'tv' },
  { id: 'octonauts',           query: 'Octonauts',                    year: 2010, type: 'tv' },
  { id: 'peppa-pig',           query: 'Peppa Pig',                    year: 2004, type: 'tv' },
  { id: 'paw-patrol',          query: 'PAW Patrol',                   year: 2013, type: 'tv' },
  { id: 'ben-and-holly',       query: "Ben & Holly's Little Kingdom", year: 2009, type: 'tv' },
  { id: 'go-jetters',          query: 'Go Jetters',                   year: 2015, type: 'tv' },
  { id: 'ms-rachel',           query: 'Songs for Littles',            year: null, type: 'tv' },
  { id: 'blippi',              query: 'Blippi',                       year: 2014, type: 'tv' },
  { id: 'the-wiggles',         query: 'The Wiggles',                  year: 1998, type: 'tv' },
  { id: 'sesame-street',       query: 'Sesame Street',                year: 1969, type: 'tv' },
  { id: 'mr-tumble',           query: 'Something Special',            year: 2003, type: 'tv' },
  { id: 'teletubbies',         query: 'Teletubbies',                  year: 1997, type: 'tv' },
  { id: 'cocomelon',           query: 'CoComelon',                    year: 2018, type: 'tv' },
  { id: 'doc-mcstuffins',      query: 'Doc McStuffins',               year: 2012, type: 'tv' },
  { id: 'rugrats',             query: 'Rugrats',                      year: 1991, type: 'tv' },
  { id: 'mickey-mouse-clubhouse', query: 'Mickey Mouse Clubhouse',    year: 2006, type: 'tv' },
  { id: 'dora-the-explorer',   query: 'Dora the Explorer',            year: 2000, type: 'tv' },
  { id: 'shaun-the-sheep',     query: 'Shaun the Sheep',              year: 2007, type: 'tv' },
  { id: 'peter-rabbit',        query: 'Peter Rabbit',                 year: 2012, type: 'tv' },

  // ── Movies ────────────────────────────────────────────────────────────────
  { id: 'the-gruffalo',        query: 'The Gruffalo',                 year: 2009, type: 'movie' },
  { id: 'the-gruffalos-child', query: "The Gruffalo's Child",         year: 2011, type: 'movie' },
  { id: 'room-on-the-broom',   query: 'Room on the Broom',            year: 2012, type: 'movie' },
  { id: 'stick-man',           query: 'Stick Man',                    year: 2015, type: 'movie' },
  { id: 'the-highway-rat',     query: 'The Highway Rat',              year: 2017, type: 'movie' },
  { id: 'zog',                 query: 'Zog',                          year: 2018, type: 'movie' },
  { id: 'the-snail-and-the-whale', query: 'The Snail and the Whale',  year: 2019, type: 'movie' },
  { id: 'tabby-mctat',         query: 'Tabby McTat',                  year: 2024, type: 'movie' },
  { id: 'toy-story',           query: 'Toy Story',                    year: 1995, type: 'movie' },
  { id: 'frozen',              query: 'Frozen',                       year: 2013, type: 'movie' },
];

function headers() {
  return { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' };
}

async function searchEntry(query, year, type) {
  const endpoint = type === 'movie' ? 'search/movie' : 'search/tv';
  const url = `https://api.themoviedb.org/3/${endpoint}?query=${encodeURIComponent(query)}&language=en-GB`;
  const res  = await fetch(url, { headers: headers() });
  if (!res.ok) throw new Error(`Search failed ${res.status} for "${query}"`);
  const data = await res.json();
  const results = data.results ?? [];
  if (!results.length) return null;
  const dateField = type === 'movie' ? 'release_date' : 'first_air_date';
  if (year) {
    const match = results.find(r => r[dateField]?.startsWith(String(year)));
    return match ?? results[0];
  }
  return results[0];
}

async function fetchTrailer(tmdbId, type) {
  const endpoint = type === 'movie' ? 'movie' : 'tv';
  const url = `https://api.themoviedb.org/3/${endpoint}/${tmdbId}/videos?language=en-GB`;
  const res  = await fetch(url, { headers: headers() });
  if (!res.ok) return null;
  const data   = await res.json();
  const videos = data.results ?? [];
  const trailer = videos.find(v => v.site === 'YouTube' && v.type === 'Trailer')
               ?? videos.find(v => v.site === 'YouTube');
  return trailer ? TRAILER_BASE + trailer.key : null;
}

(async () => {
  const fs  = await import('fs/promises');
  const raw = await fs.readFile('shows.json', 'utf8');
  const shows = JSON.parse(raw);
  const map   = Object.fromEntries(shows.map(s => [s.id, s]));

  let updated = 0;
  for (const { id, query, year, type } of ENTRIES) {
    process.stdout.write(`\n${query} … `);
    try {
      const hit = await searchEntry(query, year, type);
      if (!hit) { console.log('no TMDB result'); continue; }

      const show = map[id];
      if (!show) { console.log(`not in shows.json`); continue; }
      let changed = false;

      if (hit.poster_path) {
        show.thumbnailUrl = IMG_BASE + hit.poster_path;
        changed = true;
      }
      if (hit.overview) {
        show.description = hit.overview;
        changed = true;
      }

      const trailerUrl = await fetchTrailer(hit.id, type);
      if (trailerUrl) {
        show.trailerUrl = trailerUrl;
        changed = true;
      }

      if (changed) updated++;
      console.log(`✓  poster=${!!hit.poster_path} desc=${!!hit.overview} trailer=${!!trailerUrl}`);
    } catch (e) {
      console.log(`error: ${e.message}`);
    }
  }

  await fs.writeFile('shows.json', JSON.stringify(shows, null, 2));
  console.log(`\nDone — updated ${updated} shows.`);
  console.log('Remember to regenerate your TMDB Bearer token after use.');
})();

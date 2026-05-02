# Little Screen Guide

Honest ratings for popular children's TV shows and movies for under-5s, based on [UK government screen time guidance](https://www.gov.uk/government/news/new-screen-time-guidance-for-parents-of-under-5s).

A simple static site — no build step required to run locally.

## Running locally

Serve the folder over HTTP (the site fetches `shows.json` at runtime):

```bash
npx serve .
# or
python3 -m http.server
```

Then open `http://localhost:3000` (or `:8000` for Python).

## Rebuilding Tailwind CSS

If you change any Tailwind classes in `index.html` or `app.js`:

```bash
npx @tailwindcss/cli -i style.css -o tailwind.css
```

## How ratings work

Every show is scored across six dimensions drawn from the UK guidance:

| Dimension | Type | What it measures |
|---|---|---|
| **Pace** | RAG (green/amber/red) | How visually stimulating the content is |
| **Cognitive development** | Stars (1-5) | Educational value and learning potential |
| **Co-viewing value** | Stars (1-5) | How rewarding it is for adults to watch alongside children |
| **Emotional content** | RAG | Intensity of emotional themes |
| **Fear factor** | RAG | Likelihood of frightening young children |
| **Commercial pressure** | RAG | Merchandise push and advertising exposure |

The **overall star rating** (1-5) is an editorial judgement weighted primarily by pace and fear factor:

- Red pace caps a show at 2 stars
- Amber fear factor caps a show at 4 stars
- 5 stars requires strong scores across all six dimensions

## Contributing

We welcome contributions. Here's how you can help:

### Suggest a change

The quickest way is to [email us](mailto:hello@littlescreenguide.co.uk) or [open an issue](../../issues).

### Add a new show

1. Fork the repo and create a branch
2. Add a new entry to `shows.json` following the structure below
3. Open a pull request with a brief explanation of why the show should be included

#### Show entry structure

```json
{
  "id": "show-id-in-kebab-case",
  "name": "Show Name",
  "type": "show",
  "broadcaster": "CBeebies / Netflix",
  "description": "One to two sentences, roughly 120-150 characters.",
  "thumbnailUrl": "https://image.tmdb.org/t/p/w500/...",
  "ageMinYears": 2,
  "ageMaxYears": 5,
  "episodeLengthMinutes": 11,
  "episodeLengthRag": "green",
  "overallStars": 3,
  "dimensions": {
    "pace":              { "rag": "green", "note": "..." },
    "cognitive":         { "stars": 4,     "note": "..." },
    "coViewing":         { "stars": 3,     "note": "..." },
    "emotionalContent":  { "rag": "green", "note": "..." },
    "commercialPressure":{ "rag": "green", "note": "..." },
    "fearFactor":        { "rag": "green", "note": "..." }
  },
  "tags": ["educational", "nature"],
  "ukGuidanceNote": "How this show relates to UK screen time guidance.",
  "trailerUrl": "https://www.youtube.com/watch?v=..."
}
```

**Key rules:**

- `type` — `"show"` for TV series, `"movie"` for films. TV shows without a `type` field default to `"show"`.
- `id` — lowercase kebab-case, must be unique
- `description` — keep to 1-2 sentences (roughly 120-150 characters)
- `episodeLengthRag` — `"green"` (under 15 min), `"amber"` (15-25 min), `"red"` (over 25 min)
- `thumbnailUrl` — use a TMDB `w500` poster URL. Run `node fetch-posters.js <TMDB_TOKEN>` to fetch poster URLs for all shows at once.
- `trailerUrl` — YouTube URL or empty string
- `broadcaster` — list UK-available platforms separated by ` / ` (e.g. `"CBeebies / Netflix"`)
- RAG values — must be one of `"green"`, `"amber"`, `"red"`
- Star values — integer from 1 to 5
- `note` — a short sentence explaining the rating for that dimension

### Update an existing show

If a rating feels wrong, a broadcaster has changed, or a description could be better — open a PR or issue explaining what you'd change and why.

### Code changes

The site is vanilla HTML, CSS and JS with no framework. The main files:

| File | Purpose |
|---|---|
| `index.html` | Page structure, filter panel, footer |
| `app.js` | Filtering, sorting, card rendering, slide panel |
| `style.css` | All custom styles (non-Tailwind) |
| `tailwind.css` | Pre-built Tailwind output |
| `shows.json` | All show data |
| `fetch-posters.js` | Helper script to fetch TMDB poster URLs |

## Data attribution

This product uses the [TMDB API](https://www.themoviedb.org/) for poster images and show descriptions but is not endorsed or certified by TMDB.

## Licence

[MIT](LICENSE)

[![GTA 6 Trophy Guide](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/c/gta6-trophy-guide-01)
[![Rank](https://make.fun/badge/gta6-trophy-guide-01/Erwinsays12/makefun-gta6-trophy-guide-2/rank.svg)](https://make.fun/c/gta6-trophy-guide-01)
[![Reward](https://make.fun/badge/gta6-trophy-guide-01/Erwinsays12/makefun-gta6-trophy-guide-2/reward.svg)](https://make.fun/c/gta6-trophy-guide-01)

# Leonida Trophy Guide & Tracker — GTA VI (PS5)

An offline guide and tracker for all **55 Grand Theft Auto VI PlayStation 5 trophies** (1 platinum, 2 gold, 6 silver, 46 bronze), built for the [make.fun GTA 6 trophy guide bounty](https://make.fun/c/gta6-trophy-guide-01).

## What it is

- **Every trophy** with its official name, description and grade, as Exophase and PSNProfiles published the list on 18 November 2026.
- **A guide for each trophy, in our own words, with its sources named beside it** — what to do, where and how, and when it can be missed. Where early reports say an unlock method is not yet confirmed, the guide says so instead of guessing.
- **A roadmap to the platinum** in six stages, built from the official descriptions: story first, the one missable trophy early, then the long counts.
- **Missable flags** — one trophy is flagged missable: *Positive Mental Attitude* (a Chapter 1 meditation spot that disappears after the chapter).
- **A tracker**: tick trophies off and your progress is saved in the browser (localStorage); export it to a file and import it back. Filters by kind (story, missable, collectibles, activities, online, free roam & combat) and by grade, plus search and a hide-earned toggle.
- **A spoiler setting** that hides the names, descriptions and guides of story trophies until they are earned.
- **Fully offline**: static files under `app/`, no build step, no network requests at run time.

## Try it

```sh
node serve.ts
```

Then open http://localhost:8080 in desktop Chrome. Or serve `app/` with any static HTTP server.

## Layout

- `app/index.html` — the page shell
- `app/app.js` — checklist, filters, spoiler mode, roadmap, export/import
- `app/style.css` — the guide's own look (dark "Vice City nights" theme, system fonts only)
- `app/data/trophies.json` — the 55 trophies, the roadmap stages and the sources
- `screenshots/` — screenshots of the guide running in a browser
- `main.ts` — the entry program: copies `app/` and `screenshots/` to `/output` and writes `dossier.json`
- `vendor/makefun-frontend.ts` — the kit's dossier library, unchanged

## Sources

- Official PS5 trophy list, as listed by Exophase and PSNProfiles (18 Nov 2026)
- Output Lag — GTA 6 Trophy List
- CryptoGames — GTA 6 Trophies and Achievements
- GTA Vice City Hub — GTA 6 Achievements
- Rockstar Games — Grand Theft Auto VI (official site and trailers)

An unofficial fan guide. Not affiliated with Rockstar Games; it uses no Rockstar logo, artwork or screenshots of the game. Grand Theft Auto and GTA are trademarks of Take-Two Interactive.

## License

MIT — see [LICENSE](LICENSE).

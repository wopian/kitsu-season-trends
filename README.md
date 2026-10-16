# Kitsu Season Trends

Daily anime ratings, votes and favourites since 2017: **https://kitsu.wopian.me**.

## Development

Use Bun 1.4.2. Dependencies follow reference projects' three-day release age;
explicitly requested `kitsu-native@13.0.0` and `kitsu-core@13.0.0` are exceptions.

```sh
bun install --frozen-lockfile
bun run dev
bun run typecheck
bun run test
bun run build
bun run preview
bun run check:http http://127.0.0.1:4173
bunx playwright install chromium
bun run test:browser
```

Use `PLAYWRIGHT_CHANNEL=chrome` to test installed Chrome. After dependency changes,
run `bun dedupe` and `bun dedupe --check`.

## Data

Tracked sources are JSON5 under `data/`. Builds generate public JSON and
MessagePack using `msgpack-lite`; browser charts load MessagePack.

- `/data/{year}-{season}.json`
- `/msgpack/{year}-{season}.msgpack`
- `/data/id/{id}.json`
- `/msgpack/id/{id}.msgpack`

Season entries contain `i` (Kitsu ID), `t` (title), `u` (0 TV, 1 ONA), `n` (1 new,
0 leftover), optional `poster` (current API image URL), and daily observations `d`.
Per-anime archives place optional `poster` in `meta`. Observations retain `d`
(hours since epoch), `w` (Wilson), `l` (Laplace), `p` (weighted upvotes), `o`
(weighted downvotes), `r` (ratings), `u` (legacy users), and `f` (favourites).
Omitted numeric metrics mean zero. Poster errors display a local text fallback.

```sh
bun run cron
bun run backfill:posters --dry-run
bun run backfill:posters
bun run backfill:history --dry-run
bun run backfill:history
```

GitHub Actions runs daily at **22:00 UTC**, signs data commits and invokes static build with exact committed SHA. No Kitsu credentials
are needed. Required signing secrets: `GPG_KEY`, `GPG_SIGNING_KEY`, `GH_USERNAME`,
`GH_EMAIL`. Repository Actions token needs contents/package write permission.

## Ratings

Historical `useLaplace` selects Laplace scores; older archives use Wilson scores.
Formulas remain unchanged: weighted votes from `wilson-rate`, Wilson confidence
1.96, and Laplace `upvotes / (upvotes + downvotes + 5)`. Rating changes use percentage
points. Count changes compare previous recorded observation, which may not be yesterday.
Charts show missing observation dates as gaps. Ranking uses latest metric value,
then anime ID.

## Season stats

`/stats/` compares archived seasons with counts, TV/ONA mix, mean rating, rating
submissions, and favourites. Year filters affect charts and the linked season
table; summary cards cover the full archive. Audience totals are not unique users.

Counts come from stored entries and New/Leftover flags, including older archives
whose metadata totals differ. Ratings and audience use each anime's latest sample
within its season archive, even when collection continues after that quarter.
Mean ratings exclude zero scores and retain each archive's Wilson/Laplace method.
Early coverage can be incomplete; current-quarter totals remain in progress.

Daily collection stages `data/stats.json5` with season and ID updates after all
collection succeeds. Rebuild stats from existing archives without API calls:

```sh
bun run backfill:stats --dry-run
bun run backfill:stats
```

Backfill changes only `data/stats.json5` and uses the collector lock. Build rejects
stale stats with a backfill instruction. JSON and MessagePack exports are available
at `/stats.json` and `/stats.msgpack`, with aliases `/data/stats.json` and
`/msgpack/stats.msgpack`. All exports contain identical versioned data.

## Social previews

Build generates a 1200 × 630 SVG and PNG per season at
`/social/{year}-{season}.svg` and `.png`. Open Graph and Twitter metadata use PNG
with a content checksum query parameter. Root uses its displayed season; fall
aliases use their canonical autumn preview.

Previews show season counts, three highest-rated New anime, scoring method,
source snapshot date (UTC), and daily/archive status. Rankings use latest seasonal
observations and the archive's Wilson/Laplace method. Zero scores are excluded;
ties use ascending anime IDs. Counts include all stored entries, including leftovers.

Posters download during data preparation, cache by URL in `.cache/social-posters`,
and embed directly. Unavailable posters use branded placeholders. SVG text becomes
paths using bundled, licensed fonts. PNG generation needs no browser or runtime
server. Generated previews remain build artifacts; source archives stay unchanged.

## Static hosting

`bun run build` generates `.output/public`, every archived season page, JSON and
MessagePack downloads, custom 404, sitemap, and SHA-256 release manifest. Root shows
current season or latest available archive. `/year/fall` aliases same year's autumn.
Unknown paths return HTTP 404; do not configure an SPA fallback.

CI validates PRs and publishes master to:

```text
ghcr.io/wopian/kitsu-season-trends/static:latest
ghcr.io/wopian/kitsu-season-trends/static:sha-<commit>
```

Docker target `artifact` packages verified files at `/site`; `production` builds
from source. Both final images contain only files. Archive: `kitsu-static.tar.gz`.

MIT licensed. Kitsu data is freely downloadable.

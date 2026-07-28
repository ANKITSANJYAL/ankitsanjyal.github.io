# ankitsanjyal.github.io — Site Restructure

## Goal

The site had grown into one long single-column page with ~35 stacked blocks (4-paragraph
bio, 9 news items, 4 research interests, 4 publications, 8 projects, 3 writing entries,
4 experience rows, 3 education rows, plus visible `[ANKIT: ...]` placeholders). It reads
as a wall of information.

Restructure it to follow the **layout of [xinyinghou.org](https://xinyinghou.org/)** while
keeping the **existing color theme and typography** (blue `#1772d0` accent, orange
`#f09228` hover, Lato, white background).

## What the reference site actually does

Studied `xinyinghou.org` HTML + `style.css`. The structural moves that make it feel calm:

1. **Two-column CSS grid**, not one long column. Narrow left rail
   (`clamp(250px, 20%, 300px)`), wide right column, `column-gap: 2.5rem`, container
   capped at `max-width: 1200px` / `width: 85%`.
2. **Left rail = identity + news.** Profile photo, name, contact, role lines, social
   links — then News. Nothing else.
3. **News is truncated to 5 items** with a `See all news →` link to a dedicated page.
   The archive lives off the homepage.
4. **Right column = substance.** About Me, Research Interests, Selected Publications.
5. **Publications are cards, not rows.** Each card: fixed 160px left rail holding a
   thumbnail plus a full-width colored action button; right side holds title (14px),
   authors (12px, light weight), a venue pill, and a short highlight paragraph (12px).
   `border-radius: 12px`, 1px border, soft box-shadow, shadow deepens on hover.
6. **Venue and honors are pills**, not italic text.
7. **Small, quiet type.** Body 14px, highlights 12px, section titles 18px `inline-block`
   with a 3px accent underline (not a full-width rule).
8. **The homepage is short.** No experience table, no education table, no long project
   list. Only four sections total.
9. **Tiny footer**: copyright + the same three social links.

## Target information architecture

| Page | Contents |
|---|---|
| `index.html` | Left rail: profile + News (5, truncated). Right: About Me, Research Interests, Selected Publications (4 cards), Selected Projects (4 cards), Writing (2 compact rows) |
| `news.html` | Full news archive, grouped by year |
| `projects.html` | All 9 projects as cards, grouped |
| `cv.html` | Experience, Education & Training, Teaching — moved off the homepage |
| `blog/index.html` | Static list of the real writing pages (was a broken localStorage widget showing "No posts yet") |

## Checklist

### Phase 1 — Stylesheet
- [x] Rewrite `assets/css/academic.css` around a two-column grid; keep `#1772d0` / `#f09228` / Lato
- [x] Add `.layout-grid` with sticky left rail and responsive collapse at 900px
- [x] Add `.item-card` component (160px thumb rail + action button + body) for publications and projects
- [x] Add `.pill` variants: venue, honor, status, tag
- [x] Restyle `.section-title` to inline-block with 3px `#1772d0` underline
- [x] Reduce base type scale to match reference (body 14–15px, card highlight 13px)
- [x] Keep `.exp-table` / `.edu-table` styles (still used by `cv.html`)
- [x] Mobile: single column, rail unsticks, cards stack

### Phase 2 — Homepage rebuild
- [x] Rebuild `index.html` on the grid: left rail = profile + news, right = content
- [x] Trim bio from 4 paragraphs to 2 (drop the preprint list — it duplicates Publications)
- [x] Truncate News to 5 items + `See all news →`
- [x] Compress Research Interests to a keywords line + short bullets
- [x] Convert 4 publications to `.item-card` with thumbnails and a PDF/arXiv button
- [x] Cut to 4 selected projects as cards + `See all projects →`
- [x] Shorten every project description (drop the repeated "same pattern underlying interpretability agents" justification prose)
- [x] Compact Writing to 2 rows; remove the `[ANKIT: add posts here]` and `[coming soon]` placeholders
- [x] Move Experience + Education off the homepage into `cv.html`
- [x] Fix broken absolute image path `/Users/ankitsanjyal/Desktop/...` → `assets/images/multimodal_emotion.png`
- [x] Slim the nav and add CV link

### Phase 3 — New pages
- [x] `news.html` — full archive grouped by year
- [x] `projects.html` — all 9 projects as cards
- [x] `cv.html` — Experience, Education & Training, Teaching
- [x] Replace `blog/index.html` localStorage widget with a static list of real posts

### Phase 4 — Consistency pass
- [x] Update nav on all 4 `papers/*.html` to the new link set
- [x] Update nav on all 9 `projects/*.html` to the new link set
- [x] Update nav on both real `blog/*.html` posts
- [x] Delete dead scaffolding: `blog/write.html`, `blog/edit.html`, `blog/post.html`
- [x] Verify every internal link resolves
- [x] Verify no `[ANKIT:` or `[coming soon]` placeholders remain anywhere

### Phase 5 — Research statement alignment (2026-07-28)
- [x] Update CV link to the new Google Doc (old doc ID removed sitewide)
- [x] Add research statement link: profile rail, Research Interests, `cv.html`
- [x] Rewrite About to open on the reliable-window question and the multi-agent second half
- [x] Add ~120-word research summary in the author's own voice + `Multi-Agent Safety` keyword
- [x] Add fifth interest bullet: Multi-agent monitorability
- [x] Create `AnkitSanjyal.md` — GitHub profile README repositioned around AI safety

## Status

**All phases complete** (verified 2026-07-28). Verification performed:

- All 20 HTML pages: 0 broken internal links, 0 broken image paths, 0 dangling anchors.
- All 20 pages carry an identical six-link nav.
- 0 placeholder strings (`[ANKIT:`, `[coming soon]`) and 0 absolute local paths remain.
- Every CSS class used in markup is defined; no phantom classes.
- Rendered in headless Chrome at 1280px and 500px and inspected.
- All 20 external links in `AnkitSanjyal.md` checked; only the two paused
  github-readme-stats endpoints are non-200 (documented inline in that file).

Rendering bugs found by looking at screenshots and fixed:
1. Tall source images (`Diff-Det.png`, `NoProp.png`) were dictating card height via
   `flex: 1 1 auto`, ballooning cards to ~330px. Fixed by making flex-basis set the
   band height (`flex: 1 1 132px`) so images fill and crop instead.
2. `.back-link` was `inline-block`, so it sat on the same line as the `inline-block`
   `.section-title` on every subpage. Changed to `display: block`.
3. Merge damage in the Publications section: a duplicated Affect-Diff entry in the old
   `.pub-row` markup (unstyled, since those classes no longer exist) and a dropped
   RectifiedHR card while the note still claimed "Four arXiv preprints". Both fixed.

Note on mobile testing: headless Chrome on macOS clamps the window to a ~500px minimum,
so screenshots requested at 390–430px are **crops of a 500px render**, not real narrow
layouts. Apparent "clipping" at those widths is an artifact, not a CSS bug — verify
mobile at >=500px or in a real browser.

## Git history warning (2026-07-28)

The restructure was merged to `master` in PR #5, then **reverted in PR #6**
(`07799a4 Revert "Ai safety revamp"`), and that reverted master was merged back into
`ai-safety-revamp` in PR #7. For a period, both remote branches had lost the restructure
and only local commit `013abe3` still contained it. Recovery: `master` was
fast-forwarded to `013abe3`.

Backups of that state exist as branch `backup-restructure-20260728` and tag
`good-state-20260728`. **Do not delete them** until the remote state is confirmed good.

If the site ever appears to revert to the old single-column layout, check for another
revert commit on master before re-doing any work.

## Known issues not yet fixed

- `github.com/Fordham-EDM-Lab/MAESTRO` returns 404 to anonymous visitors (org is public,
  repo is not). Still linked from `projects.html` and `projects/maestro.html`.
  `AnkitSanjyal.md` points at the live deployment instead.
- The public `github-readme-stats.vercel.app` instance is returning
  `503 DEPLOYMENT_PAUSED`, so two of the three GitHub stat cards render broken.

## Conventions

- Palette: `#1772d0` accent, `#f09228` link hover, `#111` headings, `#444` body,
  `#888` meta, `#e8e8e8` borders. Do not introduce the reference site's brown.
- Font: Lato throughout. No serif display face.
- Card thumbnails: 160×150, `object-fit: contain` on white.
- Keep every existing detail page (`papers/*`, `projects/*`, `blog/*`) intact — the
  restructure is about the homepage and navigation, not about deleting written content.

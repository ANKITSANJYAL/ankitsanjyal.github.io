# ankitsanjyal.github.io

## What this site is

A single ambient shell. The homepage is a fixed frame that never moves: a name, a
tagline, a persistent nav, and four corners of quiet chrome. Only the content region
inside that frame changes. Depth is opt-in and never navigates away: summaries link
to full write-ups, abstracts open in a modal.

The direction is adapted from shrenikpatel.me, with two deliberate departures. That
site ships an empty HTML shell and renders everything in JavaScript; **this one ships
every entry as real HTML** so the whole site is readable and indexable without JS.
And where that site burns 212 KB of WebGL on its background, this one gets the same
effect from four blurred CSS blobs and one inline SVG turbulence, at about a kilobyte.

There is no build step. It is static HTML on GitHub Pages, and it must stay that way.

## Architecture

| Path | Role |
|---|---|
| `index.html` | The shell. Six views, every entry, both modals, all the JS |
| `assets/css/shell.css` | The only stylesheet. Every page loads it and nothing else |
| `cv.html` | Kept, but not linked from the shell. The nav CV link goes to the Google Doc |
| `papers/*.html` | 4 paper write-ups |
| `projects/*.html` | 11 project write-ups |
| `blog/*.html` | 2 posts |
| `admin.html` | Unlisted, noindex. The thoughts editor. Talks only to the Worker |
| `worker/` | The one server: email code sign-in, and the only writer to the repo |
| `design-concepts/` | Throwaway prototypes for the redesign. Safe to delete |

## How the homepage works

Six views live in the DOM at once as `<section class="view" id="v-NAME">`; the nav
toggles `.on`. **Nothing is injected by JS.** Views are addressable by hash
(`index.html#projects`), which is what every detail page's back-link targets.

### An entry

Every entry in research, projects and writing has the same shape:

```html
<article class="row">
  <div class="rhead">
    <h3><a href="projects/thing.html">Title</a></h3>
    <span class="when">2026</span>
  </div>
  <p class="sum"><a href="projects/thing.html">Two to three sentences.</a></p>
  <div class="acts">
    <button data-abs>abstract</button>
    <a href="https://..." target="_blank" rel="noopener">code &nearr;</a>
    <span class="venue">Label</span>
  </div>
  <div class="abs" data-title="Full title" data-date="Venue and date">
    <p>The abstract, as published.</p>
    <p class="go"><a href="...">Full write-up</a></p>
  </div>
</article>
```

Three rules hold everywhere:

1. **The summary is the link.** The whole `.sum` paragraph is an `<a>` to the write-up,
   not a trailing arrow. The title links to the same place.
2. **The abstract is a modal.** `.abs` is hidden in the DOM (so it is still crawlable)
   and cloned into the one shared `#sheet-dialog` on click. Never add a second dialog
   for an entry; add an `.abs` block.
3. **Summaries are two to three sentences.** A one-line summary is the thing this site
   exists to avoid.

### The keyword filter

`research`, `projects` and `thoughts` each carry a filter bar and a row of chips.
Matching is **AND across whitespace-separated tokens**, each token a substring match
over a haystack built from the row's `data-k`, its title, its summary and its venue.

The abstract is deliberately **not** in the haystack. Several write-ups mention a field
in passing (`MAESTRO` says the word "interpretability"), and including abstracts turned
the filter into a dragnet that returned ten of sixteen rows for a specific query.

`data-k` is the curated half and the one to extend. It holds the vocabulary a visitor
would reach for that does not appear in the prose: stack names, adjacent fields, tools.
An `ALIAS` table in the shell script widens common words onto what the corpus actually
says (`etl` reaches `pipeline` and `warehouse`, `agent` reaches `crewai` and `langgraph`).
Plurals fold both ways.

Two rules learned the hard way: keep aliases longer than three characters (`sec` matched
"seconds"), and add a term to `data-k` rather than to `ALIAS` when only one entry needs it.

`/` focuses the filter in whichever view is open.

### Thoughts

`writing` holds the research posts. `thoughts` holds essays and reading notes, and is
the informal half. A thought is an `<article class="tnote">`: a visible date and title
button, plus the same hidden `.abs` block the rows use, so it opens in the shared sheet.
Nothing about it is a separate mechanism.

### The frame

- Corner chrome: live 24-hour clock top-left, mood toggle top-right, `in new york`
  bottom-left, `what i'm reading` bottom-right.
- Moods are `slate` (default), `warm`, `ink`, set as `data-mood` on `<body>`. Each
  redefines the same tokens; nothing else changes.
- The rain uses `sin(42 + i)` rather than `Math.random()`, so it is identical on every
  load. `warm` has no rain, `ink` has twice as much.
- The portrait is ordered-dithered on a canvas with an 8x8 Bayer matrix, and falls back
  to a greyscale `<img>` if the canvas is tainted (which is what happens over `file://`).

## Publishing a thought from the site

`admin.html` is an unlisted, `noindex` editor: sign in with a code mailed to
`ALLOWED_EMAIL`, write in a small rich-text box, save, and the thought is live once
Pages rebuilds. It is the only part of the site that writes to the repository.

**The static site cannot do this alone**, and that is not a limitation to design
around. Mailing a code, checking it, and keeping a secret are all server work.
A verified fact, not an assumption: GitHub's `login/device/code` and
`login/oauth/access_token` endpoints send no CORS headers, so browser-only GitHub
auth is impossible from a static page. Anything claiming otherwise is putting a
write-capable credential in the page source.

So there is exactly one server, `worker/`, a Cloudflare Worker:

```
admin.html  ──(email, then 6-digit code)──►  Worker  ──(GitHub token)──►  repo
     ▲                                         │
     └──────── 2-hour session token ───────────┘
```

The browser never holds a GitHub credential. The Worker holds it, and will only
write between the `<!-- THOUGHTS:*:START -->` and `<!-- THOUGHTS:*:END -->` markers
in `index.html`. A fully compromised session can add, edit or delete a thought and
nothing else.

Three rules that exist because breaking them was caught by `worker/test.mjs`:

1. **Markers are unique and correctly ordered.** They were first spliced into the
   research section, because every list view ends with the same three lines and the
   first match won. `grep -n 'THOUGHTS:' index.html` should show START before END
   inside `v-thoughts`, and nowhere else.
2. **`parseNotes` dedents, `renderNote` indents.** Otherwise each save re-indents
   the previous save and the block walks right across the page.
3. **`unescapeAttr` is the exact inverse of `escapeAttr`, ampersand last.** A title
   containing `&` otherwise gains an `amp;` on every edit until the reader is
   looking at raw entities.

Run `cd worker && node test.mjs` after touching either the Worker or the thoughts
markup. It needs no network, no secrets, and no deploy. Deployment steps and the
threat model are in `worker/README.md`.

## Writing rules

- **No em dashes anywhere on the site.** Use a comma, a colon, or a full stop. This is
  checked: `grep -rn --include='*.html' --include='*.css' -- '—' .` should only ever
  match inside `design-concepts/`.
- Chrome and nav are lowercase. Headings and prose are sentence case.

## Styling rules

- Two typefaces. **EB Garamond** is the voice: name, tagline, headings, dates, corner
  chrome, italic asides, the `return` buttons. **Instrument Sans** is the information:
  body copy, summaries, abstracts, nav. **JetBrains Mono** appears only on detail pages,
  for dates and labels. No fourth face.
- Tokens live on `:root` and are redefined per mood. Never hardcode a colour in a page.
- `shell.css` holds two environments. Section A is `body.shell`, the ambient homepage.
  Section B is `body:not(.shell)`, the reader: light, quiet, and deliberately outside
  the ambient system, because that is where the long writing lives.
- Section C claws back the components that must look identical everywhere: pills, link
  buttons, heroes, abstract boxes. Detail pages load `shell.css` before their own
  `<style>`, so those rules carry `body` specificity. If a fourth component starts
  drifting per page, extend section C rather than editing 15 files.
- Images are `filter: grayscale(1)` on detail pages and return to full colour on hover.
  Some figures encode their result in colour, so the hover is load-bearing.
- `prefers-reduced-motion` disables the blobs, the rain, and the view transition.

## Conventions carried forward

- Keep every detail page. The design work is about navigation, never about deleting
  written content.
- Nav is identical on all 17 subpages: name on the left, then Home, Research, Projects,
  Writing, and CV (which opens the Google Doc in a new tab).
- Back-link wording is `← Back` everywhere, and it targets the view the page belongs to.

## History

The site was a single long column, then a two-column academic layout modelled on
xinyinghou.org (blue `#1772d0` accent, Lato), then a strictly black-and-white search
shell whose homepage was a name, two sentences and a search box. All three are gone.

The search shell is worth remembering: typing filtered a full index that shipped in the
HTML, with `/` to focus and arrow keys to move. The current shell replaced it with an
explicit five-item nav. If search comes back, it belongs as a `/` overlay over this
frame, not as the homepage.

The pre-shell state, including `news.html`, `projects.html`, `blog/index.html` and
`assets/css/academic.css`, is recoverable from git history. Backup branch
`backup-restructure-20260728` and tag `good-state-20260728` still hold the two-column
version. The search shell itself is the commit immediately before this redesign.

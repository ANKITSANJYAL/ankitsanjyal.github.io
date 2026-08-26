# ankitsanjyal.github.io — the search shell

## What this site is

One idea, executed everywhere: **the homepage is a name, two sentences, and a search box.**
Nothing else exists until a visitor asks for it. Depth is opt-in — someone who only wants
to know who Ankit is reads three lines and leaves; someone interested types and gets
everything.

Palette is **black, white and grey only**. There is no accent colour anywhere on the site,
and adding one would break the whole premise.

## Architecture

| Path | Role |
|---|---|
| `index.html` | The shell. Bio, search box, five section chips, and the full entry index |
| `assets/css/shell.css` | The only stylesheet. Every page loads it and nothing else |
| `cv.html` | Experience, Education & Training, Teaching |
| `papers/*.html` | 4 paper write-ups |
| `projects/*.html` | 10 project write-ups |
| `blog/*.html` | 2 posts |

18 pages total. There is no `news.html`, no `projects.html`, no `blog/index.html` — search
replaced all three, and every item they listed is an entry on the homepage.

## How the homepage works

**Every entry ships as real HTML** inside `#results`, not injected by JS. This matters twice
over: the page works with JavaScript off, and crawlers index the whole site from one
document. An inline `<script>` in `<head>` sets `html.js`, and CSS hides the entries only
in that class — so there is no flash of a long list on load.

Each entry is a single `<a class="hit">` carrying:

- `data-cat` — one of `research` `project` `teaching` `writing` `contact`
- `data-k` — extra search keywords that do not appear in the visible text
- `.t` title, `.sum` **two to three sentence summary**, `.dest` where the link goes

**Routing rule:** an entry links to its own write-up page when one exists, and to the
source (GitHub, arXiv, LessWrong, a Google Doc, `mailto:`) only when it does not. Every
paper and project currently has a write-up, so nearly everything routes internally, and
the write-up page carries the external links. `.dest` must always name the real
destination — `Write-up →`, `CV →`, `Read →`, `Google Doc ↗`.

**Search behaviour:** a bare section name (`research`, `project`, …) filters by `data-cat`;
anything else is a substring match over category + keywords + title + summary. That is why
typing `research` lists the research and typing `reasoning` searches for it.

**Keyboard:** `↑`/`↓` move the selection, `Enter` opens it, `Esc` clears and blurs, `/`
focuses the box when it is not already focused. The box is focused on load, so the letter
jumps (`r` `p` `t` `w` `c`) only fire when focus is elsewhere — this is deliberate, so a
shortcut can never swallow what someone is typing. **Do not advertise a shortcut on the
chips again unless it works in the state the page actually loads in.**

## Adding an entry

Add one `<a class="hit">` to `#results` in `index.html`, matching the shape of its
neighbours. Give it a real `data-cat`, generous `data-k`, and a summary of **at least two
sentences** — a one-line summary is the thing this redesign existed to remove. No JS
change is needed; the script reads whatever is in the DOM.

## Styling rules

- Two typefaces: **Instrument Sans** everywhere, **JetBrains Mono** for labels, metadata,
  pills, and destinations. No third face.
- Tokens live on `:root` in `shell.css`: `--paper --sunk --ink --body --mute --rule --line`.
  Use them; never hardcode a hex in a page.
- Square corners. `border-radius` is `0` sitewide.
- **Images are `filter: grayscale(1)` and return to full colour on hover.** Some figures
  encode results in colour, so the hover is load-bearing, not decoration.
- Single theme, light, painted explicitly. Detail pages still carry their own inline
  `<style>` blocks with hardcoded light values, so a dark-mode inversion would break them.
- Detail pages load `shell.css` *before* their own `<style>`, so their local rules win.
  Section 5 of `shell.css` uses `body .x` selectors to claw back the two components that
  must look identical everywhere — pills and link buttons. If a third component starts
  drifting per-page, extend that block rather than editing 15 files.

## Conventions carried forward

- Keep every detail page. The design work is about navigation, never about deleting
  written content.
- Nav is identical on all 17 subpages: name on the left, `Search` and `CV` on the right.
- Back-link wording is `← Back to search` everywhere.

## History

Earlier versions were a single long column, then a two-column academic layout modelled on
xinyinghou.org (blue `#1772d0` accent, Lato). Both are gone. Four black-and-white
directions were prototyped — an index, a masonry board, editorial panels, and this shell —
and the shell was chosen. The prototypes lived in `design-options/` and were deleted.

The pre-shell state, including `news.html`, `projects.html`, `blog/index.html` and
`assets/css/academic.css`, is recoverable from git history. Backup branch
`backup-restructure-20260728` and tag `good-state-20260728` still hold the two-column
version.

/**
 * Exercises the Worker's parse, render, splice and validate logic against the
 * real index.html. No network, no deploy, no secrets.
 *
 *   cd worker && node test.mjs
 *
 * Run it after touching either the Worker or the thoughts markup. The three
 * bugs it caught when it was written were all silent ones: a marker inserted
 * into the wrong section, indentation that grew on every save, and titles that
 * gained an "amp;" each time they were edited.
 */
import { readFileSync, writeFileSync, mkdtempSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { tmpdir } from 'node:os';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');

const shim = join(mkdtempSync(join(tmpdir(), 'worker-test-')), 'worker.mjs');
writeFileSync(
  shim,
  readFileSync(join(here, 'src/index.js'), 'utf8').replace(
    /export default \{[\s\S]*$/,
    'export { parseNotes, renderNote, spliceNotes, validateBody, validateNote, makeId, utf8ToB64, b64ToUtf8, dedent };'
  )
);
const W = await import(shim);
const idx = readFileSync(join(root, 'index.html'), 'utf8');

let pass = 0, fail = 0;
const ok = (name, cond, extra) => {
  if (cond) { pass++; console.log('  ok   ' + name); }
  else { fail++; console.log('  FAIL ' + name + (extra ? '  -> ' + extra : '')); }
};

console.log('\n== parse the live file ==');
const notes = W.parseNotes(idx);
ok('finds the seeded reading notes', notes.length >= 1, 'got ' + notes.length);
ok('every note has an id', notes.every((n) => /^[a-z0-9-]+$/.test(n.id)));
ok('every note has a title', notes.every((n) => n.title.trim().length > 0));
ok('no double-escaped entities in titles', notes.every((n) => !/&amp;/.test(n.title)),
   JSON.stringify(notes.map((n) => n.title)));

console.log('\n== round trip is a fixed point ==');
const same = W.spliceNotes(idx, notes);
ok('splicing what we parsed changes nothing', same === idx);
ok('parsing it again gives the same notes',
   JSON.stringify(W.parseNotes(same)) === JSON.stringify(notes));
ok('nothing before the markers moved',
   same.split('<!-- THOUGHTS:ESSAYS:START -->')[0] === idx.split('<!-- THOUGHTS:ESSAYS:START -->')[0]);

console.log('\n== add, then remove, an essay ==');
const essay = {
  group: 'essays', id: W.makeId('On starting'), title: 'On starting & finishing',
  date: '2026', meta: 'essay · august 2026', tags: 'life writing',
  body: '<p>A first <strong>paragraph</strong> with <em>emphasis</em>.</p>\n<h3>A turn</h3>\n<p>And <a href="https://example.com" target="_blank" rel="noopener">a link</a>.</p>'
};
const added = W.spliceNotes(idx, [...notes, essay]);
const back = W.parseNotes(added).find((n) => n.id === essay.id);
ok('the essay is stored', !!back);
ok('it lands in the essays group', back && back.group === 'essays');
ok('the body survives byte for byte', back && back.body === essay.body, back && JSON.stringify(back.body));
ok('an ampersand in the title survives', back && back.title === essay.title, back && back.title);
ok('a second save is stable',
   W.spliceNotes(added, W.parseNotes(added)) === added);
ok('removing it restores the file exactly',
   W.spliceNotes(added, W.parseNotes(added).filter((n) => n.id !== essay.id)) === idx);

console.log('\n== the validator refuses what it should ==');
for (const [name, html] of [
  ['a script tag',        '<p>hi</p><script>alert(1)</script>'],
  ['an event handler',    '<p onclick="alert(1)">hi</p>'],
  ['a javascript link',   '<p><a href="javascript:alert(1)">x</a></p>'],
  ['an iframe',           '<p>a</p><iframe src="//evil"></iframe>'],
  ['an img with onerror', '<img src=x onerror=alert(1)>'],
  ['a style block',       '<style>body{display:none}</style>'],
  ['unbalanced tags',     '<p>open <strong>never closed</p>'],
  ['a stray attribute',   '<p class="x">hi</p>'],
  ['an empty body',       '   '],
]) ok('refuses ' + name, W.validateBody(html) !== null);

console.log('\n== the validator accepts what it should ==');
for (const [name, html] of [
  ['plain paragraphs', '<p>one</p>\n<p>two</p>'],
  ['bold and italic',  '<p><strong>a</strong> and <em>b</em></p>'],
  ['a subheading',     '<h3>Title</h3>\n<p>text</p>'],
  ['a blockquote',     '<blockquote><p>quoted</p></blockquote>'],
  ['a bullet list',    '<ul><li>one</li><li>two</li></ul>'],
  ['an external link', '<p><a href="https://x.com" target="_blank" rel="noopener">x</a></p>'],
  ['an internal link', '<p><a href="cv.html">cv</a></p>'],
  ['a mailto link',    '<p><a href="mailto:a@b.com">mail</a></p>'],
  ['a line break',     '<p>a<br>b</p>'],
]) ok('accepts ' + name, W.validateBody(html) === null, W.validateBody(html));

console.log('\n== whole-note validation ==');
ok('refuses a missing title',  W.validateNote({ ...essay, title: '  ' }) !== null);
ok('refuses an unknown group', W.validateNote({ ...essay, group: 'nope' }) !== null);
ok('refuses html in a title',  W.validateNote({ ...essay, title: '<b>x</b>' }) !== null);
ok('refuses a path in an id',  W.validateNote({ ...essay, id: '../../etc' }) !== null);
ok('accepts a good note',      W.validateNote(essay) === null, W.validateNote(essay));

console.log('\n== base64 survives real prose ==');
const tricky = 'quotes “curly”, an arrow ↗, an en dash –, emoji 🙂, beta β';
ok('utf-8 round trips', W.b64ToUtf8(W.utf8ToB64(tricky)) === tricky);
ok('the whole file round trips', W.b64ToUtf8(W.utf8ToB64(idx)) === idx);

console.log(`\n${pass} passed, ${fail} failed\n`);
process.exit(fail ? 1 : 0);

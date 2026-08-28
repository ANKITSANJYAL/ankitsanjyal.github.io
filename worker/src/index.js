/**
 * thoughts-auth : the only server this site has.
 *
 * It exists for two reasons, both of which a static host cannot do:
 *   1. mail a one-time code and check it, and
 *   2. hold the GitHub token, so that the browser never sees a credential
 *      that can write to the repository.
 *
 * The browser gets a short-lived session token and nothing else. Every write
 * goes through this Worker, which is the only party that can reach GitHub, and
 * which will only ever write between the THOUGHTS markers in index.html.
 *
 * Bindings, all set with `wrangler secret put` except the plain vars:
 *   OTP_KV          KV namespace, holds pending codes and rate counters
 *   ALLOWED_EMAIL   the single address permitted to sign in
 *   SESSION_SECRET  random string, at least 32 chars, signs session tokens
 *   GITHUB_TOKEN    fine-grained PAT, this repo only, Contents read and write
 *   RESEND_API_KEY  mail provider key
 *   GITHUB_REPO     var, e.g. "ANKITSANJYAL/ankitsanjyal.github.io"
 *   GITHUB_BRANCH   var, e.g. "master"
 *   MAIL_FROM       var, e.g. "Thoughts <onboarding@resend.dev>"
 *   ALLOWED_ORIGIN  var, e.g. "https://ankitsanjyal.github.io"
 */

const CODE_TTL_S = 600;        // a code is good for ten minutes
const SESSION_TTL_S = 7200;    // a session lasts two hours
const MAX_VERIFY_ATTEMPTS = 5; // per code
const MAX_CODES_PER_HOUR = 5;  // per address

const MARKERS = {
  essays:  ['<!-- THOUGHTS:ESSAYS:START -->',  '<!-- THOUGHTS:ESSAYS:END -->'],
  reading: ['<!-- THOUGHTS:READING:START -->', '<!-- THOUGHTS:READING:END -->'],
};

/* Tags the body may contain. Anything else is rejected rather than cleaned:
   the editor already produces conforming markup, so a violation means either
   a bug or someone poking at the endpoint, and both deserve a 400. */
const ALLOWED_TAGS = new Set(['p', 'strong', 'em', 'a', 'blockquote', 'ul', 'ol', 'li', 'h3', 'br']);

/* ------------------------------------------------------------------ utils */

const enc = new TextEncoder();

function json(data, status, env, extra) {
  return new Response(JSON.stringify(data), {
    status: status || 200,
    headers: { 'content-type': 'application/json; charset=utf-8', ...cors(env), ...(extra || {}) },
  });
}

/**
 * ALLOWED_ORIGIN is a comma-separated list, so the live site and a local copy
 * can both be allowed without opening the Worker to everyone. The reply echoes
 * whichever listed origin asked, because a browser will not accept a list.
 * An unlisted origin gets the first entry back, which its browser then refuses.
 */
function cors(env) {
  const list = String(env.ALLOWED_ORIGIN || '').split(',').map((s) => s.trim()).filter(Boolean);
  const asked = env.__origin || '';
  const allow = list.includes(asked) ? asked : (list[0] || '*');
  return {
    'access-control-allow-origin': allow,
    'access-control-allow-methods': 'GET, POST, PUT, OPTIONS',
    'access-control-allow-headers': 'content-type, authorization',
    'access-control-max-age': '86400',
    'vary': 'origin',
  };
}

function b64url(bytes) {
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function unb64url(s) {
  const pad = s.replace(/-/g, '+').replace(/_/g, '/');
  const bin = atob(pad + '='.repeat((4 - (pad.length % 4)) % 4));
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function hmac(secret, msg) {
  const key = await crypto.subtle.importKey(
    'raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  return new Uint8Array(await crypto.subtle.sign('HMAC', key, enc.encode(msg)));
}

async function sha256hex(s) {
  const d = await crypto.subtle.digest('SHA-256', enc.encode(s));
  return [...new Uint8Array(d)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

/* comparison that does not leak where two strings first differ */
function sameString(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function normEmail(e) {
  return String(e || '').trim().toLowerCase();
}

/* ---------------------------------------------------------------- session */

async function issueSession(env, email) {
  const exp = Math.floor(Date.now() / 1000) + SESSION_TTL_S;
  const payload = b64url(enc.encode(JSON.stringify({ sub: email, exp })));
  const sig = b64url(await hmac(env.SESSION_SECRET, payload));
  return { token: `v1.${payload}.${sig}`, exp };
}

async function readSession(env, request) {
  const auth = request.headers.get('authorization') || '';
  const m = /^Bearer\s+(.+)$/i.exec(auth);
  if (!m) return null;

  const parts = m[1].split('.');
  if (parts.length !== 3 || parts[0] !== 'v1') return null;

  const expect = b64url(await hmac(env.SESSION_SECRET, parts[1]));
  if (!sameString(expect, parts[2])) return null;

  let claims;
  try {
    claims = JSON.parse(new TextDecoder().decode(unb64url(parts[1])));
  } catch { return null; }

  if (!claims || claims.exp < Math.floor(Date.now() / 1000)) return null;
  if (normEmail(claims.sub) !== normEmail(env.ALLOWED_EMAIL)) return null;
  return claims;
}

/* ------------------------------------------------------------------- mail */

async function sendCode(env, email, code) {
  const body = {
    from: env.MAIL_FROM,
    to: [email],
    subject: `${code} is your code`,
    text:
      `${code}\n\n` +
      `That is your sign-in code for the thoughts editor. It is good for ten minutes.\n\n` +
      `If you did not ask for it, someone typed your address into the editor and got nowhere. ` +
      `No action is needed, and nothing can be written without this code.\n`,
  };

  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      authorization: `Bearer ${env.RESEND_API_KEY}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!r.ok) {
    const detail = await r.text();
    throw new Error(`mail provider refused: ${r.status} ${detail.slice(0, 300)}`);
  }
}

/* ----------------------------------------------------------------- GitHub */

async function ghFetch(env, path, init) {
  const r = await fetch(`https://api.github.com${path}`, {
    ...init,
    headers: {
      authorization: `Bearer ${env.GITHUB_TOKEN}`,
      accept: 'application/vnd.github+json',
      'x-github-api-version': '2022-11-28',
      'user-agent': 'thoughts-editor',
      ...((init && init.headers) || {}),
    },
  });
  const text = await r.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { /* leave null */ }
  if (!r.ok) throw new Error((data && data.message) || `GitHub ${r.status}`);
  return data;
}

function utf8ToB64(str) {
  const bytes = enc.encode(str);
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin);
}

function b64ToUtf8(b64) {
  const bin = atob(b64.replace(/\s/g, ''));
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

async function loadIndex(env) {
  const branch = env.GITHUB_BRANCH || 'master';
  const j = await ghFetch(env, `/repos/${env.GITHUB_REPO}/contents/index.html?ref=${encodeURIComponent(branch)}`);
  return { sha: j.sha, text: b64ToUtf8(j.content) };
}

async function saveIndex(env, text, sha, message) {
  const branch = env.GITHUB_BRANCH || 'master';
  return ghFetch(env, `/repos/${env.GITHUB_REPO}/contents/index.html`, {
    method: 'PUT',
    body: JSON.stringify({ message, content: utf8ToB64(text), sha, branch }),
  });
}

/* --------------------------------------------------- parse, build, splice */

function escapeAttr(s) {
  return String(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/* The exact inverse of escapeAttr, ampersand last. Without this a title holding
   an "&" gains another "amp;" on every save, and after a few edits the page is
   showing the reader raw entities. */
function unescapeAttr(s) {
  return String(s)
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&amp;/g, '&');
}

/* renderNote indents the body to sit nicely in the file. Reading it back has to
   undo that, or every save would indent the previous save's indentation again
   and the block would drift right forever. Leading whitespace carries no meaning
   in the tags we allow, so stripping it per line is safe and makes the round
   trip stable. */
function dedent(body) {
  return body.split('\n').map((l) => l.replace(/^[ \t]+/, '')).join('\n').trim();
}

function sliceSection(text, group) {
  const [open, close] = MARKERS[group];
  const a = text.indexOf(open);
  const b = text.indexOf(close);
  if (a < 0 || b < 0 || b < a) throw new Error(`markers for "${group}" missing from index.html`);
  return { head: text.slice(0, a + open.length), body: text.slice(a + open.length, b), tail: text.slice(b) };
}

function parseNotes(text) {
  const out = [];
  for (const group of Object.keys(MARKERS)) {
    const { body } = sliceSection(text, group);
    const re = /<article class="tnote" data-k="([^"]*)" data-id="([^"]*)">([\s\S]*?)<\/article>/g;
    let m;
    while ((m = re.exec(body))) {
      const block = m[3];
      const title = /<span class="tl">([\s\S]*?)\s*&nearr;<\/span>/.exec(block);
      const date  = /<span class="d">([\s\S]*?)<\/span>/.exec(block);
      const meta  = /data-date="([^"]*)"/.exec(block);
      const inner = /<div class="abs"[^>]*>([\s\S]*?)<\/div>\s*$/.exec(block);
      out.push({
        group,
        tags: unescapeAttr(m[1]),
        id: m[2],
        title: title ? unescapeAttr(title[1].trim()) : '',
        date: date ? unescapeAttr(date[1].trim()) : '',
        meta: meta ? unescapeAttr(meta[1]) : '',
        body: inner ? dedent(inner[1]) : '',
      });
    }
  }
  return out;
}

function renderNote(n) {
  const indented = n.body.split('\n').map((l) => '          ' + l).join('\n');
  return (
    `\n      <article class="tnote" data-k="${escapeAttr(n.tags)}" data-id="${escapeAttr(n.id)}">\n` +
    `        <button class="tt" data-abs><span class="d">${escapeAttr(n.date)}</span>` +
    `<span class="tl">${escapeAttr(n.title)} &nearr;</span></button>\n` +
    `        <div class="abs" data-title="${escapeAttr(n.title)}" data-date="${escapeAttr(n.meta)}">\n` +
    `${indented}\n` +
    `        </div>\n` +
    `      </article>\n`
  );
}

function spliceNotes(text, notes) {
  let out = text;
  for (const group of Object.keys(MARKERS)) {
    const sec = sliceSection(out, group);
    const mine = notes.filter((n) => n.group === group);
    out = sec.head + (mine.length ? mine.map(renderNote).join('\n') : '\n') + sec.tail;
  }
  return out;
}

/* ------------------------------------------------------ validate the body */

/**
 * Walks the markup and rejects on anything outside the whitelist. Validating
 * and refusing is safer than sanitising: a cleaner silently rewrites input it
 * misunderstands, whereas this stops and says so.
 */
function validateBody(html) {
  if (typeof html !== 'string') return 'body must be text';
  if (!html.trim()) return 'body is empty';
  if (html.length > 120000) return 'body is too long';

  const tagRe = /<\/?([a-zA-Z][a-zA-Z0-9]*)([^>]*)>/g;
  const stack = [];
  let m;

  while ((m = tagRe.exec(html))) {
    const raw = m[0];
    const name = m[1].toLowerCase();
    const attrs = m[2] || '';
    const closing = raw.startsWith('</');
    const selfClosing = /\/>$/.test(raw) || name === 'br';

    if (!ALLOWED_TAGS.has(name)) return `tag <${name}> is not allowed`;

    if (!closing) {
      if (/\son[a-z]+\s*=/i.test(attrs)) return 'event handler attributes are not allowed';
      if (name === 'a') {
        const href = /\bhref\s*=\s*"([^"]*)"/i.exec(attrs);
        const rest = attrs.replace(/\bhref\s*=\s*"[^"]*"/i, '')
                          .replace(/\b(target|rel)\s*=\s*"[^"]*"/gi, '').trim();
        if (rest) return 'only href, target and rel are allowed on a link';
        if (href && !/^(https?:\/\/|mailto:|#|\/|[a-z0-9._-]+\.html)/i.test(href[1])) {
          return 'that link scheme is not allowed';
        }
      } else if (attrs.trim()) {
        return `<${name}> may not carry attributes`;
      }
      if (!selfClosing) stack.push(name);
    } else {
      if (stack.pop() !== name) return `tags are not balanced near </${name}>`;
    }
  }

  if (stack.length) return `<${stack[stack.length - 1]}> is never closed`;
  if (/<script|<style|javascript:|data:text\/html/i.test(html)) return 'that content is not allowed';
  return null;
}

function validateNote(n) {
  if (!n || typeof n !== 'object') return 'no note supplied';
  if (!MARKERS[n.group]) return 'unknown section';
  for (const f of ['title', 'date', 'meta', 'tags']) {
    if (typeof n[f] !== 'string') return `${f} must be text`;
    if (/[<>]/.test(n[f])) return `${f} may not contain angle brackets`;
  }
  if (!n.title.trim()) return 'a title is required';
  if (n.title.length > 200) return 'that title is too long';
  if (n.date.length > 40 || n.meta.length > 200 || n.tags.length > 400) return 'a field is too long';
  if (n.id && !/^[a-z0-9-]{1,80}$/.test(n.id)) return 'bad id';
  return validateBody(n.body);
}

function makeId(title) {
  const base = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 48);
  return `${base || 'note'}-${Date.now().toString(36)}`;
}

/* ------------------------------------------------------------------ routes */

async function handleRequest(request, env) {
  const url = new URL(request.url);
  const path = url.pathname.replace(/\/+$/, '') || '/';

  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors(env) });

  /* ---- ask for a code ---- */
  if (path === '/auth/request' && request.method === 'POST') {
    let email;
    try { ({ email } = await request.json()); } catch { return json({ error: 'bad request' }, 400, env); }
    email = normEmail(email);

    /* The reply is identical whether or not the address is the right one, so
       this endpoint cannot be used to discover the owner's address. */
    const generic = { ok: true, message: 'If that address can sign in, a code is on its way.' };

    if (!email || email !== normEmail(env.ALLOWED_EMAIL)) return json(generic, 200, env);

    const hour = Math.floor(Date.now() / 3600000);
    const rateKey = `rate:${await sha256hex(email)}:${hour}`;
    const used = parseInt((await env.OTP_KV.get(rateKey)) || '0', 10);
    if (used >= MAX_CODES_PER_HOUR) {
      return json({ error: 'Too many codes requested. Try again in an hour.' }, 429, env);
    }
    await env.OTP_KV.put(rateKey, String(used + 1), { expirationTtl: 3700 });

    const code = String(crypto.getRandomValues(new Uint32Array(1))[0] % 1000000).padStart(6, '0');
    const salt = b64url(crypto.getRandomValues(new Uint8Array(16)));
    await env.OTP_KV.put(
      `otp:${await sha256hex(email)}`,
      JSON.stringify({ salt, hash: await sha256hex(salt + code), attempts: 0 }),
      { expirationTtl: CODE_TTL_S }
    );

    try {
      await sendCode(env, email, code);
    } catch (e) {
      return json({ error: `Could not send the mail. ${e.message}` }, 502, env);
    }
    return json(generic, 200, env);
  }

  /* ---- exchange the code for a session ---- */
  if (path === '/auth/verify' && request.method === 'POST') {
    let email, code;
    try { ({ email, code } = await request.json()); } catch { return json({ error: 'bad request' }, 400, env); }
    email = normEmail(email);
    code = String(code || '').trim();

    const bad = { error: 'That code is wrong or has expired.' };
    if (!/^\d{6}$/.test(code)) return json(bad, 401, env);
    if (email !== normEmail(env.ALLOWED_EMAIL)) return json(bad, 401, env);

    const key = `otp:${await sha256hex(email)}`;
    const raw = await env.OTP_KV.get(key);
    if (!raw) return json(bad, 401, env);

    const rec = JSON.parse(raw);
    if (rec.attempts >= MAX_VERIFY_ATTEMPTS) {
      await env.OTP_KV.delete(key);
      return json({ error: 'Too many wrong attempts. Ask for a new code.' }, 429, env);
    }

    if (!sameString(await sha256hex(rec.salt + code), rec.hash)) {
      rec.attempts += 1;
      await env.OTP_KV.put(key, JSON.stringify(rec), { expirationTtl: CODE_TTL_S });
      return json(bad, 401, env);
    }

    await env.OTP_KV.delete(key); // a code is good exactly once
    const session = await issueSession(env, email);
    return json({ ok: true, ...session }, 200, env);
  }

  /* ---- everything below needs a session ---- */
  const claims = await readSession(env, request);
  if (!claims) return json({ error: 'Session expired. Sign in again.' }, 401, env);

  if (path === '/thoughts' && request.method === 'GET') {
    const file = await loadIndex(env);
    return json({ notes: parseNotes(file.text) }, 200, env);
  }

  if (path === '/thoughts' && request.method === 'PUT') {
    let payload;
    try { payload = await request.json(); } catch { return json({ error: 'bad request' }, 400, env); }

    const file = await loadIndex(env);
    let notes = parseNotes(file.text);
    let message;

    if (payload.action === 'delete') {
      const id = String(payload.id || '');
      const gone = notes.find((n) => n.id === id);
      if (!gone) return json({ error: 'No such thought.' }, 404, env);
      notes = notes.filter((n) => n.id !== id);
      message = `Delete thought: ${gone.title}`;
    } else {
      const note = payload.note;
      const problem = validateNote(note);
      if (problem) return json({ error: problem }, 400, env);

      const clean = {
        group: note.group,
        title: note.title.trim(),
        date: note.date.trim(),
        meta: note.meta.trim(),
        tags: note.tags.trim().toLowerCase(),
        body: note.body.trim(),
        id: note.id || makeId(note.title),
      };

      const at = notes.findIndex((n) => n.id === clean.id);
      if (at > -1) { notes[at] = clean; message = `Edit thought: ${clean.title}`; }
      else { notes.unshift(clean); message = `New thought: ${clean.title}`; }
    }

    const next = spliceNotes(file.text, notes);
    if (next === file.text) return json({ ok: true, notes, unchanged: true }, 200, env);

    await saveIndex(env, next, file.sha, message);
    return json({ ok: true, notes }, 200, env);
  }

  return json({ error: 'not found' }, 404, env);
}

export default {
  async fetch(request, env) {
    /* A per-request copy, so the requesting origin can travel with env without
       two concurrent requests in the same isolate treading on each other. */
    const scoped = { ...env, __origin: request.headers.get('origin') || '' };
    try {
      for (const k of ['ALLOWED_EMAIL', 'SESSION_SECRET', 'GITHUB_TOKEN', 'GITHUB_REPO']) {
        if (!scoped[k]) return json({ error: `Worker is missing ${k}.` }, 500, scoped);
      }
      return await handleRequest(request, scoped);
    } catch (e) {
      return json({ error: e.message || 'something broke' }, 500, scoped);
    }
  },
};

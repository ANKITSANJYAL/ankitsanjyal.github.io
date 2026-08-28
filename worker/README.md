# thoughts-auth

The only server this site has. It exists because GitHub Pages cannot send an email,
cannot check a one-time code, and cannot keep a secret. Everything else stays static.

**What it does:** mails you a six-digit code, checks it, and then acts as the only
party that can write to the repository. The browser is given a short-lived session
token and never sees a GitHub credential.

**What it cannot do:** write anywhere in `index.html` except between the
`<!-- THOUGHTS:*:START -->` and `<!-- THOUGHTS:*:END -->` markers. Even a fully
compromised browser session can only add, edit or delete a thought.

---

## Deploy, about ten minutes

### 1. A mail key

Sign up at [resend.com](https://resend.com) and create an API key. On the free tier
the shared `onboarding@resend.dev` sender can only deliver to **the address you
signed up with**, which is exactly the constraint we want: the one recipient is you.

If you later want mail from your own domain, verify it in Resend and change
`MAIL_FROM` in `wrangler.toml`.

### 2. A GitHub token

[Create a fine-grained token](https://github.com/settings/personal-access-tokens/new):

- **Repository access:** only select repositories, then `ankitsanjyal.github.io`
- **Permissions:** Repository permissions, Contents, **Read and write**. Nothing else.
- **Expiration:** set one. Ninety days is reasonable; renewing is one command.

This token lives only in Cloudflare. It never reaches a browser.

### 3. The Worker

```bash
cd worker
npx wrangler login

# the store for pending codes
npx wrangler kv namespace create OTP_KV
# paste the printed id into wrangler.toml, replacing PASTE_THE_ID_WRANGLER_PRINTS

npx wrangler secret put ALLOWED_EMAIL     # asanjyal82@gmail.com
npx wrangler secret put SESSION_SECRET    # see below
npx wrangler secret put GITHUB_TOKEN      # the token from step 2
npx wrangler secret put RESEND_API_KEY    # the key from step 1

npx wrangler deploy
```

For `SESSION_SECRET`, any long random string:

```bash
openssl rand -base64 48
```

`wrangler deploy` prints a URL like `https://thoughts-auth.<your-subdomain>.workers.dev`.

### 4. Point the editor at it

In `admin.html`, set the one constant at the top of the script:

```js
var AUTH = 'https://thoughts-auth.your-subdomain.workers.dev';
```

Commit and push. Visit `/admin.html`, enter your address, wait for the code.

---

## Checking it works

```bash
# should return the same generic reply for any address
curl -s -X POST https://thoughts-auth.<sub>.workers.dev/auth/request \
  -H 'content-type: application/json' -d '{"email":"someone@example.com"}'

# should be refused without a session
curl -s https://thoughts-auth.<sub>.workers.dev/thoughts
```

Logs, while you are testing:

```bash
npx wrangler tail
```

---

## How it is kept safe

| Concern | What stops it |
|---|---|
| Someone else signing in | Codes are only ever mailed to `ALLOWED_EMAIL`. A different address gets the same reply and no mail. |
| Guessing a code | Six digits, five attempts, then the code is destroyed. Codes expire in ten minutes and work exactly once. |
| Flooding your inbox | Five codes per address per hour. |
| Reading the code from storage | Only a salted SHA-256 of it is stored, and comparison is constant-time. |
| A stolen session token | Two-hour expiry, and it can only reach the thoughts endpoints. |
| Injecting markup into the page | The body is validated against a tag whitelist and **rejected** rather than cleaned. Scripts, styles, event handlers and odd link schemes are refused. |
| Writing elsewhere in the site | The Worker only ever splices between the thoughts markers. |
| The GitHub token leaking | It is a Cloudflare secret. It is not in this repo and not in any page. |

## If something goes wrong

- **Revoke first, debug later.** Delete the token at
  [github.com/settings/tokens](https://github.com/settings/tokens) and every write stops
  immediately, including yours.
- **Lock everyone out now:** `npx wrangler secret put SESSION_SECRET` with a new value.
  Every existing session token stops verifying on the next request.

## Cost

Cloudflare Workers free tier is 100,000 requests a day and KV is 1,000 writes a day.
Writing a few thoughts a week uses a rounding error of that. Resend's free tier is
100 emails a day. Nothing here bills.

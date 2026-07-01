# Connect Your Domain (prestiva.com.au) — Beginner Guide

Goal: make your website open at **https://www.prestiva.com.au** instead of the
long Vercel address `https://prestiva-website.vercel.app`.

You'll do this in **two places**:
1. **Vercel** (where your website lives) — tell it about your domain.
2. **Your domain registrar** (where you *bought* prestiva.com.au) — point the
   domain at Vercel by adding two small "DNS records".

No coding. Takes ~15 minutes of clicking, then some waiting for it to activate.

> We're using **www.prestiva.com.au** as the main address because your site's
> SEO settings are already built for it. The plain `prestiva.com.au` will
> automatically redirect to the www version.

---

## Before you start — what you need

- [ ] Login for **Vercel** (where the site is deployed).
- [ ] Login for **wherever you bought prestiva.com.au** (the "registrar" — common
      Australian ones: VentraIP, Crazy Domains, Netregistry, GoDaddy, Namecheap).
- [ ] ~15 minutes.

---

## Part A — Add the domain in Vercel

1. Go to **https://vercel.com** and log in.
2. Click your project **prestiva-website**.
3. Click **Settings** (top menu) → **Domains** (left menu).
4. In the box, type **`www.prestiva.com.au`** → click **Add**.
5. Type **`prestiva.com.au`** → click **Add** as well.

Vercel will now show both domains with an **"Invalid Configuration"** warning and
a list of **DNS records** to create. Keep this tab open — you'll copy these
values in Part B.

You'll typically see something like:

| Type  | Name (Host) | Value |
|-------|-------------|-------|
| A     | `@`         | `76.76.21.21` |
| CNAME | `www`       | `cname.vercel-dns.com` |

> ⚠️ **Use the exact values Vercel shows you**, not the example above — Vercel
> sometimes gives a slightly different IP or target. The table above is just so
> you know what it looks like.

---

## Part B — Add the DNS records at your registrar

1. Log in to the website where you **bought** prestiva.com.au.
2. Find the domain's **DNS settings**. It's usually called one of:
   - **"DNS"**, **"DNS Management"**, **"DNS Zone"**, **"Manage DNS"**, or
     **"Advanced DNS"** — look near the domain name in your account.
3. You'll add **two records** using the values from Vercel (Part A):

   **Record 1 — the apex (bare) domain**
   - Type: A
   - Host / Name: `@`
   - Value / Points to: 216.198.79.1 
   - TTL: leave default (e.g. 1 hour / 3600)

   **Record 2 — the www version**
   - Type: CNAME
   - Host / Name: `www`
   - Value / Points to: `3e9357ca5d1195cc.vercel-dns-017.com.`
   - TTL: leave default

4. **Save**.

> 💡 If the registrar already has an existing A record on `@` or a CNAME on `www`
> (e.g. a "parking" page they set up), **edit/replace those** with the new values
> rather than adding duplicates.

---

## Part C — Set the main address & redirect

Back on the **Vercel → Domains** page:

1. Find **`www.prestiva.com.au`** and make sure it's set as the **Primary
   Domain** (there's usually a "..." menu → *Set as Primary*).
2. For **`prestiva.com.au`**, choose the option to **Redirect to
   www.prestiva.com.au** (Vercel offers this automatically).

This means anyone typing `prestiva.com.au` lands on `www.prestiva.com.au`.

---

## Part D — Wait, then check

1. DNS changes take time to spread — usually **a few minutes**, sometimes up to
   a few hours (rarely 24h).
2. Vercel checks automatically. When ready, the warning turns into a green
   **"Valid Configuration"**, and Vercel **auto-installs a free SSL certificate**
   (so `https://` and the padlock work — you don't do anything for this).
3. Test by visiting **https://www.prestiva.com.au** — your site should load.
   Also try **https://prestiva.com.au** — it should redirect to the www version.

---

## Troubleshooting

- **Still says "Invalid Configuration" after an hour** → double-check the records
  at your registrar exactly match Vercel (no typos, no extra spaces). Make sure
  you didn't leave an old conflicting A/CNAME record in place.
- **"CNAME at root/@ not allowed" error** → that's normal; the **apex** must be an
  **A record** (not CNAME). Only `www` is a CNAME. (If your registrar *only*
  supports CNAME at the apex, use Vercel's "nameservers" method instead — tell me
  and I'll guide you.)
- **Site loads but shows "Not Secure" / no padlock** → SSL is still being issued;
  wait ~15–30 min and refresh.
- **`prestiva.com.au` doesn't redirect** → confirm the redirect option is enabled
  in Vercel → Domains for the non-www entry.

---

## Good to know

- Your **backend** (on Render) is **not affected** by this — the site keeps
  talking to it the same way. Nothing to change there.
- Your code's SEO/canonical links already use `https://www.prestiva.com.au`, so
  search engines will index the right address from day one.
- Email (`admin@prestiva.com.au`) is separate from this and keeps working.

> Prefer the bare **prestiva.com.au** (no "www") as your main address instead?
> It's a small code change (SEO links + sitemap) plus flipping the redirect the
> other way — ask and I'll set it up.

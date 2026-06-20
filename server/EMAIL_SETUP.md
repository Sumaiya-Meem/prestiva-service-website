# Email Setup (Gmail) — Step by Step

The website sends two emails on every contact-form submission:

1. **Lead notification** → to your admin inbox
2. **Auto-reply** → to the customer who filled the form

It uses your own Gmail account as the sender (free — no domain or paid service
needed). Follow these 5 steps.

---

## Step 1 — Turn on 2-Step Verification

1. Go to **https://myaccount.google.com**
2. Click **Security** (left side)
3. Find **2-Step Verification** → turn it **ON** and follow the prompts

> Google requires this before it will give you an App Password.

---

## Step 2 — Create an App Password

1. Go to **https://myaccount.google.com/apppasswords**
2. Type a name like **Prestiva Website** → click **Create**
3. Google shows a **16-character code** like `abcd efgh ijkl mnop`
4. **Copy it** — this is your `SMTP_PASS`

---

## Step 3 — Fill in `server/.env`

Open `server/.env` and set these values (example uses `admin@gmail.com`):

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=admin@gmail.com
SMTP_PASS=abcdefghijklmnop
MAIL_FROM=Prestiva Property Services <admin@gmail.com>
ADMIN_EMAIL=admin@gmail.com
```

- `SMTP_USER` → your Gmail address
- `SMTP_PASS` → the 16-character App Password from Step 2 (spaces don't matter)
- `MAIL_FROM` → keep the **same** email inside the `< >`
- `ADMIN_EMAIL` → where leads arrive (your Gmail is fine)

Leave `SMTP_HOST`, `SMTP_PORT`, and `SMTP_SECURE` exactly as shown.

> Never commit `.env` to git — it contains your password.

---

## Step 4 — Test it

In a terminal, from the **server** folder:

```bash
node test-email.js admin@gmail.com
```

You should see **`sent via smtp`**, and **2 test emails** arrive in your inbox
(check the Spam folder the first time).

---

## Step 5 — Done ✅

Run the website (`npm run dev` from the project root) and submit the contact form:

- **You** receive the lead details at `ADMIN_EMAIL`
- **The customer** receives an automatic thank-you reply

No payment, nothing to buy.

---

### Good to know

- The "From" shows your Gmail address with the display name *Prestiva Property
  Services*. To later show `admin@prestiva.com.au` instead, add it as a
  "Send mail as" alias in Gmail (optional).
- Free Gmail allows about **500 emails/day** — plenty for a contact form.
- If sending fails, double-check the App Password and that 2-Step Verification
  is on.

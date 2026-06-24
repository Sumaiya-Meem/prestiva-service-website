# Email Setup — Microsoft 365 (Detailed Beginner Guide)

This guide makes the contact-form emails work using your Microsoft 365 mailbox
`admin@prestiva.com.au`. Follow it **exactly, in order** — no prior experience
needed. It takes about 15 minutes.

When you submit the website's contact form, two emails go out:

1. **Lead notification** → to you (`admin@prestiva.com.au`)
2. **Auto-reply** → to the customer who filled the form

---

## Why this method (read once, then forget)

Microsoft **turned off** the old "email + password" way of sending mail from apps
(it stopped working completely on April 30, 2026). The modern, Microsoft-approved
way is to register a small "app" in your Microsoft account and give it permission
to send mail. You do this **once**. After that the website just works.

You will end up with **4 secret values** that you paste into one file:

| Value | What it is | Where you get it |
|-------|-----------|------------------|
| `MS_TENANT_ID` | Your organization's ID | Step 4 |
| `MS_CLIENT_ID` | The app's ID | Step 4 |
| `MS_CLIENT_SECRET` | The app's password | Step 5 |
| `MS_SENDER` | The mailbox to send from | already known: `admin@prestiva.com.au` |

Keep a temporary notepad open to paste these into as you go.

---

## Before you start — checklist

- [ ] You can sign in to **https://entra.microsoft.com** with `admin@prestiva.com.au`
- [ ] That account is a **Global Administrator** (or has admin rights). If you're
      the business owner who set up Microsoft 365, you almost certainly are.
- [ ] `admin@prestiva.com.au` is a **real, licensed mailbox** (you can log into
      Outlook with it).

If you can't sign in as an admin, you'll need whoever manages your Microsoft 365
to do Steps 1–7, or send them this guide.

---

## Step 1 — Open the Microsoft admin portal

1. Open a web browser.
2. Go to **https://entra.microsoft.com**
3. Sign in with **admin@prestiva.com.au** and its password.
4. If prompted for a verification code (2-step), complete it.

You're now in the **Microsoft Entra admin center**. (This used to be called
"Azure Active Directory" — same thing.)

---

## Step 2 — Find "App registrations"

1. On the **left sidebar**, look for **Applications**.
   - If you don't see a sidebar, click the **☰ menu icon** (three lines) at the top-left.
2. Click **Applications** to expand it.
3. Click **App registrations**.

You'll see a page titled **App registrations** with tabs and a **+ New registration** button near the top.

---

## Step 3 — Create the app

1. Click **+ New registration**.
2. Fill in the form:
   - **Name**: type `Prestiva Website Mailer`
   - **Supported account types**: select the **first** option —
     *"Accounts in this organizational directory only (… - Single tenant)"*
   - **Redirect URI**: leave it **blank** (don't touch it).
3. Click the blue **Register** button at the bottom.

After a moment you land on the app's **Overview** page.

---

## Step 4 — Copy the Tenant ID and Client ID

On the **Overview** page you'll see a section called **Essentials** with several
values. Find these two and copy each (there's a small copy icon when you hover):

- **Application (client) ID** — a long code like `1a2b3c4d-....`
  → paste it in your notepad labelled **MS_CLIENT_ID**
- **Directory (tenant) ID** — another long code
  → paste it in your notepad labelled **MS_TENANT_ID**

> These two are just IDs, not secrets, but you still need them.

---

## Step 5 — Create the app's password (client secret)

1. On the **left sidebar of the app** (not the main one), click **Certificates & secrets**.
2. Make sure the **Client secrets** tab is selected.
3. Click **+ New client secret**.
4. In the panel that opens:
   - **Description**: type `website mailer`
   - **Expires**: choose **24 months** (the longest offered)
5. Click **Add**.

Now a new row appears in the table. **This is the only time the password is shown.**

6. In the **Value** column, click the copy icon and copy the whole thing
   (it looks like `abc8Q~xxxxxxxxxxxxxxxxxxxxxx`).
   → paste it in your notepad labelled **MS_CLIENT_SECRET**

> ⚠️ **Critical:** copy the **Value**, NOT the "Secret ID" next to it. If you
> navigate away before copying the Value, it's gone forever and you must create a
> new secret (just repeat this step).
>
> 📅 The secret **expires in 24 months**. Put a reminder in your calendar to redo
> this step and update the value before then, or email will stop working.

---

## Step 6 — Give the app permission to send mail

1. On the app's **left sidebar**, click **API permissions**.
2. Click **+ Add a permission**.
3. A panel opens. Click the big tile **Microsoft Graph**.
4. You'll be asked *"What type of permissions…"*. Click **Application permissions**.
   - ⚠️ Choose **Application permissions**, NOT "Delegated permissions".
5. In the search box that appears, type `Mail.Send`.
6. Tick the checkbox next to **Mail.Send**.
7. Click **Add permissions** at the bottom.

You're back on the **API permissions** page. The `Mail.Send` row probably says
*"Not granted"* in orange. One more click:

8. Click **✓ Grant admin consent for &lt;your organization&gt;** (a button above the table).
9. Click **Yes** to confirm.

The Status column should now show a **green tick** and *"Granted for …"*.

> If the "Grant admin consent" button is greyed out, your account isn't an admin —
> someone with Global Admin must click it.

---

## Step 7 — (Recommended) Lock the app to only this mailbox

By default the app can technically send as any mailbox in your organization.
This optional step restricts it to **only** `admin@prestiva.com.au`. It's worth
doing for safety. If you'd rather skip it, mail still works — jump to Step 8.

1. On your Windows PC, click Start, type **PowerShell**, and open **Windows PowerShell**.
2. Run this once to install the tool (press Enter, and type `Y` then Enter if asked):
   ```powershell
   Install-Module ExchangeOnlineManagement -Scope CurrentUser
   ```
3. Connect (a sign-in window pops up — log in as `admin@prestiva.com.au`):
   ```powershell
   Connect-ExchangeOnline -UserPrincipalName admin@prestiva.com.au
   ```
4. Run this, replacing `PASTE-CLIENT-ID-HERE` with your **MS_CLIENT_ID** from Step 4:
   ```powershell
   New-ApplicationAccessPolicy -AppId PASTE-CLIENT-ID-HERE -PolicyScopeGroupId admin@prestiva.com.au -AccessRight RestrictAccess -Description "Prestiva website mailer can only send as admin"
   ```
5. When done:
   ```powershell
   Disconnect-ExchangeOnline -Confirm:$false
   ```

> Note: a brand-new policy can take a few minutes (occasionally up to ~30) to
> take effect. If your Step 9 test fails right after this with an access error,
> wait a bit and try again.

---

## Step 8 — Put your 4 values into the website

1. In the project, open the **`server`** folder.
2. Find the file named **`.env`**.
   - If there's no `.env` but there is **`.env.example`**, make a copy of it and
     rename the copy to `.env`. (In the editor: right-click `.env.example` →
     Copy, then Paste, then rename to `.env`.)
3. Open `.env` and set these lines (paste your notepad values after each `=`):

   ```env
   MS_TENANT_ID=your-tenant-id-from-step-4
   MS_CLIENT_ID=your-client-id-from-step-4
   MS_CLIENT_SECRET=your-secret-value-from-step-5
   MS_SENDER=admin@prestiva.com.au
   MAIL_FROM=Prestiva Property Services <admin@prestiva.com.au>
   MAIL_FROM_NAME=Prestiva Property Services
   ADMIN_EMAIL=admin@prestiva.com.au
   ```

4. **Important:** if there are any old `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS` lines,
   delete them or put a `#` at the start of each line to disable them. (Microsoft
   SMTP no longer works, and if those are filled in the code would try them.)
5. Save the file.

- No spaces around the `=` sign.
- Don't wrap the values in quotes.
- Never share `.env` or commit it to git — it holds your secret.

---

## Step 9 — Test it

1. Open a terminal **in the `server` folder**.
   - Easy way: in VS Code, right-click the `server` folder → **Open in Integrated Terminal**.
2. If you've never run the server before, first install dependencies:
   ```bash
   npm install
   ```
3. Run the test:
   ```bash
   node test-email.js admin@prestiva.com.au
   ```

**Success looks like this:**
```
 Transport : Microsoft Graph (OAuth2 from your Microsoft 365 mailbox)
 ...
✅ Admin notification sent via graph
✅ Customer auto-reply sent via graph
🎉 Success. Check the inbox (and spam folder) for two emails.
```

Open Outlook for `admin@prestiva.com.au` — you should see **2 test emails**
(check the **Junk** folder the first time; mark them "Not junk").

If it failed, the test prints a specific hint — see Troubleshooting below.

---

## Step 10 — Done ✅

Run the whole website (`npm run dev` from the project root), open the site, and
submit the **contact form**. You'll get the lead email, and the address you typed
in the form gets the auto-reply. That's it — fully working.

---

## Troubleshooting (matched to the exact error)

| Error message contains… | What it means | Fix |
|---|---|---|
| `AADSTS7000215` / `invalid client secret` | Wrong or expired secret | Redo **Step 5**, copy the **Value** (not the ID), update `.env` |
| `AADSTS90002` / tenant not found | Wrong `MS_TENANT_ID` | Recopy the **Directory (tenant) ID** from Step 4 |
| `AccessDenied` / `403` / consent | Permission not granted | Redo **Step 6**, including **Grant admin consent** |
| `MailboxNotEnabledForRESTAPI` / not found | `MS_SENDER` isn't a real licensed mailbox | Check the address is exactly `admin@prestiva.com.au` and has a license |
| `No email transport configured` | `.env` not loaded / values missing | Confirm the file is named exactly `.env`, is in `server/`, and you saved it |
| Test passes but no email arrives | Likely in Junk, or sender has no license | Check Junk; confirm the mailbox is licensed |

When you run `node test-email.js`, it also prints a one-line hint pointing at the
likely step — follow that.

---

## Quick reference: what each `.env` value does

- **`MS_TENANT_ID`** — identifies your Microsoft organization.
- **`MS_CLIENT_ID`** — identifies the "Prestiva Website Mailer" app you registered.
- **`MS_CLIENT_SECRET`** — the app's password (expires in 24 months — set a reminder!).
- **`MS_SENDER`** — the mailbox emails are sent **from**.
- **`ADMIN_EMAIL`** — where customer lead notifications are **delivered**.
- **`MAIL_FROM`** — the friendly "From" name + address customers see.

---

## Notes & limits

- **Sending limits:** Microsoft allows ~10,000 recipients/day and 30 messages/min —
  vastly more than a contact form needs.
- **Photo attachments:** very large photo uploads (over ~3 MB total) are dropped
  from the email so the notification still sends; the email still says how many
  photos were uploaded. (They're also saved in the database if that's configured.)
- **Custom headers:** Microsoft Graph ignores non-`x-` email headers, so the
  auto-reply's `List-Unsubscribe` header isn't sent. This is harmless.

## If you ever can't use Microsoft

The mailer also supports the **Resend** email service (and plain SMTP for
non-Microsoft hosts). See `server/.env.example` for those variables. Microsoft
Graph is used automatically whenever the `MS_*` values are present.

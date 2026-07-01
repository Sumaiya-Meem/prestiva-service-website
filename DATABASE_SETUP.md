# Database Setup — MongoDB Atlas (Free Tier)

The site runs fine **without** a database (quote emails still send). Adding MongoDB
unlocks lead **persistence** and the **admin dashboard** (`/admin`).

The free **M0** tier (512 MB) is plenty — thousands of quote records fit easily,
and it's free forever. This takes ~10 minutes.

---

## 1. Create an Atlas account & cluster

1. Go to <https://www.mongodb.com/cloud/atlas/register> and sign up (free).
2. When prompted to deploy, choose **M0 / Free**.
3. Pick a cloud provider + a region **close to your server** (e.g. AWS, Sydney
   `ap-southeast-2` for Australia). Lower latency = faster saves.
4. Name the cluster (default `Cluster0` is fine) → **Create Deployment**.

## 2. Create a database user

Atlas usually opens a "Connect" wizard right after creating the cluster.

1. Under **Database Access** (or the wizard), create a user with a
   **username + password**. Use the auto-generated password or your own.
2. Give it the **Read and write to any database** role.
3. **Copy the password somewhere safe** — you need it for the connection string.

> Tip: if your password contains special characters (`@ : / ? # & %`), they must be
> URL-encoded in the connection string (e.g. `@` → `%40`). The simplest fix is to use
> a password with only letters and numbers.

## 3. Allow network access

Under **Network Access → Add IP Address**:

- **For quick testing:** click **Allow access from anywhere** (`0.0.0.0/0`).
- **For production:** add only your backend host's IP address(es).

## 4. Get the connection string

1. Cluster → **Connect** → **Drivers**.
2. Driver: **Node.js**. Copy the string. It looks like:

   ```
   mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

3. Replace `USER` and `PASSWORD` with your database user's credentials, and add a
   database name (e.g. `prestiva`) right before the `?`:

   ```
   mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/prestiva?retryWrites=true&w=majority
   ```

## 5. Add it to the backend `.env`

In `server/.env` add (or update) these two lines:

```env
# MongoDB Atlas connection string from step 4
MONGODB_URI=mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/prestiva?retryWrites=true&w=majority

# Admin dashboard login token — use a LONG random string in production
ADMIN_API_TOKEN=change-me-to-a-long-random-secret
```

> Generate a strong token: `openssl rand -hex 24`

## 6. Restart & verify

```bash
cd server
npm run dev      # or: npm start
```

You should see in the console:

```
[db] MongoDB connected.
Server is running on port 5000
```

If you instead see `[db] MONGODB_URI not set` or a connection error, re-check
steps 2–5 (most issues are a wrong password, an un-encoded special character, or a
missing Network Access rule).

## 7. Test it

1. Submit the website contact form once → a record is saved.
2. Go to **`/admin/login`** and enter your `ADMIN_API_TOKEN`.
3. **Quote Requests** tab → your submission appears; change its status to confirm
   updates persist.
4. **Site Settings** tab → edit a price/phone/link, **Save**, then reload the public
   site — the change is live.

---

## How it works (for reference)

- **Connection:** `server/config/db.js` — optional; the app skips the DB cleanly if
  `MONGODB_URI` is unset, so nothing breaks before setup.
- **Collections** are created automatically on first write:
  - `quotes` — every contact-form submission (model: `server/models/Quote.js`).
  - `settings` — one document holding admin overrides (model: `server/models/Settings.js`).
  - `gallerysections` — gallery categories (model: `server/models/GallerySection.js`).
  - `media` — gallery images & videos metadata (model: `server/models/Media.js`).
- **Admin API** (token-protected via `ADMIN_API_TOKEN`):
  - `GET  /api/contact` — list quotes
  - `PATCH /api/contact/:id` — update a quote's status
  - `GET  /api/settings` — public; read config overrides
  - `PUT  /api/settings` — save config overrides
  - `GET  /api/admin/verify` — used by the login screen
- **Settings overrides** are deep-merged over the static `client/src/config/siteConfig.js`
  at page load, so dashboard edits apply everywhere without a redeploy.

## Gallery (photos & videos)

The **Gallery** tab in the admin lets you add/remove **images and videos** per section.
The public Gallery page and the homepage "See the Results" videos read from the same
data, so changes are live on the site immediately.

- **Metadata** lives in MongoDB (`gallerysections`, `media`); the **files** live on the
  server's disk under `server/uploads/gallery/<section>/` and are served at `/uploads/...`.
- Images are auto-compressed to WebP; videos are stored as-is and a **poster frame** is
  extracted automatically (via the bundled `ffmpeg-static` — no system install needed).
- ⚠️ Because files are on the server's disk, deploy the backend to a host with a
  **persistent filesystem** (VPS, Render/Railway with a disk). On ephemeral/serverless
  hosts, uploads would be lost between deploys — switch `server/utils/galleryStore.js`
  to object storage (S3/R2) in that case.

### One-time import of existing photos

The site ships with bundled gallery photos/clips. Import them into the database once so
they appear on the (now dynamic) public site and become removable from the admin:

```bash
cd server
npm run seed:gallery
```

This is safe to re-run (already-imported items are skipped).

## Free-tier limits & notes

- **M0:** 512 MB storage, shared CPU/RAM, no backups. Fine for leads + settings.
- Atlas may **pause** an M0 cluster after long inactivity — the first request after a
  pause can be slow while it resumes.
- Photos are currently emailed as attachments (not stored in the DB). To show photos
  in the dashboard later, add object storage (Cloudflare R2 / AWS S3) and save the URLs
  on each quote.
- Keep `.env` out of git (it holds secrets). `.env.example` documents the variables.

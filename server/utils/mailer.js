const nodemailer = require('nodemailer');

/**
 * Unified mail sender.
 *
 * Priority 1 — Microsoft Graph (OAuth2, recommended for Microsoft 365):
 *   if MS_TENANT_ID + MS_CLIENT_ID + MS_CLIENT_SECRET + MS_SENDER are set, we
 *   send via the Graph API using the client-credentials flow. This is the ONLY
 *   working way to send from a Microsoft 365 mailbox now that Microsoft has
 *   retired Basic Auth (password / app-password) SMTP. Mail arrives "from" the
 *   real business mailbox (e.g. admin@prestiva.com.au).
 * Priority 2 — SMTP (direct send): legacy username/password SMTP. Still works
 *   for cPanel / Gmail (app password) hosts, but NOT for Microsoft 365.
 * Priority 3 — Resend API: used only when neither of the above is configured.
 *
 * Returns { ok: true, channel } on success or throws on failure.
 */

// ───────────────────────── Microsoft Graph (OAuth2) ─────────────────────────

const graphConfigured = () =>
  Boolean(
    process.env.MS_TENANT_ID &&
      process.env.MS_CLIENT_ID &&
      process.env.MS_CLIENT_SECRET &&
      process.env.MS_SENDER
  );

let cachedToken = null; // { accessToken, expiresAt }

const getGraphToken = async () => {
  // Reuse the token until ~1 minute before it expires.
  if (cachedToken && cachedToken.expiresAt - 60_000 > Date.now()) {
    return cachedToken.accessToken;
  }

  const tenant = process.env.MS_TENANT_ID;
  const url = `https://login.microsoftonline.com/${tenant}/oauth2/v2.0/token`;
  const body = new URLSearchParams({
    client_id: process.env.MS_CLIENT_ID,
    client_secret: process.env.MS_CLIENT_SECRET,
    scope: 'https://graph.microsoft.com/.default',
    grant_type: 'client_credentials',
  });

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(
      `Graph token error: ${data.error_description || data.error || res.statusText}`
    );
  }

  cachedToken = {
    accessToken: data.access_token,
    expiresAt: Date.now() + Number(data.expires_in || 3600) * 1000,
  };
  return cachedToken.accessToken;
};

// Build Graph's recipient shape from a string or array of addresses.
const toRecipients = (addr) =>
  (Array.isArray(addr) ? addr : [addr])
    .filter(Boolean)
    .map((address) => ({ emailAddress: { address } }));

const sendViaGraph = async ({ to, subject, html, text, replyTo, headers, attachments }) => {
  const token = await getGraphToken();
  const sender = process.env.MS_SENDER;

  const message = {
    subject,
    body: { contentType: html ? 'HTML' : 'Text', content: html || text || '' },
    toRecipients: toRecipients(to),
  };

  if (replyTo) message.replyTo = toRecipients(replyTo);

  // Graph only accepts custom internet headers prefixed with "x-" (case-insensitive).
  // Standard headers like List-Unsubscribe / Auto-Submitted are rejected, so we drop them.
  if (headers) {
    const custom = Object.entries(headers)
      .filter(([name]) => /^x-/i.test(name))
      .map(([name, value]) => ({ name, value: String(value) }));
    if (custom.length) message.internetMessageHeaders = custom;
  }

  if (attachments && attachments.length) {
    // Graph's simple sendMail caps the whole request at ~4 MB. If the photos
    // exceed a safe budget, drop them so the notification still sends — the
    // email body already states how many photos were attached.
    const MAX_ATTACH_BYTES = 3 * 1024 * 1024; // ~3 MB of raw file data
    const total = attachments.reduce((sum, a) => sum + (a.content?.length || 0), 0);
    if (total > MAX_ATTACH_BYTES) {
      console.warn(
        `[mail] Skipping ${attachments.length} attachment(s) (${Math.round(total / 1024)} KB) — over Graph's size limit.`
      );
    } else {
      message.attachments = attachments.map((a) => ({
        '@odata.type': '#microsoft.graph.fileAttachment',
        name: a.filename,
        contentBytes: Buffer.isBuffer(a.content)
          ? a.content.toString('base64')
          : Buffer.from(a.content).toString('base64'),
      }));
    }
  }

  const res = await fetch(`https://graph.microsoft.com/v1.0/users/${encodeURIComponent(sender)}/sendMail`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message, saveToSentItems: true }),
  });

  // A successful sendMail returns 202 Accepted with an empty body.
  if (!res.ok) {
    let detail = res.statusText;
    try {
      const err = await res.json();
      detail = err.error?.message || detail;
    } catch (_) {
      /* empty / non-JSON body */
    }
    throw new Error(`Graph sendMail error: ${detail}`);
  }

  return { ok: true, channel: 'graph' };
};

// ───────────────────────────── Direct SMTP ──────────────────────────────────

let cachedTransporter = null;

const smtpConfigured = () =>
  Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);

const getTransporter = () => {
  if (cachedTransporter) return cachedTransporter;

  const port = Number(process.env.SMTP_PORT) || 465;
  cachedTransporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    // secure=true for 465 (implicit TLS), false for 587 (STARTTLS)
    secure: process.env.SMTP_SECURE ? process.env.SMTP_SECURE === 'true' : port === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  return cachedTransporter;
};

/**
 * @param {Object} opts
 * @param {string} opts.to        recipient address
 * @param {string} opts.subject   subject line
 * @param {string} opts.html      HTML body
 * @param {string} [opts.text]    plain-text body (improves spam score — always include)
 * @param {string} [opts.replyTo] reply-to address
 * @param {Object} [opts.headers] extra mail headers (e.g. List-Unsubscribe)
 */
const sendMail = async ({ to, subject, html, text, replyTo, headers, attachments }) => {
  const fromName = process.env.MAIL_FROM_NAME || 'Prestiva Property Services';

  // ── Microsoft Graph (OAuth2) ──
  if (graphConfigured()) {
    return sendViaGraph({ to, subject, html, text, replyTo, headers, attachments });
  }

  // ── Direct SMTP ──
  if (smtpConfigured()) {
    const from = process.env.MAIL_FROM || `${fromName} <${process.env.SMTP_USER}>`;
    // Nodemailer expects { filename, content: Buffer }
    const smtpAttachments = (attachments || []).map((a) => ({ filename: a.filename, content: a.content }));
    await getTransporter().sendMail({ from, to, subject, html, text, replyTo, headers, attachments: smtpAttachments });
    return { ok: true, channel: 'smtp' };
  }

  // ── Resend fallback ──
  if (process.env.RESEND_API_KEY) {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: process.env.MAIL_FROM || 'onboarding@resend.dev',
        to,
        subject,
        html,
        text,
        reply_to: replyTo,
        headers,
        // Resend expects { filename, content: base64 }
        attachments: (attachments || []).map((a) => ({
          filename: a.filename,
          content: Buffer.isBuffer(a.content) ? a.content.toString('base64') : a.content,
        })),
      }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Resend API error');
    return { ok: true, channel: 'resend' };
  }

  throw new Error('No email transport configured (set MS_* for Graph, SMTP_*, or RESEND_API_KEY).');
};

module.exports = { sendMail, smtpConfigured, graphConfigured };

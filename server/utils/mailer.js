const nodemailer = require('nodemailer');

/**
 * Unified mail sender.
 *
 * Priority 1 — SMTP (direct send): if SMTP_HOST + SMTP_USER + SMTP_PASS are set,
 *   we send straight from the real business mailbox (full email access). This lets
 *   mail arrive "from" admin@prestiva.com.au instead of a third-party test sender.
 * Priority 2 — Resend API: used only when SMTP is not configured.
 *
 * Returns { ok: true } on success or throws on failure.
 */

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
const sendMail = async ({ to, subject, html, text, replyTo, headers }) => {
  const fromName = process.env.MAIL_FROM_NAME || 'Prestiva Property Services';

  // ── Direct SMTP ──
  if (smtpConfigured()) {
    const from = process.env.MAIL_FROM || `${fromName} <${process.env.SMTP_USER}>`;
    await getTransporter().sendMail({ from, to, subject, html, text, replyTo, headers });
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
      }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Resend API error');
    return { ok: true, channel: 'resend' };
  }

  throw new Error('No email transport configured (set SMTP_* or RESEND_API_KEY).');
};

module.exports = { sendMail, smtpConfigured };

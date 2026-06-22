const NAVY = '#0A1628';
const NAVY_2 = '#1B2D4F';
const GOLD = '#D4A853';
const PHONE = '0403 540 227';
const PHONE_RAW = '0403540227';
const EMAIL = 'admin@prestiva.com.au';
const SITE = 'https://prestiva-website.vercel.app/';
const FONT = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

const esc = (v = '') =>
  String(v)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

const prettyService = (s = '') => esc(String(s).replace(/-/g, ' ')).replace(/\b\w/g, (c) => c.toUpperCase());

/** Bulletproof, table-based button. */
const button = (href, label, bg = GOLD, color = '#ffffff') => `
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;">
    <tr>
      <td align="center" bgcolor="${bg}" style="border-radius:10px;">
        <a href="${href}" target="_blank"
           style="display:inline-block; padding:15px 34px; font-family:${FONT}; font-size:15px; font-weight:700; color:${color}; text-decoration:none; border-radius:10px; letter-spacing:.3px;">
          ${label}
        </a>
      </td>
    </tr>
  </table>`;

/** Outer page + branded header + footer wrapper. */
const shell = (headerTitle, headerSubtitle, inner) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="light only" />
</head>
<body style="margin:0; padding:0; background:#eef1f5;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#eef1f5;">
    <tr>
      <td align="center" style="padding:30px 14px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0"
               style="width:600px; max-width:600px; background:#ffffff; border-radius:16px; overflow:hidden; box-shadow:0 12px 34px rgba(10,22,40,0.12);">

          <!-- Gold accent bar -->
          <tr><td style="height:5px; background:${GOLD}; line-height:5px; font-size:0;">&nbsp;</td></tr>

          <!-- Header -->
          <tr>
            <td align="center" bgcolor="${NAVY}" style="background:linear-gradient(135deg, ${NAVY}, ${NAVY_2}); padding:34px 30px;">
              <div style="font-family:${FONT}; font-size:13px; letter-spacing:3px; text-transform:uppercase; color:${GOLD}; font-weight:700;">
                Prestiva <span style="color:#ffffff;">Property Services</span>
              </div>
              <div style="font-family:${FONT}; font-size:23px; font-weight:700; color:#ffffff; margin-top:14px;">${headerTitle}</div>
              <div style="font-family:${FONT}; font-size:14px; color:rgba(255,255,255,0.78); margin-top:6px;">${headerSubtitle}</div>
            </td>
          </tr>

          <!-- Body -->
          <tr><td style="padding:34px 36px;">${inner}</td></tr>

          <!-- Footer -->
          <tr>
            <td align="center" bgcolor="#f5f7f9" style="padding:24px 30px; border-top:1px solid #eef0f2;">
              <div style="font-family:${FONT}; font-size:13px; color:#7b8694; line-height:1.7;">
                <a href="tel:${PHONE_RAW}" style="color:${NAVY}; text-decoration:none; font-weight:600;">${PHONE}</a>
                &nbsp;&middot;&nbsp;
                <a href="mailto:${EMAIL}" style="color:${NAVY}; text-decoration:none; font-weight:600;">${EMAIL}</a>
              </div>
              <div style="font-family:${FONT}; font-size:12px; color:#9aa3ad; margin-top:6px;">
                Property Maintenance &middot; Landscaping &middot; Cleaning &nbsp;|&nbsp; Adelaide &amp; Sydney
              </div>
              <div style="font-family:${FONT}; font-size:12px; margin-top:8px;">
                <a href="${SITE}" style="color:${GOLD}; text-decoration:none;">www.prestiva.com.au</a>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

/* ───────────────────────── Admin notification ───────────────────────── */
const adminTemplate = ({ fullName, phone, email, service, propertyType, preferredDate, suburb, message, mapLat, mapLng, photoCount }) => {
  const row = (label, value) => `
    <tr>
      <td style="padding:13px 0; border-bottom:1px solid #f0f2f4; font-family:${FONT}; font-size:13px; color:#8a939e; width:34%; vertical-align:top;">${label}</td>
      <td style="padding:13px 0; border-bottom:1px solid #f0f2f4; font-family:${FONT}; font-size:15px; color:#1a1f2b; font-weight:600; vertical-align:top;">${value}</td>
    </tr>`;

  const mapLink =
    mapLat && mapLng
      ? `<div style="margin-top:6px;"><a href="https://www.google.com/maps?q=${mapLat},${mapLng}" target="_blank" style="font-family:${FONT}; color:#0f4c81; text-decoration:none; font-size:13px; font-weight:600;">📍 Open in Google Maps</a></div>`
      : '';

  const inner = `
    <p style="font-family:${FONT}; font-size:16px; color:#2b3240; margin:0 0 6px; font-weight:700;">New quote request 🎉</p>
    <p style="font-family:${FONT}; font-size:14px; color:#6c7682; margin:0 0 24px; line-height:1.6;">
      A customer just submitted the website enquiry form. Here are their details:
    </p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
      ${row('👤 Full name', esc(fullName))}
      ${row('📞 Phone', `<a href="tel:${esc(phone)}" style="color:#0f4c81; text-decoration:none;">${esc(phone)}</a>`)}
      ${row('✉️ Email', `<a href="mailto:${esc(email)}" style="color:#0f4c81; text-decoration:none;">${esc(email)}</a>`)}
      ${row('🧹 Service', prettyService(service))}
      ${propertyType ? row('🏠 Property type', esc(propertyType)) : ''}
      ${preferredDate ? row('📅 Preferred date', esc(preferredDate)) : ''}
      ${row('📍 Location', `${esc(suburb)}${mapLink}`)}
      ${photoCount ? row('📎 Photos', `${photoCount} attached`) : ''}
    </table>

    <div style="margin:24px 0 4px; background:#f8f9fb; border-left:4px solid ${GOLD}; border-radius:0 8px 8px 0; padding:18px 20px;">
      <div style="font-family:${FONT}; font-size:12px; font-weight:700; text-transform:uppercase; letter-spacing:.6px; color:#8a939e; margin-bottom:8px;">💬 Message</div>
      <div style="font-family:${FONT}; font-size:15px; color:#3a414d; line-height:1.65; white-space:pre-wrap;">${message ? esc(message) : '<span style="color:#aab2bc; font-style:italic;">No additional message provided.</span>'}</div>
    </div>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:28px;">
      <tr>
        <td align="center" style="padding:0 6px;">${button(`tel:${esc(phone)}`, '📞 Call Customer', NAVY)}</td>
        <td align="center" style="padding:0 6px;">${button(`mailto:${esc(email)}`, '✉️ Reply by Email', GOLD)}</td>
      </tr>
    </table>

    <p style="font-family:${FONT}; font-size:12px; color:#aab2bc; text-align:center; margin:24px 0 0;">
      Tip: respond within a couple of hours to win the job. ⚡
    </p>`;

  return shell('New Quote Request', 'Website enquiry form', inner);
};

/* ───────────────────────── Customer auto-reply ───────────────────────── */
const customerTemplate = ({ fullName, service }) => {
  const first = String(fullName || '').trim().split(' ')[0] || 'there';

  const step = (num, title, text) => `
    <tr>
      <td width="44" valign="top" style="padding:0 14px 18px 0;">
        <div style="width:34px; height:34px; border-radius:50%; background:${NAVY}; color:${GOLD}; font-family:${FONT}; font-size:15px; font-weight:700; text-align:center; line-height:34px;">${num}</div>
      </td>
      <td valign="top" style="padding:0 0 18px 0;">
        <div style="font-family:${FONT}; font-size:15px; font-weight:700; color:#1a1f2b;">${title}</div>
        <div style="font-family:${FONT}; font-size:14px; color:#6c7682; line-height:1.6; margin-top:2px;">${text}</div>
      </td>
    </tr>`;

  const inner = `
    <p style="font-family:${FONT}; font-size:17px; color:#1a1f2b; margin:0 0 14px; font-weight:700;">Thank you, ${esc(first)}! 🙏</p>

    <p style="font-family:${FONT}; font-size:15px; color:#4a515d; line-height:1.7; margin:0 0 18px;">
      We've received your enquiry${service ? ` for <strong>${prettyService(service)}</strong>` : ''} and saved your details.
      One of our <strong>Prestiva Property Services</strong> representatives will personally reach out to you soon to confirm
      the details and arrange your free, no-obligation quote.
    </p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px;">
      <tr>
        <td style="background:#fbf6ec; border:1px solid #f0e3c6; border-radius:10px; padding:14px 18px;">
          <div style="font-family:${FONT}; font-size:14px; color:#7a6526; line-height:1.6;">
            📩 <strong>This is an automated confirmation</strong> to let you know your message arrived safely.
            A real member of our team will contact you directly — usually within <strong>2 business hours</strong>.
          </div>
        </td>
      </tr>
    </table>

    <div style="font-family:${FONT}; font-size:12px; font-weight:700; text-transform:uppercase; letter-spacing:.6px; color:#8a939e; margin-bottom:16px;">What happens next</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
      ${step('1', 'We review your request', 'Our team looks over the service and location you provided.')}
      ${step('2', 'We get in touch', 'Expect a call or email to confirm details and timing.')}
      ${step('3', 'You receive your free quote', 'Clear, upfront pricing with no obligation.')}
    </table>

    <div style="height:1px; background:#eef0f2; margin:26px 0;"></div>

    <p style="font-family:${FONT}; font-size:15px; color:#4a515d; line-height:1.6; margin:0 0 18px; text-align:center;">
      Need us sooner? We're happy to help right now.
    </p>
    ${button(`tel:${PHONE_RAW}`, `📞 Call us — ${PHONE}`, GOLD)}

    <p style="font-family:${FONT}; font-size:15px; color:#4a515d; line-height:1.7; margin:30px 0 0;">
      Warm regards,<br/>
      <strong style="color:#1a1f2b;">The Prestiva Team</strong>
    </p>
    <p style="font-family:${FONT}; font-size:12px; color:#aab2bc; margin:18px 0 0;">
      This is an automated confirmation — you can simply reply to this email if you'd like to add anything.
    </p>`;

  return shell('Thank You for Your Enquiry', 'We’ll be in touch shortly', inner);
};

/* ───────────────────────── Plain-text versions ───────────────────────── */
/* Including a text/plain alternative significantly lowers spam scoring. */

const adminText = ({ fullName, phone, email, service, suburb, message, mapLat, mapLng }) =>
  [
    'NEW QUOTE REQUEST — Prestiva Property Services',
    '',
    `Name:     ${fullName}`,
    `Phone:    ${phone}`,
    `Email:    ${email}`,
    `Service:  ${String(service).replace(/-/g, ' ')}`,
    `Location: ${suburb}`,
    mapLat && mapLng ? `Map:      https://www.google.com/maps?q=${mapLat},${mapLng}` : null,
    '',
    'Message:',
    message ? message : '(none provided)',
    '',
    `Reply: ${email}  |  Call: ${phone}`,
  ]
    .filter((l) => l !== null)
    .join('\n');

const customerText = ({ fullName, service }) => {
  const first = String(fullName || '').trim().split(' ')[0] || 'there';
  return [
    `Hi ${first},`,
    '',
    `Thank you for contacting Prestiva Property Services. We've received your enquiry${
      service ? ` for ${String(service).replace(/-/g, ' ')}` : ''
    } and saved your details.`,
    '',
    'This is an automated confirmation. One of our representatives will personally reach out to you soon — usually within 2 business hours — to arrange your free, no-obligation quote.',
    '',
    `Need us sooner? Call ${PHONE} or reply to this email.`,
    '',
    'Warm regards,',
    'The Prestiva Team',
    '',
    `${PHONE}  |  ${EMAIL}`,
    SITE,
  ].join('\n');
};

module.exports = { adminTemplate, customerTemplate, adminText, customerText };

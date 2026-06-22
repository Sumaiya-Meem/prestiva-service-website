const { sendMail } = require('../utils/mailer');
const { adminTemplate, customerTemplate, adminText, customerText } = require('../utils/emailTemplates');
const { dbReady } = require('../config/db');
const Quote = require('../models/Quote');

const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v || ''));

/**
 * Send the admin notification (with any photo attachments) + customer auto-reply
 * in parallel. Runs AFTER the HTTP response so the user never waits on SMTP.
 */
const dispatchEmails = async (payload, adminEmail, attachments) => {
  const results = await Promise.allSettled([
    sendMail({
      to: adminEmail,
      replyTo: payload.email,
      subject: `New Request for Free Quote - ${payload.service}`,
      html: adminTemplate(payload),
      text: adminText(payload),
      attachments,
    }),
    sendMail({
      to: payload.email,
      replyTo: adminEmail,
      subject: "We've received your enquiry — a Prestiva representative will be in touch soon",
      html: customerTemplate(payload),
      text: customerText(payload),
      headers: {
        'List-Unsubscribe': `<mailto:${adminEmail}?subject=unsubscribe>`,
        'X-Auto-Response-Suppress': 'OOF, AutoReply',
        // RFC 3834: marks this as an automated reply so other mail servers
        // don't bounce/auto-respond back to us (prevents mail loops).
        'Auto-Submitted': 'auto-replied',
      },
    }),
  ]);

  results.forEach((r, i) => {
    const which = i === 0 ? 'admin notification' : 'customer auto-reply';
    if (r.status === 'rejected') console.error(`[mail] ${which} FAILED:`, r.reason?.message || r.reason);
    else console.log(`[mail] ${which} sent via ${r.value.channel}`);
  });
};

/**
 * Admin: list saved quotes (most recent first). Token-protected.
 * GET /api/contact?status=new&limit=50
 */
exports.listQuotes = async (req, res) => {
  if (!dbReady()) {
    return res.status(503).json({ success: false, message: 'Database not configured.' });
  }
  try {
    const { status } = req.query;
    const limit = Math.min(Number(req.query.limit) || 100, 500);
    const filter = status ? { status } : {};
    const quotes = await Quote.find(filter).sort({ createdAt: -1 }).limit(limit).lean();
    return res.json({ success: true, count: quotes.length, quotes });
  } catch (err) {
    console.error('[db] listQuotes error:', err.message);
    return res.status(500).json({ success: false, message: 'Could not fetch quotes.' });
  }
};

/**
 * Admin: update a quote's pipeline status. Token-protected.
 * PATCH /api/contact/:id  { status: 'contacted' }
 */
exports.updateQuoteStatus = async (req, res) => {
  if (!dbReady()) {
    return res.status(503).json({ success: false, message: 'Database not configured.' });
  }
  const allowed = ['new', 'contacted', 'quoted', 'won', 'lost'];
  if (!allowed.includes(req.body.status)) {
    return res.status(400).json({ success: false, message: `status must be one of: ${allowed.join(', ')}` });
  }
  try {
    const quote = await Quote.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    ).lean();
    if (!quote) return res.status(404).json({ success: false, message: 'Quote not found.' });
    return res.json({ success: true, quote });
  } catch (err) {
    console.error('[db] updateQuoteStatus error:', err.message);
    return res.status(500).json({ success: false, message: 'Could not update quote.' });
  }
};

exports.submitContact = async (req, res) => {
  try {
    const {
      fullName, phone, email, service, propertyType, preferredDate,
      suburb, message, mapLat, mapLng, website,
    } = req.body;

    // ── Honeypot ──
    if (website) {
      return res.status(201).json({ success: true, message: 'Contact request submitted successfully' });
    }

    // ── Validation ──
    const errors = [];
    if (!fullName || String(fullName).trim().length < 2) errors.push('A valid full name is required.');
    if (!phone || String(phone).trim().length < 6) errors.push('A valid phone number is required.');
    if (!isEmail(email)) errors.push('A valid email address is required.');
    if (!service) errors.push('Please select a service.');
    if (!suburb || String(suburb).trim().length < 2) errors.push('Please provide a suburb/location.');
    if (errors.length) return res.status(400).json({ success: false, message: errors.join(' ') });

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@prestiva.com.au';
    const payload = { fullName, phone, email, service, propertyType, preferredDate, suburb, message, mapLat, mapLng };

    // Photos uploaded via multer (memory storage)
    const attachments = (req.files || []).map((f) => ({ filename: f.originalname, content: f.buffer }));
    payload.photoCount = attachments.length;

    // Persist the lead FIRST so it's never lost even if SMTP fails later.
    // Non-blocking for the user, but awaited so we don't drop it on a fast response.
    if (dbReady()) {
      try {
        await Quote.create({
          fullName, phone, email, service, propertyType, preferredDate, suburb, message,
          mapLat: mapLat === '' || mapLat == null ? null : Number(mapLat),
          mapLng: mapLng === '' || mapLng == null ? null : Number(mapLng),
          photos: (req.files || []).map((f) => ({ filename: f.originalname, size: f.size })),
          userAgent: req.get('user-agent') || '',
        });
      } catch (dbErr) {
        // Don't fail the request just because persistence hiccuped — email is the backup.
        console.error('[db] Failed to save quote:', dbErr.message);
      }
    }

    // Respond immediately
    res.status(201).json({ success: true, message: 'Contact request submitted successfully' });

    // Send emails in the background
    dispatchEmails(payload, adminEmail, attachments).catch((e) => console.error('dispatchEmails error:', e.message));
  } catch (error) {
    console.error('Contact Submission Error:', error.message);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: 'We could not send your request right now. Please call us on 0403 540 227.',
      });
    }
  }
};

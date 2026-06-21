const { sendMail } = require('../utils/mailer');
const { adminTemplate, customerTemplate, adminText, customerText } = require('../utils/emailTemplates');

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
      },
    }),
  ]);

  results.forEach((r, i) => {
    const which = i === 0 ? 'admin notification' : 'customer auto-reply';
    if (r.status === 'rejected') console.error(`[mail] ${which} FAILED:`, r.reason?.message || r.reason);
    else console.log(`[mail] ${which} sent via ${r.value.channel}`);
  });
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

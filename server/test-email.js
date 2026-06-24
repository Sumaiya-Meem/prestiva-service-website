/**
 * Quick email tester.
 *
 * Usage (from the /server folder):
 *   node test-email.js                     -> sends to ADMIN_EMAIL from .env
 *   node test-email.js you@example.com     -> sends to a specific address
 *
 * It uses the SAME mailer the live form uses, so a success here means the
 * contact form will deliver mail too.
 */
require('dotenv').config();
const { sendMail, smtpConfigured, graphConfigured } = require('./utils/mailer');
const { adminTemplate, customerTemplate, adminText, customerText } = require('./utils/emailTemplates');

(async () => {
  const to = process.argv[2] || process.env.ADMIN_EMAIL;

  if (!to) {
    console.error('❌ No recipient. Set ADMIN_EMAIL in .env or pass an address: node test-email.js you@example.com');
    process.exit(1);
  }

  const transport = graphConfigured()
    ? 'Microsoft Graph (OAuth2 from your Microsoft 365 mailbox)'
    : smtpConfigured()
      ? 'SMTP (direct from your mailbox)'
      : process.env.RESEND_API_KEY
        ? 'Resend API (fallback)'
        : 'NONE — configure MS_*, SMTP_*, or RESEND_API_KEY in .env';

  console.log('────────────────────────────────────────');
  console.log(' Prestiva email test');
  console.log(' Transport :', transport);
  console.log(' Sending to:', to);
  console.log('────────────────────────────────────────');

  const sample = {
    fullName: 'Test User',
    phone: '0403 540 227',
    email: to,
    service: 'commercial',
    suburb: '123 Sample St, Adelaide SA 5000',
    message: 'This is a test email sent from test-email.js — if you can read this, email works! ✅',
  };

  try {
    const admin = await sendMail({
      to,
      subject: 'Prestiva TEST — admin notification',
      html: adminTemplate(sample),
      text: adminText(sample),
    });
    console.log('✅ Admin notification sent via', admin.channel);

    const reply = await sendMail({
      to,
      subject: 'Prestiva TEST — customer auto-reply',
      html: customerTemplate(sample),
      text: customerText(sample),
    });
    console.log('✅ Customer auto-reply sent via', reply.channel);

    console.log('\n🎉 Success. Check the inbox (and spam folder) for two emails.');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ Send failed:', err.message);
    const m = err.message || '';
    if (/AADSTS7000215|invalid client secret|invalid_client/i.test(m)) {
      console.error('   → Wrong client secret. Copy the secret VALUE (not the ID) from');
      console.error('     Entra → your app → Certificates & secrets. See EMAIL_SETUP.md Step 2.');
    } else if (/AADSTS900023|AADSTS90002|tenant/i.test(m)) {
      console.error('   → Wrong MS_TENANT_ID. Copy the Directory (tenant) ID from the app Overview page.');
    } else if (/AccessDenied|403|consent|Authorization_Request/i.test(m)) {
      console.error('   → Missing permission. Add Microsoft Graph → Application → Mail.Send and click');
      console.error('     "Grant admin consent". See EMAIL_SETUP.md Step 3.');
    } else if (/MailboxNotEnabledForRESTAPI|not found|ErrorInvalidUser/i.test(m)) {
      console.error('   → MS_SENDER is not a real, licensed Microsoft 365 mailbox. Check the address.');
    } else {
      console.error('   → Check your MS_* (Graph), SMTP_*, or RESEND_API_KEY values in server/.env');
    }
    process.exit(1);
  }
})();

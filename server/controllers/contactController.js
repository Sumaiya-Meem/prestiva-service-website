exports.submitContact = async (req, res) => {
  try {
    const { fullName, phone, email, service, suburb, message, mapLat, mapLng } = req.body;
    const adminEmail = process.env.ADMIN_EMAIL || 'info@prestiva.com.au';

    // Send the email via Resend API (HTTPS port 443) instead of Nodemailer (Port 465)
    try {
      if (!process.env.RESEND_API_KEY) {
        console.warn('Email notification skipped: RESEND_API_KEY not configured');
        return res.status(500).json({ 
          success: false, 
          message: "Server Configuration Error: Add RESEND_API_KEY to Render." 
        });
      }

      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: 'onboarding@resend.dev', // Resend's free testing email
          to: adminEmail,
          subject: `New Request for Free Quote - ${service}`,
          html: `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e6e6e6; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
              <div style="background-color: #0b1c36; color: #ffffff; padding: 25px; text-align: center;">
                <h2 style="margin: 0; font-size: 24px; font-weight: 600;">New Quote Request</h2>
                <p style="margin: 8px 0 0; font-size: 15px; opacity: 0.85;">Prestiva Property Services</p>
              </div>
              <div style="padding: 30px; background-color: #ffffff;">
                <p style="font-size: 16px; color: #444; line-height: 1.5; margin-top: 0;">You have received a new service inquiry. Here are the details:</p>
                
                <table style="width: 100%; border-collapse: collapse; margin-top: 25px; font-size: 15px;">
                  <tbody>
                    <tr style="border-bottom: 1px solid #f0f0f0;">
                      <td style="padding: 14px 0; font-weight: 600; color: #666; width: 35%;">👤 Full Name</td>
                      <td style="padding: 14px 0; color: #111; font-weight: 500;">${fullName}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #f0f0f0;">
                      <td style="padding: 14px 0; font-weight: 600; color: #666;">📞 Phone</td>
                      <td style="padding: 14px 0;">
                        <a href="tel:${phone}" style="color: #0f4c81; text-decoration: none; font-weight: 500;">${phone}</a>
                      </td>
                    </tr>
                    <tr style="border-bottom: 1px solid #f0f0f0;">
                      <td style="padding: 14px 0; font-weight: 600; color: #666;">✉️ Email</td>
                      <td style="padding: 14px 0;">
                        <a href="mailto:${email}" style="color: #0f4c81; text-decoration: none; font-weight: 500;">${email}</a>
                      </td>
                    </tr>
                    <tr style="border-bottom: 1px solid #f0f0f0;">
                      <td style="padding: 14px 0; font-weight: 600; color: #666;">🧹 Service</td>
                      <td style="padding: 14px 0; color: #111; font-weight: 500; text-transform: capitalize;">${service.replace(/-/g, ' ')}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #f0f0f0;">
                      <td style="padding: 14px 0; font-weight: 600; color: #666;">📍 Location</td>
                      <td style="padding: 14px 0; color: #111; font-weight: 500;">
                        ${suburb}
                        ${mapLat && mapLng ? `<br/><a href="https://www.google.com/maps?q=${mapLat},${mapLng}" target="_blank" style="color: #0f4c81; text-decoration: none; font-size: 13px; margin-top: 5px; display: inline-block;">🗺️ View on Google Maps</a>` : ''}
                      </td>
                    </tr>
                  </tbody>
                </table>
                
                <div style="margin-top: 30px; background-color: #f7f9fa; padding: 20px; border-left: 4px solid #cfaa5e; border-radius: 0 6px 6px 0;">
                  <h4 style="margin: 0 0 10px; color: #333; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">💬 Additional Message</h4>
                  <p style="margin: 0; color: #444; font-size: 15px; line-height: 1.6; white-space: pre-wrap;">${message ? message : '<i>No additional message provided.</i>'}</p>
                </div>
              </div>
              <div style="background-color: #f5f7f9; color: #999; padding: 20px; text-align: center; font-size: 13px; border-top: 1px solid #eee;">
                This automated email was sent securely via <a href="https://prestiva-website.vercel.app/" style="color: #0f4c81; text-decoration: none;">Prestiva Service Website</a>.
              </div>
            </div>
          `
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error from Resend API');
      }

      console.log('Email notification sent successfully via Resend');
      return res.status(201).json({ 
        success: true, 
        message: "Contact request submitted successfully" 
      });

    } catch (emailError) {
      console.error('Failed to send email notification:', emailError.message);
      return res.status(500).json({ 
        success: false, 
        message: "Failed to send email API request." 
      });
    }
  } catch (error) {
    console.error("Contact Submission Error:", error.message);
    res.status(500).json({ 
      success: false, 
      message: "Server Error. Please try again later." 
    });
  }
};

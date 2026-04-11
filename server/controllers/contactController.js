exports.submitContact = async (req, res) => {
  try {
    const { fullName, phone, email, service, suburb, message } = req.body;
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
            <h3>New Quote Request</h3>
            <p><strong>Name:</strong> ${fullName}</p>
            <p><strong>Phone:</strong> ${phone}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Service:</strong> ${service}</p>
            <p><strong>Suburb:</strong> ${suburb}</p>
            <p><strong>Message:</strong> ${message || 'No additional message'}</p>
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

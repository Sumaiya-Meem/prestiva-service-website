const nodemailer = require('nodemailer');

exports.submitContact = async (req, res) => {
  try {
    const { fullName, phone, email, service, suburb, message } = req.body;
    
    // Configure Nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    // Determine the admin email from environment variables or use a default
    const adminEmail = process.env.ADMIN_EMAIL || 'info@prestiva.com.au';

    // Set up email data
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: adminEmail,
      subject: `New Request for Free Quote - ${service}`,
      text: `You have received a new quote request.
      
Details:
Name: ${fullName}
Phone: ${phone}
Email: ${email}
Service: ${service}
Suburb: ${suburb}
Message: ${message || 'No additional message'}
      `,
      html: `
        <h3>New Quote Request</h3>
        <p><strong>Name:</strong> ${fullName}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Service:</strong> ${service}</p>
        <p><strong>Suburb:</strong> ${suburb}</p>
        <p><strong>Message:</strong> ${message || 'No additional message'}</p>
      `
    };

    // Send the email
    try {
      if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        await transporter.sendMail(mailOptions);
        console.log('Email notification sent successfully');
        return res.status(201).json({ 
          success: true, 
          message: "Contact request submitted successfully" 
        });
      } else {
        console.warn('Email notification skipped: EMAIL_USER and/or EMAIL_PASS not configured');
        return res.status(500).json({ 
          success: false, 
          message: "Server Configuration Error: Email credentials not set in Render Environment Variables." 
        });
      }
    } catch (emailError) {
      console.error('Failed to send email notification:', emailError.message);
      return res.status(500).json({ 
        success: false, 
        message: "Failed to send email. Ensure your Gmail App Password is correct." 
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

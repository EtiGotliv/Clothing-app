import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

export const sendFeedback = async (req, res) => {
  const { feedback, username, email } = req.body;

  if (!feedback || !username || !email) {
    return res.status(400).json({ message: 'Missing fields' });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    const mailBody = `
📬 משוב חדש התקבל מ־Bonitique

👤 שם המשתמש: ${username}
📧 אימייל: ${email}

📝 תוכן ההודעה:
---------------------
${feedback}
`;

    await transporter.sendMail({
      from: `"Bonitique" <${process.env.MAIL_USER}>`,
      to: process.env.MAIL_USER,
      subject: '📨 משוב חדש מהאתר',
      text: mailBody,
    });

    res.status(200).json({ message: 'Feedback sent successfully' });
  } catch (error) {
    console.error('Email error:', error);
    res.status(500).json({ message: 'Failed to send feedback' });
  }
};

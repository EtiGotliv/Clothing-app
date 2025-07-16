import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send({ message: 'Method Not Allowed' });
  }

  const { feedback } = req.body;

  if (!feedback) {
    return res.status(400).json({ message: 'Feedback is missing' });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Bonitique" <${process.env.MAIL_USER}>`,
      to: process.env.MAIL_USER,
      subject: 'משוב חדש מהאתר!',
      text: feedback,
    });

    res.status(200).json({ message: 'נשלח בהצלחה' });
  } catch (error) {
    console.error('Email error:', error);
    res.status(500).json({ message: 'שגיאה בשליחת מייל' });
  }
}

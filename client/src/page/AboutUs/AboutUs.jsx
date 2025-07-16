import React, { useEffect, useState } from 'react';
import styles from '../AboutUs/AboutUs.module.css';

function AboutUs() {
  const [feedback, setFeedback] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const storedName = localStorage.getItem('userName');
    const storedEmail = localStorage.getItem('userEmail');

    setUsername(storedName && storedName !== 'undefined' ? storedName : 'אנונימי');
    setEmail(storedEmail && storedEmail !== 'undefined' ? storedEmail : 'לא ידוע');
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:8080/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedback, username, email }),
      });
      if (res.ok) {
        setSubmitted(true);
        setFeedback('');
      }
    } catch (error) {
      console.error('שגיאה בשליחה:', error);
    }
  };

  return (
    <div className={styles.aboutSection}>
      <h1 className={styles.headline}>?Bonitique מה הסיפור של</h1>

      <p className={styles.paragraph}> .אנחנו לא עוד אפליקציית סטייל</p>
      <p className={styles.paragraph}> .אנחנו לא שגרה בארון שלך</p>
      <p className={styles.paragraph}> !!Bonitique אנחנו </p>
      <p className={styles.paragraph}> .אפליקציה שבאה לעשות סדר בבלאגן ולגרום לכל חולצה להרגיש כמו לוק מנצח</p>
    

      <p className={styles.paragraph}>
        בלי להטיף, בלי לשפוט – רק בינה מלאכותית עם סטייל אמיתי, שרוצה לעזור לך ללבוש את מי שאת.
      </p>

      <h2 className={styles.slogan}> .אז אם כבר בגדים – לפחות שיהיה בכיף</h2>

      <div className={styles.feedbackForm}>
        <h3>📬 מה דעתך עלינו?</h3>

        {submitted ? (
          <>
            <p className={styles.thankYou}>תודה על המשוב! 🙏 נשמח לשמוע ממך שוב</p>
            <button onClick={() => setSubmitted(false)} className={styles.sendMore}>
              שלח/י עוד משוב
            </button>
          </>
        ) : (
          <form onSubmit={handleSubmit} className={styles.formFadeIn}>
           <textarea
              placeholder="מה חשבת על האתר?"
              value={feedback}
              onChange={(e) => {
                const text = e.target.value;
                setFeedback(text);
                const isHebrew = /[\u0590-\u05FF]/.test(text);
                e.target.dir = isHebrew ? 'rtl' : 'ltr';
                e.target.style.textAlign = isHebrew ? 'right' : 'left';
              }}
              required
            />

            <button type="submit">שליחה</button>
          </form>
        )}
      </div>
    </div>
  );
}

export default AboutUs;

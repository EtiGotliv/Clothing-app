import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import styles from "../AuthForm/AuthForm.module.css";

function Signup() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    document.body.style.margin = "0";
    document.body.style.padding = "0";
    document.body.style.overflow = "hidden";
    document.documentElement.style.margin = "0";
    document.documentElement.style.padding = "0";
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.body.style.margin = "";
      document.body.style.padding = "";
      document.body.style.overflow = "";
      document.documentElement.style.margin = "";
      document.documentElement.style.padding = "";
      document.documentElement.style.overflow = "";
    };
  }, []);

  async function submit(e) {
    e.preventDefault();
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_SERVER_API_URL}/api/auth/signup`,
        {
          name,
          email,
          password,
        }
      );

      if (res.data.status === "success") {
        const { userId, role } = res.data;

        localStorage.setItem("authToken", userId);
        localStorage.setItem("userId", userId);
        localStorage.setItem("userName", name);
        localStorage.setItem("userEmail", email);
        localStorage.setItem("userRole", role);

        navigate("/home", { state: { id: userId, name } });
      } else if (res.data === "exist" || res.data.status === "exist") {
        alert("המשתמש כבר קיים במערכת");
      } else {
        alert("ההרשמה נכשלה");
      }
    } catch (e) {
      console.error(e);
      alert("משהו השתבש, נסי שוב.");
    }
  }

  return (
    <div className={styles.authPageContainer}>
      <div className={styles.leftPanel}>
        <div className={styles.logoContainer}>
          <img src="/Image/Logo.png" alt="Logo" className={styles.logo} />
          <img src="/Image/namewab.png" alt="Logo Web" className={styles.logoWeb} />
        </div>
      </div>
      <div className={styles.rightPanel}>
        <div className={styles.formContainer}>
          <h1 className={styles.heading}>!הצטרפ/י לבוניטיקיו</h1>
          <form onSubmit={submit}>
            <input
              type="text"
              name="name"
              autoComplete="name"
              onChange={(e) => setName(e.target.value)}
              placeholder="שם מלא"
              required
            />
            <input
              type="email"
              name="email"
              autoComplete="email"
              onChange={(e) => setEmail(e.target.value)}
              placeholder="אימייל"
              required
            />
            <input
              type="password"
              name="password"
              autoComplete="new-password"
              onChange={(e) => setPassword(e.target.value)}
              placeholder="סיסמה"
              required
            />
            <input type="submit" value="צור/י משתמש" />
          </form>
          <div className={styles.divider}>או</div>
          <Link to="/" className={styles.link}>
            יש לך משתמש? התחברי
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Signup;

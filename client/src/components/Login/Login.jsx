import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "../AuthForm/AuthForm.module.css";
import GoogleLoginButton from "../UserLoginButton/GoogleLoginButton";

function Login() {
  const navigate = useNavigate();
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
        `${import.meta.env.VITE_SERVER_API_URL}/api/auth/login`,
        {
          email,
          password,
        }
      );

      if (res.data.status === "success") {
        const { userId, name, role } = res.data;

        localStorage.setItem("authToken", userId);
        localStorage.setItem("userId", userId);
        localStorage.setItem("userName", name);
        localStorage.setItem("userEmail", email);
        localStorage.setItem("userRole", role);

        navigate("/home", { state: { id: userId, name } });
      } else {
        alert("המשתמש לא קיים");
      }
    } catch (error) {
      console.error(error);
      alert("התחברות נכשלה");
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
          <h1 className={styles.heading}>!ברוכה הבאה</h1>
          <form onSubmit={submit}>
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
              autoComplete="current-password"
              onChange={(e) => setPassword(e.target.value)}
              placeholder="סיסמה"
              required
            />
            <input type="submit" value="כניסה לארון שלי" />
          </form>
          <div className={styles.divider}>או התחברי עם גוגל</div>
          <GoogleLoginButton />
          <Link to="/Signup" className={styles.link}>
            ליצירת משתמש חדש
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;

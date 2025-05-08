// src/components/Login/Login.jsx
import axios from "axios";
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "../AuthForm/AuthForm.module.css";

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // הוספת קלאס לבודי בטעינת הקומפוננטה
  useEffect(() => {
    // הוספת class לבודי בלי לפגוע בשאר ההגדרות
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.body.style.overflow = 'hidden';
    document.documentElement.style.margin = '0';
    document.documentElement.style.padding = '0';
    document.documentElement.style.overflow = 'hidden';
    
    // ניקוי בעת עזיבת הקומפוננטה
    return () => {
      document.body.style.margin = '';
      document.body.style.padding = '';
      document.body.style.overflow = '';
      document.documentElement.style.margin = '';
      document.documentElement.style.padding = '';
      document.documentElement.style.overflow = '';
    };
  }, []);

  async function submit(e) {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:8080/", { email, password });

      if (res.data.status === "success") {
        const { userId, name } = res.data;
        localStorage.setItem("authToken", userId);
        localStorage.setItem("userName", name);
        navigate("/home", { state: { id: userId, name } });
      } else {
        alert("User does not exist");
      }
    } catch (error) {
      console.error(error);
      alert("Login failed");
    }
  }

  return (
    <div className={styles.authPageContainer}>
      <div className={styles.leftPanel}>
        <img src="/Image/Logo.png" alt="Logo" className={styles.logo} />
        <img src="/Image/namewab.png" alt="Logo Web" className={styles.logoWeb} />
      </div>
      <div className={styles.rightPanel}>
        <div className={styles.formContainer}>
          <h1>Login</h1>
          <form onSubmit={submit}>
            <input
              type="email"
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
            />
            <input
              type="password"
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
            />
            <input type="submit" value="Login" />
          </form>
          <div className={styles.divider}>OR</div>
          <Link to="/Signup" className={styles.link}>Signup Page</Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
// src/components/Signup/Signup.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import styles from "../AuthForm/AuthForm.module.css";

function Signup() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // הוספת סגנונות ישירות לבודי בטעינת הקומפוננטה
  useEffect(() => {
    // הוספת סגנונות ישירות בלי לשנות מחלקות
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
      const res = await axios.post(`${import.meta.env.VITE_SERVER_API_URL}/Signup`, {
        name, email, password,
      });

      if (res.data.status === "success") {
        const userId = res.data.userId;
        localStorage.setItem("authToken", userId);
        localStorage.setItem("userName", name);
        navigate("/home", { state: { id: userId, name } });
      } else if (res.data.status === "exist") {
        alert("User already exists");
      } else {
        alert("Signup failed");
      }
    } catch (e) {
      console.error(e);
      alert("Something went wrong, please try again.");
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
          <h1>Create Account</h1>
          <form onSubmit={submit}>
            <input
              type="text"
              onChange={(e) => setName(e.target.value)}
              placeholder="Your Name"
              required
            />
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
            <input type="submit" value="Sign Up" />
          </form>
          <div className={styles.divider}>OR</div>
          <Link to="/" className={styles.link}>
            Already have an account? Login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Signup;
// src/components/Signup/Signup.jsx
import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import styles from "../AuthForm/AuthForm.module.css";

function Signup() {
  const navigate = useNavigate();

  const [name, setName] = useState(""); // שדה להזנת שם המשתמש
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function submit(e) {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:8080/Signup", {
        name,
        email,
        password,
      });

      // נניח שהשרת מחזיר אובייקט עם נתוני המשתמש בהצלחה:
      // { status: "success", userId: "67b31f23fb4864c43330f8ac" }
      if (res.data.status === "success") {
        const userId = res.data.userId;
        localStorage.setItem("authToken", userId);
        localStorage.setItem("userName", name);
        navigate("/home", { state: { id: userId, name } });
      } else if (res.data === "exist") {
        alert("User already exists");
      } else {
        alert("Signup failed");
      }
    } catch (e) {
      console.error(e);
      alert("Wrong details");
    }
  }

  return (
    <div className={styles.authPageContainer}>
      {/* חלק שמאלי עם הלוגו */}
      <div className={styles.leftPanel}>
        <img src="/path_to_your_logo.png" alt="Logo" className={styles.logo} />
      </div>
      {/* חלק ימין עם הטופס */}
      <div className={styles.rightPanel}>
        <div className={styles.formContainer}>
          <h1>Signup</h1>
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
            <input type="submit" value="Signup" />
          </form>
          <br />
          <p>OR</p>
          <br />
          <Link to="/" className={styles.link}>Login Page</Link>
        </div>
      </div>
    </div>
  );
}

export default Signup;

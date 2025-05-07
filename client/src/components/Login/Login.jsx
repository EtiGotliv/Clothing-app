// src/components/Login/Login.jsx
import axios from "axios";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "../AuthForm/AuthForm.module.css";

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function submit(e) {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:8080/", { email, password });
      
      // { status: "success", userId: "67b31f23fb4864c43330f8ac", name: "fridi" }
      if (res.data.status === "success") {
        const { userId, name } = res.data;
        console.log("Response data:", res.data);

        localStorage.setItem("authToken", userId);
        // localStorage.setItem("authToken", token);
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
        <img src="/path_to_your_logo.png" alt="Logo" className={styles.logo} />
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
      <br />
      <p>OR</p>
          <br />

      <Link to="/Signup" className={styles.link}>Signup Page</Link>
    </div>
    </div>
    </div>

  );
}

export default Login;

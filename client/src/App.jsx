import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from "react";
import HomePage from "./page/HomePage/HomePage";
import MyClothe from "./page/MyClothe/MyClothe";
import OutSugges from "./page/OutSugges/OutSugges";
import ScanCloset from "./page/ScanCloset/ScanCloset";
import AboutAs from "./page/AboutUs/AboutAs";
import Header from "./components/Header/Header";
import styles from './styles/App.module.css';
import CategoryPage from "./page/CategoryPage/CategoryPage";
import Login from "./components/Login/Login";
import Signup from "./components/Signup/Signup";

function App() {
  return (
    <BrowserRouter>
      <div>
        <Header /> 
      </div>
      
      <main className={styles.main}>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/Signup" element={<Signup />} />
          <Route path="/Home" element={<HomePage />} />
          <Route path="/about" element={<AboutAs />} />
          <Route path="/clothes" element={<MyClothe />} />
          <Route path="/category/:categoryName" element={<CategoryPage />} />
          <Route path="/Sugges" element={<OutSugges />} />
          <Route path="/Scan-Camera" element={<ScanCloset />} />
        </Routes>
      </main>

      <footer className={styles.footer}>
        <p>&copy; 2025 Myweb</p>
      </footer>
    </BrowserRouter>
  );
}

export default App;

import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./page/HomePage/HomePage";
import MyClothe from "./page/MyClothe/MyClothe";
import OutSugges from "./page/OutSugges/OutSugges";
import ScanCloset from "./page/ScanCloset/ScanCloset";
import AboutAs from "./page/AboutUs/AboutAs";
import Header from "./components/common/Header/Header";
import styles from './styles/App.module.css';

function App() {
  return (
    <BrowserRouter>
      <div>
        <Header /> {/* הכפתורים יהיו כאן בכל הדפים */}
      </div>
      
      <main className={styles.main}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutAs />} />
          <Route path="/clothes" element={<MyClothe />} />
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

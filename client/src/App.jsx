import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./page/HomePage/HomePage";
import MyClothe from "./page/MyClothe/MyClothe";
import OutSugges from "./page/OutSugges/OutSugges";
import ScanCloset from "./page/ScanCloset/ScanCloset";
import AboutUs from "./page/AboutUs/AboutUs";
import Dailytip from "./page/Dailytip/Dailytip";
import Favorites from "./page/user/Favorites";
import Profile from "./page/Profile/Profile";
import Header from "./components/Header/Header";
import styles from './styles/App.module.css';
import CategoryPage from "./page/CategoryPage/CategoryPage";
import ClothingDetailsPage from "./page/ClothingDetailsPage/ClothingDetailsPage";
import Login from "./components/Login/Login";
import Signup from "./components/Signup/Signup";
import { ToastContainer } from 'react-toastify';
import CameraButton from "./components/common/CameraButton/CameraButton";
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <BrowserRouter>
      <Header />

      <main className={styles.main}>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/Signup" element={<Signup />} />
          <Route path="/Home" element={<HomePage />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/dailytip" element={<Dailytip />} />
          <Route path="/clothes" element={<MyClothe />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/clothing-details/:id" element={<ClothingDetailsPage />} />
          <Route path="/category/:categoryName" element={<CategoryPage />} />
          <Route path="/Sugges" element={<OutSugges />} />
          <Route path="/Scan-Camera" element={<ScanCloset />} />
        </Routes>
      </main>

      <ToastContainer position="top-right" autoClose={3000} />
      <CameraButton />
    </BrowserRouter>
  );
}

export default App;
import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Search from '../Search/Search';

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const searchRef = useRef(null);
  const searchButtonRef = useRef(null);

  const userImage = localStorage.getItem("userImage");

  const handleSignOut = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userName");
    localStorage.removeItem("userImage");
    window.location.href = "/";
  };

  const handleHomeClick = () => {
    navigate("/home");
  };

  const handleProfileClick = () => {
    navigate("/profile");
    setIsOpen(false); // סגור את התפריט
  };

  const toggleSearch = () => {
    setShowSearch((prev) => !prev);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target) &&
        searchButtonRef.current &&
        !searchButtonRef.current.contains(event.target)
      ) {
        setShowSearch(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const hideHeader = location.pathname === "/" || location.pathname === "/Signup";

  if (hideHeader) return null;

  return (
    <>
      <nav className="w-full bg-[#f0d3b8] shadow-md fixed top-0 left-0 z-50">
        <div className="mx-auto max-w-[1280px] flex items-center justify-between h-20 px-6">
          <div className="flex items-center gap-1">
            <img className="h-14 w-auto" src="/Image/Logo.png" alt="Bonitique Logo" />
            <a href="/home" className="text-white text-2xl font-bold transition-none" style={{ textDecoration: 'none' }}>
              Bonitique
            </a>
            <div className="flex items-center gap-6 ml-8">
              <a href="/about" className="text-[#7b4a1d] text-lg font-medium hover:text-[#5a3115]">About</a>
              <a href="/clothes" className="text-[#7b4a1d] text-lg font-medium hover:text-[#5a3115]">Clothes</a>
              <a href="/Scan-Camera" className="text-[#7b4a1d] text-lg font-medium hover:text-[#5a3115]">Scan</a>
              <a href="/Sugges" className="text-[#7b4a1d] text-lg font-medium hover:text-[#5a3115]">Sugges</a>
            </div>
          </div>

          <div className="flex items-center gap-3 ml-auto">
            <button
              onClick={handleHomeClick}
              className="w-8 h-8 flex items-center justify-center bg-white rounded-full text-[#7b4a1d] hover:bg-[#f9f2e9] transition"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="w-5 h-5" viewBox="0 0 16 16">
                <path d="M8 .5l7 7V15a1 1 0 0 1-1 1h-4v-4H6v4H2a1 1 0 0 1-1-1V7.5l7-7z"/>
              </svg>
            </button>

            <button
              ref={searchButtonRef}
              onClick={toggleSearch}
              className="w-8 h-8 flex items-center justify-center bg-white rounded-full text-[#7b4a1d] hover:bg-[#f9f2e9] transition"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="w-4 h-4" viewBox="0 0 16 16">
                <path d="M11.742 10.344a6.5 6.5 0 1 0-1.398 1.398h-.001l3.85 3.85a1 1 0 0 0 1.415-1.415l-3.85-3.85zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
              </svg>
            </button>

            <div className="relative">
              <button type="button" className="flex items-center text-sm rounded-full bg-[#7b4a1d]" onClick={() => setIsOpen(!isOpen)}>
                <img className="h-10 w-10 rounded-full" src={userImage} alt="Profile" />
              </button>
              {isOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-md bg-white py-2 shadow-lg ring-1 ring-black/5">
                  <button 
                    onClick={handleProfileClick}
                    className="block w-full text-left px-4 py-2 text-md text-gray-700 hover:bg-gray-100"
                  >
                    👤 Your Profile
                  </button>
                  <a href="#" className="block px-4 py-2 text-md text-gray-700 hover:bg-gray-100">Settings</a>
                  <button onClick={handleSignOut} className="block w-full text-left px-4 py-2 text-md text-gray-700 hover:bg-gray-100">
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {showSearch && (
        <div ref={searchRef} className="fixed top-20 left-0 right-0 z-40 flex justify-center bg-[#fff7f0] py-4 shadow-md animate-fadeIn">
          <div className="w-full max-w-2xl px-4">
            <Search onClose={() => setShowSearch(false)} />
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
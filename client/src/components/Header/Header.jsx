import React from 'react';

const Header = () => {
  return (
    <nav className="w-full bg-gray-800 shadow-md fixed top-0 left-0 z-50">
      <div className="mx-auto max-w-[1280px] flex items-center justify-between h-16 px-6">
        
        {/* לוגו */}
        <div className="flex items-center">
          <img
            className="w-12 h-12"
            src="https://tailwindui.com/plus-assets/img/logos/mark.svg?color=indigo&shade=500"
            alt="Your Company"
          />
        </div>

        {/* תפריט הניווט */}
        <div className="hidden md:flex flex-grow justify-center gap-6">
          <a href="/" className="text-white text-lg font-medium hover:text-gray-300">CLOTHES APP</a>
          <a href="/about" className="text-gray-300 text-lg font-medium hover:text-white">Team</a>
          <a href="/clothes" className="text-gray-300 text-lg font-medium hover:text-white">Projects</a>
          <a href="/Scan-Camera" className="text-gray-300 text-lg font-medium hover:text-white">Calendar</a>
          <a href="/Sugges" className="text-gray-300 text-lg font-medium hover:text-white">Reports</a>
        </div>

        {/* אזור הפרופיל - מוצמד לימין */}
        <div className="flex items-center space-x-4 ml-auto">
          {/* אייקון התראות */}
          <button
            type="button"
            className="relative p-2 rounded-full text-gray-400 hover:text-white"
          >
            <span className="sr-only">View notifications</span>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"/>
            </svg>
          </button>

          {/* תמונת פרופיל ותפריט נפתח */}
          <div className="relative">
            <button
              type="button"
              className="flex items-center text-sm rounded-full bg-gray-800"
              id="user-menu-button"
            >
              <span className="sr-only">Open user menu</span>
              <img
                className="h-10 w-10 rounded-full"
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                alt=""
              />
            </button>

            {/* תפריט נפתח */}
            <div className="absolute right-0 mt-2 w-48 rounded-md bg-white py-2 shadow-lg ring-1 ring-black/5">
              <a href="#" className="block px-4 py-2 text-md text-gray-700 hover:bg-gray-100">Your Profile</a>
              <a href="#" className="block px-4 py-2 text-md text-gray-700 hover:bg-gray-100">Settings</a>
              <a href="#" className="block px-4 py-2 text-md text-gray-700 hover:bg-gray-100">Sign out</a>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Header;

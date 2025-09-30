import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="bg-white/10 backdrop-blur-lg absolute top-0 left-0 right-0 z-20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0 text-white font-bold text-xl">
            AceMyCV
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/login" className="text-white hover:bg-white/20 px-3 py-2 rounded-md text-sm font-medium transition">
              Log In
            </Link>
            <Link to="/signup" className="bg-white text-blue-600 hover:bg-gray-100 px-3 py-2 rounded-md text-sm font-medium transition">
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
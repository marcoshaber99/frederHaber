import { faBars, faSignOutAlt, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useState } from 'react';
import { Link, Route, Routes, useNavigate } from 'react-router-dom';
import frederickLogo from '../images/frederick-white-logo.png';
import NewRequests from './NewRequests';


const AdminDashboard = ({ email, role }) => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    navigate('/logout');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="h-screen flex">
      <div
        className={`bg-blue-800 fixed inset-y-0 left-0 z-10 transform transition-transform duration-300 w-64 p-4 ${
          isMenuOpen ? 'translate-x-0' : '-translate-x-full'
        } md:relative md:translate-x-0`}
      >
        <div className="flex justify-between items-end mb-8">
          <div>
            <Link to="#">
              <img
                src={frederickLogo}
                alt="Frederick University Logo"
                className="w-33 mb-4 mt-2"
              />
            </Link>
            <p className="text-gray-300 text-lg px-2">{role}</p>
          </div>
          <div className="md:hidden">
            <button onClick={toggleMenu} className="text-white ">
              <FontAwesomeIcon icon={faTimes} className="text-2xl w-33 mb-11 mt-2" />
            </button>
          </div>
        </div>
        <nav className="flex flex-col items-center justify-center mt-44 py-14">
        <Link to="new-requests" className="text-left text-white text-lg my-4 hover:text-green-400">
          New Requests
        </Link>
        {/* Add similar Links for other admin pages here */}
        <Link to="#" className="text-left text-white text-lg my-4 hover:text-green-400">
          Open Requests
        </Link>
        <Link to="#" className="text-left text-white text-lg my-4 hover:text-green-400">
          Closed Requests
        </Link>
          <div className="absolute bottom-0 left-0 w-full text-center py-4">
            <button
              className="px-10 ml-10 py-7 flex items-center text-white text-xl hover:text-red-500"
              onClick={handleLogout}
            >
              <FontAwesomeIcon icon={faSignOutAlt} className="mr-2" />
              Logout
            </button>
          </div>
        </nav>
      </div>
      <div className="flex-1 p-8 md:ml-64">
        <div className="md:hidden">
          <button onClick={toggleMenu} className="text-blue-800">
            <FontAwesomeIcon
              icon={isMenuOpen ? faTimes : faBars}
              className="text-2xl"
            />
          </button>
        </div>
        <Routes>
          <Route path="new-requests" element={<NewRequests />} />
          {/* Add similar Routes for other admin pages here */}
        </Routes>
      </div>
    </div>
  );
};

export default AdminDashboard;

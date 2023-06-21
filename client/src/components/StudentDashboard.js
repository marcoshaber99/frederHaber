import { faBars, faSignOutAlt, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useState, useCallback } from 'react';
import { Link, Route, Routes, useNavigate, useLocation } from 'react-router-dom';
import frederickLogo from '../images/frederick-white-logo.png';
import CreateRequest from './CreateRequest';
import UpdateRequest from './UpdateRequest';
import ViewRequests from './ViewRequests';

const StudentDashboard = ({ email, role }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = useCallback(() => {
    navigate('/logout');
  }, [navigate]);

  const toggleMenu = useCallback(() => {
    setIsMenuOpen(!isMenuOpen);
  }, [isMenuOpen]);

  const isActive = useCallback((path) => {
    return location.pathname.includes(path);
  }, [location]);

  return (
    <div className="min-h-screen flex bg-gray-100">
      <div
        className={`fixed z-20 inset-0 flex-none h-full bg-black bg-opacity-25 w-full lg:bg-blue-800 lg:static lg:h-auto lg:overflow-y-visible lg:pt-0 lg:w-60 xl:w-72 lg:block p-4 ${
          isMenuOpen ? 'block' : 'hidden'
        } lg:sticky lg:top-16`}
      >
        <div className="h-full overflow-y-auto scrolling-touch lg:h-auto lg:block lg:relative lg:sticky lg:top-16 bg-blue-800 mr-4 lg:mr-0 py-2 lg:py-0 pl-1 pr-6 lg:pl-4 lg:pr-8 shadow-xl lg:shadow-none">
          <div className="flex justify-between items-center mb-8">
            <Link to="#">
              <img
                src={frederickLogo}
                alt="Frederick University Logo"
                className="w-full mt-2"
              />
            </Link>
            <div className="lg:hidden">
              <button onClick={toggleMenu} className="text-white">
                <FontAwesomeIcon icon={faTimes} className="text-2xl" />
              </button>
            </div>
          </div>
          <div className="mb-8 text-center lg:text-left">
            <p className="text-lg text-white">{role}</p>
            <p className="text-sm text-gray-200">{email}</p>
          </div>
          <nav className="flex flex-col">
            <Link
              to="create-request"
              className={`px-3 py-2 flex items-center text-sm leading-5 font-medium text-white rounded-md focus:outline-none focus:text-white focus:bg-blue-600 ${
                isActive('create-request') ? 'bg-blue-600' : ''
              }`}
            >
              Create Request
            </Link>
            <Link
              to="view-requests"
              className={`mt-1 px-3 py-2 flex items-center text-sm leading-5 font-medium text-white rounded-md focus:outline-none focus:text-white focus:bg-blue-600 ${
                isActive('view-requests') ? 'bg-blue-600' : ''
              }`}
            >
              View Requests
            </Link>
          </nav>
          <div className="mt-auto">
            <button
              className="flex items-center px-3 py-2 w-full text-sm leading-5 font-medium text-white rounded-md focus:outline-none focus:text-white focus:bg-blue-600 hover:text-red-500"
              onClick={handleLogout}
            >
              <FontAwesomeIcon icon={faSignOutAlt} className="mr-2" />
              Logout
            </button>
          </div>
        </div>
      </div>
      <div className="min-w-0 w-full flex-auto lg:static lg:max-h-full lg:overflow-visible">
        <div className="lg:hidden">
          <button onClick={toggleMenu} className="px-3 py-2 text-blue-800">
            <FontAwesomeIcon
              icon={isMenuOpen ? faTimes : faBars}
              className="text-2xl"
            />
          </button>
        </div>
        <main className="p-4 flex-auto overflow-y-auto">
          <Routes>
            <Route path="create-request" element={<CreateRequest />} />
            <Route path="view-requests" element={<ViewRequests />} />
            <Route path="update-request/:id" element={<UpdateRequest />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default StudentDashboard;

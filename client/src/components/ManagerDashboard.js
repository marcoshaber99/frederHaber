import { faBars, faSignOutAlt, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useCallback, useState } from 'react';
import { Link, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import frederickLogo from '../images/frederick-white-logo.png';
import AllRequests from './AllRequests';
import PendingApproval from './PendingApproval';


const ManagerDashboard = ({ email, role }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    navigate('/logout');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const isActive = useCallback((path) => {
    return location.pathname.includes(path);
  }, [location]);

  return (
    <div className="h-screen flex">
      <div
          className={`bg-blue-800 fixed inset-y-0 left-0 z-10 transform transition-transform duration-300 w-64 p-4 ${
            isMenuOpen ? 'translate-x-0' : '-translate-x-full'
          } md:relative md:translate-x-0`}
          style={{position: 'fixed'}}
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
            <button onClick={toggleMenu} className="text-white">
              <FontAwesomeIcon icon={faTimes} className="text-2xl" />
            </button>
          </div>
        </div>
        <nav className="flex flex-col items-center justify-center mt-44 py-14">
          <Link to="all-requests" className={`text-lg my-4 mr-2 transition-all duration-300 transform hover:scale-105 ${isActive('all-requests') ? 'text-green-400' : 'text-white'} hover:text-green-400`}>
             All Requests
          </Link>
          <Link to="pending-approval" className={`text-lg my-4 mr-2 transition-all duration-300 transform hover:scale-105 ${isActive('pending-approval') ? 'text-green-400' : 'text-white'} hover:text-green-400`}>
            Pending Approval
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
          
        <Route path="all-requests" element={<AllRequests />} />

          <Route path="pending-approval" element={<PendingApproval />} />
        </Routes>
      </div>
    </div>
  );
};

export default ManagerDashboard;

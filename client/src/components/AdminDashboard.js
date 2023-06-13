import { css } from '@emotion/react';
import { faBars, faSignOutAlt, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import axios from 'axios';
import React, { useCallback, useEffect, useState } from 'react';
import { Link, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import ClipLoader from "react-spinners/ClipLoader";
import frederickLogo from '../images/frederick-white-logo.png';
import NewRequests from './NewRequests';
import OpenRequests from './OpenRequests';
import OpenRequestsDetails from './OpenRequestsDetails';



// Loader CSS override
const override = css`
  display: inline-block;
  margin-left: 5px;
`;

const AdminDashboard = ({ email, role }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [newRequestsCount, setNewRequestsCount] = useState(null);
  const [loadingNewRequestsCount, setLoadingNewRequestsCount] = useState(false);

  const fetchNewRequestsCount = useCallback(async () => {
    setLoadingNewRequestsCount(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5001/api/scholarship/get-new-requests-count', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      setNewRequestsCount(response.data); // Changed this line
    } catch (error) {
      console.error('Error fetching new requests count:', error);
    } finally {
      setLoadingNewRequestsCount(false);
    }
}, []);

  useEffect(() => {
    fetchNewRequestsCount();
  }, [fetchNewRequestsCount]);

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
    <div className="h-screen flex flex-col md:flex-row overflow-hidden">
      <div
        className={`bg-blue-800 fixed inset-y-0 left-0 z-10 transform transition-transform duration-300 w-60 md:w-62 p-4 ${
          isMenuOpen ? 'translate-x-0' : '-translate-x-full'
        } md:relative md:translate-x-0`}
      >
        <div className="flex justify-between items-center mb-8">
        <Link to="#">
            <img
              src={frederickLogo}
              alt="Logo of Frederick University"
              className="w-full mt-2"
            />
          </Link>
          <div className="md:hidden">
            <button onClick={toggleMenu} className="text-white">
              <FontAwesomeIcon icon={faTimes} className="text-2xl" />
            </button>
          </div>
        </div>
        <div className="mb-8 text-center md:text-left">
          <p className="text-md text-orange-400">{role}</p>
          <p className="text-gray-100">{email}</p>
        </div>
        <nav className="flex flex-col items-center md:justify-start py-48 md:mt-0">
          <Link to="new-requests" className={`text-lg my-4 transition-all duration-300 transform hover:scale-105 ${isActive('new-requests') ? 'text-green-400' : 'text-white'} hover:text-green-400`}>
            New Requests {loadingNewRequestsCount ? <ClipLoader color="#ffffff" loading={loadingNewRequestsCount} css={override} size={20} /> : `(${newRequestsCount})`}
          </Link>
          <Link to="open-requests" className={`text-left text-lg my-4 mr-4 ${isActive('open-requests') ? 'text-green-400' : 'text-white'} hover:text-green-400`}>
            Open Requests
          </Link>
          <Link to="closed-requests" className={`text-left text-lg my-4 mr-2 ${isActive('closed-requests') ? 'text-green-400' : 'text-white'} hover:text-green-400`}>
            Closed Requests
          </Link>
        </nav>
        <div className="fixed bottom-0 left-0 w-full flex justify-center py-4 bg-blue-800 md:absolute md:bg-transparent">
          <button
            className="px-10 py-8 flex items-center text-white text-xl hover:text-red-400 duration-300 transform hover:scale-105"
            onClick={handleLogout}
          >
            <FontAwesomeIcon icon={faSignOutAlt} className="mr-2" />
            Logout
          </button>
        </div>
      </div>
      <div className="flex-1 p-4 md:p-8 md:ml-48 mr-8 overflow-y-auto">
        <div className="md:hidden mb-4">
          <button onClick={toggleMenu} className="text-blue-800">
            <FontAwesomeIcon
              icon={isMenuOpen ? faTimes : faBars}
              className="text-2xl"
            />
          </button>
        </div>
        <Routes>
          <Route path="new-requests" element={<NewRequests />} />
          <Route path="open-requests" element={<OpenRequests />} /> 
          <Route path="open-requests/:id" element={<OpenRequestsDetails />} /> 

        </Routes>
      </div>
    </div>
  );
  
};

export default AdminDashboard;

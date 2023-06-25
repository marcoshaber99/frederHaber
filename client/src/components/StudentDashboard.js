import { css } from '@emotion/react';
import { faBars, faSignOutAlt, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import axios from 'axios';
import { animated, useSpring } from 'react-spring';

import React, { useCallback, useEffect, useState } from 'react';
import { Link, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import ClipLoader from "react-spinners/ClipLoader";
import { useRequest } from '../contexts/RequestContext'; // add this line
import frederickLogo from '../images/frederick-white-logo.png';
import CreateRequest from './CreateRequest';
import UpdateRequest from './UpdateRequest';
import ViewRequests from './ViewRequests';


// Loader CSS override
const override = css`
  display: inline-block;
  margin-left: 5px;
`;

const StudentDashboard = ({ role }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [requestsCount, setRequestsCount] = useState(null);
  const [loadingRequestsCount, setLoadingRequestsCount] = useState(false);
  const [email, setEmail] = useState('');  // New state for email


  // Use RequestContext here
  const { latestRequestStatus, loadingLatestRequestStatus, fetchLatestRequestStatus } = useRequest();

  const fetchRequestsCount = useCallback(async () => {
    setLoadingRequestsCount(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5001/api/scholarship/get-requests-count', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      setRequestsCount(response.data);
    } catch (error) {
      console.error('Error fetching requests count:', error);
    } finally {
      setLoadingRequestsCount(false);
    }
  }, []);

  useEffect(() => {
    fetchRequestsCount();
    fetchLatestRequestStatus(); // Now using fetchLatestRequestStatus from context
  }, [fetchRequestsCount, fetchLatestRequestStatus]);

  useEffect(() => {
    const userEmail = localStorage.getItem('userEmail');
    if (userEmail) {
      setEmail(userEmail);
    }
  }, []);

  const handleLogout = useCallback(() => {
    navigate('/logout');
  }, [navigate]);

  const toggleMenu = useCallback(() => {
    setIsMenuOpen(!isMenuOpen);
  }, [isMenuOpen]);

  const isActive = useCallback((path) => {
    return location.pathname.includes(path);
  }, [location]);

  const scaleProps = useSpring({transform: 'scale(1.05)', from: {transform: 'scale(1)'}});


  return (
    <div className="h-screen flex flex-col md:flex-row overflow-hidden bg-gray-100">
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
        <nav className="flex flex-col items-center md:justify-start py-48 md:mt-0 w-full">

          
          <Link to="view-requests" className={`text-lg my-4 mr-2 transition-all duration-300 transform hover:scale-105 ${isActive('view-requests') ? 'text-green-400' : 'text-white'} hover:text-green-400`}>
            View Requests
          </Link>

          {loadingLatestRequestStatus ? null : (["admin_reviewed", "submitted", "requires_more_info"].includes(latestRequestStatus) ? (
  <animated.div
    style={scaleProps}
    className="text-lg md:text-lg lg:text-lg my-4 mr-2  font-bold text-blue-200 transition-all duration-300 transform hover:scale-105"
  >
    Request in progress.
  </animated.div>
) : (
  <Link to="create-request" className={`text-lg my-4 mr-2 transition-all duration-300 transform hover:scale-105 ${isActive('create-request') ? 'text-green-400' : 'text-white'} hover:text-green-400`}>
    <div className="relative inline-flex items-center">
      <span>Create Request</span>
      {loadingRequestsCount 
        ? <ClipLoader color="#ffffff" loading={loadingRequestsCount} css={override} size={20} /> 
        : requestsCount > 0 &&
          <div className="bg-red-500 text-white font-bold rounded-full w-6 h-6 text-xs flex items-center justify-center shadow-md absolute -top-1 -right-10">
            {requestsCount}
          </div>
      }
    </div>
  </Link>
))}

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
      <div className="flex-1 p-4 md:p-8 md:ml-48  overflow-y-auto">
        <div className="md:hidden mb-4">
          <button onClick={toggleMenu} className="text-blue-800">
            <FontAwesomeIcon
              icon={isMenuOpen ? faTimes : faBars}
              className="text-2xl"
            />
          </button>
        </div>
        <Routes>
          <Route path="create-request" element={<CreateRequest />} />
          <Route path="view-requests" element={<ViewRequests />} />
          <Route path="update-request/:id" element={<UpdateRequest />} />
        </Routes>
      </div>
    </div>
  );

};

export default StudentDashboard;

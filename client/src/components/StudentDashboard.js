import { css } from '@emotion/react';
import { faBars, faSignOutAlt, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import axios from 'axios';
import { AiOutlineForm, AiOutlineIdcard } from 'react-icons/ai';
import { BsFillPersonFill } from 'react-icons/bs';
import { animated, useSpring } from 'react-spring';

import clsx from 'clsx'; // Add this import to use the clsx utility
import React, { useCallback, useEffect, useState } from 'react';
import { Link, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import ClipLoader from "react-spinners/ClipLoader";
import { useRequest } from '../contexts/RequestContext';
import frederickLogo from '../images/frederick-white-logo-1.png';
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
  const [shouldShowInProgress, setShouldShowInProgress] = useState(false);
  const [showCreateRequest, setShowCreateRequest] = useState(true);

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
    fetchLatestRequestStatus();
  }, [fetchRequestsCount, fetchLatestRequestStatus, latestRequestStatus]);

  useEffect(() => {
    const userEmail = localStorage.getItem('userEmail');
    if (userEmail) {
      setEmail(userEmail);
    }
  }, []);

  useEffect(() => {
    const inProgressStatuses = ["admin_reviewed", "submitted", "requires_more_info"];
    setShouldShowInProgress(inProgressStatuses.includes(latestRequestStatus));
    setShowCreateRequest(!inProgressStatuses.includes(latestRequestStatus) && latestRequestStatus !== "approved");
  }, [latestRequestStatus]);

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
        className={`bg-blue-800 shadow-md fixed inset-y-0 left-0 z-10 transform transition-transform duration-300 w-60 md:w-62 ${
          isMenuOpen ? 'translate-x-0' : '-translate-x-full'
        } md:relative md:translate-x-0`}
      >
        <div className="flex justify-between items-center mb-8 mt-12">
          <Link to="#">
          <img
              src={frederickLogo}
              alt="Logo of Frederick University"
              className="w-60 h-8 object-cover md:mt-6 ml-4"
            />

          </Link>
          <div className="md:hidden">
            <button onClick={toggleMenu} className="text-white">
              <FontAwesomeIcon icon={faTimes} className="text-2xl" />
            </button>
          </div>
        </div>
        <div className="md:text-left px-8 mt-12">
          <div className="relative inline-flex items-center"> 
              <BsFillPersonFill className="text-white text-2xl mr-2" size={17}/>
              <span className="font-semibold text-orange-400">{role}</span>
            </div>
          <p className="text-sm text-gray-100 ">{email}</p>
        </div>
        <nav className="flex flex-col items-center md:justify-start py-48 md:mt-0 w-full">
          <Link to="view-requests" className={`w-full text-center text-lg  py-4  ${isActive('view-requests') ? 'text-white bg-blue-700' : 'text-white'}  hover:bg-blue-900 py-2 rounded-md`} >
          <div className="relative inline-flex items-center">

          <AiOutlineIdcard className="text-white text-2xl mr-2" size={20}/>

          <span>View Requests</span>
            </div>

          </Link>
          {
          shouldShowInProgress ? (
            <animated.div
              style={scaleProps}
              className="text-lg md:text-lg lg:text-lg my-4 mr-2  font-bold text-blue-200 transition-all duration-300 transform hover:scale-105"
            >
              Request in progress.
            </animated.div>
          ) : showCreateRequest ? (
            <Link to="create-request" className={`w-full text-center text-lg py-4 ${isActive('create-request') ? 'text-white bg-blue-700' : 'text-white'} hover:bg-blue-900 py-2 rounded-md`}>
              <div className="relative inline-flex items-center">
                {/* put the icon here */}
                <AiOutlineForm className="text-white text-2xl mr-2" size={20}/>
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
          ) : null
        }
        </nav>
        <div className="fixed bottom-0 left-0 w-full flex justify-center py-4 bg-blue-800 md:absolute md:bg-transparent px-4">
          <button
            className="px-10 py-8 flex items-center text-white text-xl hover:text-red-400 font-bold duration-300 transform"
            onClick={handleLogout}
          >
            <FontAwesomeIcon icon={faSignOutAlt} className="mr-2" />
            Logout
          </button>
        </div>
      </div>
      <div className={clsx("flex-1 p-4 md:p-8 overflow-y-auto", {
        "md:ml-8": !isMenuOpen,
        "md:ml-16": isMenuOpen  // Adjust the left margin to your preference when the navbar is shown
      })}> 
      
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

import { css } from '@emotion/react';
import { faBars, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { BiLogOut, BiNotification, BiTable } from 'react-icons/bi';
import { BsFillPersonFill } from 'react-icons/bs';
import { MdPendingActions } from 'react-icons/md';
import { Link, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import ClipLoader from "react-spinners/ClipLoader";
import { NewRequestCountContext } from '../contexts/RequestContext'; 
import frederickLogo from '../images/frederick-white-logo.png';
import AllRequests from './AllRequests';
import NewRequests from './NewRequests';
import OpenRequests from './OpenRequests';
import OpenRequestsDetails from './OpenRequestsDetails';

// Loader CSS override
const override = css`
  display: inline-block;
  margin-left: 5px;
`;

const AdminDashboard = ({ role }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [email, setEmail] = useState(''); 

  // updated these lines
  const { newRequestsCount, loadingNewRequestsCount, fetchNewRequestsCount } = useContext(NewRequestCountContext);

  useEffect(() => {
    fetchNewRequestsCount();
  }, [fetchNewRequestsCount]);

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
  

  return (
    <div className="h-screen flex flex-col md:flex-row overflow-hidden bg-gray-100">
      <div
        className={`bg-blue-800 shadow-md fixed inset-y-0 left-0 z-10 transform transition-transform duration-300 w-60 md:w-62 ${
          isMenuOpen ? 'translate-x-0' : '-translate-x-full'
        } md:relative md:translate-x-0`}
      >
        <div className="flex items-center mb-8 mt-8 ml-4">
        <Link to="#">
          <img
              src={frederickLogo}
              alt="Logo of Frederick University"
              className="w-60 h-8 object-cover md:mt-6 ml-2"
            />

          </Link>
          <div className="md:hidden">
            <button onClick={toggleMenu} className="text-white">
              <FontAwesomeIcon icon={faTimes} className="text-2xl" />
            </button>
          </div>
        </div>
        <div className="md:text-left px-8">
          <div className="relative inline-flex items-center">
              <BsFillPersonFill className="text-white text-2xl mr-2" size={17}/>
              <span className="font-semibold text-orange-400">{role}</span>
            </div>
          <p className="text-sm text-gray-100 ">{email}</p>
        </div>
        <nav className="flex flex-col items-center md:justify-start py-48 md:mt-0 w-full">
        <Link to="new-requests" className={`w-full text-center py-4 ${isActive('new-requests') ? 'text-white bg-blue-700' : 'text-white'}  hover:bg-blue-900 py-2 rounded-md`} >
          <div className="relative inline-flex items-center">
              {/* place notification icon next to new requests */}
              <BiNotification className="text-white mr-2" size={18}/>
              <span>New Requests</span>
              {loadingNewRequestsCount 
                  ? <ClipLoader color="#ffffff" loading={loadingNewRequestsCount} css={override} size={20} /> 
                  : 
                  <div class="w-6 inline-block">
                      {newRequestsCount > 0 &&
                          <span class="relative flex h-3 w-3 mb-4 ml-2">
                              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                              <span class="relative inline-flex rounded-full h-3 w-3 bg-sky-200"></span>
                          </span>
                      }
                  </div>
              }
          </div>
      </Link>

          <Link to="open-requests" className={`w-full text-center py-4 ${isActive('open-requests') ? 'text-white bg-blue-700' : 'text-white'}  hover:bg-blue-900 py-2 rounded-md`} >
          <div className="relative inline-flex items-center mr-5">
            <MdPendingActions className="text-white mr-2" size={18}/>
            <span>Open Requests</span>
            </div>
          </Link>
          <Link to="all-requests" className={`w-full text-center py-4 ${isActive('all-requests') ? 'text-white bg-blue-700' : 'text-white'}  hover:bg-blue-900 py-2 rounded-md`} >
          <div className="relative inline-flex items-center mr-2">
            <BiTable className="text-white mr-2" size={18}/>
            <span>Closed Requests</span>
          </div>
          </Link>
        </nav>
        <div className="fixed bottom-16 w-full flex justify-center py-4 hover:bg-blue-900 rounded-md bg-blue-800 md:absolute md:bg-transparent">
          <button
            className="px-10 flex items-center text-white text-xl mr-5"
            onClick={handleLogout}
          >
            <BiLogOut className="text-white mr-2" size={20}/>
            <span>Logout</span>
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
          <Route path="new-requests" element={<NewRequests fetchNewRequestsCount={fetchNewRequestsCount} />} />
          <Route path="open-requests" element={<OpenRequests />} /> 
          <Route path="open-requests/:id" element={<OpenRequestsDetails />} /> 
          <Route path="all-requests" element={<AllRequests />} />
        </Routes>
      </div>
    </div>
  );
  
};

export default AdminDashboard;

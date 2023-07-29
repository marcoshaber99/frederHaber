import { faBars, faSignOutAlt, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import clsx from 'clsx';
import React, { useCallback, useEffect, useState } from 'react';
import { BiTable } from 'react-icons/bi';
import {BsFillPersonFill} from 'react-icons/bs';
import { MdPendingActions } from 'react-icons/md';
import { Link, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import frederickLogo from '../images/frederick-white-logo.png';
import AllRequests from './AllRequests';
import PendingApproval from './PendingApproval';

const ManagerDashboard = ({ role }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [email, setEmail] = useState('');  

  useEffect(() => {
    const userEmail = localStorage.getItem('userEmail');
    if (userEmail) {
      setEmail(userEmail);
    }
  }, []);

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
    <div className="h-screen flex flex-col md:flex-row overflow-hidden bg-gray-100">
      <div
        className={`bg-blue-800 shadow-md fixed inset-y-0 left-0 z-10 transform transition-transform duration-300 w-60 md:w-62 ${
          isMenuOpen ? 'translate-x-0' : '-translate-x-full'
        } md:relative md:translate-x-0`}
      >
        <div className="flex justify-between items-center mb-8 mt-8">
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
        <div className="md:text-left px-8">
          <div className="relative inline-flex items-center"> 
              <BsFillPersonFill className="text-white text-2xl mr-2" size={17}/>
              <span className="font-semibold text-orange-400">{role}</span>
            </div>
          <p className="text-sm text-gray-100 ">{email}</p>
        </div>
        <nav className="flex flex-col items-center md:justify-start py-48 md:mt-0 w-full">
          <Link to="all-requests" className={`w-full text-center text-lg  py-4  ${isActive('all-requests') ? 'text-white bg-blue-700' : 'text-white'}  hover:bg-blue-900 py-2 rounded-md`} >
          <div className="relative inline-flex items-center mr-2">
            {/* place icon next to closed requests */}
            <BiTable className="text-white mr-2" size={18}/>
            <span>Closed Requests</span>
          </div>          </Link>
          <Link to="pending-approval" className={`w-full text-center text-lg  py-4  ${isActive('pending-approval') ? 'text-white bg-blue-700' : 'text-white'}  hover:bg-blue-900 py-2 rounded-md`} >
          <div className="relative inline-flex items-center">

            <MdPendingActions className="text-white text-2xl mr-2" size={20}/>
            <span>Pending Approval</span>

            </div>
          </Link>
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
        "md:ml-16": isMenuOpen 
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
          <Route path="all-requests" element={<AllRequests />} />
          <Route path="pending-approval" element={<PendingApproval />} />
        </Routes>
      </div>
    </div>
  );
};

export default ManagerDashboard;

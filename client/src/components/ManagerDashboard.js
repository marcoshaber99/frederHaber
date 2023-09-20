import { css } from '@emotion/react';

import { faBars, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import clsx from 'clsx';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { BiLogOut, BiTable } from 'react-icons/bi';
import { BsFillPersonFill } from 'react-icons/bs';
import { MdPendingActions } from 'react-icons/md';
import { Link, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import ClipLoader from "react-spinners/ClipLoader";
import { PendingApprovalCountContext } from '../contexts/RequestContext';
import frederickLogo from '../images/frederick-white-logo.png';
import AllRequests from './AllRequests';
import PendingApproval from './PendingApproval';

const override = css`
  display: inline-block;
  margin-left: 5px;
`;

const ManagerDashboard = ({ role }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [email, setEmail] = useState('');  


    const { pendingApprovalsCount, loadingPendingApprovalsCount, fetchPendingApprovalsCount } = useContext(PendingApprovalCountContext);

    useEffect(() => {
      fetchPendingApprovalsCount();
    }, [fetchPendingApprovalsCount]);


    useEffect(() => {
      const updateEmail = () => {
        const userEmail = localStorage.getItem('userEmail');
        if (userEmail) {
          setEmail(userEmail);
        }
      };
      // Initially set  email
      updateEmail();
    
      // Set up a listener for changes in localStorage
      window.addEventListener('storage', updateEmail);
    
      // Clean up the event listener
      return () => {
        window.removeEventListener('storage', updateEmail);
      };
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
        <div className="flex items-center mb-8 mt-8 ml-2">
        <Link to="#">
          <img
              src={frederickLogo}
              alt="Logo of Frederick University"
              className="w-60 h-8 object-cover md:mt-6 ml-2"
            />

          </Link>
          <div className="md:hidden">
            <button onClick={toggleMenu} className="text-white">
              <FontAwesomeIcon icon={faTimes} className="text-2xl mr-3 mt-1" />
            </button>
          </div>
        </div>
        <div className="md:text-left px-8 group">

            <div className="relative inline-flex items-center">
                <BsFillPersonFill className="text-white text-2xl mr-2" size={17}/>
                <span className="font-semibold text-orange-400">{role}</span>
              </div>
              <div className="relative text-sm text-gray-100 max-w-md hover:cursor-pointer">
              <span className="truncate block group-hover:underline" title={email}>
                {email}
              </span>
              {/* Custom Tooltip */}
              <div className="absolute left-0 bottom-full mb-2 text-xs text-gray-800 bg-white p-1 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 ease-in-out">
                {email}
              </div>
            </div>
        </div>
        <nav className="flex flex-col items-center md:justify-start py-48 md:mt-0 w-full">

          <Link to="pending-approval" className={`w-full text-center py-4 ${isActive('pending-approval') ? 'text-white bg-blue-700' : 'text-white'}  hover:bg-blue-900 py-2 rounded-md`} >
          <div className="relative inline-flex items-center">

            <MdPendingActions className="text-white mr-2" size={20}/>
            <span>Pending Approval</span>

            {loadingPendingApprovalsCount 
                ? <ClipLoader color="#ffffff" loading={loadingPendingApprovalsCount} css={override} size={20} /> 
                : 
                <div className="w-6 inline-block">
                    {pendingApprovalsCount > 0 &&
                        <span className="relative flex h-3 w-3 mb-4 ml-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-300"></span>
                        </span>
                    }
                </div>
            }


            </div>
          </Link>
          <Link to="all-requests" className={`w-full text-center  py-4  ${isActive('all-requests') ? 'text-white bg-blue-700' : 'text-white'}  hover:bg-blue-900 py-2 rounded-md`} >
            <div className="relative inline-flex items-center mr-2">
              <BiTable className="text-white mr-2" size={18}/>
              <span>Approved Requests</span>
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
      <div className={clsx("flex-1 p-4 md:p-8 overflow-y-auto", {
              "md:ml-8": !isMenuOpen,
              "md:ml-16": isMenuOpen 
            })}>

        <div className="md:hidden mb-4">
          <button onClick={toggleMenu} className="text-blue-800">
            <FontAwesomeIcon
              icon={isMenuOpen ? faTimes : faBars}
              className="text-2xl mr-3 mt-1"
            />
          </button>
        </div>
        <Routes>
          <Route path="all-requests" element={<AllRequests role={role} />} />
          <Route path="pending-approval" element={<PendingApproval fetchPendingApprovalsCount={fetchPendingApprovalsCount} />} />
        </Routes>
      </div>
    </div>
  );
};

export default ManagerDashboard;

import { css } from "@emotion/react";
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import ClipLoader from "react-spinners/ClipLoader";
import ActivateAccount from './components/ActivateAccount';
import AdminDashboard from './components/AdminDashboard';
import ForgotPasswordForm from './components/ForgotPasswordForm';
import LoginForm from './components/LoginForm';
import Logout from './components/Logout';
import ManagerDashboard from './components/ManagerDashboard';
import RegisterForm from './components/RegisterForm';
import ResetPasswordForm from './components/ResetPasswordForm';
import StudentDashboard from './components/StudentDashboard';
import { LanguageProvider } from './contexts/LanguageContext';
import { RequestContextProvider } from './contexts/RequestContext'; 


const override = css`
  display: block;
  margin: 0 auto;
  border-color: red;
`;

const App = () => {
  const [currentUserRole, setCurrentUserRole] = useState(undefined);
  const [currentUserEmail, setCurrentUserEmail] = useState(undefined);

  const verifyToken = async (token) => {
    try {
      const response = await axios.post(
        `http://localhost:5001/api/auth/verify-token`, 
        {}, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCurrentUserRole(response.data.userRole);
      setCurrentUserEmail(response.data.userEmail);
    } catch (error) {
      localStorage.removeItem('token');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userEmail');
      setCurrentUserRole(null);
      setCurrentUserEmail(null);
    }
};


useEffect(() => {
  const token = localStorage.getItem('token');
  if (token) {
    verifyToken(token);
  } else {
    setCurrentUserRole(null);
    setCurrentUserEmail(null);
  }
}, []);

  if (currentUserRole === undefined || currentUserEmail === undefined) {
    return <div className="sweet-loading">
                <ClipLoader color="#123abc" loading={true} css={override} size={150} />
           </div>;
  }

  return (
    <LanguageProvider>

    <Router>
      <Routes>
        <Route path="/" element={<LoginForm setCurrentUserRole={setCurrentUserRole} setCurrentUserEmail={setCurrentUserEmail} />} />

        <Route path="/register" element={<RegisterForm />} />

        <Route path="/login" element={<LoginForm setCurrentUserRole={setCurrentUserRole} setCurrentUserEmail={setCurrentUserEmail} />} />

        <Route path="/logout" element={<Logout />} />

        <Route path="/activate/:token" element={<ActivateAccount />} />

        <Route path="/reset-password/:token" element={<ResetPasswordForm />} />

        <Route path="/forgot-password" element={<ForgotPasswordForm />} />


        <Route
          path="/student-dashboard/*"
           element={
              currentUserRole === 'student' ? (
                <RequestContextProvider> 
                  <StudentDashboard email={currentUserEmail} role={currentUserRole} />
                </RequestContextProvider>
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
        <Route
          path="/admin-dashboard/*"
          element={
            currentUserRole === 'admin' ? (
              <RequestContextProvider> 
                <AdminDashboard email={currentUserEmail} role={currentUserRole} />
              </RequestContextProvider>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="/manager-dashboard/*"
          element={
            currentUserRole === 'manager' ? (
              <RequestContextProvider> 
                <ManagerDashboard email={currentUserEmail} role={currentUserRole} />
              </RequestContextProvider>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />


      </Routes>
    </Router>
    </LanguageProvider>

  );
};

export default App;
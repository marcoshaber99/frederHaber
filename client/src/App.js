import React, { useEffect, useState } from 'react';
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import ActivateAccount from './components/ActivateAccount/ActivateAccount';
import AdminDashboard from './components/AdminDashboard';
import ForgotPasswordForm from './components/ForgotPasswordForm';
import LoginForm from './components/LoginForm';
import Logout from './components/Logout';
import ManagerDashboard from './components/ManagerDashboard';
import RegisterForm from './components/RegisterForm';
import ResetPasswordForm from './components/ResetPasswordForm';
import StudentDashboard from './components/StudentDashboard';
// import UpdateRequest from './components/UpdateRequest';


const App = () => {
  const [currentUserRole, setCurrentUserRole] = useState(null);
  const [currentUserEmail, setCurrentUserEmail] = useState(null);

  useEffect(() => {
    const storedUserRole = localStorage.getItem('userRole');
    const storedUserEmail = localStorage.getItem('userEmail');
    if (storedUserRole && storedUserEmail) {
      setCurrentUserRole(storedUserRole);
      setCurrentUserEmail(storedUserEmail);
    }
  }, []);

  return (
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
                <StudentDashboard email={currentUserEmail} role={currentUserRole} />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
        <Route
          path="/admin-dashboard"
          element={
            currentUserRole === 'admin' ? (
              <AdminDashboard email={currentUserEmail} role={currentUserRole} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/manager-dashboard"
          element={
            currentUserRole === 'manager' ? (
              <ManagerDashboard email={currentUserEmail} role={currentUserRole} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        {/* <Route path="/update-request/:id" element={<UpdateRequest />} /> */}

        
      </Routes>
    </Router>
  );
};

export default App;

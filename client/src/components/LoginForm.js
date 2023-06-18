import axios from 'axios';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import frederickLogo from '../images/frederick-university-logo.png';
import RoleSelection from './RoleSelection';


const LoginForm = ({ setCurrentUserRole, setCurrentUserEmail }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [showRoleSelection, setShowRoleSelection] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      const response = await axios.post(`http://localhost:5001/api/auth/login`, { email, password });
      setMessage('Logged in successfully');

      // Store the token in local storage
      localStorage.setItem('token', response.data.token);

      if (response.data.userRole === 'student') {
        
        localStorage.setItem('userEmail', response.data.userEmail);
        setCurrentUserEmail(response.data.userEmail);

        
        localStorage.setItem('userRole', response.data.userRole);
        setCurrentUserRole(response.data.userRole);
        
        navigate('/student-dashboard/view-requests');
      } else if (response.data.userRole === 'admin' || response.data.userRole === 'manager') {
        if (response.data.firstLogin) {
          setShowRoleSelection(true);
        } else {
          localStorage.setItem('userRole', response.data.userRole);
          setCurrentUserRole(response.data.userRole);
          navigate(response.data.userRole === 'admin' ? '/admin-dashboard' : '/manager-dashboard');
        }
      }
    } catch (error) {
      if (error.response) {
        setMessage(error.response.data.message);
      } else {
        setMessage('Error logging in');
      }
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Link to="/">
      <img
      src={frederickLogo}
      alt="Frederick University Logo"
      className="w-48 mt-6 ml-6" 
    />
      </Link>
    
    <div className="bg-white h-2/3 w-full">
      <div className="flex justify-center">
        <div className="bg-white py-12 px-20 rounded-lg shadow-xl mt-12 w-120"> 
          <h1 className="text-3xl font-semibold mb-4">Log into your account</h1> 
          <p className="text-base mb-4">
            If you don't have an account,{' '}
            <Link to="/register" className="text-blue-600">
              Register here!
            </Link>
          </p>
          <form onSubmit={handleSubmit} className="mt-4 space-y-2"> 
              <label htmlFor="email" className="block text-gray-700 font-semibold pt-3">
                Email
              </label>
              <input
                type="email"
                id="email"
                placeholder="Enter email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 mb-4 placeholder-gray-500 border border-gray-300 rounded-md focus:outline-none focus:border-blue-400"
              />
              <label htmlFor="password" className="block text-gray-700 font-semibold pt-5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  placeholder="Enter your password here"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-3 py-2 mb-4 placeholder-gray-500 border border-gray-300 rounded-md focus:outline-none focus:border-blue-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-500"
                >
                  {showPassword ? (
                    <i className="fas fa-eye-slash"></i>
                  ) : (
                    <i className="fas fa-eye"></i>
                  )}
                </button>
              </div>
              <p className="mt-1 text-blue-500 text-right pt-2">
                <Link to="/forgot-password">Forgot Password?</Link>
              </p>
              <button
                type="submit"
                className="w-full py-2 bg-blue-700 text-white font-semibold rounded-md hover:bg-blue-800 transition duration-200"
              >
                Login
              </button>
            </form>
            
            {message && (
              <p
                className={`mt-4 text-center ${
                  message.startsWith('Logged in successfully')
                    ? 'text-green-600'
                    : 'text-red-500'
                }`}
              >
                {message}
              </p>
            )}

            {showRoleSelection && (
              <RoleSelection
                email={email}
                onSuccess={(userRole) => {
                  setCurrentUserRole(userRole);
                  navigate(
                    userRole === 'admin' ? '/admin-dashboard' : '/manager-dashboard'
                  );
                }}
              />
            )}

           
          </div>
        </div>
      </div>
      <div className="bg-blue-800 w-full h-1/3"></div>
    </div>
  );
};

export default LoginForm;


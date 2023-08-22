import axios from 'axios';
import React, { useState } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import frederickLogo from '../images/frederick-university-logo.png';

const RegisterForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validatePasswordComplexity = (password) => {
    // Require at least 5 characters and one number
    const regex = /^(?=.*\d)[A-Za-z\d]{5,}$/;
    return regex.test(password);
  };
  const validateInput = () => {
    let valid = true;

    // Email validation
    if (!email.includes('@')) {
      setEmailError('Must be a valid email');
      valid = false;
    } else {
      setEmailError('');
    }

    // Password validation
    if (password.length < 5) {
      setPasswordError('Password must be at least 5 characters long');
      valid = false;
    } else {
      setPasswordError('');
    }

    // Password complexity validation
    if (!validatePasswordComplexity(password)) {
      setPasswordError('Password must be at least 5 characters long and contain at least one number');
      valid = false;
    } else {
      setPasswordError('');
    }

  return valid;
};

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
  
    // Validate input before making API request
    if (!validateInput()) {
      return;
    }
  
    setIsLoading(true);
  
    try {
      const response = await axios.post('http://localhost:5001/api/auth/register', { email, password });
      setMessage(response.data.message);
    } catch (error) {
      if (error.response && error.response.data.errors) {
        const serverErrors = error.response.data.errors.map((err) => err.msg);
        setMessage(serverErrors.join('. '));
      } else {
        setMessage('Error registering user');
      }
    } finally {
      setIsLoading(false);
    }
  };
  

  return (
    <div className="flex flex-col min-h-screen">
       <Link to="#">
          <img
  src={frederickLogo}
  alt="Logo of Frederick University"
  className=" object-cover md:mt-6 ml-8"
/>

          </Link>
      <div className="bg-white h-2/3 w-full">
      <div className="flex justify-center">
  <div className="bg-white py-12 px-20 rounded-lg shadow-xl mt-12 max-w-lg">
    <h1 className="text-3xl font-semibold mb-4">Register</h1>
            <p className="text-base mb-4">
              If you already have an account,{' '}
              <Link to="/login" className="text-blue-600">
                Login here!
              </Link>
            </p>
            <div className="w-full">
              <form onSubmit={handleSubmit} className="space-y-2">
                <div>
                  <label htmlFor="email" className="block text-gray-700 font-semibold py-2">
                    Email
                  </label>
                  <input
                  type="email"
                  placeholder="Enter email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-3 py-2 mb-4 placeholder-gray-500 border border-gray-300 rounded-md focus:outline-none focus:border-blue-400"
                />
                <div className="h-6 mt-1 text-red-500 transition-all duration-300 ease-in-out">
                    {emailError && (
                      <div className="flex flex-wrap">
                        {emailError}
                      </div>
                    )}
                  </div>
                </div>
                <div>
      <label htmlFor="password" className="block text-gray-700 font-semibold py-2">Password</label>
      <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-3 py-2 mb-4 placeholder-gray-500 border border-gray-300 rounded-md focus:outline-none focus:border-blue-400"
          />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-3 text-gray-500"
          title={showPassword ? "Hide password" : "Show password"} // Tooltip
        >
          {showPassword ? <FaEyeSlash /> : <FaEye />}
        </button>

        </div>
        <div className="mt-1 text-red-500 transition-all duration-300 ease-in-out break-words">
          {passwordError && (
            <div className="flex flex-wrap">
              {passwordError}
            </div>
          )}
        </div>
      </div>
      <button
            type="submit"
            className="w-full py-2 bg-blue-700 text-white font-semibold rounded-md hover:bg-blue-800 transition duration-200"
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : 'Register'}
          </button>
              </form>
              {message && (
            <div className="mt-4 text-center">
              <div
                className={`text-center max-w-sm mx-auto ${
                  message.startsWith('User registered successfully')
                    ? 'text-green-600'
                    : 'text-red-500'
                }`}
              >
                {message.startsWith('User registered successfully')
                  ? message.split('. ').map((line, index) => (
                      <React.Fragment key={index}>
                        {line}
                        {index < message.split('. ').length - 1 ? <br /> : null}
                      </React.Fragment>
                    ))
                  : message}
              </div>
            </div>
              )}

            </div>
          </div>
        </div>
      </div>
      <div className="bg-blue-800 w-full h-1/3"></div>
    </div>
  );
};

export default RegisterForm;
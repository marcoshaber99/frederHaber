import axios from 'axios';
import React, { useState } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import frederickLogo from '../images/frederick-university-logo.png';
import gmailLogo from '../images/icon-gmail.svg';
import outlookLogo from '../images/icon-outlook.svg';


const RegisterForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessCard, setShowSuccessCard] = useState(false);

  const validatePasswordComplexity = (password) => {
    const regex = /^(?=.*\d)[A-Za-z\d]{5,}$/;
    return regex.test(password);
  };

  const validateInput = () => {
    let valid = true;

    if (!email.includes('@')) {
      toast.error('Must be a valid email');
      valid = false;
    }

    if (password.length < 5) {
      toast.error('Password must be at least 5 characters long');
      valid = false;
    }

    if (!validatePasswordComplexity(password)) {
      toast.error('Password must be at least 5 characters long and contain at least one number');
      valid = false;
    }

    return valid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateInput()) {
      return;
    }

    setIsLoading(true);

    try {
      await axios.post('http://localhost:5001/api/auth/register', { email, password });
      setShowSuccessCard(true);
    } catch (error) {
      if (error.response && error.response.data.errors) {
        const serverErrors = error.response.data.errors.map((err) => err.msg);
        toast.error(serverErrors.join('. '));
      } else {
        toast.error('Error registering user');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
    <ToastContainer />
    <Link to="#">
      <img
        src={frederickLogo}
        alt="Logo of Frederick University"
        className="object-cover md:mt-6 ml-8"
      />
    </Link>
    <div className="bg-white h-2/3 w-full">
      <div className="flex justify-center">
      {showSuccessCard ? (
  <div className="bg-gray-100 py-12 px-20 rounded-lg shadow-xl mt-12 max-w-lg border border-gray-300">
    <h1 className="text-3xl font-semibold text-gray-700 mb-4">Check your email</h1>
    <p className="text-base text-gray-700 mb-4">
      We've sent a message to <strong className="text-gray-700">{email}</strong> with a link to activate your account.
    </p>
    <div className="flex justify-start space-x-4 mb-4">
      <button onClick={() => window.open('https://mail.google.com', '_blank')}>
        <img src={gmailLogo} alt="Gmail" className="w-8 h-8" title="Open Gmail"/>
      </button>
      <button onClick={() => window.open('https://outlook.live.com', '_blank')}>
        <img src={outlookLogo} alt="Outlook" className="w-8 h-8" title="Open Outlook"/>
      </button>
    </div>
    <p className="text-sm text-gray-600 mt-4">
      Didn't get an email? Check your spam folder!
    </p>
    <button 
      className="bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600 transition duration-200 px-4 py-2 mt-4"
      onClick={() => setShowSuccessCard(false)}
    >
      Go back to Register
    </button>
  </div>
) : (
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
                  </div>
                  <div>
                    <label htmlFor="password" className="block text-gray-700 font-semibold py-2">
                      Password
                    </label>
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
                        title={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
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
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="bg-blue-800 w-full h-1/3"></div>
    </div>
  );
};

export default RegisterForm;

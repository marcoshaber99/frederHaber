import axios from 'axios';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import frederickLogo from '../images/frederick-university-logo.png';

const ForgotPasswordForm = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      const response = await axios.post('http://localhost:5001/api/password/forgot-password', { email });
      setMessage(response.data.message);
    } catch (error) {
      if (error.response) {
        setMessage(error.response.data.message);
      } else {
        setMessage('Error sending reset password email');
      }
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* direct user to login form when clicking the logo */}
        <Link to="/">
                  <img
          src={frederickLogo}
          alt="Logo of Frederick University"
          className=" object-cover md:mt-6 ml-8"
        />

          </Link>
      <div className="bg-white h-2/3 w-full">
        <div className="flex justify-center">
          <div className="bg-white py-12 px-16 rounded-lg shadow-xl mt-12 w-96">
            <h1 className="text-2xl font-semibold mb-2">Forgot Password</h1>
            <form onSubmit={handleSubmit} className="mt-4 space-y-3">
              <div>
                <label htmlFor="email" className="block text-gray-700 font-semibold mb-1">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="Enter email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-3 py-2 placeholder-gray-500 border border-gray-300 rounded-md focus:outline-none focus:border-blue-400"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2  bg-blue-700 text-white font-semibold rounded-md hover:bg-blue-800 transition duration-200"
              >
                Send Reset Email
              </button>
            </form>
            {message && (
              <p className={`mt-4 text-center ${message.startsWith('Password') ? 'text-green-600' : 'text-red-500'}`}>{message}</p>
            )}
          </div>
        </div>
      </div>
      <div className="bg-blue-800 w-full h-1/3"></div>
    </div>
  );
};

export default ForgotPasswordForm;

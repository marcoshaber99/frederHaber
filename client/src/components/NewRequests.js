import { css } from "@emotion/react";
import axios from 'axios';
import React, { useCallback, useEffect, useState } from 'react';
import ClipLoader from "react-spinners/ClipLoader";

const NewRequests = () => {
  const [newRequests, setNewRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const override = css`
    display: block;
    margin: 0 auto;
    border-color: red;
  `;

  const fetchNewRequests = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5001/api/scholarship/get-new-requests', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      setNewRequests(response.data.requests);
    } catch (error) {
      console.error('Error fetching new requests:', error);
    }
  }, []);

  useEffect(() => {
    fetchNewRequests();
  }, [fetchNewRequests]);

  const handleRequestSelect = (request) => {
    setSelectedRequest(request);
  };

  const requestMoreInfo = async () => {
    if (!selectedRequest) {
      return;
    }
  
    setSuccess(false);
    setError(null);
  
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`http://localhost:5001/api/scholarship/update-request-status/${selectedRequest.id}`, {
        status: 'requires_more_info',
      }, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
  
      // Set success message and start loading animation
      setSuccess(true);
      setLoading(true);
      
      // Clear the selected request, success message, stop the loading animation, and refresh the list of new requests after a delay
      setTimeout(async () => {
        setSelectedRequest(null);
        setSuccess(false);
        setLoading(false);
        await fetchNewRequests();
      }, 3000);
    } catch (error) {
      console.error('Error requesting more info:', error);
      setError('Error requesting more info.');
    }
  };
  

  return (
    <div className="max-w-6xl mx-auto mt-10 p-5">
      <h2 className="text-2xl font-semibold mb-6">New Scholarship Requests</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {newRequests.map((request) => (
        <div
          key={request.id}
          className={`bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition duration-200 transform hover:scale-105 cursor-pointer 
          ${selectedRequest && selectedRequest.id === request.id ? 'border-2 border-blue-500' : ''}`}
          onClick={() => handleRequestSelect(request)}
        >
          <h3 className="font-semibold text-lg mb-2 text-blue-500">{request.sport}</h3>
          <p className="text-gray-600 text-sm">
            {request.description.substring(0, 30) + (request.description.length > 30 ? "..." : "")}
          </p>
        </div>
      ))}
      </div>
      {selectedRequest && (
        <div className="mt-10">
          <h2 className="text-2xl font-semibold mb-6">Selected Request Details</h2>
          <div className="bg-white rounded-lg p-4 shadow-md">
            <p><strong>First Name:</strong> {selectedRequest.first_name}</p>
            <p><strong>Last Name:</strong> {selectedRequest.last_name}</p>
            <p><strong>Government ID:</strong> {selectedRequest.government_id}</p>
            <p><strong>Registration Number:</strong> {selectedRequest.registration_number}</p>
            <p><strong>Phone Number:</strong> {selectedRequest.phone_number}</p>
            <p><strong>Course Title:</strong> {selectedRequest.course_title}</p>
            <p><strong>Academic Year:</strong> {selectedRequest.academic_year}</p>
            <p><strong>Education Level:</strong> {selectedRequest.education_level}</p>
            <p><strong>City:</strong> {selectedRequest.city}</p>
            <p><strong>Sport:</strong> {selectedRequest.sport}</p>
            <p className="whitespace-normal overflow-wrap break-all w-2/3"><strong>Description:</strong> {selectedRequest.description}</p>
            <p><strong>Status:</strong> {selectedRequest.status}</p>
            {loading ? (
              <ClipLoader color="#123abc" loading={loading} css={override} size={50} />
            ) : (
              <button 
                onClick={requestMoreInfo} 
                className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-200 transform hover:scale-105" 
              >
                Ask for further information
              </button>
            )}
            {success && <p className="mt-2 text-green-500">Request for more information has been sent!</p>}
            {error && <p className="mt-2 text-red-500">{error}</p>}
          </div>
        </div>
      )}
    </div>
  );
};

export default NewRequests;
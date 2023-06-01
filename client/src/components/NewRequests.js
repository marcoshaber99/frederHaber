import { css } from "@emotion/react";
import axios from 'axios';
import React, { useCallback, useEffect, useState } from 'react';
import ClipLoader from "react-spinners/ClipLoader";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const NewRequests = () => {
  const [newRequests, setNewRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchingRequests, setFetchingRequests] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  const override = css`
    display: inline-block;
    margin: 0 5px;
  `;

  const fetchNewRequests = useCallback(async () => {
    setFetchingRequests(true);
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
      setFetchError('Error fetching new requests. Please try again later.');
    }
    setFetchingRequests(false);
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

    const confirm = window.confirm('Are you sure you want to ask for further information?');
    if (!confirm) {
      return;
    }

    setIsLoading(true);

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

      toast.success('Request for more information has been sent!', {
        position: toast.POSITION.BOTTOM_RIGHT,
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });

      setSelectedRequest(null);
      await fetchNewRequests();
    } catch (error) {
      console.error('Error requesting more info:', error);
      toast.error('Error requesting more info. Please try again.', {
        position: toast.POSITION.BOTTOM_RIGHT,
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }

    setIsLoading(false);
  };

  return (
    <div className="max-w-6xl mx-auto mt-10 p-5">
      <ToastContainer />
      <h2 className="text-2xl font-semibold mb-6">New Scholarship Requests</h2>
      {fetchingRequests ? (
        <ClipLoader color="#000000" loading={fetchingRequests} css={override} size={50} />
      ) : fetchError ? (
        <p>{fetchError}</p>
      ) : (
        <>
          {newRequests.length === 0 ? (
            <p>No new requests at the moment.</p>
          ) : (
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
          )}
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
            <button 
                  onClick={requestMoreInfo} 
                  className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-200 transform hover:scale-105" 
                  disabled={isLoading}
                >
                  {isLoading ? <ClipLoader color="#ffffff" loading={isLoading} css={override} size={20} /> : 'Ask for further information'}
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default NewRequests;

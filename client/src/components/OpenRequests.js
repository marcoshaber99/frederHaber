import { css } from "@emotion/react";
import axios from 'axios';
import React, { useCallback, useEffect, useState } from 'react';
import { FiDownload } from "react-icons/fi";
import ClipLoader from "react-spinners/ClipLoader";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { format } from 'date-fns';

const OpenRequests = () => {
  const [openRequests, setOpenRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [fetchingRequests, setFetchingRequests] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  const override = css`
    display: inline-block;
    margin: 0 5px;
  `;

  const fetchOpenRequests = useCallback(async () => {
    setFetchingRequests(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5001/api/scholarship/get-open-requests', {  // Update this with correct URL
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      setOpenRequests(response.data.requests);
    } catch (error) {
      console.error('Error fetching open requests:', error);
      setFetchError('Error fetching open requests. Please try again later.');
    }
    setFetchingRequests(false);
  }, []);

  useEffect(() => {
    fetchOpenRequests();
  }, [fetchOpenRequests]);

  const handleRequestSelect = (request) => {
    setSelectedRequest(request);
  };

  const downloadFile = async (key) => {
    try {
      const token = localStorage.getItem('token');  // Retrieve the token from local storage
      const response = await axios.get(`http://localhost:5001/api/scholarship/get-presigned-url/${key}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,  // Add the Authorization header
        },
      });
      const presignedUrl = response.data.presignedUrl;
  
      window.location.href = presignedUrl;
    } catch (err) {
      console.error(err);
      // Display a user-friendly message to inform the user that the file could not be downloaded
      alert('Failed to download file. Please try again later.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto mt-10 p-5">
      <ToastContainer />
      <h2 className="text-2xl font-semibold mb-6">Open Requests</h2>
      {fetchingRequests ? (
        <ClipLoader color="#000000" loading={fetchingRequests} css={override} size={50} />
      ) : fetchError ? (
        <p>{fetchError}</p>
      ) : (
        <>
          {openRequests.length === 0 ? (
            <p>No open requests at the moment.</p>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {openRequests.map((request) => (
                <div
                key={request.id}
                className={`bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition duration-200 transform hover:scale-105 cursor-pointer 
                ${selectedRequest && selectedRequest.id === request.id ? 'border-2 border-blue-500' : ''} overflow-auto`}
                onClick={() => handleRequestSelect(request)}
              >
                  <h3 className="font-semibold text-lg mb-2 text-blue-500">{request.sport}</h3>
                  <p className="text-gray-600 text-sm overflow-auto">
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
                <h3 className="font-semibold text-lg mb-2 text-blue-500">Student's Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-lg shadow-md">
                <p><strong>First Name:</strong> {selectedRequest.first_name}</p>
                <p><strong>Last Name:</strong> {selectedRequest.last_name}</p>
                <p><strong>Government ID:</strong> {selectedRequest.government_id}</p>
                <p><strong>Registration Number:</strong> {selectedRequest.registration_number}</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-md">
                <p><strong>Phone Number:</strong> {selectedRequest.phone_number}</p>
                <p><strong>Course Title:</strong> {selectedRequest.course_title}</p>
                <p><strong>Sport:</strong> {selectedRequest.sport}</p>
                <p><strong>Description:</strong> {selectedRequest.description}</p>
              </div>
            </div>
            <div className="flex flex-col mt-4 ml-4">
              <p><strong>Attached File: </strong></p>
              {selectedRequest.file_url && (
                <div className="mt-2">
                  <button 
                    onClick={() => downloadFile(selectedRequest.file_key)} 
                    className="flex items-center justify-center gap-2 px-4 py-2 text-white font-semibold bg-blue-800 rounded-md focus:outline-none hover:bg-blue-600"
                  >
                    <FiDownload className="w-4 h-4" />
                    Download File
                  </button>
                </div>
               )}
            </div>
            {selectedRequest.admin_full_name && (
              <div className="mt-10 mb-10 bg-gray-100 p-4 rounded-lg">
                <h3 className="font-semibold text-lg mb-2 text-blue-500">Admin's Review</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-lg shadow-md">
                    <p><strong>Admin Full Name:</strong> {selectedRequest.admin_full_name}</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-md">
                    <p><strong>Percentage:</strong> {selectedRequest.percentage}</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-md">
                    <p><strong>Scholarship Category:</strong> {selectedRequest.scholarship_category}</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-md">
                <p><strong>Other Scholarship:</strong> {selectedRequest.other_scholarship}</p>
              </div>
              {selectedRequest.other_scholarship === 'YES' && (
                <div className="bg-white p-4 rounded-lg shadow-md">
                  <p><strong>Other Scholarship Percentage:</strong> {selectedRequest.other_scholarship_percentage}</p>
                </div>
              )}
                  <div className="bg-white p-4 rounded-lg shadow-md">
                    <p><strong>Comments:</strong> {selectedRequest.comments}</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-md">
                    <p><strong>Date:</strong> {format(new Date(selectedRequest.created_at), 'MMMM dd, yyyy')}</p>
                  </div>
                </div>
              </div>
            )}

    </div>
  </div>
)}

        </>
      )}
    </div>
  );
};

export default OpenRequests;
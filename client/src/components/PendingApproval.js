import axios from 'axios';
import React, { useCallback, useEffect, useState } from 'react';
import ClipLoader from "react-spinners/ClipLoader";
import { css } from "@emotion/react";

const PendingApproval = () => {
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const override = css`
    display: inline-block;
    margin: 0 5px;
  `;

  const fetchPendingApprovalRequests = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5001/api/scholarship/get-pending-approval', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      setRequests(response.data.requests);
    } catch (error) {
      console.error('Error fetching pending approval requests:', error);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchPendingApprovalRequests();
  }, [fetchPendingApprovalRequests]);

  const handleRequestSelect = (request) => {
    setSelectedRequest(request);
  };

  return (
    <div className="max-w-6xl mx-auto mt-10 p-5">
      <h2 className="text-2xl font-semibold mb-6">Pending Approval</h2>
      {isLoading ? (
        <ClipLoader color="#000000" loading={isLoading} css={override} size={50} />
      ) : (
        <>
          {requests.length === 0 ? (
            <p>No pending approvals at the moment.</p>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {requests.map((request) => (
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
      <h3 className="font-semibold text-lg mb-2 text-blue-500">Student's Information</h3>
      <p><strong>First Name:</strong> {selectedRequest.first_name}</p>
      <p><strong>Last Name:</strong> {selectedRequest.last_name}</p>
      <p><strong>Government ID:</strong> {selectedRequest.government_id}</p>
      <p><strong>Registration Number:</strong> {selectedRequest.registration_number}</p>
      <p><strong>Phone Number:</strong> {selectedRequest.phone_number}</p>
      <p><strong>Course Title:</strong> {selectedRequest.course_title}</p>
      <p><strong>Sport:</strong> {selectedRequest.sport}</p>
      <p><strong>Description:</strong> {selectedRequest.description}</p>
      {selectedRequest.admin_full_name && (
        <div div className="mt-10 mb-10">
          <h3 className="font-semibold text-lg mb-2 text-blue-500">Admin's Review</h3>
          <p><strong>Admin Full Name:</strong> {selectedRequest.admin_full_name}</p>
          <p><strong>Percentage:</strong> {selectedRequest.percentage}</p>
          <p><strong>Scholarship Category:</strong> {selectedRequest.scholarship_category}</p>
          <p><strong>Other Scholarship:</strong> {selectedRequest.other_scholarship}</p>
          <p><strong>Other Scholarship Percentage:</strong> {selectedRequest.other_scholarship_percentage}</p>
          <p><strong>Comments:</strong> {selectedRequest.comments}</p>
          <p><strong>Date:</strong> {selectedRequest.date}</p>
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

export default PendingApproval;


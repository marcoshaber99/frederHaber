import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const NewRequests = () => {
  const [newRequests, setNewRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);

  useEffect(() => {
    const fetchNewRequests = async () => {
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
    };

    fetchNewRequests();
  }, []);

  const handleRequestSelect = (request) => {
    setSelectedRequest(request);
  };

  return (
    <div className="max-w-6xl mx-auto mt-10">
      <h2 className="text-2xl font-semibold mb-6">New Scholarship Requests</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {newRequests.map((request) => (
          <div
            key={request.id}
            className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition duration-200"
            onClick={() => handleRequestSelect(request)}
          >
            <h3 className="font-semibold text-xl mb-2">{request.sport}</h3>
            <p className="text-gray-600">{request.description}</p>
          </div>
        ))}
      </div>
      {selectedRequest && (
        <div className="mt-10">
          <h2 className="text-2xl font-semibold mb-6">Selected Request Details</h2>
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
          <p><strong>Description:</strong> {selectedRequest.description}</p>
          <p><strong>Status:</strong> {selectedRequest.status}</p>
        </div>
      )}
    </div>
  );
};

export default NewRequests;

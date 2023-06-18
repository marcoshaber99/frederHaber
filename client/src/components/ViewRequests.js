import { ClockIcon, CheckIcon, PencilIcon, TrashIcon } from '@heroicons/react/solid';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Link } from "react-router-dom";

const ViewRequests = () => {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5001/api/scholarship/get-requests', {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
        setRequests(response.data.requests);
      } catch (error) {
        console.error('Error fetching scholarship requests:', error);
      }
    };

    fetchRequests();
  }, []);

  const handleDelete = async (requestId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5001/api/scholarship/delete-request/${requestId}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      setRequests(requests.filter((request) => request.id !== requestId));
    } catch (error) {
      console.error('Error deleting scholarship request:', error);
    }
  };
  

  return (
      <div className="mt-10 ml-2">
        <h2 className="text-2xl font-semibold mb-6">
          View Scholarship Requests
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {requests.map((request) => (
            <div
              key={request.id}
              className={`relative bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition duration-200 overflow-wrap break-word overflow-auto ${
                request.status === 'draft' ? 'bg-gray-200' : ''
              } hover:shadow-lg transition duration-200 transform hover:scale-105 cursor-pointer`}
            >
              {request.status === 'draft' || request.status === 'requires_more_info' ? (
                <Link to={`/update-request/${request.id}`} className="absolute top-2 right-8 text-blue-500 p-1 rounded hover:bg-blue-200 transition duration-200">
                  <PencilIcon className="w-5 h-5" />
                </Link>
              ) : null}
              {request.status === 'draft' || request.status === 'requires_more_info' ? (
                <button onClick={() => handleDelete(request.id)} className="absolute top-2 right-2 text-red-500 p-1 rounded hover:bg-red-200 transition duration-200">
                  <TrashIcon className="w-5 h-5" />
                </button>
              ) : null}
  
              <h3 className="font-semibold text-xl mb-2">{request.sport}</h3>
              <p className="text-gray-600">
                {request.description.substring(0, 20) +
                  (request.description.length > 20 ? '...' : '')}
              </p>
              {request.status === 'draft' && (
                <p className="mt-4 text-yellow-600 font-semibold">Draft</p>
              )}
              {request.status === 'submitted' && (
                <div className="flex items-center mt-4">
                  <ClockIcon className="h-5 w-5 mr-2 animate-spin-slow text-blue-700" />
                  <p className="text-blue-500 animate-pulse text-lg font-bold">
                    Waiting for approval
                  </p>
                </div>
              )}
              {request.status === 'admin_reviewed' && (
                <div className="flex items-center mt-4">
                  <CheckIcon className="h-10 w-10 mr-2 text-green-600" />
                  <p className="text-green-600 text-md font-bold">
                    Admin Approved, waiting for final approval..
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
};

export default ViewRequests;

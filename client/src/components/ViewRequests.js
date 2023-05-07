import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { TrashIcon } from '@heroicons/react/outline';


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
    <div className="max-w-6xl mx-auto mt-10">
      <h2 className="text-2xl font-semibold mb-6">
        View Scholarship Requests
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {requests.map((request) => (
          <div
            key={request.id}
            className={`bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition duration-200 ${
              request.status === 'draft' ? 'bg-gray-200' : ''
            } relative`}
          >
            <button
              onClick={() => handleDelete(request.id)}
              className="absolute top-2 right-2 text-red-500 p-1 rounded hover:bg-red-200 transition duration-200"
            >
              <TrashIcon className="w-5 h-5" />
            </button>
            <h3 className="font-semibold text-xl mb-2">{request.sport}</h3>
            <p className="text-gray-600">{request.description}</p>
            {request.status === 'draft' && (
              <p className="mt-4 text-yellow-600 font-semibold">Draft</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ViewRequests;

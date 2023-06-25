import { CheckIcon, ClockIcon, ExclamationIcon, PencilIcon, TrashIcon } from '@heroicons/react/solid';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Link } from "react-router-dom";

const ViewRequests = () => {
  const [requests, setRequests] = useState([]);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [selectedRequestDetails, setSelectedRequestDetails] = useState(null);

  
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

  const handleDeleteConfirmation = (requestId) => {
    setSelectedRequest(requestId);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    handleDelete(selectedRequest);
    setDeleteModalOpen(false);
    setSelectedRequest(null);
  };

  const handleRequestSelect = (request) => {
    if (selectedRequestDetails && selectedRequestDetails.id === request.id) {
      setSelectedRequestDetails(null);
    } else {
      setSelectedRequestDetails(request);
    }
  };

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
        <div key={request.id}>
          <div 
            className={`relative bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition duration-200 overflow-wrap break-word overflow-auto ${request.status === 'draft' ? 'bg-gray-200' : ''} hover:shadow-lg transition duration-200 transform hover:scale-105 cursor-pointer`}
            onClick={() => handleRequestSelect(request)}
          >
            {request.status === 'draft' || request.status === 'requires_more_info' ? (
              <Link to={`/student-dashboard/update-request/${request.id}`} className="absolute top-2 right-8 text-blue-500 p-1 rounded hover:bg-blue-200 transition duration-200">
                <PencilIcon className="w-5 h-5" />
              </Link>
            ) : null}
            {request.status === 'draft' || request.status === 'requires_more_info' ? (
              <button onClick={() => handleDeleteConfirmation(request.id)} className="absolute top-2 right-2 text-red-500 p-1 rounded hover:bg-red-200 transition duration-200">
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
              <div className="flex items-center mt-4 approval-container">
                <CheckIcon className="h-10 w-10 mr-2 text-green-600" />
                <p className="text-green-600 text-md font-bold approval-text">
                  Admin Approved, waiting for final approval..
                </p>
              </div>
            )}
            {request.status === 'approved' && (
              <div className="flex items-center mt-4 approval-container">
                <CheckIcon className="h-6 w-6 mr-2 text-green-600" />
                <p className="text-green-600 text-lg font-bold approval-text">
                  Approved
                </p>
              </div>
            )}
            {request.status === 'denied' && (
              <div className="flex items-center mt-4 approval-container">
                <ExclamationIcon className="h-6 w-6 mr-2 text-red-600" />
                <p className="text-red-600 text-lg font-bold approval-text">
                  Denied
                </p>
              </div>
            )}
          </div>
          {((request.status === 'approved' || request.status === 'denied') && request.manager_comment) && (
              <p className="text-gray-900 text-lg font-semibold mt-2 ml-1">
                <span className="text-gray-700">Manager's Comment:</span>
                <span className="text-lg text-black ml-1">{request.manager_comment}</span>
              </p>
            )}


        </div>
      ))}
    </div>
      {deleteModalOpen && (
        <div className="fixed z-10 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <ExclamationIcon className="h-6 w-6 text-red-600" aria-hidden="true" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                      Delete Request
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Are you sure you want to delete this request? This action cannot be undone.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button type="button" onClick={confirmDelete} className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm">
                  Confirm
                </button>
                <button type="button" onClick={() => setDeleteModalOpen(false)} className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

{selectedRequestDetails && (
      <section className="request-detail mt-10">
        <h2 className="text-2xl font-semibold mb-6">Your Request Details</h2>
        <div className="bg-white rounded-lg p-4 shadow-md">
            <p><strong>First Name:</strong> {selectedRequestDetails.first_name}</p>
            <p><strong>Last Name:</strong> {selectedRequestDetails.last_name}</p>
            <p><strong>Government ID:</strong> {selectedRequestDetails.government_id}</p>
            <p><strong>Registration Number:</strong> {selectedRequestDetails.registration_number}</p>
            <p><strong>Phone Number:</strong> {selectedRequestDetails.phone_number}</p>
            <p><strong>Course Title:</strong> {selectedRequestDetails.course_title}</p>
            <p><strong>Academic Year:</strong> {selectedRequestDetails.academic_year}</p>
            <p><strong>Education Level:</strong> {selectedRequestDetails.education_level}</p>
            <p><strong>City:</strong> {selectedRequestDetails.city}</p>
            <p><strong>Sport:</strong> {selectedRequestDetails.sport}</p>
            <p className="whitespace-normal overflow-wrap break-all w-2/3"><strong>Description:</strong> {selectedRequestDetails.description}</p>


            </div>
      </section>
    )}


    </div>
  );
};

export default ViewRequests;

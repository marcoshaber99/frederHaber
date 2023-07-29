import { CheckIcon, ClockIcon, ExclamationIcon, PencilIcon, TrashIcon } from '@heroicons/react/solid';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { AiFillCheckCircle } from 'react-icons/ai';
import { BiDuplicate } from "react-icons/bi";
import { Link } from "react-router-dom";
import { useRequest } from '../contexts/RequestContext';

const ViewRequests = () => {
  const [requests, setRequests] = useState([]);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [selectedRequestDetails, setSelectedRequestDetails] = useState(null);
  const [duplicateModalOpen, setDuplicateModalOpen] = useState(false);
  const { fetchLatestRequestStatus } = useRequest();

  const [isDuplicateInfoModalOpen, setDuplicateInfoModalOpen] = useState(false);

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

  const handleDuplicateConfirmation = (requestId) => {
    setSelectedRequest(requestId);
    setDuplicateModalOpen(true);
  };

  const confirmDuplicate = async () => {
    await handleDuplicate(selectedRequest);
    setDuplicateModalOpen(false);
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
      const deletedRequest = requests.find(request => request.id === requestId);
      await axios.delete(`http://localhost:5001/api/scholarship/delete-request/${requestId}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      setRequests(prevRequests => {
        const updatedRequests = prevRequests.filter(request => request.id !== requestId);
        const finalRequests = updatedRequests.map(request => {
          if (request.id === deletedRequest.original_request_id) {
            return {
              ...request,
              has_been_duplicated: false,
            };
          }
          return request;
        });
        return finalRequests;
      });

      if (selectedRequestDetails && selectedRequestDetails.id === requestId) {
        setSelectedRequestDetails(null); // If the deleted request is currently being viewed, stop viewing it
      }

      fetchLatestRequestStatus(); // Fetch the latest request status after deleting a request
    } catch (error) {
      console.error('Error deleting scholarship request:', error);
    }
  };
  
  const handleDuplicate = async (requestId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`http://localhost:5001/api/scholarship/duplicate-request/${requestId}`, {}, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      // Add the new request to the local state
      setRequests(prevRequests => {
        // Map through the previous requests
        const updatedRequests = prevRequests.map(request => {
          if (request.id === requestId) {
            return {
              ...request,
              duplicated_request_id: response.data.request.id,  // Add the ID of the new request
              has_been_duplicated: true,
            };
          }
          // If it's not, return the request as is
          return request;
        });
      
        // Add the new request to the end of the updatedRequests array
        updatedRequests.push(response.data.request);
      
        // Return the updatedRequests array as the new state
        return updatedRequests;
      });
  
      // Open the duplicate confirmation modal
      setDuplicateModalOpen(true);
    } catch (error) {
      console.error('Error duplicating scholarship request:', error);
      if (error.response && error.response.data && error.response.data.message) {
        alert(error.response.data.message);
      }
    }
  };

  const handleDuplicateInfo = () => {
    setDuplicateInfoModalOpen(true);
  };
  


  return (
    <div className="mt-6 ml-2">
    <h2 className="text-2xl font-semibold">View Scholarship Requests</h2>
    {requests.length === 0 ? (
      <p>No requests at the moment.</p>
    ) : (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-16">
      {requests.map((request) => (
        <div key={request.id} >
          <div 
            className={`relative bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition duration-200 overflow-wrap break-word overflow-auto ${request.status === 'draft' ? 'bg-gray-200' : ''} 
            ${selectedRequestDetails && selectedRequestDetails.id === request.id ? 'border-2 border-blue-500' : ''}  // Add border when selected
            hover:shadow-lg transition duration-200 transform hover:scale-105 cursor-pointer`}
            onClick={() => handleRequestSelect(request)}
          >
          {request.status === 'draft' || request.status === 'requires_more_info' || request.status === 'denied' ? (
            <Link to={`/student-dashboard/update-request/${request.id}`} className="absolute top-2 right-8 text-blue-500 p-1 rounded hover:bg-blue-200 transition duration-200">
              <PencilIcon className="w-5 h-5" />
            </Link>
          ) : null}
          {request.status === 'draft' || request.status === 'requires_more_info' || request.status === 'denied' ? (
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
                <div className="flex flex-col items-start mt-4 approval-container">
                  <div className="flex items-center">
                    <AiFillCheckCircle size={24} color="green" className="mr-2" />
                    <p className="text-green-600 text-lg font-bold approval-text">
                     Approved! 
                    </p>
                  </div>
                  {request.has_been_duplicated ? (
                    <button 
                      // disabled 
                      className="absolute top-2 right-2 text-gray-500 p-2 rounded hover:bg-green-200 transition duration-200 cursor-pointer"
                      title="Already Duplicated"
                      onClick={handleDuplicateInfo}
                    >
                      <BiDuplicate size={24} className='text-gray-400' /> 
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleDuplicateConfirmation(request.id)} 
                      className="absolute top-2 right-2 text-blue-500 p-2 rounded hover:bg-blue-200 transition duration-200 cursor-pointer"
                      title="Duplicate for Next Year"
                    >
                      <BiDuplicate size={24} className='text-blue-800' /> 
                    </button>

                  )}
                </div>
              )}

            {request.status === 'denied' && (
              <div className="flex items-center mt-4 approval-container">

                <ExclamationIcon className="h-6 w-6 mr-2 text-red-600" />

                <p className="text-red-600 text-lg font-bold approval-text">
                  Request Denied, Try Again
                </p>

              </div>
            )}
          </div>
          {((request.status === 'approved' || request.status === 'denied') && request.manager_comment) && (
              <p className="text-gray-900 text-lg font-semibold mt-2 ml-1">
                <span className="text-gray-500">Manager's Comment:</span>
                <span className="text-lg text-black font-normal ml-1">{request.manager_comment}</span>
              </p>
            )}


        </div>
      ))}
    </div>
      )}
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


        {isDuplicateInfoModalOpen && (
                <div className="fixed z-10 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                  <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
                    <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                    <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                      <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <div className="sm:flex sm:items-start">
                          <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                            <BiDuplicate size={24} className='text-grey-700' />
                          </div>
                          <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                            <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                              Duplicate Request
                            </h3>
                            <div className="mt-2">
                              <p className="text-sm text-gray-500">
                                This request has already been duplicated.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                        <button type="button" onClick={() => setDuplicateInfoModalOpen(false)} className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm">
                          OK
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}


                {duplicateModalOpen && (
                  <div className="fixed z-10 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                      <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
                      <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                      <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                        <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                          <div className="sm:flex sm:items-start">
                            <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                              <BiDuplicate size={24} className='text-blue-700' />
                            </div>
                            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                              <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                                Duplicate Request
                              </h3>
                              <div className="mt-2">
                                <p className="text-sm text-gray-500">
                                  Are you sure you want to duplicate this request? It will be saved as a draft.
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                          <button type="button" onClick={confirmDuplicate} className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm">
                            Confirm
                          </button>
                          <button type="button" onClick={() => setDuplicateModalOpen(false)} className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
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
            {selectedRequestDetails.file_url.endsWith('.png') && (
              <div className="mt-4">
                <h3 className="text-xl font-semibold mb-2">Attached File:</h3>
                {/* insert file name here */}
                <p><strong>File Name:</strong> {selectedRequestDetails.file_name}</p>
                  <a href={selectedRequestDetails.file_url} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block bg-blue-500 text-white px-4 py-2 rounded">Download File</a>
              </div>
            )}
          </div>
        </section>
      )}

    </div>
  );
};

export default ViewRequests;
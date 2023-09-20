import { Dialog, Transition } from '@headlessui/react';
import { CheckIcon, ClockIcon, ExclamationIcon, PencilIcon, TrashIcon, XIcon } from '@heroicons/react/solid';
import axios from 'axios';
import { format } from 'date-fns';
import React, { Fragment, useEffect, useState } from 'react';
import { AiFillCheckCircle } from 'react-icons/ai';
import { BiDuplicate } from "react-icons/bi";
import { FiDownload } from 'react-icons/fi';
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
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);

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

  const openDetailsModal = (request) => {
    setSelectedRequestDetails(request);
    setDetailsModalOpen(true);
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
        setSelectedRequestDetails(null); 
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

      // Add  new request to the local state
      setRequests(prevRequests => {
        // Map through the previous requests
        const updatedRequests = prevRequests.map(request => {
          if (request.id === requestId) {
            return {
              ...request,
              duplicated_request_id: response.data.request.id, 
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
  
  const downloadFile = async (key) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5001/api/scholarship/get-presigned-url/${key}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        }
      });
      const presignedUrl = response.data.presignedUrl;
      window.location.href = presignedUrl;
    } catch (err) {
      console.error(err);
      alert('Failed to download file. Please try again later.');
    }
  };
  
  
  
  

  function statusColorClass(status) {
    switch(status) {
        case 'draft':
            return 'border-yellow-500';
        case 'submitted':
            return 'border-blue-500/75';
        case 'admin_reviewed':
            return 'border-green-500/75';
        case 'approved':
            return 'border-green-600/50';
        case 'denied':
            return 'border-red-500/50';
        default:
            return '';
    }
}
  
  
  return (
    <div className="mt-6 ml-2">
    <h2 className="text-2xl font-semibold">Your Requests</h2>
    {requests.length === 0 ? (
      <p>No requests at the moment.</p>
    ) : (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-16">
      {requests.map((request) => (
        <div key={request.id} onClick={() => openDetailsModal(request)}>
        <div 
            className={`relative bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition duration-200 overflow-wrap break-word overflow-auto ${statusColorClass(request.status)} ${selectedRequestDetails && selectedRequestDetails.id === request.id ? 'border-2 border-blue-500' : ''}
            hover:shadow-lg transition duration-200 transform hover:scale-105 cursor-pointer`}
            onClick={() => handleRequestSelect(request)}
          >

          {request.status === 'draft' || request.status === 'requires_more_info' || request.status === 'denied' ? (
            <Link to={`/student-dashboard/update-request/${request.id}`} className="absolute top-2 right-8 text-blue-500 p-1 rounded hover:bg-blue-200 transition duration-200">
              <PencilIcon className="w-5 h-5" />
            </Link>
          ) : null}
          {request.status === 'draft' || request.status === 'requires_more_info' || request.status === 'denied' ? (
           <button 
           onClick={(event) => {
             event.stopPropagation();
             handleDeleteConfirmation(request.id);
           }} 
           className="absolute top-2 right-2 text-red-500 p-1 rounded hover:bg-red-200 transition duration-200"
         >
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
                    onClick={(event) => {
                      event.stopPropagation();
                      handleDuplicateInfo( request.id);
                    }} 
                      // disabled 
                      className="absolute top-2 right-2 text-gray-500 p-2 rounded hover:bg-green-200 transition duration-200 cursor-pointer"
                      title="Already Duplicated"
                    >
                      <BiDuplicate size={24} className='text-gray-400' /> 
                    </button>
                  ) : (
                    <button 
                    onClick={(event) => {
                      event.stopPropagation();
                      handleDuplicateConfirmation(request.id);
                    }} 
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

                <p className="text-red-600 text-lg font-semibold approval-text">
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

<Transition.Root show={detailsModalOpen} as={Fragment}>
  <Dialog as="div" className="fixed z-10 inset-0 overflow-y-auto" onClose={setDeleteModalOpen}>
    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
      <Transition.Child as={Fragment}>
        <Dialog.Overlay className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
      </Transition.Child>
      <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
      <Transition.Child
        as={Fragment}
        enter="ease-out duration-300"
        enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
        enterTo="opacity-100 translate-y-0 sm:scale-100"
        leave="ease-in duration-200"
        leaveFrom="opacity-100 translate-y-0 sm:scale-100"
        leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
      >
                <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full sm:p-6">

                <div className="absolute top-0 right-0 pt-4 pr-4">
  <button
    type="button"
    className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
    onClick={() => setDetailsModalOpen(false)}
  >
    <span className="sr-only">Close</span>
    <XIcon className="h-6 w-6" aria-hidden="true" />
  </button>
</div>
          <div>
          {selectedRequestDetails && (
  <section className="request-detail mt-10">
    <h2 className="text-center text-2xl text-blue-800 font-semibold mb-6">Your Request Details</h2>
    <div className="bg-white rounded-lg p-8 shadow-md">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-lg shadow-md space-y-4">
          <p className="text-lg mb-1"><strong>Name:</strong> {selectedRequestDetails.first_name} {selectedRequestDetails.last_name}</p>
          <p className="text-lg mb-1"><strong>ID Number:</strong> {selectedRequestDetails.government_id}</p>
          <p className="text-lg mb-1"><strong>Reg. Number:</strong> {selectedRequestDetails.registration_number}</p>
          <p className="text-lg mb-1"><strong>Phone Number:</strong> {selectedRequestDetails.phone_number}</p>
          <p className="text-lg mb-1"><strong>Year Of Admission:</strong> {selectedRequestDetails.year_of_admission}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md space-y-4">

          <p className="text-lg mb-1"><strong>Course Title:</strong> {selectedRequestDetails.course_title}</p>
          <p className="text-lg mb-1"><strong>Sport:</strong> {selectedRequestDetails.sport}</p>
          <p className="text-lg mb-1"><strong>Date:</strong> {format(new Date(selectedRequestDetails.created_at), 'MMMM dd, yyyy')}</p>
          <p className="text-lg mb-1"><strong>Description:</strong> {selectedRequestDetails.description}</p>
        </div>
      </div>
      <div className="flex flex-col mt-4 ml-4 space-y-2">
        <p className="text-lg mb-1"><strong>Attached File: </strong></p>
        {selectedRequestDetails.file_url && (
  <div>
    <button 
      onClick={() => downloadFile(
        selectedRequestDetails.file_key,
        selectedRequestDetails.first_name, 
        selectedRequestDetails.last_name, 
        selectedRequestDetails.sport 
      )} 
      className="flex items-center justify-center gap-2 px-4 py-2 text-white font-semibold bg-blue-800 rounded-md focus:outline-none hover:bg-blue-600"
    >
      <FiDownload className="w-4 h-4" />
      Download File
    </button>
  </div>
)}

      </div>
    </div>
  </section>
)}

          </div>
        </div>
      </Transition.Child>
    </div>
  </Dialog>
</Transition.Root>

    </div>
  );
};




export default ViewRequests;


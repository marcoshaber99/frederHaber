import React, { createContext, useContext, useState, useCallback } from 'react';
import axios from 'axios';

const RequestContext = createContext();

export function useRequest() {
    return useContext(RequestContext);
}

export function RequestContextProvider({ children }) {
    const [latestRequestStatus, setLatestRequestStatus] = useState('');
    const [loadingLatestRequestStatus, setLoadingLatestRequestStatus] = useState(true);

    const fetchLatestRequestStatus = useCallback(async () => {
        try {
            setLoadingLatestRequestStatus(true); // start loading
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5001/api/scholarship/get-latest-pending-request-status', {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });
            setLatestRequestStatus(response.data.status);
        } catch (error) {
            console.error('Error fetching latest request:', error);
            setLatestRequestStatus('Error'); // Error handling
        } finally {
            setLoadingLatestRequestStatus(false); // end loading
        }
    }, []);

    const value = {
        latestRequestStatus,
        loadingLatestRequestStatus,
        fetchLatestRequestStatus,
    };

    return (
        <RequestContext.Provider value={value}>
            {children}
        </RequestContext.Provider>
    );
}

import ClearIcon from '@mui/icons-material/Clear';
import DeleteIcon from '@mui/icons-material/Delete';
import { Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, IconButton, InputAdornment, List, ListItem, ListItemText, Pagination, TextField, Tooltip, Typography, useMediaQuery, useTheme } from '@mui/material';
import MuiAlert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import { styled } from '@mui/system';
import { DataGrid, GridOverlay, GridToolbar } from '@mui/x-data-grid';
import axios from 'axios';
import { debounce } from 'lodash';
import React, { useCallback, useEffect, useMemo, useState } from 'react';


function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}


function CustomLoadingOverlay() {
  return (
    <GridOverlay>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <CircularProgress />
        <Typography>Loading...</Typography>
      </Box>
    </GridOverlay>
  );
}

function CustomNoRowsOverlay() {
  return (
    <GridOverlay>
      <Typography>No records found.</Typography>
    </GridOverlay>
  );
}
const useFetchData = (url, token) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      const response = await axios.get(url, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.status === 200) {
        const transformedData = response.data.requests.map((request, index) => ({
          ...request,
          id: request.id,
        }));
        
        setData(transformedData);
      } else {
        throw new Error('Something went wrong');
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [url, token]);
  

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, fetchData };
};


const AllRequests = ({role}) => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const token = localStorage.getItem('token');
  const { data, loading, error, fetchData } = useFetchData('http://localhost:5001/api/scholarship/all-requests', token);

  const [searchText, setSearchText] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [pageSize, setPageSize] = useState(5);
  const [page, setPage] = useState(0);  
  const [open, setOpen] = React.useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [isSearchTriggered, setIsSearchTriggered] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const renderList = () => (
    <List>
      {(isSearchTriggered ? filteredData : data).map((item) => (
        <ListItem
          key={item.id}
          button
          onClick={() => setSelectedItem(item)}
          className="hover:bg-gray-100 transition duration-150 ease-in-out"
        >
          <ListItemText
            primary={`${item.first_name} ${item.last_name}`}
            secondary={`Reg. Num: ${item.registration_number}`}
            className="border-b border-gray-400 pb-2"
          />
          {role !== 'admin' && (
            <IconButton
              color="error"
              onClick={(event) => {
                event.stopPropagation();
                openDeleteDialog(item.id);
              }}
            >
              <DeleteIcon />
            </IconButton>
          )}
        </ListItem>
      ))}
    </List>
  );
  
  

  const renderDetailsModal = () => (
    <Dialog open={!!selectedItem} onClose={() => setSelectedItem(null)} fullWidth>
      <DialogTitle>{`${selectedItem?.first_name} ${selectedItem?.last_name}`}</DialogTitle>
      <DialogContent>
        <Typography variant="body1"><strong>Reg. Num:</strong> {selectedItem?.registration_number}</Typography>
        <Typography variant="body1"><strong>Gov. ID:</strong> {selectedItem?.government_id}</Typography>
        <Typography variant="body1"><strong>Sport:</strong> {selectedItem?.sport}</Typography>
        <Typography variant="body1"><strong>Year Of Admission:</strong> {selectedItem?.year_of_admission}</Typography>

        <Typography variant="body1"><strong>Campus:</strong> {selectedItem?.city}</Typography>
        <Typography variant="body1"><strong>Ed. Level:</strong> {selectedItem?.education_level}</Typography>
        <Typography variant="body1"><strong>Percentage:</strong> {selectedItem?.percentage}</Typography>
        <Typography variant="body1"><strong>Category:</strong> {selectedItem?.scholarship_category}</Typography>
        {selectedItem?.other_scholarship === 'YES' && (
          <>
            <Typography variant="body1"><strong>Other Scholarship:</strong> {selectedItem?.other_scholarship}</Typography>
            <Typography variant="body1"><strong>Other Scholarship %:</strong> {selectedItem?.other_scholarship_percentage || '-'}</Typography>
          </>
        )}
        <Typography variant="body1"><strong>Manager's Comments:</strong> {selectedItem?.manager_comment || '-'}</Typography>
        {selectedItem?.file_url && (
          <div className="mt-2">
            <Button
              variant="contained"
              color="primary"
              onClick={() => downloadFile(selectedItem?.file_key)}
            >
              Download File
            </Button>
          </div>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setSelectedItem(null)} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
  
  

  const openDeleteDialog = (id) => {
    setSelectedRow(id);
    setOpenDialog(true);
  };

  const closeDeleteDialog = () => {
    setOpenDialog(false);
    setSelectedRow(null);
  };

  const handleClearSearch = () => {
    setSearchText('');
    setIsSearchTriggered(false);
  };


  const handlePageSizeChange = (event) => {
    setPageSize(event.target.value);
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
  

  useEffect(() => {
    const debouncedHandleSearch = debounce(() => {
      const lowercasedFilter = searchText.toLowerCase();
      const filtered = data.filter(item => {
        return Object.keys(item).some(key =>
          item[key] && item[key].toString().toLowerCase().includes(lowercasedFilter)
        );
      });
      setFilteredData(filtered);
      setIsSearchTriggered(true);
    }, 500);
  
    debouncedHandleSearch();
  
    // Cleanup function
    return () => {
      debouncedHandleSearch.cancel();
    };
  }, [searchText, data]);
  

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setOpen(false);
  };

  const handleDelete = async () => {
    try {
      const response = await axios.delete(`http://localhost:5001/api/scholarship/manager-delete-request/${selectedRow}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
  
      if (response.status === 200) {
        fetchData(); // refresh the data
        alert('Request deleted successfully');
      } else {
        throw new Error(`Request failed with status code ${response.status}`);
      }
    } catch (error) {
      alert(error.message);
    }
  
    closeDeleteDialog();
  };
  const StyledDataGrid = styled(DataGrid)({
    '& .MuiDataGrid-columnHeader': {
      backgroundColor: '#f0f0f0',
      color: '#337',
      borderBottom: '1px solid rgba(0, 0, 0, 0.30)',
      fontWeight: 'bold',
      '&:hover': {
        backgroundColor: '#e0e0e0',
      },
    },
  });
  const columns = useMemo(() => {
    const baseColumns = [
      {
        field: 'registration_number',
        headerName: 'Reg. Num.',
        flex: 1,
        minWidth: 100,
        resizable: true,
        sortable: true,
        renderCell: (params) => (
          <Tooltip title={params.value.toString()}>
            <span>{params.value}</span>
          </Tooltip>
        ),
      },
      {
        field: 'first_name',
        headerName: 'Name',
        flex: 1,
        minWidth: 100,
        resizable: true,
        sortable: true,
      },
      {
        field: 'last_name',
        headerName: 'Surname',
        flex: 1,
        minWidth: 100,
        resizable: true,
        sortable: true,
      },
      {
        field: 'government_id',
        headerName: 'ID',
        flex: 1,
        minWidth: 100,
        resizable: true,
        sortable: true,
        renderCell: (params) => (
          <Tooltip title={params.value.toString()}>
            <span>{params.value}</span>
          </Tooltip>
        ),
      },
      
      {
        field: 'sport',
        headerName: 'Sport',
        flex: 1,
        minWidth: 100,
        resizable: true,
        sortable: true,
      },
      {
        field: 'city',
        headerName: 'Campus',
        flex: 1,
        minWidth: 100,
        resizable: true,
        sortable: true,
      },
      {
        field: 'education_level',
        headerName: 'Ed. Level',
        flex: 1,
        minWidth: 100,
        resizable: true,
        sortable: true,
        renderCell: (params) => (
          <Tooltip title={params.value.toString()}>
            <span>{params.value}</span>
          </Tooltip>
        ),
      },

      //add new field for year_of_admission
        
      {
        field: "year_of_admission",
        headerName: "Year of Admission",
        flex: 1,
        minWidth: 100,
        resizable: true,
        sortable: true,
        renderCell: (params) => (
          <Tooltip title={params.value.toString()}>
            <span>{params.value}</span>
          </Tooltip>
        ),
  
      },
      {
        field: 'percentage',
        headerName: 'Percentage',
        flex: 1,
        minWidth: 100,
        resizable: true,
        sortable: true,
      },
      {
        field: 'scholarship_category',
        headerName: 'Category',
        flex: 1,
        minWidth: 100,
        resizable: true,
        sortable: true,
      },
      {
        field: 'other_scholarship',
        headerName: 'Other Scholarship',
        flex: 1,
        minWidth: 100,
        resizable: true,
        sortable: true,
      },
      {
        field: 'other_scholarship_percentage',
        headerName: 'Other Scholarship %',
        flex: 1,
        minWidth: 100,
        resizable: true,
        sortable: true,
        valueGetter: (params) => {
          // Only display the percentage if "Other Scholarship" is "YES"
          return params.row.other_scholarship === 'YES' ? params.row.other_scholarship_percentage : '-';
        },
      },
      {
        field: 'manager_comment',
        headerName: "Manager's Comments",
        flex: 3, 
        minWidth: 200, // Increased minWidth
        resizable: true,
        sortable: true,
        renderCell: (params) => (
          <Tooltip title={params.value || '-'}>
            <span>{params.value || '-'}</span>
          </Tooltip>
        ),
      },
    ];

    const actionColumn = {
      flex: 1,
      minWidth: 100,
      sortable: false,
      renderCell: (params) => (
        <IconButton 
          color="error" 
          onClick={() => openDeleteDialog(params.row.id)}
        >
          <DeleteIcon />
        </IconButton>
      ),
    };
    

  const downloadColumn = {
    field: 'download',
    headerName: 'Download',
    flex: 3,
    minWidth: 150,
    sortable: false,
    renderCell: (params) => (
      <Button 
        variant="contained" 
        color="primary" 
        onClick={() => downloadFile(params.row.file_key)}
      >
        Download
      </Button>
    ),
  };
  

  return role === 'admin' ? [...baseColumns, downloadColumn] : [...baseColumns, downloadColumn, actionColumn];


  }, [role]);


  return (
    <Box sx={{ height: 500, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }} className="p-6 bg-gray-100">
      {error ? (
        <>
          <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
            <Alert onClose={handleClose} severity="error" sx={{ width: '100%' }}>
              {error}
            </Alert>
          </Snackbar>
          <Button variant="contained" color="primary" onClick={fetchData}>Retry</Button>
        </>
      ) : (
        <div className="h-[400px] w-full">

      <div className="flex items-center mb-2 ml-2 max-w-[95%]">
        <TextField
          id="search-bar"
          label="Search by any field..."
          variant="outlined"
          value={searchText}
          onChange={(event) => setSearchText(event.target.value)}
          className="rounded-lg shadow-md"
          sx={{ flex: 1, maxWidth: '100%' }} // Updated maxWidth to 100%
          InputProps={{
            endAdornment: searchText && (
              <InputAdornment position="end">
                <IconButton onClick={handleClearSearch}>
                  <ClearIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        </div>

        {isSmallScreen ? (
          <>
          {renderList()}
          {renderDetailsModal()}
          <Pagination
            count={Math.ceil(filteredData.length / pageSize)}
            page={page + 1}
            onChange={(_, newPage) => setPage(newPage - 1)}
            onChangeRowsPerPage={handlePageSizeChange}
            // ...
          />
        </>          
        ) : (
            <StyledDataGrid
              className="bg-white rounded-lg"
              rows={isSearchTriggered ? filteredData : data}
              columns={columns}
              pageSize={pageSize}
              page={page}
              onPageChange={(newPage) => setPage(newPage)}
              rowsPerPageOptions={[5, 10, 20]}
              checkboxSelection
              disableSelectionOnClick
              pagination
              loading={loading}
              slots={{
                NoRowsOverlay: CustomNoRowsOverlay,
                LoadingOverlay: CustomLoadingOverlay,
              }}
            slotProps={{
              toolbar: GridToolbar,
              pagination: () => (
                <Pagination
                  count={Math.ceil(filteredData.length / pageSize)}
                  page={page + 1}
                  onChange={(_, newPage) => setPage(newPage - 1)}
                  onChangeRowsPerPage={handlePageSizeChange}
                  boundaryCount={isSmallScreen ? 2 : 5}
                />
              ),
            }}
          />
          )}

        </div>
      )}
  
  <Dialog
    open={openDialog}
    onClose={closeDeleteDialog}
    aria-labelledby="alert-dialog-title"
    aria-describedby="alert-dialog-description"
  >
    <DialogTitle id="alert-dialog-title">{'Delete Request?'}</DialogTitle>
    <DialogContent>
      <DialogContentText id="alert-dialog-description">
        Are you sure you want to delete this request? This action cannot be undone.
      </DialogContentText>
    </DialogContent>
    <DialogActions>
      <Button onClick={closeDeleteDialog} color="primary">
        Cancel
      </Button>
      <Button onClick={handleDelete} color="primary" autoFocus>
        Delete
      </Button>
    </DialogActions>
  </Dialog>
</Box>
  );
};

export default AllRequests;
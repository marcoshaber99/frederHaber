import DeleteIcon from '@mui/icons-material/Delete';
import { Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, IconButton, List, ListItem, ListItemText, Pagination, TextField, Tooltip, Typography, useMediaQuery, useTheme } from '@mui/material';
import MuiAlert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
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

const SmallScreenView = ({ data, openDeleteDialog }) => {
  const [searchText, setSearchText] = useState("");
  const [filteredData, setFilteredData] = useState(data);

  useEffect(() => {
    if (!searchText) {
      setFilteredData(data);
      return;
    }

    const lowercasedFilter = searchText.toLowerCase();
    const filtered = data.filter(item => {
      return Object.keys(item).some(key =>
        item[key] && item[key].toString().toLowerCase().includes(lowercasedFilter)
      );
    });

    setFilteredData(filtered);
  }, [searchText, data]);

  return (
    <Box>
      {data.length > 0 ? (
        <>
          <TextField
            id="search-bar"
            label="Search by any field..."
            variant="outlined"
            sx={{ marginBottom: 2 }}
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            className="rounded-lg shadow-md"
          />
          <List>
            {filteredData.map((item, index) => (
              <ListItem key={index}>
                <ListItemText
                  primary={`${item.first_name} ${item.last_name}`}
                  secondary={`User ID: ${item.user_id}, Reg. Num.: ${item.registration_number}, Gov. ID: ${item.government_id}, Sport: ${item.sport}, Campus: ${item.city}, Ed. Level: ${item.education_level}`}
                />
                <IconButton 
                  color="error" 
                  onClick={() => openDeleteDialog(item.id)}
                >
                  <DeleteIcon />
                </IconButton>
              </ListItem>
            ))}
          </List>
        </>
      ) : (
        <Typography variant="h6" align="center" color="textSecondary">
          No records found..
        </Typography>
      )}
    </Box>
  );
};



const AllRequests = ({role}) => {
  console.log('Role in AllRequests:', role); // Debug role value

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


  const openDeleteDialog = (id) => {
    setSelectedRow(id);
    setOpenDialog(true);
  };

  const closeDeleteDialog = () => {
    setOpenDialog(false);
    setSelectedRow(null);
  };


  const handlePageSizeChange = (event) => {
    setPageSize(event.target.value);
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
  
  const columns = useMemo(() => {
    const baseColumns = [
      {
        field: 'user_id',
      headerName: 'Applicant',
      flex: 1,
      minWidth: 100,
        resizable: true,
        sortable: true,
        hide: isSmallScreen,
        renderCell: (params) => (
          <Tooltip title={params.value.toString()}>
            <span>{params.value}</span>
          </Tooltip>
        ),
      },
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
        headerName: 'Gov. ID',
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
    ];

    const actionColumn = {
      flex: 1,
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
    

    return role === 'admin' ? baseColumns : [...baseColumns, actionColumn];
  }, [role, isSmallScreen]);

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
      ) : isSmallScreen ? (
        <SmallScreenView data={isSearchTriggered ? filteredData : data} openDeleteDialog={openDeleteDialog} />
        ) : (
        <Box sx={{ height: 400, width: '100%' }}>
          <TextField
            id="search-bar"
            label="Search by any field..."
            variant="outlined"
            sx={{ marginBottom: 2 }}
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            className="rounded-lg shadow-md"
          />
  
          <DataGrid
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
  
        </Box>
      )}
  
      <Dialog
        open={openDialog}
        onClose={closeDeleteDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Are you sure?"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            You are about to delete a record. This action is irreversible.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteDialog}>Cancel</Button>
          <Button onClick={() => handleDelete(selectedRow)} color="error">Delete</Button>
        </DialogActions>
      </Dialog>
  
    </Box>
  );
  
  
};

export default AllRequests;
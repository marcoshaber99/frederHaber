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
const SmallScreenView = ({ data, openDeleteDialog }) => {
  const [searchText, setSearchText] = useState("");
  const [filteredData, setFilteredData] = useState(data);

  const handleClearSearch = () => {
    setSearchText('');
    setFilteredData(data);
  };

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
    <div className="flex flex-col">
      <div className="flex items-center mt-4">
        <TextField
          id="search-bar"
          label="Search by any field..."
          variant="outlined"
          value={searchText}
          onChange={(event) => setSearchText(event.target.value)}
          className="rounded-lg shadow-md w-full"
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
      <div className="overflow-y-scroll h-60 mt-2 w-full pr-2"> {/* Scrollable content with Tailwind classes */}
        {filteredData.length > 0 ? (
          <List>
            {filteredData.map((item, index) => (
              <ListItem key={index} sx={{ padding: 2 }}>
                <ListItemText
                  primary={
                    <>
                      <Typography variant="h6">{`${item.first_name} ${item.last_name}`}</Typography>
                      <Typography variant="body2">{`Registration Num.: ${item.registration_number}`}</Typography>
                      <Typography variant="body2">{`Gov. ID: ${item.government_id}`}</Typography>
                      <Typography variant="body2">{`Sport: ${item.sport}`}</Typography>
                      <Typography variant="body2">{`Campus: ${item.city}`}</Typography>
                      <Typography variant="body2">{`Educational Level: ${item.education_level}`}</Typography>
                      <Typography variant="body2">{`Percentage: ${item.percentage}`}</Typography>
                      <Typography variant="body2">{`Category: ${item.scholarship_category}`}</Typography>
                      <Typography variant="body2">{`Other Scholarship: ${item.other_scholarship}`}</Typography>
                      <Typography variant="body2">{`Other Scholarship %: ${item.other_scholarship_percentage}`}</Typography>
                      <Typography variant="body2">{`Manager's Comments: ${item.manager_comment}`}</Typography>
                    </>
                  }
                />
                <IconButton color="error" onClick={() => openDeleteDialog(item.id)}>
                  <DeleteIcon />
                </IconButton>
              </ListItem>
            ))}
          </List>
        ) : (
          <Typography variant="h6" align="center" color="textSecondary">
            No records found..
          </Typography>
        )}
      </div>
    </div>
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

  const handleClearSearch = () => {
    setSearchText('');
    setIsSearchTriggered(false);
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
        flex: 1,
        minWidth: 150, // Increased width
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

        <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: 2, maxWidth: '80%'}}> 
        <TextField
          id="search-bar"
          label="Search by any field..."
          variant="outlined"
          value={searchText}
          onChange={(event) => setSearchText(event.target.value)}
          className="rounded-lg shadow-md"
          sx={{ flex: 1, maxWidth: '70%' }}
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
        </Box>

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
  
        </Box>
      )}
  
  <Dialog
        open={openDialog}
        onClose={closeDeleteDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Delete Confirmation"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete this record? Please note that this action is irreversible and will permanently remove the data.
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
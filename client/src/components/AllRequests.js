import { IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, TableSortLabel, TextField } from '@mui/material';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useFilters, usePagination, useSortBy, useTable } from 'react-table';
import { Search } from '@mui/icons-material';

const AllRequests = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchRequests = async () => {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5001/api/scholarship/all-requests', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        setData(response.data.requests);
        console.log(response.data.requests)
      } else {
        console.error(response);
      }
    };

    fetchRequests();
  }, []);

  const columns = React.useMemo(
    () => [
      {
        Header: 'Applicant',
        accessor: 'user_id',
      },
      {
        Header: 'Registration Number',
        accessor: 'registration_number',
      },
      {
        Header: 'Status',
        accessor: 'status',
      },
      {
        Header: 'Name',
        accessor: 'first_name',
      },
      {
        Header: 'Surname',
        accessor: 'last_name',
      },
      {
        Header: 'Sport',
        accessor: 'sport',
      },
      {
        Header: 'Description',
        accessor: 'description',
      },
    ],
    []
  );

  const defaultColumn = React.useMemo(
    () => ({
      Filter: ({ column }) => {
        return (
          <TextField
            value={column.filterValue || ''}
            onChange={e => {
              column.setFilter(e.target.value || undefined); 
            }}
            placeholder={`Search ${column.id}`}
            InputProps={{
              endAdornment: (
                <IconButton>
                  <Search />
                </IconButton>
              ),
            }}
          />
        );
      },
      
    }),
    []
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    page,
    nextPage,
    state: { pageIndex, pageSize },
    setPageSize,
    prepareRow,
  } = useTable(
    {
      columns,
      data,
      initialState: { pageIndex: 0, pageSize: 10 },
      defaultColumn,
    },
    useFilters,
    useSortBy,
    usePagination
  );

  return (
    <Paper sx={{ overflow: 'auto' }}>
      <TableContainer sx={{ maxHeight: 440 }}>
        <Table stickyHeader {...getTableProps()} size="small">
          <TableHead>
            {headerGroups.map(headerGroup => (
              <TableRow {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map(column => (
                  <TableCell
                    {...column.getHeaderProps(column.getSortByToggleProps())}
                  >
                    {column.render('Header')}
                    <TableSortLabel
                      active={column.isSorted}
                      direction={column.isSortedDesc ? 'desc' : 'asc'}
                    />
                    <div>{column.canFilter ? column.render('Filter') : null}</div>
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableHead>
          <TableBody {...getTableBodyProps()}>
            {page.map(row => {
              prepareRow(row);
              return (
                <TableRow {...row.getRowProps()}>
                  {row.cells.map(cell => (
                    <TableCell {...cell.getCellProps()}>
                      {cell.render('Cell')}
                    </TableCell>
                  ))}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[10, 20, 30, 40, 50]}
        component="div"
        count={data.length}
        rowsPerPage={pageSize}
        page={pageIndex}
        onPageChange={(event, newPage) => nextPage(newPage)}
        onRowsPerPageChange={(event) => setPageSize(Number(event.target.value))}
      />
    </Paper>
  );
};

export default AllRequests;

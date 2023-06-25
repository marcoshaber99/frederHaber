// AllRequests.js
import React, { useState, useEffect } from 'react';
import { useTable } from 'react-table';
import axios from 'axios';

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
        setData(response.data);
      } else {
        console.error(response);
      }
    };

    fetchRequests();
  }, []);

  const columns = React.useMemo(
    () => [
      {
        Header: 'Request ID',
        accessor: 'request_id',
      },
      {
        Header: 'Applicant',
        accessor: 'applicant',
      },
      {
        Header: 'Date Submitted',
        accessor: 'date_submitted',
      },
      {
        Header: 'Status',
        accessor: 'status',
      },
      // Add more columns as required
    ],
    []
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  } = useTable({ columns, data });

  return (
    <table {...getTableProps()} style={{ border: 'solid 1px blue' }}>
      <thead>
        {headerGroups.map(headerGroup => (
          <tr {...headerGroup.getHeaderGroupProps()}>
            {headerGroup.headers.map(column => (
              <th
                {...column.getHeaderProps()}
                style={{
                  borderBottom: 'solid 3px red',
                  background: 'aliceblue',
                  color: 'black',
                  fontWeight: 'bold',
                }}
              >
                {column.render('Header')}
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody {...getTableBodyProps()}>
        {rows.map(row => {
          prepareRow(row);
          return (
            <tr {...row.getRowProps()}>
              {row.cells.map(cell => (
                <td
                  {...cell.getCellProps()}
                  style={{
                    padding: '10px',
                    border: 'solid 1px gray',
                    background: 'papayawhip',
                  }}
                >
                  {cell.render('Cell')}
                </td>
              ))}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

export default AllRequests;

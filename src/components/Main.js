import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { alpha } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import TableFooter from '@mui/material/TableFooter';
import TablePagination from '@mui/material/TablePagination';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Checkbox from '@mui/material/Checkbox';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import SearchIcon from '@mui/icons-material/Search';
import InputAdornment from '@mui/material/InputAdornment';
import Input from '@mui/material/Input';
import { visuallyHidden } from '@mui/utils';
import { stableSort, getComparator } from '../components/Adnan';
import styles from './style.module.css';

function createData(id, name, email, role) {
  return {
    id,
    name,
    email,
    role,
  };
}

const Footer = () => {
  const [members, setMembers] = useState([]);
  const [editingMemberId, setEditingMemberId] = useState(null);
  const [editedName, setEditedName] = useState('');
  const [editedEmail, setEditedEmail] = useState('');
  const [editedRole, setEditedRole] = useState('');
  const [order, setOrder] = React.useState('asc');
  const [orderBy, setOrderBy] = React.useState('name');
  const [selected, setSelected] = React.useState([]);
  const [page, setPage] = React.useState(0);
  const [dense, setDense] = React.useState(false);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch('https://geektrust.s3-ap-southeast-1.amazonaws.com/adminui-problem/members.json');
      if (response.ok) {
        const result = await response.json();
        setMembers(result.map((member) => createData(member.id, member.name, member.email, member.role)));
      } else {
        console.error('Error fetching data:', response.status);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleEdit = (id, name, email, role) => {
    setEditingMemberId(id);
    setEditedName(name);
    setEditedEmail(email);
    setEditedRole(role);
  };

  const handleSaveEdit = (id) => {
    setMembers((prevMembers) =>
      prevMembers.map((member) => {
        if (member.id === id) {
          return {
            ...member,
            name: editedName,
            email: editedEmail,
            role: editedRole,
          };
        } else {
          return member;
        }
      })
    );
    setEditingMemberId(null); // Reset editing state after saving
  };

  const handleCancelEdit = () => {
    setEditingMemberId(null); // Reset editing state without saving
  };

  const handleDelete = () => {
    setMembers((prevMembers) => prevMembers.filter((member) => !selected.includes(member.id)));
    setSelected([]); // Clear selected after deletion
  };

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAllClick = () => {
    if (selected.length > 0 && selected.length < members.length) {
      const newSelected = members.map((n) => n.id);
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event, id) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1),
      );
    }
    setSelected(newSelected);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleChangeDense = (event) => {
    setDense(event.target.checked);
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const isSelected = (id) => selected.indexOf(id) !== -1;

  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - members.length) : 0;

  const filteredMembers = members.filter((member) =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const visibleMembers = stableSort(filteredMembers, getComparator(order, orderBy)).slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage,
  );

  return (
    <>
      <Box sx={{ width: '100%' }}>
        <Paper sx={{ width: '100%', mb: 2 }}>
          <Toolbar
            sx={{
              pl: { sm: 2 },
              pr: { xs: 1, sm: 1 },
              ...(selected.length > 0 && {
                bgcolor: (theme) =>
                  alpha(theme.palette.primary.main, theme.palette.action.activatedOpacity),
              }),
            }}
          >
            {selected.length > 0 ? (
              <Typography
                sx={{ flex: '1 1 100%' }}
                color="inherit"
                variant="subtitle1"
                component="div"
              >
                {selected.length} selected
              </Typography>
            ) : (
              <Typography
                sx={{ flex: '1 1 100%' }}
                variant="h6"
                id="tableTitle"
                component="div"
              >
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <Input
                    placeholder='Search'
                    startAdornment={
                      <InputAdornment position='start'>
                        <SearchIcon />
                      </InputAdornment>
                    }
                    onChange={handleSearch}
                  />
                </div>
              </Typography>
            )}

            {selected.length > 0 ? (
              <Tooltip title="Delete">
                <IconButton onClick={handleDelete}>
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            ) : (
              <Tooltip title="Filter list">
                <IconButton>
                  {/* Add your filter icon here */}
                </IconButton>
              </Tooltip>
            )}
          </Toolbar>
          <TableContainer>
            <Table
              sx={{ minWidth: 750 }}
              aria-labelledby="tableTitle"
              size={dense ? 'small' : 'medium'}
            >
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      color="primary"
                      indeterminate={selected.length > 0 && selected.length < members.length}
                      checked={members.length > 0 && selected.length === members.length}
                      onChange={handleSelectAllClick}
                      inputProps={{
                        'aria-label': 'select all members',
                      }}
                    />
                  </TableCell>
                  <TableCell align="left" padding="none">
                    <TableSortLabel
                      active={orderBy === 'name'}
                      direction={order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                      onClick={() => handleRequestSort('name')}
                    >
                      Member Name
                      {orderBy === 'name' ? (
                        <Box component="span" sx={visuallyHidden}>
                          {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                        </Box>
                      ) : null}
                    </TableSortLabel>
                  </TableCell>
                  <TableCell align="right">Email ID</TableCell>
                  <TableCell align="right">Role</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {visibleMembers.map((member, index) => {
                  const isMemberSelected = isSelected(member.id);
                  const labelId = `enhanced-table-checkbox-${index}`;

                  return (
                    <TableRow
                      hover
                      onClick={(event) => handleClick(event, member.id)}
                      role="checkbox"
                      aria-checked={isMemberSelected}
                      tabIndex={-1}
                      key={member.id}
                      selected={isMemberSelected}
                      sx={{ cursor: 'pointer' }}
                    >
                      <TableCell padding="checkbox">
                        <Checkbox
                          color="primary"
                          checked={isMemberSelected}
                          inputProps={{
                            'aria-labelledby': labelId,
                          }}
                        />
                      </TableCell>
                      <TableCell component="th" id={labelId} scope="row" padding="none">
                        {editingMemberId === member.id ? (
                          <>
                            <input
                              type="text"
                              value={editedName}
                              onChange={(e) => setEditedName(e.target.value)}
                            />
                            <input
                              type="text"
                              value={editedEmail}
                              onChange={(e) => setEditedEmail(e.target.value)}
                            />
                            <input
                              type="text"
                              value={editedRole}
                              onChange={(e) => setEditedRole(e.target.value)}
                            />
                            <button onClick={() => handleSaveEdit(member.id)}>
                              <SaveIcon />
                            </button>
                            <button onClick={handleCancelEdit}>
                              <CancelIcon />
                            </button>
                          </>
                        ) : (
                          member.name
                        )}
                      </TableCell>
                      <TableCell align="right">
                        {editingMemberId === member.id ? (
                          <input
                            type="text"
                            value={editedEmail}
                            onChange={(e) => setEditedEmail(e.target.value)}
                          />
                        ) : (
                          member.email
                        )}
                      </TableCell>
                      <TableCell align="right">
                        {editingMemberId === member.id ? (
                          <input
                            type="text"
                            value={editedRole}
                            onChange={(e) => setEditedRole(e.target.value)}
                          />
                        ) : (
                          member.role
                        )}
                      </TableCell>
                      <TableCell align="right">
                        {editingMemberId === member.id ? (
                          <>
                            <IconButton onClick={() => handleSaveEdit(member.id)}>
                              <SaveIcon />
                            </IconButton>
                            <IconButton onClick={handleCancelEdit}>
                              <CancelIcon />
                            </IconButton>
                          </>
                        ) : (
                          <>
                            <IconButton onClick={() => handleEdit(member.id, member.name, member.email, member.role)}>
                              <EditIcon />
                            </IconButton>
                            <IconButton onClick={() => handleDelete(member.id)}>
                              <DeleteIcon />
                            </IconButton>
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
                {emptyRows > 0 && (
                  <TableRow
                    style={{
                      height: (dense ? 33 : 53) * emptyRows,
                    }}
                  >
                    <TableCell colSpan={6} />
                  </TableRow>
                )}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TablePagination
                    rowsPerPageOptions={[5, 10, 25, { label: 'All', value: -1 }]}
                    colSpan={5}
                    count={filteredMembers.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    SelectProps={{
                      inputProps: {
                        'aria-label': 'rows per page',
                      },
                      native: true,
                    }}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                  />
                </TableRow>
              </TableFooter>
            </Table>
          </TableContainer>
        </Paper>
      </Box>
    </>
  );
};

Footer.propTypes = {
  members: PropTypes.array.isRequired,
};

export default Footer;

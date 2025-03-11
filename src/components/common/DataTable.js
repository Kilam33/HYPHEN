import React from 'react';
import {
  Box,
  Typography,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Button,
  Input,
  Select,
  Option,
  IconButton,
} from '@mui/joy';

const DataTable = ({ title, columns, data, filterOptions, actions }) => {
  const [filters, setFilters] = React.useState({});
  const [searchTerm, setSearchTerm] = React.useState('');

  // Handle filter changes
  const handleFilterChange = (columnId, value) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [columnId]: value,
    }));
  };

  // Handle search term changes
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Filter data based on filters and search term
  const filteredData = data.filter((row) => {
    // Apply column filters
    const matchesFilters = Object.entries(filters).every(([columnId, value]) => {
      if (!value) return true; // No filter applied for this column
      return row[columnId] === value;
    });

    // Apply search term
    const matchesSearch = Object.values(row).some((value) =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    );

    return matchesFilters && matchesSearch;
  });

  return (
    <Box>
      {/* Table Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography level="h5">{title}</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {/* Search Input */}
          <Input
            placeholder="Search..."
            value={searchTerm}
            onChange={handleSearchChange}
            startDecorator={<SearchIcon />}
            size="sm"
          />
          {/* Actions */}
          {actions.map((action, index) => (
            <Button
              key={index}
              startDecorator={action.icon}
              color={action.color}
              variant={action.variant}
              onClick={action.onClick}
            >
              {action.label}
            </Button>
          ))}
        </Box>
      </Box>

      {/* Filters */}
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        {columns.map((column) => {
          if (column.filterable && filterOptions) {
            return (
              <Select
                key={column.id}
                placeholder={`Filter by ${column.label}`}
                value={filters[column.id] || ''}
                onChange={(_, value) => handleFilterChange(column.id, value)}
                size="sm"
                sx={{ minWidth: 150 }}
              >
                <Option value="">All</Option>
                {filterOptions.map((option) => (
                  <Option key={option.value} value={option.value}>
                    {option.label}
                  </Option>
                ))}
              </Select>
            );
          }
          return null;
        })}
      </Box>

      {/* Table */}
      <Table>
        <TableHead>
          <TableRow>
            {columns.map((column) => (
              <TableCell key={column.id} style={{ width: column.width }}>
                {column.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredData.map((row) => (
            <TableRow key={row.id}>
              {columns.map((column) => (
                <TableCell key={column.id}>
                  {column.render ? column.render(row) : row[column.id]}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* No Data Message */}
      {filteredData.length === 0 && (
        <Box sx={{ textAlign: 'center', p: 3 }}>
          <Typography level="body-md">No data found.</Typography>
        </Box>
      )}
    </Box>
  );
};

export default DataTable;
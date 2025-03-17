import React, { useState, useEffect } from 'react';
import { Box, Checkbox, Typography, TabList, Card, Grid, Button, Input, IconButton, Chip, Table, Divider, Tabs, Tab, Sheet, Select, Option, Modal, ModalDialog, ModalClose, FormControl, FormLabel, Textarea, Switch, Badge, CircularProgress, Stack, Alert } from '@mui/joy';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import FilterListIcon from '@mui/icons-material/FilterList';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import WarningIcon from '@mui/icons-material/Warning';
import TrendingUpIcon from '@mui/icons-material/TrendingUp'; 
import QrCodeIcon from '@mui/icons-material/QrCode';
import HistoryIcon from '@mui/icons-material/History';
import RefreshIcon from '@mui/icons-material/Refresh';
import InventoryIcon from '@mui/icons-material/Inventory';
import CategoryIcon from '@mui/icons-material/Category';
import UploadIcon from '@mui/icons-material/Upload';
import CategoryManagementModal from './CategoryManagementModal';


// Get the API URL from environment variables or use a default
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function InventoryManagement() {
  const [inventory, setInventory] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [openAddModal, setOpenAddModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [filterCategory, setFilterCategory] = useState('all');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [selectedItems, setSelectedItems] = useState([]);
  

  // Fetch all necessary data when component mounts
  useEffect(() => {
    fetchData();
  }, []);

  // Reset selections when page changes
  useEffect(() => {
    setSelectedItems([]);
  }, [currentPage]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterCategory]);

  // Main data fetching function
  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Initialize database first
      await fetch(`${API_URL}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      // Then fetch all data in parallel
      const [inventoryData, categoriesData, suppliersData] = await Promise.all([
        fetchInventory(),
        fetchCategories(),
        fetchSuppliers()
      ]);

      // Ensure we have valid data before setting state
      if (Array.isArray(inventoryData)) {
        setInventory(inventoryData);
      }
      if (Array.isArray(categoriesData)) {
        setCategories(categoriesData);
      }
      if (Array.isArray(suppliersData)) {
        setSuppliers(suppliersData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setError(error.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };


  

  // Fetch inventory data
  const fetchInventory = async () => {
    try {
      const response = await fetch(`${API_URL}/inventory_items`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to fetch inventory data');
      }
      return await response.json();
    } catch (error) {
      console.error('Inventory fetch error:', error);
      throw error;
    }
  };

  // Fetch categories data
  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_URL}/categories`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to fetch categories data');
      }
      return await response.json();
    } catch (error) {
      console.error('Categories fetch error:', error);
      throw error;
    }
  };

  // Fetch suppliers data
  const fetchSuppliers = async () => {
    try {
      const response = await fetch(`${API_URL}/suppliers`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to fetch suppliers data');
      }
      return await response.json();
    } catch (error) {
      console.error('Suppliers fetch error:', error);
      throw error;
    }
  };

  // Filter inventory items based on search query and category filter
  const filteredItems = React.useMemo(() => {
    if (!Array.isArray(inventory)) return [];

    return inventory.filter(item => {
      const matchesSearch =
        (item?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item?.sku?.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory =
        filterCategory === 'all' ||
        item?.category === filterCategory;

      return matchesSearch && matchesCategory;
    });
  }, [inventory, searchQuery, filterCategory]);

  // Get current items for pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);

  // Handle category changes
  const handleCategoryChange = async () => {
    try {
      await fetchCategories();
      // Refresh inventory to get updated category names
      await fetchInventory();
    } catch (error) {
      console.error('Error refreshing categories:', error);
      setError('Failed to refresh categories');
    }
  };

  // Handle individual item selection
const handleSelectItem = (itemId) => {
  setSelectedItems(prev => {
    if (prev.includes(itemId)) {
      return prev.filter(id => id !== itemId);
    } else {
      return [...prev, itemId];
    }
  });
};

// Handle select all functionality
const handleSelectAll = () => {
  if (selectedItems.length === currentItems.length) {
    // If all are selected, unselect all
    setSelectedItems([]);
  } else {
    // Otherwise select all current items
    setSelectedItems(currentItems.map(item => item.id));
  }
};

  // Format date function
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Handle item editing
  const handleEditItem = (item) => {
    setSelectedItem(item);
    setOpenAddModal(true);
  };

  // Handle modal close
  const handleCloseModal = () => {
    setOpenAddModal(false);
    setSelectedItem(null);
  };

  // Handle delete confirmation dialog
  const handleDeleteClick = (item) => {
    setItemToDelete(item);
    setDeleteConfirmOpen(true);
  };

  // Handle actual item deletion
  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/inventory_items/${itemToDelete.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to delete item');
      }

      // Remove item from state
      setInventory(prev => prev.filter(item => item.id !== itemToDelete.id));

      // Close dialog
      setDeleteConfirmOpen(false);
      setItemToDelete(null);
    } catch (error) {
      console.error('Error deleting item:', error);
      setError('Failed to delete item: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Function to handle form submission for adding or updating an item
  const handleAddOrUpdateItem = async (event) => {
    event.preventDefault();
    setSaveLoading(true);

    try {
      const formData = new FormData(event.currentTarget);
      const itemData = {
        name: formData.get('name'),
        sku: formData.get('sku'),
        category_id: parseInt(formData.get('category'), 10),
        in_stock: parseInt(formData.get('inStock'), 10),
        reserved: parseInt(formData.get('reserved'), 10) || 0,
        low_stock_threshold: parseInt(formData.get('lowStockThreshold'), 10) || 10,
        supplier_id: parseInt(formData.get('supplier'), 10),
        location: formData.get('location') || '',
        description: formData.get('description') || ''
      };

      const url = selectedItem
        ? `${API_URL}/inventory_items/${selectedItem.id}` // Update existing item
        : `${API_URL}/inventory_items`; // Add new item
      const method = selectedItem ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(itemData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to save item');
      }

      const savedItem = await response.json();

      // Update state with new or updated item
      if (selectedItem) {
        setInventory(prev => prev.map(item => item.id === savedItem.id ? savedItem : item));
      } else {
        setInventory(prev => [...prev, savedItem]);
      }

      // Close modal
      handleCloseModal();
    } catch (error) {
      console.error('Error saving item:', error);
      setError('Failed to save item: ' + error.message);
    } finally {
      setSaveLoading(false);
    }
  };

  // Export inventory data as CSV
  const exportInventoryCsv = () => {
    // Create CSV header
    const headers = [
      'ID', 'Name', 'SKU', 'Category', 'In Stock', 
      'Reserved', 'Available', 'Low Stock Threshold', 
      'Supplier', 'Location', 'Description'
    ];
    
    // Create CSV rows
    const rows = inventory.map(item => [
      item.id,
      item.name,
      item.sku,
      item.category,
      item.in_stock,
      item.reserved,
      item.available,
      item.low_stock_threshold,
      item.supplier_name,
      item.location,
      item.description
    ]);
    
    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => 
        // Escape commas and quotes in cell values
        typeof cell === 'string' ? `"${cell.replace(/"/g, '""')}"` : cell
      ).join(','))
    ].join('\n');
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'inventory_export.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle restock action for low stock items
  const handleRestock = (item) => {
    handleEditItem(item);
  };

  // Loading state
  if (loading && inventory.length === 0) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: 'calc(100vh - 64px)',
          flexDirection: 'column',
          gap: 2
        }}
      >
        <CircularProgress size="lg" />
        <Typography level="body-md">Loading inventory data...</Typography>
      </Box>
    );
  }

  // Error state
  if (error && inventory.length === 0) {
    return (
      <Box
        sx={{
          p: 3,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: 'calc(100vh - 64px)',
          flexDirection: 'column',
          gap: 2
        }}
      >
        <Alert color="danger" variant="soft" sx={{ maxWidth: 600 }}>
          <Typography level="h4">Error</Typography>
          <Typography>{error}</Typography>
          <Button
            onClick={fetchData}
            sx={{ mt: 2 }}
            color="danger"
          >
            Retry
          </Button>
        </Alert>
      </Box>
    );
  }

  // Main render
  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 7, mb: 3 }}>
        <Typography level="h3">Inventory Manager</Typography>
        <Button
          variant="solid"
          color="primary"
          startDecorator={<AddIcon />}
          onClick={() => setOpenAddModal(true)}
        >
          Add Item
        </Button>
      </Box>

      {/* Stats cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid xs={12} sm={6} lg={3}>
          <Card variant="soft" color="light" sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography level="title-md">Total Inventory Value</Typography>
              <InventoryIcon />
            </Box>
            <Typography level="h3">${inventory.reduce((acc, item) => acc + (item.in_stock * item.price), 0).toLocaleString()}</Typography>
            <Typography level="body-sm" sx={{ mt: 1 }}>Based on current stock levels</Typography>
          </Card>
        </Grid>
        <Grid xs={12} sm={6} lg={3}>
          <Card variant="soft" color="warning" sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography level="title-md">Low Stock Items</Typography>
              <WarningIcon />
            </Box>
            <Typography level="h3">{inventory.filter(item => item.available <= item.low_stock_threshold).length}</Typography>
            <Typography level="body-sm" sx={{ mt: 1 }}>Items needing restock</Typography>
          </Card>
        </Grid>
        <Grid xs={12} sm={6} lg={3}>
          <Card variant="soft" color="success" sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography level="title-md">Forecasted Demand</Typography>
              <TrendingUpIcon />
            </Box>
            <Typography level="h3">+15%</Typography>
            <Typography level="body-sm" sx={{ mt: 1 }}>Next 30 days</Typography>
          </Card>
        </Grid>
        <Grid xs={12} sm={6} lg={3}>
          <Card variant="soft" color="danger" sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography level="title-md">Inventory Turnover</Typography>
              <RefreshIcon />
            </Box>
            <Typography level="h3">2.5x</Typography>
            <Typography level="body-sm" sx={{ mt: 1 }}>Last 12 months</Typography>
          </Card>
        </Grid>
      </Grid>
      
      {/* Display error as alert if error exists but we have some data */}
      {error && inventory.length > 0 && (
        <Alert color="warning" variant="soft" sx={{ mb: 3 }}>
          {error}
          <Button size="sm" variant="soft" color="warning" onClick={fetchData} sx={{ ml: 2 }}>
            Retry
          </Button>
        </Alert>
      )}

      {/* Tabs for different inventory views */}
      <Tabs
        value={activeTab}
        onChange={(e, value) => setActiveTab(value)}
        sx={{ mb: 3 }}
      >
        <TabList>
          <Tab>All Items</Tab>
          <Tab>
            <Badge badgeContent={inventory.filter(item => item.available <= item.low_stock_threshold).length} color="warning">
              Low Stock
            </Badge>
          </Tab>
          <Tab>Categories</Tab>
        </TabList>
      </Tabs>
      

      {/* Search and filter bar */}
      <Card variant="outlined" sx={{ mb: 3, p: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid xs={12} sm={5}>
            <Input
              fullWidth
              placeholder="Search by name or SKU"
              startDecorator={<SearchIcon />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </Grid>
          <Grid xs={12} sm={3}>
            <Select
              placeholder="Category"
              startDecorator={<CategoryIcon />}
              value={filterCategory}
              onChange={(e, value) => setFilterCategory(value || 'all')}
            >
              <Option value="all">All Categories</Option>
              {categories.map(category => (
                <Option key={category.id} value={category.name}>{category.name}</Option>
              ))}
            </Select>
          </Grid>
          <Grid xs={12} sm={4} sx={{ display: 'flex', gap: 1, justifyContent: { xs: 'flex-start', sm: 'flex-end' } }}>
            <Button
              variant="soft"
              color="primary"
              startDecorator={<RefreshIcon />}
              size="sm"
              onClick={async () => {
                setLoading(true);
                try {
                  await fetchData(); // Use your existing fetchData function
                  setSearchQuery(''); // Reset search query
                  setFilterCategory('all'); // Reset category filter
                  setCurrentPage(1); // Reset to first page
                } catch (error) {
                  console.error("Failed to refresh data:", error);
                  setError("Failed to refresh data: " + error.message);
                } finally {
                  setLoading(false);
                }
              }}
              disabled={loading} // Disable button while loading
            >
              {loading ? 'Refreshing...' : 'Refresh'}
            </Button>
            
            <Button
              variant="outlined"
              colorvariant="outlined"
              color="neutral"
              startDecorator={<FilterListIcon />}
            >
              Filter
            </Button>
            <Button
              variant="outlined"
              color="neutral"
              startDecorator={<FileDownloadIcon />}
              onClick={exportInventoryCsv}
            >
              Export
            </Button>
          </Grid>
        </Grid>
      </Card>
      {/* Add this before your table */}
      {selectedItems.length > 0 && (
        <Box sx={{ mb: 2, display: 'flex', gap: 1 }}>
          <Typography sx={{ display: 'flex', alignItems: 'center' }}>
            {selectedItems.length} item(s) selected
          </Typography>
          <Button
            size="sm"
            color="primary"
            variant="soft"
            startDecorator={<EditIcon />}
          >
            Bulk Edit
          </Button>
          <Button
            size="sm"
            color="danger"
            variant="soft"
            startDecorator={<DeleteIcon />}
            onClick={() => {
              // Add confirm dialog or logic for bulk delete
              console.log("Bulk delete:", selectedItems);
            }}
          >
            Delete Selected
          </Button>
        </Box>
      )}
      {/* Content based on active tab */}
      {activeTab === 0 && (
        <Card variant="outlined">
          <Table stickyHeader hoverRow>
            <thead>
              <tr>
                <th style={{ width: '5%' }}>
                  <Checkbox
                    checked={currentItems.length > 0 && selectedItems.length === currentItems.length}
                    indeterminate={selectedItems.length > 0 && selectedItems.length < currentItems.length}
                    onChange={handleSelectAll}
                  />
                </th>
                <th style={{ width: '20%' }}>Name</th>
                <th style={{ width: '10%' }}>SKU</th>
                <th style={{ width: '20%' }}>Name</th>
                <th style={{ width: '10%' }}>SKU</th>
                <th style={{ width: '10%' }}>Category</th>
                <th style={{ width: '10%' }}>In Stock</th>
                <th style={{ width: '10%' }}>Available</th>
                <th style={{ width: '10%' }}>Supplier</th>
                <th style={{ width: '10%' }}>Location</th>
                <th style={{ width: '20%' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '2rem' }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                      <InventoryIcon sx={{ fontSize: 40, opacity: 0.3 }} />
                      <Typography level="body-lg">No inventory items found</Typography>
                      <Typography level="body-sm" sx={{ opacity: 0.7 }}>
                        {searchQuery || filterCategory !== 'all'
                          ? "Try adjusting your search filters"
                          : "Add your first inventory item to get started"}
                      </Typography>
                    </Box>
                  </td>
                </tr>
              ) : (
                currentItems.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <Checkbox
                        checked={selectedItems.includes(item.id)}
                        onChange={() => handleSelectItem(item.id)}
                      />
                    </td>
                    <td>
                      <Typography fontWeight="lg">{item.name}</Typography>
                    </td>
                    <td>
                      <Typography fontWeight="lg">{item.name}</Typography>
                    </td>
                    <td>
                      <Typography level="body-sm" color="neutral">
                        {item.sku}
                      </Typography>
                    </td>
                    <td>
                      <Chip
                        size="sm"
                        variant="soft"
                        color="neutral"
                      >
                        {item.category}
                      </Chip>
                    </td>
                    <td>{item.in_stock}</td>
                    <td>
                      <Chip
                        size="sm"
                        color={item.available <= item.low_stock_threshold ? "warning" : "success"}
                        variant="soft"
                        startDecorator={item.available <= item.low_stock_threshold ? <WarningIcon /> : null}
                      >
                        {item.available}
                      </Chip>
                    </td>
                    <td>{item.supplier_name}</td>
                    <td>{item.location || '-'}</td>
                    <td>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton
                          size="sm"
                          variant="plain"
                          color="neutral"
                          onClick={() => handleEditItem(item)}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="sm"
                          variant="plain"
                          color="danger"
                          onClick={() => handleDeleteClick(item)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </Card>
      )}

      {/* Low Stock Tab */}
      {activeTab === 1 && (
        <Card variant="outlined">
          <Table stickyHeader hoverRow>
            <thead>
              <tr>
                <th>Name</th>
                <th>SKU</th>
                <th>Available</th>
                <th>Threshold</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {inventory.filter(item => item.available <= item.low_stock_threshold).length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                      <InventoryIcon sx={{ fontSize: 40, opacity: 0.3 }} />
                      <Typography level="body-lg">No low stock items</Typography>
                      <Typography level="body-sm" sx={{ opacity: 0.7 }}>
                        All inventory items are above their low stock thresholds
                      </Typography>
                    </Box>
                  </td>
                </tr>
              ) : (
                inventory
                  .filter(item => item.available <= item.low_stock_threshold)
                  .map((item) => (
                    <tr key={item.id}>
                      <td>
                        <Typography fontWeight="lg">{item.name}</Typography>
                        <Typography level="body-xs" color="neutral">
                          {item.category}
                        </Typography>
                      </td>
                      <td>{item.sku}</td>
                      <td>
                        <Chip
                          size="sm"
                          color="warning"
                          variant="soft"
                          startDecorator={<WarningIcon />}
                        >
                          {item.available}
                        </Chip>
                      </td>
                      <td>{item.low_stock_threshold}</td>
                      <td>
                        <Button
                          size="sm"
                          variant="outlined"
                          color="neutral"
                          onClick={() => handleRestock(item)}
                          startDecorator={<UploadIcon />}
                        >
                          Restock
                        </Button>
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </Table>
        </Card>
      )}

      {/* Categories Tab */}
      {activeTab === 2 && (
        <>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Button
              variant="outlined"
              color="primary"
              startDecorator={<CategoryIcon />}
              onClick={() => setCategoryModalOpen(true)}
            >
              Manage Categories
            </Button>
          </Box>
          <Grid container spacing={2}>
            {categories.map((category) => (
              <Grid key={category.id} xs={12} sm={6} md={4} lg={3}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <Typography level="h4">{category.name}</Typography>
                  <Typography level="body-sm" sx={{ mb: 2 }}>
                    {category.description || 'No description available'}
                  </Typography>
                  <Divider />
                  <Box sx={{ pt: 2, pb: 1 }}>
                    <Chip size="sm" variant="soft" color="primary">
                      {category.item_count} items
                    </Chip>
                  </Box>
                </Card>
              </Grid>
            ))}
            {categories.length === 0 && (
              <Grid xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                  <Typography level="body-lg">No categories found</Typography>
                </Box>
              </Grid>
            )}
          </Grid>
        </>
      )}

      {/* Add/Edit Item Modal */}
      <Modal open={openAddModal} onClose={handleCloseModal}>
        <ModalDialog size="lg">
          <ModalClose />
          <Typography level="h4">
            {selectedItem ? 'Edit Inventory Item' : 'Add New Inventory Item'}
          </Typography>
          <Divider sx={{ my: 2 }} />
          
          <form onSubmit={handleAddOrUpdateItem}>
            <Grid container spacing={2}>
              <Grid xs={12} sm={6}>
                <FormControl required>
                  <FormLabel>Item Name</FormLabel>
                  <Input
                    name="name"
                    defaultValue={selectedItem?.name || ''}
                    placeholder="Enter item name"
                  />
                </FormControl>
              </Grid>
              <Grid xs={12} sm={6}>
                <FormControl required>
                  <FormLabel>SKU</FormLabel>
                  <Input
                    name="sku"
                    defaultValue={selectedItem?.sku || ''}
                    placeholder="Enter unique SKU code"
                  />
                </FormControl>
              </Grid>
              <Grid xs={12} sm={6}>
                <FormControl required>
                  <FormLabel>Category</FormLabel>
                  <Select
                    name="category"
                    defaultValue={selectedItem?.category_id?.toString() || ''}
                    placeholder="Select category"
                  >
                    {categories.map(category => (
                      <Option key={category.id} value={category.id.toString()}>
                        {category.name}
                      </Option>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid xs={12} sm={6}>
                <FormControl required>
                  <FormLabel>Supplier</FormLabel>
                  <Select
                    name="supplier"
                    defaultValue={selectedItem?.supplier_id?.toString() || ''}
                    placeholder="Select supplier"
                  >
                    {suppliers.map(supplier => (
                      <Option key={supplier.id} value={supplier.id.toString()}>
                        {supplier.name}
                      </Option>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid xs={12} sm={4}>
                <FormControl required>
                  <FormLabel>In Stock</FormLabel>
                  <Input
                    name="inStock"
                    type="number"
                    defaultValue={selectedItem?.in_stock || 0}
                    slotProps={{ input: { min: 0 } }}
                  />
                </FormControl>
              </Grid>
              <Grid xs={12} sm={4}>
                <FormControl>
                  <FormLabel>Reserved</FormLabel>
                  <Input
                    name="reserved"
                    type="number"
                    defaultValue={selectedItem?.reserved || 0}
                    slotProps={{ input: { min: 0 } }}
                  />
                </FormControl>
              </Grid>
              <Grid xs={12} sm={4}>
                <FormControl>
                  <FormLabel>Low Stock Threshold</FormLabel>
                  <Input
                    name="lowStockThreshold"
                    type="number"
                    defaultValue={selectedItem?.low_stock_threshold || 10}
                    slotProps={{ input: { min: 0 } }}
                  />
                </FormControl>
              </Grid>
              <Grid xs={12}>
                <FormControl>
                  <FormLabel>Location</FormLabel>
                  <Input
                    name="location"
                    defaultValue={selectedItem?.location || ''}
                    placeholder="Storage location (optional)"
                  />
                </FormControl>
              </Grid>
              <Grid xs={12}>
                <FormControl>
                  <FormLabel>Description</FormLabel>
                  <Textarea
                    name="description"
                    defaultValue={selectedItem?.description || ''}
                    minRows={3}
                    placeholder="Item description (optional)"
                  />
                </FormControl>
              </Grid>
            </Grid>

            <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button variant="outlined" color="neutral" onClick={handleCloseModal}>
                Cancel
              </Button>
              <Button type="submit" loading={saveLoading}>
                {selectedItem ? 'Update' : 'Add'} Item
              </Button>
            </Box>
          </form>
        </ModalDialog>
      </Modal>
      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
        {/* First page button */}
        <Button
          variant="outlined"
          color="neutral"
          onClick={() => setCurrentPage(1)}
          disabled={currentPage === 1}
          size="sm"
        >
          First
        </Button>

        {/* Skip 10 pages backward */}
        <Button
          variant="outlined"
          color="neutral"
          onClick={() => setCurrentPage(prev => Math.max(prev - 10, 1))}
          disabled={currentPage <= 10}
          size="sm"
        >
          -10
        </Button>

        {/* Previous page button */}
        <Button
          variant="outlined"
          color="neutral"
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
        >
          Previous
        </Button>

        <Typography sx={{ display: 'flex', alignItems: 'center', mx: 2 }}>
          Page {currentPage} of {Math.ceil(filteredItems.length / itemsPerPage)}
        </Typography>

        {/* Next page button */}
        <Button
          variant="outlined"
          color="neutral"
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(filteredItems.length / itemsPerPage)))}
          disabled={currentPage >= Math.ceil(filteredItems.length / itemsPerPage)}
        >
          Next
        </Button>

        {/* Skip 10 pages forward */}
        <Button
          variant="outlined"
          color="neutral"
          onClick={() => setCurrentPage(prev => Math.min(prev + 10, Math.ceil(filteredItems.length / itemsPerPage)))}
          disabled={currentPage >= Math.ceil(filteredItems.length / itemsPerPage) - 9}
          size="sm"
        >
          +10
        </Button>

        {/* Last page button */}
        <Button
          variant="outlined"
          color="neutral"
          onClick={() => setCurrentPage(Math.ceil(filteredItems.length / itemsPerPage))}
          disabled={currentPage === Math.ceil(filteredItems.length / itemsPerPage)}
          size="sm"
        >
          Last
        </Button>

        {/* input field to let users jump to a specific page */}
        <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
          <Typography sx={{ mr: 1 }}>Go to:</Typography>
          <Input
            size="sm"
            sx={{ width: '60px' }}
            type="number"
            slotProps={{
              input: {
                min: 1,
                max: Math.ceil(filteredItems.length / itemsPerPage)
              }
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const value = parseInt(e.target.value);
                if (!isNaN(value) && value >= 1 && value <= Math.ceil(filteredItems.length / itemsPerPage)) {
                  setCurrentPage(value);
                }
              }
            }}
          />
        </Box>

      </Box>


      {/* Delete Confirmation Modal */}
      <Modal open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <ModalDialog variant="outlined" role="alertdialog">
          <Typography level="h4">Confirm Delete</Typography>
          <Divider sx={{ my: 2 }} />
          <Typography mb={2}>
            Are you sure you want to delete the item "{itemToDelete?.name}"?
            This action cannot be undone.
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
            <Button variant="plain" color="neutral" onClick={() => setDeleteConfirmOpen(false)}>
              Cancel
            </Button>
            <Button variant="solid" color="danger" onClick={handleConfirmDelete}>
              Delete
            </Button>
          </Box>
        </ModalDialog>
      </Modal>

      {/* Category Management Modal */}
      <CategoryManagementModal
        open={categoryModalOpen}
        onClose={() => setCategoryModalOpen(false)}
        categories={categories}
        onCategoryChange={handleCategoryChange}
        apiUrl={API_URL}

        
      />
    </Box>
    
    
  );
}

export default InventoryManagement;
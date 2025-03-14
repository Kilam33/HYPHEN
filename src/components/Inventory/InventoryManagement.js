import React, { useState, useEffect } from 'react';
import { Box, Typography, TabList, Card, Grid, Button, Input, IconButton, Chip, Table, Divider, Tabs, Tab, Sheet, Select, Option, Modal, ModalDialog, ModalClose, FormControl, FormLabel, Textarea, Switch, Badge, CircularProgress, Stack, Alert } from '@mui/joy';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import FilterListIcon from '@mui/icons-material/FilterList';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import WarningIcon from '@mui/icons-material/Warning';
import QrCodeIcon from '@mui/icons-material/QrCode';
import HistoryIcon from '@mui/icons-material/History';
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

  // Fetch all necessary data when component mounts
  useEffect(() => {
    fetchData();
  }, []);

  // Main data fetching function
  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Initialize database if needed
      await initializeDatabase();

      // Fetch all data in parallel
      await Promise.all([
        fetchInventory(),
        fetchCategories(),
        fetchSuppliers()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError(error.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // Initialize database
  const initializeDatabase = async () => {
    try {
      const response = await fetch(`${API_URL}/setup`, { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to initialize database');
      }
      
      return await response.json();
    } catch (error) {
      console.warn('Database setup warning:', error);
      // Continue even if setup fails - might be already set up
    }
  };

  // Fetch inventory data
  const fetchInventory = async () => {
    try {
      const response = await fetch(`${API_URL}/inventory`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch inventory data');
      }
      
      const data = await response.json();
      setInventory(data);
      return data;
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
        throw new Error('Failed to fetch categories data');
      }
      
      const data = await response.json();
      setCategories(data);
      return data;
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
        throw new Error('Failed to fetch suppliers data');
      }
      
      const data = await response.json();
      setSuppliers(data);
      return data;
    } catch (error) {
      console.error('Suppliers fetch error:', error);
      throw error;
    }
  };

  // Filter inventory items based on search query and category filter
  const filteredItems = inventory.filter(item => {
    const matchesSearch =
      (item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.sku?.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory =
      filterCategory === 'all' ||
      item.category === filterCategory;

    return matchesSearch && matchesCategory;
  });

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
      const response = await fetch(`${API_URL}/inventory/${itemToDelete.id}`, {
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
        ? `${API_URL}/inventory/${selectedItem.id}` // Update existing item
        : `${API_URL}/inventory`; // Add new item
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

      {/* Content based on active tab */}
      {activeTab === 0 && (
        <Card variant="outlined">
          <Table stickyHeader hoverRow>
            <thead>
              <tr>
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
              {filteredItems.length === 0 ? (
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
                filteredItems.map((item) => (
                  <tr key={item.id}>
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
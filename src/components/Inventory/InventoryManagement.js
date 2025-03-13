import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  Grid,
  Button,
  Input,
  IconButton,
  Chip,
  Table,
  Divider,
  Tabs,
  TabList,
  Tab,
  Sheet,
  Select,
  Option,
  Modal,
  ModalDialog,
  ModalClose,
  FormControl,
  FormLabel,
  Textarea,
  Switch,
  Badge,
  CircularProgress,
  Stack
} from '@mui/joy';
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

// Mock data for demonstration purposes
const mockInventoryItems = [
  { 
    id: '1001', 
    name: 'Smartphone Cases (iPhone 15)', 
    sku: 'CASE-IP15-BLK',
    category: 'Accessories',
    inStock: 154,
    reserved: 12,
    available: 142,
    lowStockThreshold: 30,
    supplierName: 'TechAccess Inc.',
    location: 'Warehouse A',
    lastUpdated: '2023-10-12T09:23:11'
  },
  { 
    id: '1002', 
    name: 'Wireless Earbuds',
    sku: 'AUDIO-WE-100', 
    category: 'Audio',
    inStock: 78,
    reserved: 5,
    available: 73,
    lowStockThreshold: 25,
    supplierName: 'SoundMasters Ltd',
    location: 'Warehouse B',
    lastUpdated: '2023-10-14T14:45:23'
  },
  { 
    id: '1003', 
    name: 'USB-C Cable 6ft',
    sku: 'CBL-USBC-6FT', 
    category: 'Cables',
    inStock: 210,
    reserved: 25,
    available: 185,
    lowStockThreshold: 50,
    supplierName: 'ConnectPro Supply',
    location: 'Warehouse A',
    lastUpdated: '2023-10-15T11:30:45'
  },
  { 
    id: '1004', 
    name: 'Bluetooth Speaker',
    sku: 'AUDIO-BTS-200', 
    category: 'Audio',
    inStock: 45,
    reserved: 8,
    available: 37,
    lowStockThreshold: 20,
    supplierName: 'SoundMasters Ltd',
    location: 'Warehouse C',
    lastUpdated: '2023-10-10T16:15:33'
  },
  { 
    id: '1005', 
    name: 'Printer Ink Cartridge',
    sku: 'PRNT-INK-BLK', 
    category: 'Printing',
    inStock: 5,
    reserved: 0,
    available: 5,
    lowStockThreshold: 10,
    supplierName: 'Office Supply Co',
    location: 'Warehouse B',
    lastUpdated: '2023-10-13T09:10:15'
  },
  { 
    id: '1006', 
    name: 'External SSD 1TB',
    sku: 'STRG-SSD-1TB', 
    category: 'Storage',
    inStock: 32,
    reserved: 3,
    available: 29,
    lowStockThreshold: 15,
    supplierName: 'DataTech Solutions',
    location: 'Warehouse A',
    lastUpdated: '2023-10-11T13:25:58'
  },
  { 
    id: '1007', 
    name: 'Ergonomic Mouse',
    sku: 'INPT-MS-ERGO', 
    category: 'Peripherals',
    inStock: 67,
    reserved: 4,
    available: 63,
    lowStockThreshold: 20,
    supplierName: 'TechAccess Inc.',
    location: 'Warehouse B',
    lastUpdated: '2023-10-09T10:45:31'
  }
];

const mockCategories = [
  { id: 1, name: 'Accessories', itemCount: 324 },
  { id: 2, name: 'Audio', itemCount: 156 },
  { id: 3, name: 'Cables', itemCount: 213 },
  { id: 4, name: 'Peripherals', itemCount: 89 },
  { id: 5, name: 'Printing', itemCount: 42 },
  { id: 6, name: 'Storage', itemCount: 76 }
];

function InventoryManagement() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [openAddModal, setOpenAddModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [categories, setCategories] = useState([]);
  const [filterCategory, setFilterCategory] = useState('all');
  
  // Simulate data fetching
  useEffect(() => {
    const fetchData = async () => {
      try {
        // In a real app, this would be an API call
        setTimeout(() => {
          setInventory(mockInventoryItems);
          setCategories(mockCategories);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching inventory data:', error);
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Filter inventory items based on search query and category filter
  const filteredItems = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         item.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
    
    return matchesSearch && matchesCategory;
  });
  
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
  
  if (loading) {
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
  
  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
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
      
      {/* Tabs for different inventory views */}
      <Tabs 
        value={activeTab} 
        onChange={(e, value) => setActiveTab(value)}
        sx={{ mb: 3 }}
      >
        <TabList>
          <Tab>All Items</Tab>
          <Tab>
            <Badge badgeContent={inventory.filter(item => item.available <= item.lowStockThreshold).length} color="warning">
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
              color="neutral" 
              startDecorator={<FilterListIcon />}
            >
              Filters
            </Button>
            <Button 
              variant="outlined" 
              color="neutral" 
              startDecorator={<FileDownloadIcon />}
            >
              Export
            </Button>
            <IconButton variant="outlined" color="neutral">
              <UploadIcon />
            </IconButton>
          </Grid>
        </Grid>
      </Card>
      
      {activeTab === 0 && (
        <Card variant="outlined">
          <Table sx={{ '& th': { fontWeight: 'bold' } }}>
            <thead>
              <tr>
                <th style={{ width: '30%' }}>Item</th>
                <th style={{ width: '10%' }}>SKU</th>
                <th style={{ width: '12%' }}>Category</th>
                <th style={{ width: '10%' }}>In Stock</th>
                <th style={{ width: '10%' }}>Available</th>
                <th style={{ width: '15%' }}>Location</th>
                <th style={{ width: '13%' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => (
                <tr key={item.id}>
                  <td>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {item.available <= item.lowStockThreshold && (
                        <Badge color="warning" badgeContent=" " variant="solid" />
                      )}
                      {item.name}
                    </Box>
                  </td>
                  <td>{item.sku}</td>
                  <td>
                    <Chip 
                      size="sm" 
                      variant="soft" 
                      color="neutral"
                    >
                      {item.category}
                    </Chip>
                  </td>
                  <td>{item.inStock}</td>
                  <td>
                    <Typography 
                      color={item.available <= item.lowStockThreshold ? 'warning' : 'neutral'}
                      fontWeight={item.available <= item.lowStockThreshold ? 'bold' : 'normal'}
                    >
                      {item.available}
                    </Typography>
                  </td>
                  <td>{item.location}</td>
                  <td>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton 
                        size="sm" 
                        variant="plain" 
                        color="neutral"
                        onClick={() => handleEditItem(item)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="sm" variant="plain" color="neutral">
                        <QrCodeIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="sm" variant="plain" color="neutral">
                        <HistoryIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="sm" variant="plain" color="danger">
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          {filteredItems.length === 0 && (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography level="body-lg">No items found</Typography>
            </Box>
          )}
        </Card>
      )}
      
      {activeTab === 1 && (
        <Card variant="outlined">
          <Table sx={{ '& th': { fontWeight: 'bold' } }}>
            <thead>
              <tr>
                <th style={{ width: '30%' }}>Item</th>
                <th style={{ width: '10%' }}>SKU</th>
                <th style={{ width: '10%' }}>In Stock</th>
                <th style={{ width: '10%' }}>Available</th>
                <th style={{ width: '10%' }}>Threshold</th>
                <th style={{ width: '15%' }}>Supplier</th>
                <th style={{ width: '15%' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {inventory
                .filter(item => item.available <= item.lowStockThreshold)
                .filter(item => 
                  item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                  item.sku.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((item) => (
                <tr key={item.id}>
                  <td>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <WarningIcon fontSize="small" color="warning" />
                      {item.name}
                    </Box>
                  </td>
                  <td>{item.sku}</td>
                  <td>{item.inStock}</td>
                  <td>
                    <Typography color="warning" fontWeight="bold">
                      {item.available}
                    </Typography>
                  </td>
                  <td>{item.lowStockThreshold}</td>
                  <td>{item.supplierName}</td>
                  <td>
                    <Button 
                      size="sm" 
                      variant="soft" 
                      color="primary"
                      startDecorator={<InventoryIcon fontSize="small" />}
                    >
                      Restock
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          {inventory.filter(item => item.available <= item.lowStockThreshold).length === 0 && (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography level="body-lg">No low stock items</Typography>
            </Box>
          )}
        </Card>
      )}
      
      {activeTab === 2 && (
        <Grid container spacing={3}>
          {categories.map(category => (
            <Grid xs={12} sm={6} md={4} key={category.id}>
              <Card variant="outlined" sx={{ height: '100%' }}>
                <Box sx={{ p: 2 }}>
                  <Typography level="title-md">{category.name}</Typography>
                  <Divider sx={{ my: 1 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography level="body-md">{category.itemCount} items</Typography>
                    <Button 
                      size="sm" 
                      variant="plain" 
                      color="neutral"
                      endDecorator="→"
                    >
                      View
                    </Button>
                  </Box>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
      
      {/* Add/Edit Item Modal */}
      <Modal open={openAddModal} onClose={handleCloseModal}>
        <ModalDialog size="lg">
          <ModalClose />
          <Typography level="h4">
            {selectedItem ? 'Edit Inventory Item' : 'Add New Inventory Item'}
          </Typography>
          <Divider sx={{ my: 2 }} />
          
          <Box component="form" sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid xs={12}>
                <FormControl>
                  <FormLabel>Item Name</FormLabel>
                  <Input 
                    placeholder="Enter item name"
                    defaultValue={selectedItem?.name || ''}
                  />
                </FormControl>
              </Grid>
              
              <Grid xs={12} sm={6}>
                <FormControl>
                  <FormLabel>SKU</FormLabel>
                  <Input 
                    placeholder="Enter SKU code"
                    defaultValue={selectedItem?.sku || ''}
                  />
                </FormControl>
              </Grid>
              
              <Grid xs={12} sm={6}>
                <FormControl>
                  <FormLabel>Category</FormLabel>
                  <Select 
                    placeholder="Select category"
                    defaultValue={selectedItem?.category || ''}
                  >
                    {categories.map(category => (
                      <Option key={category.id} value={category.name}>{category.name}</Option>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid xs={12} sm={4}>
                <FormControl>
                  <FormLabel>In Stock</FormLabel>
                  <Input 
                    type="number" 
                    placeholder="Quantity"
                    defaultValue={selectedItem?.inStock || 0}
                  />
                </FormControl>
              </Grid>
              
              <Grid xs={12} sm={4}>
                <FormControl>
                  <FormLabel>Reserved</FormLabel>
                  <Input 
                    type="number" 
                    placeholder="Reserved quantity"
                    defaultValue={selectedItem?.reserved || 0}
                  />
                </FormControl>
              </Grid>
              
              <Grid xs={12} sm={4}>
                <FormControl>
                  <FormLabel>Low Stock Threshold</FormLabel>
                  <Input 
                    type="number" 
                    placeholder="Minimum quantity"
                    defaultValue={selectedItem?.lowStockThreshold || 10}
                  />
                </FormControl>
              </Grid>
              
              <Grid xs={12} sm={6}>
                <FormControl>
                  <FormLabel>Supplier</FormLabel>
                  <Select 
                    placeholder="Select supplier"
                    defaultValue={selectedItem?.supplierName || ''}
                  >
                    <Option value="TechAccess Inc.">TechAccess Inc.</Option>
                    <Option value="SoundMasters Ltd">SoundMasters Ltd</Option>
                    <Option value="ConnectPro Supply">ConnectPro Supply</Option>
                    <Option value="Office Supply Co">Office Supply Co</Option>
                    <Option value="DataTech Solutions">DataTech Solutions</Option>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid xs={12} sm={6}>
                <FormControl>
                  <FormLabel>Location</FormLabel>
                  <Select 
                    placeholder="Select location"
                    defaultValue={selectedItem?.location || ''}
                  >
                    <Option value="Warehouse A">Warehouse A</Option>
                    <Option value="Warehouse B">Warehouse B</Option>
                    <Option value="Warehouse C">Warehouse C</Option>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid xs={12}>
                <FormControl>
                  <FormLabel>Description</FormLabel>
                  <Textarea 
                    minRows={3} 
                    placeholder="Enter item description"
                  />
                </FormControl>
              </Grid>
              
              <Grid xs={12}>
                <FormControl orientation="horizontal" sx={{ justifyContent: 'space-between' }}>
                  <div>
                    <FormLabel>Track Inventory</FormLabel>
                    <Typography level="body-sm">Enable tracking for this item</Typography>
                  </div>
                  <Switch defaultChecked />
                </FormControl>
              </Grid>
            </Grid>
            
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 3 }}>
              <Button variant="outlined" color="neutral" onClick={handleCloseModal}>
                Cancel
              </Button>
              <Button variant="solid" color="primary">
                {selectedItem ? 'Save Changes' : 'Add Item'}
              </Button>
            </Box>
          </Box>
        </ModalDialog>
      </Modal>
    </Box>
  );
}

export default InventoryManagement;
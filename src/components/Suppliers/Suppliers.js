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
  Modal,
  ModalDialog,
  ModalClose,
  FormControl,
  FormLabel,
  Textarea,
  Switch,
  Badge,
  CircularProgress,
  Stack,
  Sheet,
  Avatar,
  Tooltip,
  Select,
  Option,
  CardOverflow
} from '@mui/joy';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import FilterListIcon from '@mui/icons-material/FilterList';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import BusinessIcon from '@mui/icons-material/Business';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import InventoryIcon from '@mui/icons-material/Inventory';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';

// Mock data for demonstration purposes
const mockSuppliers = [
  {
    id: 1,
    name: 'TechAccess Inc.',
    contactName: 'John Smith',
    email: 'john@techaccessinc.com',
    phone: '(555) 123-4567',
    address: '123 Tech Blvd, San Francisco, CA 94107',
    category: 'Electronics',
    itemsSupplied: 42,
    status: 'active',
    rating: 4.8,
    lastOrderDate: '2023-10-05T14:30:00',
    paymentTerms: 'Net 30',
    logo: 'TA',
    notes: 'Preferred supplier for accessories and peripherals.',
    isPremium: true
  },
  {
    id: 2,
    name: 'SoundMasters Ltd',
    contactName: 'Emily Johnson',
    email: 'emily@soundmasters.com',
    phone: '(555) 234-5678',
    address: '456 Audio Way, Nashville, TN 37203',
    category: 'Audio',
    itemsSupplied: 28,
    status: 'active',
    rating: 4.5,
    lastOrderDate: '2023-10-12T11:15:00',
    paymentTerms: 'Net 45',
    logo: 'SM',
    notes: 'Specialized in high-quality audio equipment.',
    isPremium: true
  },
  {
    id: 3,
    name: 'ConnectPro Supply',
    contactName: 'Michael Chen',
    email: 'michael@connectpro.com',
    phone: '(555) 345-6789',
    address: '789 Cable St, Austin, TX 78701',
    category: 'Cables',
    itemsSupplied: 36,
    status: 'active',
    rating: 4.2,
    lastOrderDate: '2023-10-08T09:45:00',
    paymentTerms: 'Net 30',
    logo: 'CP',
    notes: 'Wide range of cable products and connectors.',
    isPremium: false
  },
  {
    id: 4,
    name: 'Office Supply Co',
    contactName: 'Sarah Williams',
    email: 'sarah@officesupply.com',
    phone: '(555) 456-7890',
    address: '101 Business Park, Chicago, IL 60611',
    category: 'Office Supplies',
    itemsSupplied: 64,
    status: 'active',
    rating: 3.9,
    lastOrderDate: '2023-10-01T15:30:00',
    paymentTerms: 'Net 15',
    logo: 'OS',
    notes: 'Bulk discounts available for large orders.',
    isPremium: true
  },
  {
    id: 5,
    name: 'DataTech Solutions',
    contactName: 'David Rodriguez',
    email: 'david@datatech.com',
    phone: '(555) 567-8901',
    address: '202 Storage Ave, Seattle, WA 98101',
    category: 'Storage',
    itemsSupplied: 19,
    status: 'inactive',
    rating: 4.0,
    lastOrderDate: '2023-09-22T10:15:00',
    paymentTerms: 'Net 30',
    logo: 'DT',
    notes: 'Specializes in solid state and external storage devices.',
    isPremium: false
  },
  {
    id: 6,
    name: 'Global Peripherals Inc',
    contactName: 'Linda Kim',
    email: 'linda@globalperipherals.com',
    phone: '(555) 678-9012',
    address: '303 Mouse Blvd, Portland, OR 97205',
    category: 'Peripherals',
    itemsSupplied: 31,
    status: 'active',
    rating: 4.3,
    lastOrderDate: '2023-10-10T13:45:00',
    paymentTerms: 'Net 45',
    logo: 'GP',
    notes: 'International shipping available with additional fees.',
    isPremium: true
  }
];

const supplierCategories = [
  { id: 1, name: 'Electronics', count: 2 },
  { id: 2, name: 'Audio', count: 1 },
  { id: 3, name: 'Cables', count: 1 },
  { id: 4, name: 'Office Supplies', count: 1 },
  { id: 5, name: 'Storage', count: 1 },
  { id: 6, name: 'Peripherals', count: 1 }
];

function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [openAddModal, setOpenAddModal] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [filterCategory, setFilterCategory] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'
  
  // Simulate data fetching
  useEffect(() => {
    const fetchData = async () => {
      try {
        // In a real app, this would be an API call
        setTimeout(() => {
          setSuppliers(mockSuppliers);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching supplier data:', error);
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Filter suppliers based on search query and category filter
  const filteredSuppliers = suppliers.filter(supplier => {
    const matchesSearch = 
      supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      supplier.contactName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      supplier.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = filterCategory === 'all' || supplier.category === filterCategory;
    const matchesStatus = 
      activeTab === 0 || 
      (activeTab === 1 && supplier.status === 'active') ||
      (activeTab === 2 && supplier.status === 'inactive');
    
    return matchesSearch && matchesCategory && matchesStatus;
  });
  
  // Format date function
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };
  
  // Handle supplier editing
  const handleEditSupplier = (supplier) => {
    setSelectedSupplier(supplier);
    setOpenAddModal(true);
  };
  
  // Handle modal close
  const handleCloseModal = () => {
    setOpenAddModal(false);
    setSelectedSupplier(null);
  };

  // Render rating stars
  const renderRating = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const stars = [];
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<StarIcon key={i} fontSize="small" sx={{ color: 'warning.500' }} />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<StarIcon key={i} fontSize="small" sx={{ color: 'warning.500', opacity: 0.5 }} />);
      } else {
        stars.push(<StarBorderIcon key={i} fontSize="small" sx={{ color: 'warning.500' }} />);
      }
    }
    
    return (
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        {stars}
        <Typography level="body-xs" sx={{ ml: 0.5 }}>({rating})</Typography>
      </Box>
    );
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
        <Typography level="body-md">Loading supplier data...</Typography>
      </Box>
    );
  }
  
  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 7, mb: 3 }}>
        <Typography level="h3">Suppliers</Typography>
        <Button 
          variant="solid" 
          color="primary" 
          startDecorator={<AddIcon />}
          onClick={() => setOpenAddModal(true)}
        >
          Add Supplier
        </Button>
      </Box>
      
      {/* Tabs for different supplier views */}
      <Tabs 
        value={activeTab} 
        onChange={(e, value) => setActiveTab(value)}
        sx={{ mb: 3 }}
      >
        <TabList>
          <Tab>All Suppliers</Tab>
          <Tab>Active</Tab>
          <Tab>Inactive</Tab>
        </TabList>
      </Tabs>
      
      {/* Search and filter bar */}
      <Card variant="outlined" sx={{ mb: 3, p: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid xs={12} sm={5}>
            <Input
              fullWidth
              placeholder="Search suppliers..."
              startDecorator={<SearchIcon />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </Grid>
          <Grid xs={12} sm={3}>
            <Select 
              placeholder="Category" 
              startDecorator={<BusinessIcon />}
              value={filterCategory}
              onChange={(e, value) => setFilterCategory(value || 'all')}
            >
              <Option value="all">All Categories</Option>
              {supplierCategories.map(category => (
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
            <Box sx={{ display: 'flex' }}>
              <IconButton 
                variant={viewMode === 'grid' ? 'soft' : 'outlined'} 
                color={viewMode === 'grid' ? 'primary' : 'neutral'}
                onClick={() => setViewMode('grid')}
              >
                <BusinessIcon />
              </IconButton>
              <IconButton 
                variant={viewMode === 'table' ? 'soft' : 'outlined'} 
                color={viewMode === 'table' ? 'primary' : 'neutral'}
                onClick={() => setViewMode('table')}
              >
                <FilterListIcon />
              </IconButton>
            </Box>
          </Grid>
        </Grid>
      </Card>
      
      {/* Grid View */}
      {viewMode === 'grid' && (
        <Grid container spacing={3}>
          {filteredSuppliers.map(supplier => (
            <Grid xs={12} sm={6} md={4} key={supplier.id}>
              <Card variant="outlined" sx={{ height: '100%' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar 
                      size="lg" 
                      color={supplier.isPremium ? 'primary' : 'neutral'}
                    >
                      {supplier.logo}
                    </Avatar>
                    <Box>
                      <Typography level="title-md">{supplier.name}</Typography>
                      <Typography level="body-sm">{supplier.category}</Typography>
                    </Box>
                  </Box>
                  {supplier.isPremium && (
                    <Chip size="sm" color="primary" variant="soft">Premium</Chip>
                  )}
                </Box>
                
                <Divider sx={{ my: 2 }} />
                
                <Grid container spacing={1} sx={{ mb: 2 }}>
                  <Grid xs={12}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <EmailIcon fontSize="small" />
                      <Typography level="body-sm">{supplier.email}</Typography>
                    </Box>
                  </Grid>
                  <Grid xs={12}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PhoneIcon fontSize="small" />
                      <Typography level="body-sm">{supplier.phone}</Typography>
                    </Box>
                  </Grid>
                  <Grid xs={12}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                      <LocationOnIcon fontSize="small" sx={{ mt: 0.5 }} />
                      <Typography level="body-sm">{supplier.address}</Typography>
                    </Box>
                  </Grid>
                </Grid>
                
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                  <Typography level="body-sm">Rating:</Typography>
                  {renderRating(supplier.rating)}
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                  <Typography level="body-sm">Items Supplied:</Typography>
                  <Chip size="sm" variant="soft" color="neutral">{supplier.itemsSupplied}</Chip>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                  <Typography level="body-sm">Payment Terms:</Typography>
                  <Typography level="body-sm">{supplier.paymentTerms}</Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Typography level="body-sm">Last Order:</Typography>
                  <Typography level="body-sm">{formatDate(supplier.lastOrderDate)}</Typography>
                </Box>
                
                <CardOverflow sx={{ mt: 'auto' }}>
                  <Divider />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1.5 }}>
                    <Button 
                      size="sm" 
                      variant="plain" 
                      color="primary"
                      startDecorator={<InventoryIcon />}
                    >
                      View Items
                    </Button>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton 
                        size="sm" 
                        variant="plain" 
                        color="neutral"
                        onClick={() => handleEditSupplier(supplier)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="sm" variant="plain" color="primary">
                        <EmailIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="sm" variant="plain" color="danger">
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                </CardOverflow>
              </Card>
            </Grid>
          ))}
          
          {filteredSuppliers.length === 0 && (
            <Grid xs={12}>
              <Card variant="outlined" sx={{ p: 3, textAlign: 'center' }}>
                <Typography level="body-lg">No suppliers found</Typography>
              </Card>
            </Grid>
          )}
        </Grid>
      )}
      
      {/* Table View */}
      {viewMode === 'table' && (
        <Card variant="outlined">
          <Table sx={{ '& th': { fontWeight: 'bold' } }}>
            <thead>
              <tr>
                <th style={{ width: '25%' }}>Supplier</th>
                <th style={{ width: '15%' }}>Contact</th>
                <th style={{ width: '15%' }}>Category</th>
                <th style={{ width: '10%' }}>Items</th>
                <th style={{ width: '10%' }}>Rating</th>
                <th style={{ width: '10%' }}>Status</th>
                <th style={{ width: '15%' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSuppliers.map((supplier) => (
                <tr key={supplier.id}>
                  <td>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar size="sm" color={supplier.isPremium ? 'primary' : 'neutral'}>
                        {supplier.logo}
                      </Avatar>
                      <Box>
                        <Typography level="body-md">{supplier.name}</Typography>
                        <Typography level="body-xs">{supplier.email}</Typography>
                      </Box>
                    </Box>
                  </td>
                  <td>
                    <Typography level="body-sm">{supplier.contactName}</Typography>
                    <Typography level="body-xs">{supplier.phone}</Typography>
                  </td>
                  <td>
                    <Chip size="sm" variant="soft" color="neutral">
                      {supplier.category}
                    </Chip>
                  </td>
                  <td>{supplier.itemsSupplied}</td>
                  <td>{renderRating(supplier.rating)}</td>
                  <td>
                    <Chip 
                      size="sm" 
                      variant="soft" 
                      color={supplier.status === 'active' ? 'success' : 'warning'}
                    >
                      {supplier.status === 'active' ? 'Active' : 'Inactive'}
                    </Chip>
                  </td>
                  <td>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="Edit">
                        <IconButton 
                          size="sm" 
                          variant="plain" 
                          color="neutral"
                          onClick={() => handleEditSupplier(supplier)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Order">
                        <IconButton size="sm" variant="plain" color="neutral">
                          <LocalShippingIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="View Items">
                        <IconButton size="sm" variant="plain" color="neutral">
                          <InventoryIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton size="sm" variant="plain" color="danger">
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          {filteredSuppliers.length === 0 && (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography level="body-lg">No suppliers found</Typography>
            </Box>
          )}
        </Card>
      )}
      
      {/* Add/Edit Supplier Modal */}
      <Modal open={openAddModal} onClose={handleCloseModal}>
        <ModalDialog size="lg">
          <ModalClose />
          <Typography level="h4">
            {selectedSupplier ? 'Edit Supplier' : 'Add New Supplier'}
          </Typography>
          <Divider sx={{ my: 2 }} />
          
          <Box component="form" sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid xs={12} sm={6}>
                <FormControl>
                  <FormLabel>Supplier Name</FormLabel>
                  <Input 
                    placeholder="Enter supplier name"
                    defaultValue={selectedSupplier?.name || ''}
                  />
                </FormControl>
              </Grid>
              
              <Grid xs={12} sm={6}>
                <FormControl>
                  <FormLabel>Category</FormLabel>
                  <Select 
                    placeholder="Select category"
                    defaultValue={selectedSupplier?.category || ''}
                  >
                    {supplierCategories.map(category => (
                      <Option key={category.id} value={category.name}>{category.name}</Option>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid xs={12} sm={6}>
                <FormControl>
                  <FormLabel>Contact Name</FormLabel>
                  <Input 
                    placeholder="Enter contact person's name"
                    defaultValue={selectedSupplier?.contactName || ''}
                  />
                </FormControl>
              </Grid>
              
              <Grid xs={12} sm={6}>
                <FormControl>
                  <FormLabel>Email</FormLabel>
                  <Input 
                    type="email"
                    placeholder="Enter email address"
                    defaultValue={selectedSupplier?.email || ''}
                  />
                </FormControl>
              </Grid>
              
              <Grid xs={12} sm={6}>
                <FormControl>
                  <FormLabel>Phone</FormLabel>
                  <Input 
                    placeholder="Enter phone number"
                    defaultValue={selectedSupplier?.phone || ''}
                  />
                </FormControl>
              </Grid>
              
              <Grid xs={12} sm={6}>
                <FormControl>
                  <FormLabel>Payment Terms</FormLabel>
                  <Select 
                    placeholder="Select payment terms"
                    defaultValue={selectedSupplier?.paymentTerms || 'Net 30'}
                  >
                    <Option value="Net 15">Net 15</Option>
                    <Option value="Net 30">Net 30</Option>
                    <Option value="Net 45">Net 45</Option>
                    <Option value="Net 60">Net 60</Option>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid xs={12}>
                <FormControl>
                  <FormLabel>Address</FormLabel>
                  <Input 
                    placeholder="Enter full address"
                    defaultValue={selectedSupplier?.address || ''}
                  />
                </FormControl>
              </Grid>
              
              <Grid xs={12}>
                <FormControl>
                  <FormLabel>Notes</FormLabel>
                  <Textarea 
                    minRows={3} 
                    placeholder="Enter additional notes"
                    defaultValue={selectedSupplier?.notes || ''}
                  />
                </FormControl>
              </Grid>
              
              <Grid xs={12} sm={6}>
                <FormControl orientation="horizontal" sx={{ justifyContent: 'space-between' }}>
                  <div>
                    <FormLabel>Premium Supplier</FormLabel>
                    <Typography level="body-sm">Flag as premium supplier</Typography>
                  </div>
                  <Switch defaultChecked={selectedSupplier?.isPremium || false} />
                </FormControl>
              </Grid>
              
              <Grid xs={12} sm={6}>
                <FormControl orientation="horizontal" sx={{ justifyContent: 'space-between' }}>
                  <div>
                    <FormLabel>Active</FormLabel>
                    <Typography level="body-sm">Set supplier as active</Typography>
                  </div>
                  <Switch defaultChecked={selectedSupplier?.status === 'active' || true} />
                </FormControl>
              </Grid>
            </Grid>
            
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 3 }}>
              <Button variant="outlined" color="neutral" onClick={handleCloseModal}>
                Cancel
              </Button>
              <Button variant="solid" color="primary">
                {selectedSupplier ? 'Save Changes' : 'Add Supplier'}
              </Button>
            </Box>
          </Box>
        </ModalDialog>
      </Modal>
    </Box>
  );
}

export default Suppliers;
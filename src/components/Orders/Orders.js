import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  Divider,
  IconButton,
  Button,
  Table,
  Sheet,
  Chip,
  CircularProgress,
  Tabs,
  TabList,
  Tab,
  TabPanel,
  Select,
  Option,
  Input,
  FormControl,
  FormLabel,
  Modal,
  ModalDialog,
  ModalClose,
  Checkbox
} from '@mui/joy';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import RefreshIcon from '@mui/icons-material/Refresh';
import AddIcon from '@mui/icons-material/Add';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import ArchiveIcon from '@mui/icons-material/Archive';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import InventoryIcon from '@mui/icons-material/Inventory';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import EmailIcon from '@mui/icons-material/Email';

// Mock data for demonstration purposes
const mockOrdersData = {
  orders: [
    { 
      id: "ORD-2023-1055", 
      customer: "TechStore Inc.", 
      date: "2023-10-22T09:32:00", 
      total: 1255.99, 
      status: "Processing",
      paymentStatus: "Paid",
      items: 5
    },
    { 
      id: "ORD-2023-1054", 
      customer: "Audio World", 
      date: "2023-10-21T14:18:00", 
      total: 780.50, 
      status: "Shipped",
      paymentStatus: "Paid",
      items: 3
    },
    { 
      id: "ORD-2023-1053", 
      customer: "John Smith", 
      date: "2023-10-20T11:45:00", 
      total: 129.99, 
      status: "Delivered",
      paymentStatus: "Paid",
      items: 1
    },
    { 
      id: "ORD-2023-1052", 
      customer: "Office Supplies Co.", 
      date: "2023-10-19T16:05:00", 
      total: 2340.75, 
      status: "Processing",
      paymentStatus: "Pending",
      items: 12
    },
    { 
      id: "ORD-2023-1051", 
      customer: "Education Center", 
      date: "2023-10-18T10:30:00", 
      total: 1876.25, 
      status: "Cancelled",
      paymentStatus: "Refunded",
      items: 8
    },
    { 
      id: "ORD-2023-1050", 
      customer: "Sarah Johnson", 
      date: "2023-10-17T13:22:00", 
      total: 459.90, 
      status: "Delivered",
      paymentStatus: "Paid",
      items: 2
    },
    { 
      id: "ORD-2023-1049", 
      customer: "Digital Solutions", 
      date: "2023-10-16T09:10:00", 
      total: 3450.00, 
      status: "Shipped",
      paymentStatus: "Paid",
      items: 15
    },
    { 
      id: "ORD-2023-1048", 
      customer: "Tech Innovations LLC", 
      date: "2023-10-15T15:48:00", 
      total: 2145.60, 
      status: "Delivered",
      paymentStatus: "Paid",
      items: 7
    }
  ],
  stats: {
    totalOrders: 1055,
    pendingOrders: 15,
    shippedOrders: 12,
    completedOrders: 1020,
    cancelledOrders: 8,
    revenueToday: 4520.25,
    revenueThisWeek: 18765.99,
    revenueThisMonth: 84320.50
  }
};

function Orders() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [openNewOrderModal, setOpenNewOrderModal] = useState(false);
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  
  // Simulate data fetching
  useEffect(() => {
    const fetchData = async () => {
      try {
        // In a real app, this would be an API call
        setTimeout(() => {
          setData(mockOrdersData);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching orders data:', error);
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Handle search
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  // Handle filter change
  const handleFilterChange = (event, newValue) => {
    setFilterStatus(newValue);
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Get status chip color
  const getStatusColor = (status) => {
    switch (status) {
      case 'Processing':
        return 'primary';
      case 'Shipped':
        return 'info';
      case 'Delivered':
        return 'success';
      case 'Cancelled':
        return 'danger';
      default:
        return 'neutral';
    }
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'Processing':
        return <HourglassEmptyIcon />;
      case 'Shipped':
        return <LocalShippingIcon />;
      case 'Delivered':
        return <CheckCircleIcon />;
      case 'Cancelled':
        return <ErrorIcon />;
      default:
        return <ShoppingCartIcon />;
    }
  };

  // Get payment status color
  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'Paid':
        return 'success';
      case 'Pending':
        return 'warning';
      case 'Refunded':
        return 'danger';
      default:
        return 'neutral';
    }
  };

  // Filter orders based on search and status filter
  const filteredOrders = data?.orders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          order.customer.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filterStatus === 'all') return matchesSearch;
    return matchesSearch && order.status.toLowerCase() === filterStatus.toLowerCase();
  }) || [];

  // Handle checkbox selection
  const handleSelectOrder = (orderId) => {
    if (selectedOrders.includes(orderId)) {
      setSelectedOrders(selectedOrders.filter(id => id !== orderId));
    } else {
      setSelectedOrders([...selectedOrders, orderId]);
    }
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(filteredOrders.map(order => order.id));
    }
    setSelectAll(!selectAll);
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
        <Typography level="body-md">Loading orders data...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 7, mb: 3 }}>
        <Typography level="h3">Orders</Typography>
        <Button 
          variant="solid" 
          color="primary" 
          startDecorator={<AddIcon />}
          onClick={() => setOpenNewOrderModal(true)}
        >
          New Order
        </Button>
      </Box>
      
      {/* Stats cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid xs={12} sm={6} lg={3}>
          <Card variant="soft" color="primary" sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography level="title-md">Today's Revenue</Typography>
              <ShoppingCartIcon />
            </Box>
            <Typography level="h3">${data.stats.revenueToday.toLocaleString()}</Typography>
            <Typography level="body-sm" sx={{ mt: 1 }}>From {data.stats.pendingOrders + data.stats.shippedOrders} active orders</Typography>
          </Card>
        </Grid>
        <Grid xs={12} sm={6} lg={3}>
          <Card variant="soft" color="success" sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography level="title-md">Weekly Revenue</Typography>
              <InventoryIcon />
            </Box>
            <Typography level="h3">${data.stats.revenueThisWeek.toLocaleString()}</Typography>
            <Typography level="body-sm" sx={{ mt: 1 }}>+12.5% from last week</Typography>
          </Card>
        </Grid>
        <Grid xs={12} sm={6} lg={3}>
          <Card variant="soft" color="warning" sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography level="title-md">Total Orders</Typography>
              <ArchiveIcon />
            </Box>
            <Typography level="h3">{data.stats.totalOrders}</Typography>
            <Typography level="body-sm" sx={{ mt: 1 }}>{data.stats.pendingOrders} pending, {data.stats.shippedOrders} shipped</Typography>
          </Card>
        </Grid>
        <Grid xs={12} sm={6} lg={3}>
          <Card variant="soft" color="info" sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography level="title-md">Monthly Revenue</Typography>
              <LocalShippingIcon />
            </Box>
            <Typography level="h3">${data.stats.revenueThisMonth.toLocaleString()}</Typography>
            <Typography level="body-sm" sx={{ mt: 1 }}>+8.2% from last month</Typography>
          </Card>
        </Grid>
      </Grid>
      
      {/* Orders Table */}
      <Card variant="outlined" sx={{ mb: 3 }}>
        <Tabs 
          value={filterStatus} 
          onChange={handleFilterChange} 
          aria-label="Order status tabs"
          sx={{ borderRadius: 'lg' }}
        >
          <TabList variant="plain" sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
            <Tab value="all">All Orders</Tab>
            <Tab value="processing">Processing</Tab>
            <Tab value="shipped">Shipped</Tab>
            <Tab value="delivered">Delivered</Tab>
            <Tab value="cancelled">Cancelled</Tab>
          </TabList>
        </Tabs>
        
        <Box sx={{ p: 2, display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
            <Input
              placeholder="Search orders..."
              startDecorator={<SearchIcon />}
              value={searchQuery}
              onChange={handleSearch}
              sx={{ minWidth: 240 }}
            />
            <Button 
              variant="soft" 
              color="neutral" 
              startDecorator={<FilterListIcon />}
              size="sm"
            >
              Filters
            </Button>
            <Button 
              variant="soft" 
              color="primary" 
              startDecorator={<RefreshIcon />}
              size="sm"
              onClick={() => {
                setLoading(true);
                setTimeout(() => setLoading(false), 1000);
              }}
            >
              Refresh
            </Button>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            {selectedOrders.length > 0 && (
              <>
                <Button 
                  variant="soft" 
                  color="primary" 
                  startDecorator={<PictureAsPdfIcon />}
                  size="sm"
                >
                  Export Selected
                </Button>
                <Button 
                  variant="soft" 
                  color="danger" 
                  size="sm"
                >
                  Cancel Selected
                </Button>
              </>
            )}
          </Box>
        </Box>
        
        {filteredOrders.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography level="body-lg">No orders found matching your criteria</Typography>
          </Box>
        ) : (
          <Sheet sx={{ height: 'calc(100vh - 430px)', overflow: 'auto' }}>
            <Table stickyHeader hoverRow>
              <thead>
                <tr>
                  <th style={{ width: 40 }}>
                    <Checkbox
                      checked={selectAll}
                      onChange={handleSelectAll}
                      sx={{ verticalAlign: 'middle' }}
                    />
                  </th>
                  <th style={{ width: 120 }}>Order ID</th>
                  <th style={{ width: 200 }}>Customer</th>
                  <th style={{ width: 180 }}>Date</th>
                  <th style={{ width: 100 }}>Items</th>
                  <th style={{ width: 120 }}>Total</th>
                  <th style={{ width: 150 }}>Status</th>
                  <th style={{ width: 150 }}>Payment</th>
                  <th style={{ width: 80 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order.id}>
                    <td>
                      <Checkbox
                        checked={selectedOrders.includes(order.id)}
                        onChange={() => handleSelectOrder(order.id)}
                      />
                    </td>
                    <td>
                      <Typography level="body-sm" fontWeight="md">{order.id}</Typography>
                    </td>
                    <td>{order.customer}</td>
                    <td>{formatDate(order.date)}</td>
                    <td>{order.items}</td>
                    <td>${order.total.toLocaleString()}</td>
                    <td>
                      <Chip
                        variant="soft"
                        color={getStatusColor(order.status)}
                        startDecorator={getStatusIcon(order.status)}
                        size="sm"
                      >
                        {order.status}
                      </Chip>
                    </td>
                    <td>
                      <Chip
                        variant="outlined"
                        color={getPaymentStatusColor(order.paymentStatus)}
                        size="sm"
                      >
                        {order.paymentStatus}
                      </Chip>
                    </td>
                    <td>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton variant="plain" color="neutral" size="sm">
                          <MoreVertIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Sheet>
        )}
      </Card>
      
      {/* Action Buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 4 }}>
        <Button 
          variant="outlined" 
          color="primary" 
          startDecorator={<PictureAsPdfIcon />}
        >
          Export Orders
        </Button>
        <Button 
          variant="outlined" 
          color="neutral" 
          startDecorator={<EmailIcon />}
        >
          Email Report
        </Button>
      </Box>
      
      {/* New Order Modal */}
      <Modal
        open={openNewOrderModal}
        onClose={() => setOpenNewOrderModal(false)}
      >
        <ModalDialog
          aria-labelledby="new-order-modal"
          size="lg"
        >
          <ModalClose />
          <Typography id="new-order-modal" level="h4">
            Create New Order
          </Typography>
          <Divider sx={{ my: 2 }} />
          <Grid container spacing={2}>
            <Grid xs={12} sm={6}>
              <FormControl>
                <FormLabel>Customer</FormLabel>
                <Select placeholder="Select customer...">
                  <Option value="techstore">TechStore Inc.</Option>
                  <Option value="audioworld">Audio World</Option>
                  <Option value="john">John Smith</Option>
                  <Option value="office">Office Supplies Co.</Option>
                </Select>
              </FormControl>
            </Grid>
            <Grid xs={12} sm={6}>
              <FormControl>
                <FormLabel>Order Date</FormLabel>
                <Input type="date" defaultValue={new Date().toISOString().slice(0, 10)} />
              </FormControl>
            </Grid>
            <Grid xs={12}>
              <FormControl>
                <FormLabel>Items</FormLabel>
                <Sheet variant="outlined" sx={{ p: 2, borderRadius: 'md' }}>
                  <Typography level="body-sm" color="neutral">
                    No items added yet. Use the "Add Item" button below to add products to this order.
                  </Typography>
                  <Button 
                    startDecorator={<AddIcon />} 
                    variant="soft" 
                    color="primary" 
                    size="sm" 
                    sx={{ mt: 1 }}
                  >
                    Add Item
                  </Button>
                </Sheet>
              </FormControl>
            </Grid>
            <Grid xs={12} sm={6}>
              <FormControl>
                <FormLabel>Payment Status</FormLabel>
                <Select defaultValue="pending">
                  <Option value="paid">Paid</Option>
                  <Option value="pending">Pending</Option>
                </Select>
              </FormControl>
            </Grid>
            <Grid xs={12} sm={6}>
              <FormControl>
                <FormLabel>Shipping Method</FormLabel>
                <Select defaultValue="standard">
                  <Option value="standard">Standard Shipping</Option>
                  <Option value="express">Express Shipping</Option>
                  <Option value="overnight">Overnight Shipping</Option>
                </Select>
              </FormControl>
            </Grid>
            <Grid xs={12}>
              <FormControl>
                <FormLabel>Notes</FormLabel>
                <Input multiline minRows={3} placeholder="Add any special instructions or notes here..." />
              </FormControl>
            </Grid>
          </Grid>
          <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button variant="plain" color="neutral" onClick={() => setOpenNewOrderModal(false)}>
              Cancel
            </Button>
            <Button variant="solid" color="primary">
              Create Order
            </Button>
          </Box>
        </ModalDialog>
      </Modal>
    </Box>
  );
}

export default Orders;
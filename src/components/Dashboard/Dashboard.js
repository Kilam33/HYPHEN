import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  Divider, 
  IconButton, 
  Button, 
  List, 
  ListItem, 
  ListItemContent, 
  ListItemDecorator,
  Sheet,
  Chip,
  CircularProgress,
  AspectRatio,
  useColorScheme
} from '@mui/joy';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import InventoryIcon from '@mui/icons-material/Inventory';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import StorefrontIcon from '@mui/icons-material/Storefront';
import WarningIcon from '@mui/icons-material/Warning';
import RefreshIcon from '@mui/icons-material/Refresh';
import AssessmentIcon from '@mui/icons-material/Assessment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import SyncIcon from '@mui/icons-material/Sync';
import StatCard from './StatCard';

// Mock data for demonstration purposes
const mockInventoryData = {
  totalItems: 1428,
  lowStockItems: 23,
  revenue: 42850,
  pendingOrders: 15,
  inventoryTrend: [45, 52, 38, 60, 55, 50, 65, 60, 58, 75, 62, 48],
  revenueData: [12500, 15000, 11000, 18500, 16500, 21500, 19000, 20500, 23000, 24500, 27000, 25000],
  recentActivity: [
    { id: 1, type: 'lowStock', item: 'Printer Ink Cartridge', quantity: 5, threshold: 10, time: '10 minutes ago' },
    { id: 2, type: 'order', item: 'USB-C Cable 6ft', quantity: 25, customer: 'TechStore Inc.', time: '2 hours ago' },
    { id: 3, type: 'return', item: 'Wireless Earbuds', quantity: 3, reason: 'Defective', time: '4 hours ago' },
    { id: 4, type: 'restock', item: 'Smartphone Cases (iPhone 15)', quantity: 50, time: '5 hours ago' },
    { id: 5, type: 'order', item: 'Bluetooth Speaker', quantity: 12, customer: 'Audio World', time: '1 day ago' }
  ],
  quickbooksStatus: {
    lastSync: '2023-10-15T14:30:00',
    status: 'connected',
    pendingInvoices: 3
  }
};

function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { mode } = useColorScheme();
  
  // Simulate data fetching
  useEffect(() => {
    const fetchData = async () => {
      try {
        // In a real app, this would be an API call
        // await fetch('/api/dashboard')
        setTimeout(() => {
          setData(mockInventoryData);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
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
        <Typography level="body-md">Loading dashboard data...</Typography>
      </Box>
    );
  }
  
  // Activity type icon mapping
  const getActivityIcon = (type) => {
    switch (type) {
      case 'lowStock':
        return <WarningIcon sx={{ color: 'warning.500' }} />;
      case 'order':
        return <LocalShippingIcon sx={{ color: 'success.500' }} />;
      case 'return':
        return <ErrorIcon sx={{ color: 'danger.500' }} />;
      case 'restock':
        return <InventoryIcon sx={{ color: 'primary.500' }} />;
      default:
        return <CheckCircleIcon color="neutral" />;
    }
  };
  
  // Chart component using SVG
  const SimpleChart = ({ data, color = '#3366CC', height = 60 }) => {
    if (!data || data.length === 0) return null;
    
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min;
    
    // Create points for SVG path
    const points = data.map((value, index) => {
      const x = (index / (data.length - 1)) * 100;
      const y = 100 - ((value - min) / range) * 100;
      return `${x},${y}`;
    }).join(' ');
    
    return (
      <AspectRatio ratio="4/1" sx={{ minHeight: height }}>
        <svg width="100%" height="100%" preserveAspectRatio="none">
          <polyline
            points={points}
            stroke={color}
            strokeWidth="2"
            fill="none"
          />
          {/* Add area fill */}
          <polyline
            points={`0,100 ${points} 100,100`}
            fill={`${color}20`}
            stroke="none"
          />
        </svg>
      </AspectRatio>
    );
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

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt:7, mb: 3 }}>
        <Typography level="h3">Overview</Typography>
        <Button 
          variant="soft" 
          color="primary" 
          startDecorator={<RefreshIcon />}
          onClick={() => {
            setLoading(true);
            setTimeout(() => setLoading(false), 1000);
          }}
        >
          Refresh
        </Button>
      </Box>
      
      {/* Stat cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid xs={12} sm={6} lg={3}>
          <StatCard 
            title="Total Inventory"
            value={data.totalItems.toLocaleString()}
            percentChange={8.2}
            icon={<InventoryIcon />}
            color="primary"
            tooltip="Total number of inventory items across all warehouses"
          />
        </Grid>
        <Grid xs={12} sm={6} lg={3}>
          <StatCard 
            title="Low Stock Items"
            value={data.lowStockItems}
            percentChange={-12.5}
            icon={<WarningIcon />}
            color="warning"
            tooltip="Items below their minimum stock threshold"
          />
        </Grid>
        <Grid xs={12} sm={6} lg={3}>
          <StatCard 
            title="Monthly Revenue"
            value={`$${data.revenue.toLocaleString()}`}
            percentChange={15.3}
            icon={<AttachMoneyIcon />}
            color="success"
            tooltip="Total revenue generated this month"
          />
        </Grid>
        <Grid xs={12} sm={6} lg={3}>
          <StatCard 
            title="Pending Orders"
            value={data.pendingOrders}
            percentChange={2.7}
            icon={<LocalShippingIcon />}
            color="neutral"
            tooltip="Orders waiting to be fulfilled"
          />
        </Grid>
      </Grid>
      
      {/* Charts and activity section */}
      <Grid container spacing={3}>
        {/* Inventory Trend */}
        <Grid xs={12} md={6} xl={4}>
          <Card variant="outlined" sx={{ height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography level="title-md">Inventory Trend</Typography>
              <IconButton variant="plain" color="neutral" size="sm">
                <MoreVertIcon fontSize="small" />
              </IconButton>
            </Box>
            <SimpleChart 
              data={data.inventoryTrend} 
              color={mode === 'dark' ? '#5c7d8a' : '#3366CC'} 
              height={120} 
            />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
              <Typography level="body-sm" color="neutral">Jan</Typography>
              <Typography level="body-sm" color="neutral">Dec</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
              <Box>
                <Typography level="body-sm">Stock level change</Typography>
                <Typography level="title-sm" sx={{ color: 'success.500' }}>+6.7% YoY</Typography>
              </Box>
              <Button size="sm" variant="soft">Details</Button>
            </Box>
          </Card>
        </Grid>
        
        {/* Revenue Chart */}
        <Grid xs={12} md={6} xl={4}>
          <Card variant="outlined" sx={{ height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography level="title-md">Revenue Trend</Typography>
              <IconButton variant="plain" color="neutral" size="sm">
                <MoreVertIcon fontSize="small" />
              </IconButton>
            </Box>
            <SimpleChart 
              data={data.revenueData} 
              color={mode === 'dark' ? '#7295a3' : '#4CAF50'} 
              height={120} 
            />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
              <Typography level="body-sm" color="neutral">Jan</Typography>
              <Typography level="body-sm" color="neutral">Dec</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
              <Box>
                <Typography level="body-sm">Revenue change</Typography>
                <Typography level="title-sm" sx={{ color: 'success.500' }}>+15.3% YoY</Typography>
              </Box>
              <Button size="sm" variant="soft">Details</Button>
            </Box>
          </Card>
        </Grid>
        
        {/* QuickBooks Integration */}
        <Grid xs={12} xl={4}>
          <Card variant="outlined" sx={{ height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography level="title-md">QuickBooks Integration</Typography>
              <IconButton variant="plain" color="neutral" size="sm">
                <MoreVertIcon fontSize="small" />
              </IconButton>
            </Box>
            
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Chip
                  color={data.quickbooksStatus.status === 'connected' ? 'success' : 'danger'}
                  variant="soft"
                  startDecorator={data.quickbooksStatus.status === 'connected' ? <CheckCircleIcon /> : <ErrorIcon />}
                >
                  {data.quickbooksStatus.status === 'connected' ? 'Connected' : 'Disconnected'}
                </Chip>
              </Box>
              
              <Box sx={{ width: '100%', mb: 2 }}>
                <Typography level="body-sm" textAlign="center">Last synchronized: {formatDate(data.quickbooksStatus.lastSync)}</Typography>
              </Box>
              
              <Divider sx={{ my: 2, width: '100%' }} />
              
              <Typography level="title-sm">Pending Invoices: {data.quickbooksStatus.pendingInvoices}</Typography>
              
              <Button 
                variant="outlined" 
                color="primary" 
                startDecorator={<SyncIcon />} 
                sx={{ mt: 2 }}
                fullWidth
              >
                Sync Now
              </Button>
            </Box>
          </Card>
        </Grid>
        
        {/* Recent Activity */}
        <Grid xs={12}>
          <Card variant="outlined">
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography level="title-md">Recent Activity</Typography>
              <Button 
                size="sm" 
                variant="plain" 
                endDecorator="→"
              >
                View All
              </Button>
            </Box>
            
            <List sx={{ '--ListItem-paddingY': '1rem' }}>
              {data.recentActivity.map((activity) => (
                <ListItem key={activity.id}>
                  <ListItemDecorator>
                    {getActivityIcon(activity.type)}
                  </ListItemDecorator>
                  
                  <ListItemContent>
                    <Typography level="title-sm">{activity.item}</Typography>
                    <Typography level="body-sm">
                      {activity.type === 'lowStock' && `Low stock alert: ${activity.quantity}/${activity.threshold} remaining`}
                      {activity.type === 'order' && `Order of ${activity.quantity} units by ${activity.customer}`}
                      {activity.type === 'return' && `Return of ${activity.quantity} units - Reason: ${activity.reason}`}
                      {activity.type === 'restock' && `Restocked with ${activity.quantity} units`}
                    </Typography>
                  </ListItemContent>
                  
                  <Typography level="body-xs" color="neutral">
                    {activity.time}
                  </Typography>
                </ListItem>
              ))}
            </List>
          </Card>
        </Grid>
      </Grid>
      
      {/* Action Buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 4 }}>
        <Button 
          variant="solid" 
          color="primary" 
          startDecorator={<AssessmentIcon />}
        >
          Generate Reports
        </Button>
        <Button 
          variant="outlined" 
          color="neutral" 
          startDecorator={<StorefrontIcon />}
        >
          Manage Inventory
        </Button>
      </Box>
    </Box>
  );
}

export default Dashboard;
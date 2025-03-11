import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  Divider,
  IconButton,
  Button,
  Select,
  Option,
  Stack,
  Chip,
  Tab,
  TabList,
  TabPanel,
  Tabs,
  Table,
  Sheet,
  FormControl,
  FormLabel,
  Input,
  Checkbox,
  CircularProgress,
  AspectRatio,
  useColorScheme,
  Tooltip,
  LinearProgress
} from '@mui/joy';
import DownloadIcon from '@mui/icons-material/Download';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import FilterListIcon from '@mui/icons-material/FilterList';
import AssessmentIcon from '@mui/icons-material/Assessment';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import PrintIcon from '@mui/icons-material/Print';
import EmailIcon from '@mui/icons-material/Email';
import RefreshIcon from '@mui/icons-material/Refresh';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import InventoryIcon from '@mui/icons-material/Inventory';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import PieChartIcon from '@mui/icons-material/PieChart';
import BarChartIcon from '@mui/icons-material/BarChart';
import TimelineIcon from '@mui/icons-material/Timeline';
import ErrorIcon from '@mui/icons-material/Error';

// Mock data for reports
const mockReportData = {
  inventorySummary: {
    totalValue: 246850,
    totalItems: 1428,
    categoryCounts: [
      { name: 'Electronics', count: 458, value: 89500 },
      { name: 'Accessories', count: 352, value: 42350 },
      { name: 'Peripherals', count: 287, value: 61000 },
      { name: 'Components', count: 195, value: 34000 },
      { name: 'Storage', count: 136, value: 20000 }
    ],
    inventoryHealth: {
      optimal: 65,
      lowStock: 23,
      outOfStock: 5,
      excess: 7
    }
  },
  salesPerformance: {
    totalRevenue: 182450,
    totalOrders: 427,
    averageOrderValue: 427.28,
    monthlySales: [
      { month: 'Jan', sales: 12500 },
      { month: 'Feb', sales: 13600 },
      { month: 'Mar', sales: 14800 },
      { month: 'Apr', sales: 11900 },
      { month: 'May', sales: 15200 },
      { month: 'Jun', sales: 16700 },
      { month: 'Jul', sales: 14300 },
      { month: 'Aug', sales: 17500 },
      { month: 'Sep', sales: 18700 },
      { month: 'Oct', sales: 19800 },
      { month: 'Nov', sales: 16400 },
      { month: 'Dec', sales: 11050 }
    ],
    topSellingProducts: [
      { id: 1, name: 'USB-C Charger', sales: 152, revenue: 4560 },
      { id: 2, name: 'Wireless Earbuds', sales: 98, revenue: 11760 },
      { id: 3, name: 'HDMI Cable 6ft', sales: 87, revenue: 1305 },
      { id: 4, name: 'External SSD 1TB', sales: 65, revenue: 9750 },
      { id: 5, name: 'Bluetooth Speaker', sales: 54, revenue: 3240 }
    ],
    salesBySalesChannel: [
      { channel: 'Online Store', percentage: 45, revenue: 82102.5 },
      { channel: 'Retail Locations', percentage: 30, revenue: 54735 },
      { channel: 'Distributors', percentage: 15, revenue: 27367.5 },
      { channel: 'Marketplaces', percentage: 10, revenue: 18245 }
    ]
  },
  inventoryMovement: {
    inboundItems: 215,
    outboundItems: 427,
    returns: 32,
    adjustments: 18,
    topInboundProducts: [
      { id: 1, name: 'Smartphone Cases (iPhone 15)', quantity: 100 },
      { id: 2, name: 'Type-C Cables', quantity: 75 },
      { id: 3, name: 'Wireless Chargers', quantity: 50 }
    ],
    monthlyMovement: [
      { month: 'Jul', inbound: 180, outbound: 230 },
      { month: 'Aug', inbound: 210, outbound: 245 },
      { month: 'Sep', inbound: 190, outbound: 260 },
      { month: 'Oct', inbound: 230, outbound: 280 },
      { month: 'Nov', inbound: 215, outbound: 270 },
      { month: 'Dec', inbound: 185, outbound: 220 }
    ]
  },
  supplierPerformance: {
    totalSuppliers: 24,
    onTimeDelivery: 87,
    qualityRating: 92,
    costVariance: -3.2,
    topSuppliers: [
      { id: 1, name: 'TechGadget Inc.', onTime: 98, quality: 95, orders: 42 },
      { id: 2, name: 'ElectroSupply Co.', onTime: 95, quality: 94, orders: 36 },
      { id: 3, name: 'Global Components', onTime: 86, quality: 92, orders: 28 }
    ]
  },
  recentReports: [
    { id: 1, name: 'Q4 Inventory Valuation', type: 'inventory', date: '2023-12-31', size: '1.2 MB' },
    { id: 2, name: 'November Sales Analysis', type: 'sales', date: '2023-12-05', size: '0.8 MB' },
    { id: 3, name: 'Supplier Performance Review', type: 'supplier', date: '2023-11-30', size: '1.5 MB' },
    { id: 4, name: 'Seasonal Inventory Forecast', type: 'forecast', date: '2023-11-15', size: '2.1 MB' }
  ],
  scheduleReports: [
    { id: 1, name: 'Weekly Inventory Summary', schedule: 'Every Monday', format: 'PDF', recipients: 3 },
    { id: 2, name: 'Monthly Sales Performance', schedule: 'First day of month', format: 'Excel', recipients: 5 },
    { id: 3, name: 'Quarterly Business Review', schedule: 'End of quarter', format: 'PDF', recipients: 7 }
  ]
};

function Reports() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [dateRange, setDateRange] = useState('last30days');
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const { mode } = useColorScheme();

  // Simulate data fetching
  useEffect(() => {
    const fetchData = async () => {
      try {
        // In a real app, this would be an API call
        // await fetch('/api/reports')
        setTimeout(() => {
          setData(mockReportData);
          setLoading(false);
        }, 1200);
      } catch (error) {
        console.error('Error fetching report data:', error);
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const handleGenerateReport = () => {
    setIsGeneratingReport(true);
    setTimeout(() => {
      setIsGeneratingReport(false);
    }, 2000);
  };

  // Chart component using SVG
  const SimpleBarChart = ({ data, xKey, yKey, color = '#3366CC', height = 200 }) => {
    if (!data || data.length === 0) return null;
    
    const max = Math.max(...data.map(item => item[yKey]));
    const barWidth = 100 / data.length;
    const barPadding = barWidth * 0.2;
    const actualBarWidth = barWidth - barPadding * 2;
    
    return (
      <AspectRatio ratio="3/1" sx={{ minHeight: height }}>
        <svg width="100%" height="100%" preserveAspectRatio="none">
          {data.map((item, index) => {
            const barHeight = (item[yKey] / max) * 100;
            const x = index * barWidth + barPadding;
            return (
              <rect
                key={index}
                x={`${x}%`}
                y={`${100 - barHeight}%`}
                width={`${actualBarWidth}%`}
                height={`${barHeight}%`}
                fill={color}
                rx="2"
              />
            );
          })}
        </svg>
      </AspectRatio>
    );
  };

  const SimplePieChart = ({ data, valueKey, nameKey, height = 200 }) => {
    if (!data || data.length === 0) return null;
    
    const total = data.reduce((sum, item) => sum + item[valueKey], 0);
    const colors = ['#3366CC', '#4CAF50', '#FF9800', '#E91E63', '#9C27B0', '#607D8B'];
    
    let currentAngle = 0;
    const paths = data.map((item, index) => {
      const percentage = item[valueKey] / total;
      const startAngle = currentAngle;
      const endAngle = currentAngle + percentage * 360;
      currentAngle = endAngle;
      
      const startRad = (startAngle - 90) * Math.PI / 180;
      const endRad = (endAngle - 90) * Math.PI / 180;
      
      const x1 = 50 + 40 * Math.cos(startRad);
      const y1 = 50 + 40 * Math.sin(startRad);
      const x2 = 50 + 40 * Math.cos(endRad);
      const y2 = 50 + 40 * Math.sin(endRad);
      
      const largeArcFlag = percentage > 0.5 ? 1 : 0;
      
      const pathData = [
        `M 50 50`,
        `L ${x1} ${y1}`,
        `A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2}`,
        `Z`
      ].join(' ');
      
      return (
        <path
          key={index}
          d={pathData}
          fill={colors[index % colors.length]}
        />
      );
    });
    
    return (
      <AspectRatio ratio="1/1" sx={{ minHeight: height, maxWidth: height }}>
        <svg width="100%" height="100%" viewBox="0 0 100 100">
          {paths}
        </svg>
      </AspectRatio>
    );
  };
  
  const SimpleTimelineChart = ({ data, height = 200 }) => {
    if (!data || data.length === 0) return null;
    
    const maxInbound = Math.max(...data.map(item => item.inbound));
    const maxOutbound = Math.max(...data.map(item => item.outbound));
    const max = Math.max(maxInbound, maxOutbound);
    
    // Create points for SVG path
    const inboundPoints = data.map((item, index) => {
      const x = (index / (data.length - 1)) * 100;
      const y = 100 - (item.inbound / max) * 100;
      return `${x},${y}`;
    }).join(' ');
    
    const outboundPoints = data.map((item, index) => {
      const x = (index / (data.length - 1)) * 100;
      const y = 100 - (item.outbound / max) * 100;
      return `${x},${y}`;
    }).join(' ');
    
    return (
      <AspectRatio ratio="3/1" sx={{ minHeight: height }}>
        <svg width="100%" height="100%" preserveAspectRatio="none">
          {/* Inbound line */}
          <polyline
            points={inboundPoints}
            stroke="#3366CC"
            strokeWidth="2"
            fill="none"
          />
          <polyline
            points={`0,100 ${inboundPoints} 100,100`}
            fill="#3366CC20"
            stroke="none"
          />
          
          {/* Outbound line */}
          <polyline
            points={outboundPoints}
            stroke="#E91E63"
            strokeWidth="2"
            fill="none"
          />
          <polyline
            points={`0,100 ${outboundPoints} 100,100`}
            fill="#E91E6320"
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
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
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
        <Typography level="body-md">Loading report data...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 7, mb: 3, flexWrap: 'wrap', gap: 1 }}>
        <Typography level="h3">Reports & Analytics</Typography>
        <Stack direction="row" spacing={2}>
          <FormControl size="sm" sx={{ minWidth: 160 }}>
            <Select
              placeholder="Date Range"
              startDecorator={<CalendarMonthIcon />}
              value={dateRange}
              onChange={(e, newValue) => setDateRange(newValue)}
              size="sm"
            >
              <Option value="today">Today</Option>
              <Option value="yesterday">Yesterday</Option>
              <Option value="last7days">Last 7 Days</Option>
              <Option value="last30days">Last 30 Days</Option>
              <Option value="thisMonth">This Month</Option>
              <Option value="lastMonth">Last Month</Option>
              <Option value="custom">Custom Range...</Option>
            </Select>
          </FormControl>
          <Button 
            variant="solid" 
            color="primary" 
            startDecorator={<FileDownloadIcon />}
            onClick={handleGenerateReport}
            loading={isGeneratingReport}
          >
            Generate Report
          </Button>
        </Stack>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid xs={12} sm={6} lg={3}>
          <Card variant="outlined" sx={{ display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Box sx={{ 
                p: 1, 
                borderRadius: '50%', 
                bgcolor: 'primary.softBg', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center' 
              }}>
                <MonetizationOnIcon color="primary" />
              </Box>
              <Typography level="body-sm">Total Revenue</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
              <Typography level="h3">${data.salesPerformance.totalRevenue.toLocaleString()}</Typography>
              <Chip 
                size="sm" 
                color="success" 
                variant="soft" 
                startDecorator={<TrendingUpIcon fontSize="small" />}
              >
                +12.5%
              </Chip>
            </Box>
            <Typography level="body-xs" sx={{ mt: 1, color: 'text.tertiary' }}>
              Compared to previous period
            </Typography>
          </Card>
        </Grid>
        <Grid xs={12} sm={6} lg={3}>
          <Card variant="outlined" sx={{ display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Box sx={{ 
                p: 1, 
                borderRadius: '50%', 
                bgcolor: 'success.softBg', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center' 
              }}>
                <InventoryIcon color="success" />
              </Box>
              <Typography level="body-sm">Inventory Value</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
              <Typography level="h3">${data.inventorySummary.totalValue.toLocaleString()}</Typography>
              <Chip 
                size="sm" 
                color="success" 
                variant="soft" 
                startDecorator={<TrendingUpIcon fontSize="small" />}
              >
                +5.8%
              </Chip>
            </Box>
            <Typography level="body-xs" sx={{ mt: 1, color: 'text.tertiary' }}>
              Compared to previous period
            </Typography>
          </Card>
        </Grid>
        <Grid xs={12} sm={6} lg={3}>
          <Card variant="outlined" sx={{ display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Box sx={{ 
                p: 1, 
                borderRadius: '50%', 
                bgcolor: 'warning.softBg', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center' 
              }}>
                <AttachMoneyIcon color="warning" />
              </Box>
              <Typography level="body-sm">Avg. Order Value</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
              <Typography level="h3">${data.salesPerformance.averageOrderValue.toFixed(2)}</Typography>
              <Chip 
                size="sm" 
                color="warning" 
                variant="soft" 
                startDecorator={<TrendingUpIcon fontSize="small" />}
              >
                +2.3%
              </Chip>
            </Box>
            <Typography level="body-xs" sx={{ mt: 1, color: 'text.tertiary' }}>
              Compared to previous period
            </Typography>
          </Card>
        </Grid>
        <Grid xs={12} sm={6} lg={3}>
          <Card variant="outlined" sx={{ display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Box sx={{ 
                p: 1, 
                borderRadius: '50%', 
                bgcolor: 'danger.softBg', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center' 
              }}>
                <ErrorIcon color="danger" />
              </Box>
              <Typography level="body-sm">Low Stock Items</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
              <Typography level="h3">{data.inventorySummary.inventoryHealth.lowStock}</Typography>
              <Chip 
                size="sm" 
                color="danger" 
                variant="soft" 
                startDecorator={<TrendingDownIcon fontSize="small" />}
              >
                -8.5%
              </Chip>
            </Box>
            <Typography level="body-xs" sx={{ mt: 1, color: 'text.tertiary' }}>
              Compared to previous period
            </Typography>
          </Card>
        </Grid>
      </Grid>
      
      <Tabs value={activeTab} onChange={(event, value) => setActiveTab(value)} sx={{ mb: 4 }}>
        <TabList variant="plain" sx={{ 
          '--Tabs-gap': '0px', 
          borderRadius: 'md', 
          overflow: 'hidden',
          border: '1px solid',
          borderColor: 'divider',
          backgroundColor: mode === 'dark' ? 'neutral.800' : 'neutral.50'
        }}>
          <Tab sx={{ py: 1.5, px: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <BarChartIcon fontSize="small" />
              <Typography>Sales</Typography>
            </Box>
          </Tab>
          <Tab sx={{ py: 1.5, px: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <InventoryIcon fontSize="small" />
              <Typography>Inventory</Typography>
            </Box>
          </Tab>
          <Tab sx={{ py: 1.5, px: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PieChartIcon fontSize="small" />
              <Typography>Products</Typography>
            </Box>
          </Tab>
          <Tab sx={{ py: 1.5, px: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TimelineIcon fontSize="small" />
              <Typography>Suppliers</Typography>
            </Box>
          </Tab>
        </TabList>
        
        <TabPanel value={0} sx={{ p: 0, mt: 3 }}>
          <Grid container spacing={3}>
            <Grid xs={12} md={8}>
              <Card variant="outlined" sx={{ height: '100%' }}>
                <Typography level="title-md" sx={{ mb: 2 }}>Monthly Sales Performance</Typography>
                <SimpleBarChart 
                  data={data.salesPerformance.monthlySales} 
                  xKey="month" 
                  yKey="sales" 
                  color={mode === 'dark' ? '#5c7d8a' : '#3366CC'} 
                  height={300} 
                />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                  <Box>
                    <Typography level="body-sm">Year to Date Sales</Typography>
                    <Typography level="title-sm" sx={{ color: 'success.500' }}>
                      Up 15.3% from last year
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button size="sm" variant="plain" startDecorator={<PrintIcon />}>
                      Print
                    </Button>
                    <Button size="sm" variant="plain" startDecorator={<DownloadIcon />}>
                      Export
                    </Button>
                  </Box>
                </Box>
              </Card>
            </Grid>
            <Grid xs={12} md={4}>
              <Card variant="outlined" sx={{ height: '100%' }}>
                <Typography level="title-md" sx={{ mb: 2 }}>Sales By Channel</Typography>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                  <SimplePieChart 
                    data={data.salesPerformance.salesBySalesChannel} 
                    valueKey="percentage" 
                    nameKey="channel" 
                    height={200} 
                  />
                </Box>
                <Divider sx={{ my: 2 }} />
                <Typography level="body-sm" sx={{ mb: 1 }}>Channel Breakdown</Typography>
                {data.salesPerformance.salesBySalesChannel.map((item, index) => (
                  <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box 
                        sx={{ 
                          width: 12, 
                          height: 12, 
                          borderRadius: '50%', 
                          bgcolor: index === 0 ? '#3366CC' : 
                                  index === 1 ? '#4CAF50' : 
                                  index === 2 ? '#FF9800' : '#E91E63' 
                        }} 
                      />
                      <Typography level="body-sm">{item.channel}</Typography>
                    </Box>
                    <Typography level="body-sm" fontWeight="md">{item.percentage}%</Typography>
                  </Box>
                ))}
              </Card>
            </Grid>
            <Grid xs={12}>
              <Card variant="outlined">
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography level="title-md">Top Selling Products</Typography>
                  <Button size="sm" variant="plain" endDecorator="→">
                    View All Products
                  </Button>
                </Box>
                <Table stripe="odd" hoverRow>
                  <thead>
                    <tr>
                      <th style={{ width: '40%' }}>Product Name</th>
                      <th>Units Sold</th>
                      <th>Revenue</th>
                      <th>Avg Price</th>
                      <th>Trend</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.salesPerformance.topSellingProducts.map((product) => (
                      <tr key={product.id}>
                        <td>{product.name}</td>
                        <td>{product.sales}</td>
                        <td>${product.revenue.toLocaleString()}</td>
                        <td>${(product.revenue / product.sales).toFixed(2)}</td>
                        <td>
                          <LinearProgress 
                            determinate 
                            value={((product.sales / data.salesPerformance.topSellingProducts[0].sales) * 100)} 
                            color={product.sales > 80 ? "success" : "primary"}
                            sx={{ width: '80%' }}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
        
        <TabPanel value={1} sx={{ p: 0, mt: 3 }}>
          <Grid container spacing={3}>
            <Grid xs={12} md={7}>
              <Card variant="outlined">
                <Typography level="title-md" sx={{ mb: 2 }}>Inventory Movement</Typography>
                <SimpleTimelineChart 
                  data={data.inventoryMovement.monthlyMovement} 
                  height={300} 
                />
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 4, mt: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 12, height: 12, bgcolor: '#3366CC', borderRadius: '50%' }} />
                    <Typography level="body-sm">Inbound</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 12, height: 12, bgcolor: '#E91E63', borderRadius: '50%' }} />
                    <Typography level="body-sm">Outbound</Typography>
                  </Box>
                </Box>
              </Card>
            </Grid>
            <Grid xs={12} md={5}>
              <Card variant="outlined">
                <Typography level="title-md" sx={{ mb: 2 }}>Inventory Health</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box>
                    <Typography level="body-sm" sx={{ mb: 0.5 }}>Optimal Stock ({data.inventorySummary.inventoryHealth.optimal}%)</Typography>
                    <LinearProgress 
                      determinate 
                      value={data.inventorySummary.inventoryHealth.optimal} 
                      color="success"
                      sx={{ height: 10, borderRadius: 5 }}
                    />
                  </Box>
                  <Box>
                    <Typography level="body-sm" sx={{ mb: 0.5 }}>Low Stock ({data.inventorySummary.inventoryHealth.lowStock}%)</Typography>
                    <LinearProgress 
                      determinate 
                      value={data.inventorySummary.inventoryHealth.lowStock} 
                      color="warning"
                      sx={{ height: 10, borderRadius: 5 }}
                    />
                  </Box>
                  <Box>
                    <Typography level="body-sm" sx={{ mb: 0.5 }}>Out of Stock ({data.inventorySummary.inventoryHealth.outOfStock}%)</Typography>
                    <LinearProgress 
                      determinate 
                      value={data.inventorySummary.inventoryHealth.outOfStock} 
                      color="danger"
                      sx={{ height: 10, borderRadius: 5 }}
                    />
                  </Box>
                  <Box>
                    <Typography level="body-sm" sx={{ mb: 0.5 }}>Excess Stock ({data.inventorySummary.inventoryHealth.excess}%)</Typography>
                    <LinearProgress 
                      determinate 
                      value={data.inventorySummary.inventoryHealth.excess} 
                      color="neutral"
                      sx={{ height: 10, borderRadius: 5 }}
                    />
                  </Box>
                </Box>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                  <Box>
                    <Typography level="title-sm">{data.inventorySummary.totalItems}</Typography>
                    <Typography level="body-sm">Total Items</Typography>
                  </Box>
                  <Box>
                    <Typography level="title-sm">${data.inventorySummary.totalValue.toLocaleString()}</Typography>
                    <Typography level="body-sm">Total Value</Typography>
                  </Box>
                  <Box>
                    <Typography level="title-sm">{(data.inventorySummary.totalValue / data.inventorySummary.totalItems).toFixed(2)}</Typography>
                    <Typography level="body-sm">Avg. Value</Typography>
                  </Box>
                </Box>
              </Card>
            </Grid>
            <Grid xs={12} md={6}>
              <Card variant="outlined">
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography level="title-md">Inventory by Category</Typography>
                  <IconButton size="sm">
                    <FilterListIcon />
                  </IconButton>
                </Box>
                <Table size="sm" stripe="even" hoverRow>
                  <thead>
                    <tr>
                      <th>Category</th>
                      <th>Items</th>
                      <th>Value</th>
                      <th>% of Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.inventorySummary.categoryCounts.map((category, index) => (
                      <tr key={index}>
                        <td>{category.name}</td>
                        <td>{category.count}</td>
                        <td>${category.value.toLocaleString()}</td>
                        <td>
                          {((category.value / data.inventorySummary.totalValue) * 100).toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', pt: 2 }}>
                  <Button size="sm" variant="outlined" color="neutral">
                    Export Data
                  </Button>
                </Box>
              </Card>
            </Grid>
            <Grid xs={12} md={6}>
              <Card variant="outlined">
                <Typography level="title-md" sx={{ mb: 2 }}>Top Inbound Products</Typography>
                <Box sx={{ mb: 3 }}>
                  {data.inventoryMovement.topInboundProducts.map((product, index) => (
                    <Box 
                      key={index} 
                      sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        mb: 1.5,
                        p: 1.5,
                        borderRadius: 'sm',
                        bgcolor: mode === 'dark' ? 'neutral.800' : 'neutral.50'
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Sheet 
                          variant="solid" 
                          color={index === 0 ? "primary" : index === 1 ? "success" : "neutral"}
                          sx={{ 
                            width: 36, 
                            height: 36, 
                            borderRadius: 'md', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            fontWeight: 'bold'
                          }}
                        >
                          {index + 1}
                        </Sheet>
                        <Box>
                          <Typography level="body-sm" fontWeight="md">{product.name}</Typography>
                          <Typography level="body-xs" sx={{ color: 'text.tertiary' }}>ID: {product.id}</Typography>
                        </Box>
                      </Box>
                      <Typography level="title-sm">{product.quantity} units</Typography>
                    </Box>
                  ))}
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Typography level="title-lg">{data.inventoryMovement.inboundItems}</Typography>
                    <Typography level="body-sm">Inbound</Typography>
                  </Box>
                  <Divider orientation="vertical" />
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Typography level="title-lg">{data.inventoryMovement.outboundItems}</Typography>
                    <Typography level="body-sm">Outbound</Typography>
                  </Box>
                  <Divider orientation="vertical" />
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Typography level="title-lg">{data.inventoryMovement.returns}</Typography>
                    <Typography level="body-sm">Returns</Typography>
                  </Box>
                </Box>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
        
        <TabPanel value={2} sx={{ p: 0, mt: 3 }}>
          <Grid container spacing={3}>
            <Grid xs={12} md={8}>
              <Card variant="outlined">
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography level="title-md">Product Performance Metrics</Typography>
                  <Select defaultValue="revenue" size="sm" sx={{ minWidth: 180 }}>
                    <Option value="revenue">Revenue Generated</Option>
                    <Option value="profit">Profit Margin</Option>
                    <Option value="turnover">Inventory Turnover</Option>
                    <Option value="units">Units Sold</Option>
                  </Select>
                </Box>
                <SimpleBarChart 
                  data={data.salesPerformance.topSellingProducts.slice().reverse()} 
                  xKey="name" 
                  yKey="revenue" 
                  color={mode === 'dark' ? '#9C27B0' : '#7B1FA2'} 
                  height={280} 
                />
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
                  <Button size="sm" variant="outlined" color="neutral" startDecorator={<RefreshIcon />}>
                    Refresh
                  </Button>
                  <Button size="sm" variant="outlined" color="neutral" startDecorator={<FileDownloadIcon />}>
                    Export
                  </Button>
                </Box>
              </Card>
            </Grid>
            <Grid xs={12} md={4}>
              <Stack spacing={2} sx={{ height: '100%' }}>
                <Card variant="outlined">
                  <Typography level="title-md" sx={{ mb: 1 }}>Product Categories</Typography>
                  <Typography level="body-sm" sx={{ color: 'text.tertiary', mb: 2 }}>
                    Distribution by inventory count
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
                    <SimplePieChart 
                      data={data.inventorySummary.categoryCounts} 
                      valueKey="count" 
                      nameKey="name" 
                      height={160} 
                    />
                  </Box>
                </Card>
                <Card variant="outlined">
                  <Typography level="title-md" sx={{ mb: 1 }}>Quick Actions</Typography>
                  <Stack spacing={1}>
                    <Button size="sm" color="primary" variant="soft" startDecorator={<AssessmentIcon />}>
                      Generate Product Report
                    </Button>
                    <Button size="sm" color="neutral" variant="soft" startDecorator={<InventoryIcon />}>
                      Check Low Stock Items
                    </Button>
                    <Button size="sm" color="neutral" variant="soft" startDecorator={<TimelineIcon />}>
                      View Sales Forecasts
                    </Button>
                  </Stack>
                </Card>
              </Stack>
            </Grid>
            <Grid xs={12}>
              <Card variant="outlined">
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography level="title-md">Product Analytics</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <FormControl size="sm">
                      <Input
                        size="sm"
                        placeholder="Search products..."
                        startDecorator={<i data-feather="search" />}
                        sx={{ width: 200 }}
                      />
                    </FormControl>
                    <IconButton size="sm">
                      <FilterListIcon />
                    </IconButton>
                  </Box>
                </Box>
                <Table size="sm" stickyHeader stickyFooter stripe="odd" hoverRow>
                  <thead>
                    <tr>
                      <th style={{ width: '30%' }}>Product</th>
                      <th>SKU</th>
                      <th>Price</th>
                      <th>Stock</th>
                      <th>Revenue</th>
                      <th>Profit Margin</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from({ length: 5 }).map((_, index) => (
                      <tr key={index}>
                        <td>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Sheet 
                              variant="solid" 
                              color="neutral" 
                              sx={{ 
                                width: 40, 
                                height: 40, 
                                borderRadius: 'sm', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center' 
                              }}
                            >
                              <Typography level="title-sm">{String.fromCharCode(65 + index)}</Typography>
                            </Sheet>
                            <Box>
                              <Typography level="body-sm" fontWeight="md">
                                {['Wireless Earbuds', 'USB-C Charger', 'HDMI Cable 6ft', 'External SSD 1TB', 'Bluetooth Speaker'][index]}
                              </Typography>
                              <Typography level="body-xs" sx={{ color: 'text.tertiary' }}>
                                {['Audio', 'Chargers', 'Cables', 'Storage', 'Audio'][index]}
                              </Typography>
                            </Box>
                          </Box>
                        </td>
                        <td>{`SKU-${10000 + index * 35}`}</td>
                        <td>${[119.99, 29.99, 14.99, 149.99, 59.99][index]}</td>
                        <td>{[42, 86, 128, 35, 64][index]}</td>
                        <td>${[11760, 4560, 1305, 9750, 3240][index].toLocaleString()}</td>
                        <td>{[38, 42, 55, 32, 45][index]}%</td>
                        <td>
                          <Chip
                            size="sm"
                            variant="soft"
                            color={[
                              'success', 
                              'success', 
                              'success', 
                              'warning', 
                              'success'
                            ][index]}
                          >
                            {[
                              'In Stock', 
                              'In Stock', 
                              'In Stock', 
                              'Low Stock', 
                              'In Stock'
                            ][index]}
                          </Chip>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
                <Box 
                  sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    mt: 2
                  }}
                >
                  <Typography level="body-sm" sx={{ color: 'text.tertiary' }}>
                    Showing 5 of 124 products
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button size="sm" variant="plain" disabled>
                      Previous
                    </Button>
                    <Button size="sm" variant="plain">
                      Next
                    </Button>
                  </Box>
                </Box>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
        
        <TabPanel value={3} sx={{ p: 0, mt: 3 }}>
          <Grid container spacing={3}>
            <Grid xs={12} md={7}>
              <Card variant="outlined">
                <Typography level="title-md" sx={{ mb: 2 }}>Supplier Performance Metrics</Typography>
                <Box sx={{ p: 2, bgcolor: mode === 'dark' ? 'neutral.800' : 'neutral.50', borderRadius: 'md', mb: 3 }}>
                  <Grid container spacing={2}>
                    <Grid xs={12} sm={4}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography level="title-lg" color="primary">{data.supplierPerformance.onTimeDelivery}%</Typography>
                        <Typography level="body-sm">On-Time Delivery</Typography>
                        <Chip 
                          size="sm" 
                          color="success" 
                          variant="soft" 
                          sx={{ mt: 1 }}
                        >
                          ↑ 2.5%
                        </Chip>
                      </Box>
                    </Grid>
                    <Grid xs={12} sm={4}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography level="title-lg" color="success">{data.supplierPerformance.qualityRating}%</Typography>
                        <Typography level="body-sm">Quality Rating</Typography>
                        <Chip 
                          size="sm" 
                          color="success" 
                          variant="soft" 
                          sx={{ mt: 1 }}
                        >
                          ↑ 1.8%
                        </Chip>
                      </Box>
                    </Grid>
                    <Grid xs={12} sm={4}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography level="title-lg" color="success">{data.supplierPerformance.costVariance}%</Typography>
                        <Typography level="body-sm">Cost Variance</Typography>
                        <Chip 
                          size="sm" 
                          color="success" 
                          variant="soft" 
                          sx={{ mt: 1 }}
                        >
                          ↓ 3.2%
                        </Chip>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
                <Typography level="title-sm" sx={{ mb: 1 }}>Top Suppliers</Typography>
                {data.supplierPerformance.topSuppliers.map((supplier, index) => (
                  <Box 
                    key={index} 
                    sx={{ 
                      p: 2, 
                      mb: index !== data.supplierPerformance.topSuppliers.length - 1 ? 2 : 0,
                      border: '1px solid', 
                      borderColor: 'divider', 
                      borderRadius: 'md' 
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography level="title-sm">{supplier.name}</Typography>
                      <Chip 
                        size="sm" 
                        variant="outlined" 
                        color={supplier.onTime > 95 ? "success" : supplier.onTime > 85 ? "warning" : "neutral"}
                      >
                        {supplier.orders} Orders
                      </Chip>
                    </Box>
                    <Grid container spacing={2} sx={{ mt: 0.5 }}>
                      <Grid xs={6}>
                        <Typography level="body-xs" sx={{ mb: 0.5 }}>On-Time Delivery: {supplier.onTime}%</Typography>
                        <LinearProgress 
                          determinate 
                          value={supplier.onTime} 
                          color={supplier.onTime > 95 ? "success" : supplier.onTime > 85 ? "warning" : "danger"}
                          sx={{ height: 6, borderRadius: 3 }}
                        />
                      </Grid>
                      <Grid xs={6}>
                        <Typography level="body-xs" sx={{ mb: 0.5 }}>Quality Rating: {supplier.quality}%</Typography>
                        <LinearProgress 
                          determinate 
                          value={supplier.quality} 
                          color={supplier.quality > 95 ? "success" : supplier.quality > 85 ? "warning" : "danger"}
                          sx={{ height: 6, borderRadius: 3 }}
                        />
                      </Grid>
                    </Grid>
                  </Box>
                ))}
              </Card>
            </Grid>
            <Grid xs={12} md={5}>
              <Stack spacing={3}>
                <Card variant="outlined">
                  <Typography level="title-md" sx={{ mb: 2 }}>Supplier Distribution</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', mb: 2 }}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography level="h2">{data.supplierPerformance.totalSuppliers}</Typography>
                      <Typography level="body-sm">Total Suppliers</Typography>
                    </Box>
                    <Divider orientation="vertical" />
                    <Box>
                      <Typography level="body-sm" sx={{ mb: 0.5 }}>By Performance Rating</Typography>
                      <Box sx={{ mb: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                          <Typography level="body-xs">Excellent (90%+)</Typography>
                          <Typography level="body-xs">8</Typography>
                        </Box>
                        <LinearProgress determinate value={33} color="success" sx={{ height: 6, borderRadius: 3 }} />
                      </Box>
                      <Box sx={{ mb: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                          <Typography level="body-xs">Good (80-89%)</Typography>
                          <Typography level="body-xs">10</Typography>
                        </Box>
                        <LinearProgress determinate value={42} color="primary" sx={{ height: 6, borderRadius: 3 }} />
                      </Box>
                      <Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                          <Typography level="body-xs">Needs Improvement (80%)</Typography>
                          <Typography level="body-xs">6</Typography>
                        </Box>
                        <LinearProgress determinate value={25} color="warning" sx={{ height: 6, borderRadius: 3 }} />
                      </Box>
                    </Box>
                  </Box>
                </Card>
                <Card variant="outlined">
                  <Typography level="title-md" sx={{ mb: 2 }}>Report Generation</Typography>
                  <FormControl size="sm" sx={{ mb: 2 }}>
                    <FormLabel>Report Type</FormLabel>
                    <Select defaultValue="supplierPerformance">
                      <Option value="supplierPerformance">Supplier Performance</Option>
                      <Option value="supplierComparison">Supplier Comparison</Option>
                      <Option value="onTimeDelivery">On-Time Delivery Analysis</Option>
                      <Option value="qualityAnalysis">Quality Analysis</Option>
                    </Select>
                  </FormControl>
                  <FormControl size="sm" sx={{ mb: 2 }}>
                    <FormLabel>Date Range</FormLabel>
                    <Input type="date" />
                  </FormControl>
                  <FormControl size="sm" sx={{ mb: 2 }}>
                    <FormLabel>Select Suppliers</FormLabel>
                    <Select defaultValue="all" multiple>
                      <Option value="all">All Suppliers</Option>
                      {data.supplierPerformance.topSuppliers.map((supplier, index) => (
                        <Option key={index} value={supplier.id}>{supplier.name}</Option>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl size="sm" sx={{ mb: 2 }}>
                    <FormLabel>Metrics to Include</FormLabel>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1 }}>
                      <Checkbox label="On-Time Delivery" defaultChecked />
                      <Checkbox label="Quality Ratings" defaultChecked />
                      <Checkbox label="Cost Analysis" defaultChecked />
                      <Checkbox label="Response Time" />
                      <Checkbox label="Issue Resolution" />
                    </Box>
                  </FormControl>
                  <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                    <Button color="primary" sx={{ flex: 1 }} startDecorator={<AssessmentIcon />}>
                      Generate Report
                    </Button>
                    <Button color="neutral" variant="outlined" startDecorator={<DownloadIcon />}>
                      Export Data
                    </Button>
                  </Box>
                </Card>
              </Stack>
            </Grid>
          </Grid>
        </TabPanel>
      </Tabs>
      
      <Grid container spacing={3}>
        <Grid xs={12} md={8}>
          <Card variant="outlined">
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography level="title-md">Recent Reports</Typography>
              <IconButton size="sm">
                <MoreVertIcon />
              </IconButton>
            </Box>
            <Table size="sm" stripe="even" hoverRow>
              <thead>
                <tr>
                  <th>Report Name</th>
                  <th>Type</th>
                  <th>Generated Date</th>
                  <th>Size</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.recentReports.map((report) => (
                  <tr key={report.id}>
                    <td>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Sheet 
                          variant="soft" 
                          color={
                            report.type === 'inventory' ? 'primary' : 
                            report.type === 'sales' ? 'success' : 
                            report.type === 'supplier' ? 'warning' : 'neutral'
                          } 
                          sx={{ 
                            width: 32, 
                            height: 32, 
                            borderRadius: 'sm', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center' 
                          }}
                        >
                          {report.type === 'inventory' && <InventoryIcon />}
                          {report.type === 'sales' && <MonetizationOnIcon />}
                          {report.type === 'supplier' && <BarChartIcon />}
                          {report.type === 'forecast' && <TimelineIcon />}
                        </Sheet>
                        <Typography level="body-sm">{report.name}</Typography>
                      </Box>
                    </td>
                    <td>
                      <Chip 
                        size="sm" 
                        variant="soft" 
                        color={
                          report.type === 'inventory' ? 'primary' : 
                          report.type === 'sales' ? 'success' : 
                          report.type === 'supplier' ? 'warning' : 'neutral'
                        }
                      >
                        {report.type.charAt(0).toUpperCase() + report.type.slice(1)}
                      </Chip>
                    </td>
                    <td>{formatDate(report.date)}</td>
                    <td>{report.size}</td>
                    <td>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="Download">
                          <IconButton size="sm" variant="plain">
                            <DownloadIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Email">
                          <IconButton size="sm" variant="plain">
                            <EmailIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Print">
                          <IconButton size="sm" variant="plain">
                            <PrintIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <Button variant="plain" endDecorator="→">
                View All Reports
              </Button>
            </Box>
          </Card>
        </Grid>
        <Grid xs={12} md={4}>
          <Card variant="outlined">
            <Typography level="title-md" sx={{ mb: 2 }}>Scheduled Reports</Typography>
            <Stack spacing={2}>
              {data.scheduleReports.map((report) => (
                <Sheet 
                  key={report.id} 
                  variant="outlined" 
                  sx={{ 
                    p: 2, 
                    borderRadius: 'md', 
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      bottom: 0,
                      width: 4,
                      bgcolor: 
                        report.format === 'PDF' ? 'warning.500' : 
                        report.format === 'Excel' ? 'success.500' : 'primary.500'
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                      <Typography level="title-sm">{report.name}</Typography>
                      <Typography level="body-xs" sx={{ mt: 0.5, color: 'text.tertiary' }}>
                        Scheduled: {report.schedule}
                      </Typography>
                    </Box>
                    <Chip 
                      size="sm" 
                      variant="soft" 
                      color={
                        report.format === 'PDF' ? 'warning' : 
                        report.format === 'Excel' ? 'success' : 'primary'
                      }
                    >
                      {report.format}
                    </Chip>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 2 }}>
                    <Typography level="body-xs" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <EmailIcon fontSize="small" />
                      {report.recipients} Recipients
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button size="sm" variant="plain" color="neutral">
                        Edit
                      </Button>
                      <Button size="sm" variant="plain" color="danger">
                        Disable
                      </Button>
                    </Box>
                  </Box>
                </Sheet>
              ))}
            </Stack>
            <Button 
              fullWidth 
              variant="soft" 
              color="primary" 
              startDecorator={<AssessmentIcon />} 
              sx={{ mt: 2 }}
            >
              Create New Scheduled Report
            </Button>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Reports; 
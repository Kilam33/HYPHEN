import React, { useState, useEffect } from 'react';
import { 
  Grid, 
  Card, 
  CardContent, 
  Typography, 
  Box,
  Divider,
  Chip,
  Sheet,
  IconButton,
  List,
  ListItem,
  ListItemContent,
  ListItemDecorator,
  AspectRatio,
  Button,
  Stack,
  LinearProgress,
  Select,
  Option,
  Tooltip,
  Link
} from '@mui/joy';

// Import icons
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import InventoryIcon from '@mui/icons-material/Inventory';
import WarningIcon from '@mui/icons-material/Warning';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PeopleIcon from '@mui/icons-material/People';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import EqualizerIcon from '@mui/icons-material/Equalizer';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import FilterListIcon from '@mui/icons-material/FilterList';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import SsidChartIcon from '@mui/icons-material/SsidChart';
import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import BarChartIcon from '@mui/icons-material/BarChart';
import InsightsIcon from '@mui/icons-material/Insights';

// Mock data for AI insights - in a real application, this would come from your API
const mockInsights = [
  {
    id: 1,
    type: 'demand_forecast',
    title: 'Demand Surge Predicted',
    description: 'AI forecasts a 32% increase in demand for USB-C Cables in the next 30 days.',
    impact: 'high',
    category: 'inventory',
    timestamp: '2 hours ago',
    actionRequired: true,
    icon: <TrendingUpIcon />,
    recommendation: 'Increase order quantity by 25% for next procurement cycle.'
  },
  {
    id: 2,
    type: 'stockout_risk',
    title: 'Stockout Risk Alert',
    description: 'Printer Ink Cartridges are projected to deplete before next scheduled delivery.',
    impact: 'critical',
    category: 'inventory',
    timestamp: '4 hours ago',
    actionRequired: true,
    icon: <WarningIcon />,
    recommendation: 'Place rush order within 48 hours to avoid stockout.'
  },
  {
    id: 3,
    type: 'lead_time_change',
    title: 'Supplier Lead Time Change',
    description: 'AI detected increased lead times from Asia-based suppliers due to port congestion.',
    impact: 'medium',
    category: 'supplier',
    timestamp: '1 day ago',
    actionRequired: false,
    icon: <AccessTimeIcon />,
    recommendation: 'Adjust procurement schedule for affected suppliers.'
  },
  {
    id: 4,
    type: 'price_optimization',
    title: 'Price Optimization',
    description: 'AI suggests a 5% price increase for HDMI Cables based on market trends.',
    impact: 'medium',
    category: 'pricing',
    timestamp: '2 days ago',
    actionRequired: false,
    icon: <AttachMoneyIcon />,
    recommendation: 'Implement price adjustment with next inventory cycle.'
  },
  {
    id: 5,
    type: 'supplier_performance',
    title: 'Supplier Performance Alert',
    description: 'TechSuppliers Inc. on-time delivery rate has dropped below 85% threshold.',
    impact: 'high',
    category: 'supplier',
    timestamp: '3 days ago',
    actionRequired: true,
    icon: <PeopleIcon />,
    recommendation: 'Schedule supplier performance review meeting.'
  }
];

// Mock forecast data
const mockForecastData = {
  topProducts: [
    { name: 'USB-C Cable 6ft', forecast: 856, change: 32 },
    { name: 'Wireless Mouse', forecast: 623, change: 15 },
    { name: 'Laptop Stand', forecast: 512, change: -8 },
    { name: 'HDMI Cable', forecast: 489, change: 22 }
  ],
  inventoryHealth: 83,
  supplierRisk: {
    high: 2,
    medium: 5,
    low: 12
  },
  salesTrend: [
    { month: 'Jan', sales: 45 },
    { month: 'Feb', sales: 52 },
    { month: 'Mar', sales: 49 },
    { month: 'Apr', sales: 62 },
    { month: 'May', sales: 74 },
    { month: 'Jun', sales: 78 }
  ],
  marketFactors: [
    { factor: 'Seasonal Demand', impact: 'High' },
    { factor: 'Supply Chain Disruption', impact: 'Medium' },
    { factor: 'Price Fluctuation', impact: 'Low' }
  ]
};

const AIInsights = () => {
  const [timeRange, setTimeRange] = useState('30days');
  const [isLoading, setIsLoading] = useState(true);
  const [insights, setInsights] = useState([]);
  const [forecasts, setForecasts] = useState(null);
  
  // Simulate loading data
  useEffect(() => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setInsights(mockInsights);
      setForecasts(mockForecastData);
      setIsLoading(false);
    }, 800);
  }, [timeRange]);

  const getImpactColor = (impact) => {
    switch(impact) {
      case 'critical':
        return 'danger';
      case 'high':
        return 'warning';
      case 'medium':
        return 'info';
      default:
        return 'neutral';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt:7, mb: 3 }}>
        <Box>
          <Typography level="h3" sx={{ mb: 0.5 }}>AI Insights Dashboard</Typography>
          <Typography level="body-sm" color="neutral">
            Using AI to optimize your supply chain and inventory decisions
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Select 
            size="sm" 
            value={timeRange} 
            onChange={(_, value) => setTimeRange(value)}
            startDecorator={<FilterListIcon />}
            sx={{ minWidth: 120 }}
          >
            <Option value="7days">Last 7 days</Option>
            <Option value="30days">Last 30 days</Option>
            <Option value="90days">Last 90 days</Option>
          </Select>
          <IconButton variant="outlined" color="neutral" size="sm">
            <AutorenewIcon />
          </IconButton>
          <IconButton variant="outlined" color="neutral" size="sm">
            <CloudDownloadIcon />
          </IconButton>
        </Box>
      </Box>

      {isLoading ? (
        <Box sx={{ width: '100%', mt: 4, mb: 4 }}>
          <LinearProgress />
          <Typography level="body-sm" textAlign="center" sx={{ mt: 2 }}>
            AI is analyzing your supply chain data...
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {/* AI Summary Cards */}
          <Grid xs={12} md={8}>
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography level="title-md">
                    <InsightsIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Key AI-Generated Insights
                  </Typography>
                  <Tooltip title="AI analyzes patterns in orders, inventory, market trends, and supplier performance to generate actionable insights">
                    <IconButton size="sm" variant="plain">
                      <InfoOutlinedIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
                <Divider sx={{ mb: 2 }} />
                
                <List>
                  {insights.map((insight) => (
                    <ListItem 
                      key={insight.id}
                      sx={{ 
                        mb: 1, 
                        p: 2, 
                        borderRadius: 'md',
                        bgcolor: 'background.level1',
                        '&:hover': { bgcolor: 'background.level2' }
                      }}
                    >
                      <ListItemDecorator>
                        <Sheet 
                          variant="solid" 
                          color={getImpactColor(insight.impact)} 
                          sx={{ 
                            p: 1, 
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          {insight.icon}
                        </Sheet>
                      </ListItemDecorator>
                      <ListItemContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <Box>
                            <Typography level="title-sm">{insight.title}</Typography>
                            <Typography level="body-sm" sx={{ mt: 0.5 }}>{insight.description}</Typography>
                          </Box>
                          <Chip 
                            size="sm" 
                            variant="soft"
                            color={getImpactColor(insight.impact)}
                          >
                            {insight.impact} impact
                          </Chip>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                          <Typography level="body-xs" color="neutral">{insight.timestamp}</Typography>
                          {insight.actionRequired && (
                            <Button size="sm" variant="soft" color="primary">Take Action</Button>
                          )}
                        </Box>
                      </ListItemContent>
                    </ListItem>
                  ))}
                </List>
                
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                  <Button
                    size="sm"
                    variant="outlined"
                    color="neutral"
                    startDecorator={<FolderOpenIcon />}
                  >
                    View All Insights
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* AI Stats Column */}
          <Grid xs={12} md={4}>
            <Stack spacing={3}>
              {/* Demand Forecast */}
              <Card>
                <CardContent>
                  <Typography level="title-md" sx={{ mb: 2 }}>
                    <AutoGraphIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    AI Demand Forecast
                  </Typography>
                  
                  <List size="sm" sx={{ '--ListItem-minHeight': '32px' }}>
                    {forecasts?.topProducts.map((product, index) => (
                      <ListItem key={index}>
                        <ListItemContent sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography level="body-sm">{product.name}</Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography level="body-sm">{product.forecast}</Typography>
                            <Chip
                              size="sm"
                              variant="soft"
                              color={product.change > 0 ? 'success' : 'danger'}
                              sx={{ ml: 1, minWidth: '40px' }}
                            >
                              {product.change > 0 ? '+' : ''}{product.change}%
                            </Chip>
                          </Box>
                        </ListItemContent>
                      </ListItem>
                    ))}
                  </List>
                  
                  <Typography level="body-xs" sx={{ mt: 2, textAlign: 'center' }}>
                    Predictions based on 90-day historical data
                  </Typography>
                </CardContent>
              </Card>
              
              {/* Inventory Health */}
              <Card>
                <CardContent>
                  <Typography level="title-md" sx={{ mb: 2 }}>
                    <InventoryIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Inventory Health Score
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                    <Typography level="h2" sx={{ color: forecasts?.inventoryHealth > 80 ? 'success.500' : 'warning.500' }}>
                      {forecasts?.inventoryHealth}%
                    </Typography>
                  </Box>
                  
                  <LinearProgress 
                    determinate 
                    value={forecasts?.inventoryHealth} 
                    color={forecasts?.inventoryHealth > 80 ? 'success' : 'warning'}
                    sx={{ height: 10, borderRadius: 5 }}
                  />
                  
                  <Typography level="body-xs" sx={{ mt: 2, textAlign: 'center' }}>
                    Based on stock levels, turnover rate, and demand forecasts
                  </Typography>
                </CardContent>
              </Card>
              
              {/* External Factors */}
              <Card>
                <CardContent>
                  <Typography level="title-md" sx={{ mb: 2 }}>
                    <SsidChartIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Market Trends Analysis
                  </Typography>
                  
                  <List size="sm" sx={{ '--ListItem-minHeight': '32px' }}>
                    {forecasts?.marketFactors.map((factor, index) => (
                      <ListItem key={index}>
                        <ListItemContent sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography level="body-sm">{factor.factor}</Typography>
                          <Chip
                            size="sm"
                            variant="soft"
                            color={factor.impact === 'High' ? 'warning' : factor.impact === 'Medium' ? 'info' : 'neutral'}
                          >
                            {factor.impact} impact
                          </Chip>
                        </ListItemContent>
                      </ListItem>
                    ))}
                  </List>
                  
                  <Typography level="body-xs" sx={{ mt: 2, textAlign: 'center' }}>
                    External factors affecting your supply chain
                  </Typography>
                </CardContent>
              </Card>
            </Stack>
          </Grid>
          
          {/* Bottom Row */}
          <Grid xs={12}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography level="title-md">
                    <BarChartIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    AI-Powered ESG & Supply Chain Optimization
                  </Typography>
                  <Button size="sm" variant="outlined" color="primary">Configure Metrics</Button>
                </Box>
                <Divider sx={{ mb: 3 }} />
                
                <Grid container spacing={3}>
                  <Grid xs={12} md={4}>
                    <Sheet 
                      variant="outlined" 
                      sx={{ 
                        p: 2, 
                        borderRadius: 'md',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        textAlign: 'center'
                      }}
                    >
                      <Typography level="title-sm" sx={{ mb: 1 }}>Supplier Risk Assessment</Typography>
                      <Box sx={{ 
                        display: 'flex', 
                        gap: 1,
                        mt: 2
                      }}>
                        <Chip variant="soft" color="danger" size="lg">{forecasts?.supplierRisk.high} High</Chip>
                        <Chip variant="soft" color="warning" size="lg">{forecasts?.supplierRisk.medium} Medium</Chip>
                        <Chip variant="soft" color="success" size="lg">{forecasts?.supplierRisk.low} Low</Chip>
                      </Box>
                      <Typography level="body-xs" sx={{ mt: 2 }}>
                        AI-generated risk profile based on delivery performance and market factors
                      </Typography>
                    </Sheet>
                  </Grid>
                  
                  <Grid xs={12} md={4}>
                    <Sheet 
                      variant="outlined" 
                      sx={{ 
                        p: 2, 
                        borderRadius: 'md',
                        display: 'flex',
                        flexDirection: 'column',
                        height: '100%'
                      }}
                    >
                      <Typography level="title-sm" sx={{ mb: 1, textAlign: 'center' }}>ESG Score Impact</Typography>
                      <Box sx={{ 
                        display: 'flex', 
                        flexDirection: 'column',
                        gap: 1,
                        mt: 2
                      }}>
                        <Box>
                          <Typography level="body-xs">Environmental Impact</Typography>
                          <LinearProgress determinate value={72} color="success" sx={{ height: 8, borderRadius: 4 }} />
                        </Box>
                        <Box>
                          <Typography level="body-xs">Social Responsibility</Typography>
                          <LinearProgress determinate value={85} color="success" sx={{ height: 8, borderRadius: 4 }} />
                        </Box>
                        <Box>
                          <Typography level="body-xs">Governance Compliance</Typography>
                          <LinearProgress determinate value={91} color="success" sx={{ height: 8, borderRadius: 4 }} />
                        </Box>
                      </Box>
                      <Typography level="body-xs" sx={{ mt: 'auto', textAlign: 'center' }}>
                        AI forecasts 12% ESG improvement potential with suggested optimizations
                      </Typography>
                    </Sheet>
                  </Grid>
                  
                  <Grid xs={12} md={4}>
                    <Sheet 
                      variant="outlined" 
                      sx={{ 
                        p: 2, 
                        borderRadius: 'md',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        height: '100%'
                      }}
                    >
                      <Typography level="title-sm" sx={{ mb: 1 }}>Predicted Cost Savings</Typography>
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexGrow: 1
                      }}>
                        <Typography level="h2" color="success">30%</Typography>
                      </Box>
                      <Button size="sm" variant="soft" color="primary" sx={{ mt: 2 }}>
                        View AI Recommendations
                      </Button>
                      <Typography level="body-xs" sx={{ mt: 1, textAlign: 'center' }}>
                        Based on AI-optimized procurement and logistics
                      </Typography>
                    </Sheet>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default AIInsights;
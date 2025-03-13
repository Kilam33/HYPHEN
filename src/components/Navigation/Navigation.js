import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Sheet, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemContent,
  ListItemDecorator,
  Typography,
  IconButton,
  Box,
  Badge,
  Avatar,
  Input,
  Divider,
  Tooltip,
  useColorScheme,
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Modal,
  ModalClose,
} from '@mui/joy';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import InventoryIcon from '@mui/icons-material/Inventory';
import PeopleIcon from '@mui/icons-material/People';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import BarChartIcon from '@mui/icons-material/BarChart';
import CloseIcon from '@mui/icons-material/Close';
import NotificationsIcon from '@mui/icons-material/Notifications';
import InsightsIcon from '@mui/icons-material/Insights';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import SyncIcon from '@mui/icons-material/Sync';
import HelpIcon from '@mui/icons-material/Help';
import SearchIcon from '@mui/icons-material/Search';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import TimelineIcon from '@mui/icons-material/Timeline';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';

function Navigation({ mobileOpen, handleDrawerToggle }) {
  const location = useLocation();
  const { mode, setMode } = useColorScheme();
  const [notificationCount, setNotificationCount] = useState(3);
  const [disconnectedIntegrations, setDisconnectedIntegrations] = useState(1);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [open, setOpen] = useState(!isMobile);
  
  // Update isMobile state on window resize
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      // Auto-open on desktop, respect user preference on mobile
      if (!mobile) setOpen(true);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Sync open state with mobileOpen prop
  useEffect(() => {
    if (isMobile) {
      setOpen(mobileOpen);
    }
  }, [mobileOpen, isMobile]);

  const handleClose = () => {
    if (isMobile) {
      handleDrawerToggle();
    }
  };

  const navigationItems = [
    { path: '/', label: 'Dashboard', icon: <DashboardIcon /> },
    { path: '/inventory', label: 'Inventory', icon: <InventoryIcon /> },
    { path: '/suppliers', label: 'Suppliers', icon: <PeopleIcon /> },
    { path: '/orders', label: 'Orders', icon: <ShoppingCartIcon /> },
    { path: '/reports', label: 'Reports', icon: <BarChartIcon /> },
    { path: '/AI-Insights', label: 'AI Insights', icon: <TimelineIcon /> },
    { path: '/integrations', label: 'Integrations', icon: <SyncIcon /> },
    { path: '/support', label: 'Help & Support', icon: <HelpIcon /> },
  ];

  // Quick actions inside an accordion
  const quickActions = [
    { label: 'Create New Order', path: '/new-order', action: null },
    { label: 'Generate Report', path: null, action: () => alert('Generating report...') },
    { label: 'Sync Data', path: null, action: () => alert('Syncing data...') },
  ];

  // Pinned items 
  const pinnedItems = [
    { id: 1, path: '/sales-reports', label: 'Sales Reports', icon: <BarChartIcon /> },
    { id: 2, path: '/inventory-reports', label: 'Inventory Reports', icon: <InventoryIcon /> },
  ];

  // Recent activity
  const recentActivity = [
    { id: 1, label: 'Low stock alert: Printer Ink Cartridge', icon: <InventoryIcon /> },
    { id: 2, label: 'Order placed: USB-C Cable 6ft', icon: <ShoppingCartIcon /> },
  ];

  const toggleTheme = () => {
    setMode(mode === 'dark' ? 'light' : 'dark');
  };

  // Mobile overlay for the drawer
  if (isMobile) {
    return (
      <>
        {/* Mobile Header with Menu Button - This would be in your main layout */}
        <Box 
          sx={{ 
            display: { xs: 'flex', sm: 'none' }, 
            alignItems: 'center', 
            p: 2,
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            zIndex: 1100,
            backgroundColor: mode === 'dark' ? 'neutral.900' : 'background.body',
            borderBottom: '1px solid',
            borderColor: mode === 'dark' ? 'neutral.700' : 'neutral.100',
          }}
        >
          <IconButton 
            onClick={handleDrawerToggle} 
            sx={{ color: mode === 'dark' ? 'common.white' : 'text.primary' }}
          >
            <MenuIcon />
          </IconButton>
          <Typography level="h5" sx={{ ml: 2, fontWeight: 'bold', color: mode === 'dark' ? 'common.white' : 'text.primary' }}>
            HYPHEN
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
          <Badge badgeContent={notificationCount} color="danger">
            <IconButton variant="plain" color="neutral" sx={{ color: mode === 'dark' ? 'common.white' : 'text.primary' }}>
              <NotificationsIcon />
            </IconButton>
          </Badge>
        </Box>

        {/* Mobile Drawer */}
        <Modal
          aria-labelledby="mobile-navigation"
          open={open}
          onClose={handleClose}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiModal-backdrop': {
              backdropFilter: 'blur(3px)',
            },
          }}
        >
          <Sheet
            sx={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '80%',
              maxWidth: 300,
              height: '100%',
              boxShadow: 'lg',
              p: 2,
              overflow: 'auto',
              backgroundColor: mode === 'dark' ? 'neutral.900' : 'background.body',
              borderRight: '1px solid',
              borderColor: mode === 'dark' ? 'neutral.700' : 'neutral.100',
            }}
          >
            {/* App Title & Close Button */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography level="h5" sx={{ fontWeight: 'bold', color: mode === 'dark' ? 'common.white' : 'text.primary' }}>
                HYPHEN
              </Typography>
              <ModalClose sx={{ color: mode === 'dark' ? 'common.white' : 'text.primary' }} />
            </Box>

            {/* Search Bar - Simplified */}
            <Input
              fullWidth
              placeholder="Search..."
              variant="outlined"
              size="sm"
              startDecorator={<SearchIcon />}
              sx={{
                mb: 2,
                borderRadius: 'md',
                backgroundColor: mode === 'dark' ? 'neutral.800' : 'neutral.100',
                '&:hover': {
                  backgroundColor: mode === 'dark' ? 'neutral.700' : 'neutral.200',
                },
              }}
            />

            {/* Mobile Navigation Items */}
            <Typography level="body-xs" sx={{ mt: 1, mb: 1, ml: 1, textTransform: 'uppercase', fontWeight: 'bold', color: mode === 'dark' ? 'neutral.400' : 'neutral.500' }}>
              MAIN NAVIGATION
            </Typography>
            
            <List size="sm" sx={{ mb: 2 }}>
              {navigationItems.map((item) => (
                <ListItem key={item.path}>
                  <ListItemButton 
                    component={Link} 
                    to={item.path} 
                    selected={location.pathname === item.path}
                    onClick={handleClose}
                    sx={{
                      borderRadius: 'md',
                      color: mode === 'dark' ? 'common.white' : 'text.primary',
                      '&.Mui-selected': {
                        backgroundColor: mode === 'dark' ? 'primary.700' : 'primary.softBg',
                        color: mode === 'dark' ? 'common.white' : 'primary.plainColor',
                        fontWeight: 'bold',
                        '&:hover': {
                          backgroundColor: mode === 'dark' ? 'primary.800' : 'primary.softHoverBg',
                        },
                      },
                      '&:hover': {
                        backgroundColor: mode === 'dark' ? 'neutral.800' : 'neutral.100',
                      },
                    }}
                  >
                    <ListItemDecorator sx={{ color: mode === 'dark' ? 'common.white' : 'text.primary' }}>
                      {item.icon}
                    </ListItemDecorator>
                    <ListItemContent>{item.label}</ListItemContent>
                  </ListItemButton>
                </ListItem>
              ))}
            </List>

            <Divider sx={{ my: 1 }} />

            {/* Quick Actions */}
            <Accordion sx={{ 
              backgroundColor: 'transparent', 
              boxShadow: 'none', 
              '&:hover': { backgroundColor: mode === 'dark' ? 'neutral.800' : 'neutral.100' },
              borderRadius: 'md',
            }}>
              <AccordionSummary 
                indicator={<ExpandMoreIcon />}
                sx={{ borderRadius: 'md' }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <FlashOnIcon sx={{ mr: 1, color: mode === 'dark' ? 'warning.300' : 'warning.500' }} />
                  <Typography level="body-sm" fontWeight="bold">Quick Actions</Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <List size="sm" sx={{ pl: 2 }}>
                  {quickActions.map((action, idx) => (
                    <ListItem key={idx}>
                      <ListItemButton 
                        component={action.path ? Link : 'button'} 
                        to={action.path} 
                        onClick={(e) => {
                          if (action.action) action.action();
                          handleClose();
                        }}
                        sx={{ borderRadius: 'md' }}
                      >
                        <ListItemContent>{action.label}</ListItemContent>
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
              </AccordionDetails>
            </Accordion>

            <Divider sx={{ my: 1 }} />

            {/* Shortcuts Accordion */}
            <Accordion sx={{ 
              backgroundColor: 'transparent', 
              boxShadow: 'none',
              '&:hover': { backgroundColor: mode === 'dark' ? 'neutral.800' : 'neutral.100' },
              borderRadius: 'md',
            }}>
              <AccordionSummary 
                indicator={<ExpandMoreIcon />}
                sx={{ borderRadius: 'md' }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <MoreHorizIcon sx={{ mr: 1 }} />
                  <Typography level="body-sm" fontWeight="bold">Shortcuts</Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Typography level="body-xs" sx={{ mt: 1, mb: 1, ml: 1, fontWeight: 'bold', color: mode === 'dark' ? 'neutral.400' : 'neutral.500' }}>
                  Pinned Items
                </Typography>
                <List size="sm" sx={{ pl: 1 }}>
                  {pinnedItems.map((item) => (
                    <ListItem key={item.id}>
                      <ListItemButton 
                        component={Link} 
                        to={item.path}
                        onClick={handleClose}
                        sx={{ borderRadius: 'md' }}
                      >
                        <ListItemDecorator>{item.icon}</ListItemDecorator>
                        <ListItemContent>{item.label}</ListItemContent>
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
                
                <Typography level="body-xs" sx={{ mt: 2, mb: 1, ml: 1, fontWeight: 'bold', color: mode === 'dark' ? 'neutral.400' : 'neutral.500' }}>
                  Recent Activity
                </Typography>
                <List size="sm" sx={{ pl: 1 }}>
                  {recentActivity.map((activity) => (
                    <ListItem key={activity.id}>
                      <ListItemDecorator>{activity.icon}</ListItemDecorator>
                      <ListItemContent>
                        <Typography level="body-xs">{activity.label}</Typography>
                      </ListItemContent>
                    </ListItem>
                  ))}
                </List>
              </AccordionDetails>
            </Accordion>

            <Box sx={{ flexGrow: 1 }} /> {/* Spacer to push bottom elements down */}

            {/* Theme Toggle */}
            <ListItemButton 
              onClick={toggleTheme}
              sx={{ 
                borderRadius: 'md',
                mt: 2,
                mb: 4
              }}
            >
              <ListItemDecorator>{mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}</ListItemDecorator>
              <ListItemContent>{mode === 'dark' ? 'Light Mode' : 'Dark Mode'}</ListItemContent>
            </ListItemButton>

            {/* User Profile & Notifications */}
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1, 
                mt: 2,
                p: 1,
                borderRadius: 'md',
                backgroundColor: mode === 'dark' ? 'neutral.800' : 'neutral.100',
              }}
            >
              <Avatar size="sm" src="/static/images/avatar.jpg" />
              <Box sx={{ flex: 1 }}>
                <Typography level="body-sm" fontWeight="bold" sx={{ color: mode === 'dark' ? 'common.white' : 'text.primary' }}>Admin User</Typography>
                <Typography level="body-xs" sx={{ color: mode === 'dark' ? 'neutral.400' : 'text.secondary' }}>admin@example.com</Typography>
              </Box>
              <Badge badgeContent={notificationCount} color="danger">
                <IconButton variant="plain" color="neutral" sx={{ color: mode === 'dark' ? 'common.white' : 'text.primary' }}>
                  <NotificationsIcon />
                </IconButton>
              </Badge>
            </Box>
          </Sheet>
        </Modal>
      </>
    );
  }

  // Desktop sidebar
  return (
    <Sheet
      variant="plain"
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        height: '100vh',
        width: { xs: 0, sm: 280 },
        zIndex: 1200,
        display: { xs: 'none', sm: 'flex' },
        flexDirection: 'column',
        boxShadow: 'md',
        backgroundColor: mode === 'dark' ? 'neutral.900' : 'background.body',
        p: 2,
        borderRight: '1px solid',
        borderColor: mode === 'dark' ? 'neutral.700' : 'neutral.100',
        // Ghost behavior
        overflowY: 'auto',
        '&::-webkit-scrollbar': {
          width: '6px',
          background: 'transparent',
          opacity: 0,
        },
        '&:hover::-webkit-scrollbar': {
          opacity: 1,
        },
        '&::-webkit-scrollbar-thumb': {
          background: mode === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.2)',
          borderRadius: '6px',
          opacity: 0,
        },
        '&:hover::-webkit-scrollbar-thumb': {
          opacity: 1,
        },
        // For Firefox
        scrollbarWidth: 'thin',
        scrollbarColor: `${mode === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.2)'} transparent`,
        // Transition 
        transition: 'all 0.3s ease',
        '&:hover': {
          scrollbarColor: `${mode === 'dark' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.4)'} transparent`,
        }
      }}
    >
      {/* App Title */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography level="h5" sx={{ fontWeight: 'bold', color: mode === 'dark' ? 'common.white' : 'text.primary' }}>
          HYPHEN
        </Typography>
      </Box>

      {/* Search Bar - Simplified */}
      <Input
        fullWidth
        placeholder="Search..."
        variant="outlined"
        size="sm"
        startDecorator={<SearchIcon />}
        sx={{
          mb: 2,
          borderRadius: 'md',
          backgroundColor: mode === 'dark' ? 'neutral.800' : 'neutral.100',
          '&:hover': {
            backgroundColor: mode === 'dark' ? 'neutral.700' : 'neutral.200',
          },
        }}
      />

      {/* Main Navigation */}
      <Typography level="body-xs" sx={{ mt: 1, mb: 1, ml: 1, textTransform: 'uppercase', fontWeight: 'bold', color: mode === 'dark' ? 'neutral.400' : 'neutral.500' }}>
        MAIN NAVIGATION
      </Typography>
      
      <List size="sm" sx={{ mb: 2 }}>
        {navigationItems.map((item) => (
          <ListItem key={item.path}>
            <Tooltip title={item.label} placement="right">
              <ListItemButton 
                component={Link} 
                to={item.path} 
                selected={location.pathname === item.path}
                sx={{
                  borderRadius: 'md',
                  color: mode === 'dark' ? 'common.white' : 'text.primary',
                  '&.Mui-selected': {
                    backgroundColor: mode === 'dark' ? 'primary.700' : 'primary.softBg',
                    color: mode === 'dark' ? 'common.white' : 'primary.plainColor',
                    fontWeight: 'bold',
                    '&:hover': {
                      backgroundColor: mode === 'dark' ? 'primary.800' : 'primary.softHoverBg',
                    },
                  },
                  '&:hover': {
                    backgroundColor: mode === 'dark' ? 'neutral.800' : 'neutral.100',
                  },
                }}
              >
                <ListItemDecorator sx={{ color: mode === 'dark' ? 'common.white' : 'text.primary' }}>
                  {item.icon}
                </ListItemDecorator>
                <ListItemContent>{item.label}</ListItemContent>
              </ListItemButton>
            </Tooltip>
          </ListItem>
        ))}
      </List>

      <Divider sx={{ my: 1 }} />

      {/* Quick Actions */}
      <Accordion sx={{ 
        backgroundColor: 'transparent', 
        boxShadow: 'none', 
        '&:hover': { backgroundColor: mode === 'dark' ? 'neutral.800' : 'neutral.100' },
        borderRadius: 'md',
      }}>
        <AccordionSummary 
          indicator={<ExpandMoreIcon />}
          sx={{ borderRadius: 'md' }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <FlashOnIcon sx={{ mr: 1, color: mode === 'dark' ? 'warning.300' : 'warning.500' }} />
            <Typography level="body-sm" fontWeight="bold">Quick Actions</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <List size="sm" sx={{ pl: 2 }}>
            {quickActions.map((action, idx) => (
              <ListItem key={idx}>
                <ListItemButton 
                  component={action.path ? Link : 'button'} 
                  to={action.path} 
                  onClick={action.action}
                  sx={{ borderRadius: 'md' }}
                >
                  <ListItemContent>{action.label}</ListItemContent>
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </AccordionDetails>
      </Accordion>

      <Divider sx={{ my: 1 }} />

      {/* Pinned Items & Recent Activity - Grouped in accordions */}
      <Accordion sx={{ 
        backgroundColor: 'transparent', 
        boxShadow: 'none',
        '&:hover': { backgroundColor: mode === 'dark' ? 'neutral.800' : 'neutral.100' },
        borderRadius: 'md',
      }}>
        <AccordionSummary 
          indicator={<ExpandMoreIcon />}
          sx={{ borderRadius: 'md' }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <MoreHorizIcon sx={{ mr: 1 }} />
            <Typography level="body-sm" fontWeight="bold">Shortcuts</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Typography level="body-xs" sx={{ mt: 1, mb: 1, ml: 1, fontWeight: 'bold', color: mode === 'dark' ? 'neutral.400' : 'neutral.500' }}>
            Pinned Items
          </Typography>
          <List size="sm" sx={{ pl: 1 }}>
            {pinnedItems.map((item) => (
              <ListItem key={item.id}>
                <ListItemButton 
                  component={Link} 
                  to={item.path}
                  sx={{ borderRadius: 'md' }}
                >
                  <ListItemDecorator>{item.icon}</ListItemDecorator>
                  <ListItemContent>{item.label}</ListItemContent>
                </ListItemButton>
              </ListItem>
            ))}
          </List>
          
          <Typography level="body-xs" sx={{ mt: 2, mb: 1, ml: 1, fontWeight: 'bold', color: mode === 'dark' ? 'neutral.400' : 'neutral.500' }}>
            Recent Activity
          </Typography>
          <List size="sm" sx={{ pl: 1 }}>
            {recentActivity.map((activity) => (
              <ListItem key={activity.id}>
                <ListItemDecorator>{activity.icon}</ListItemDecorator>
                <ListItemContent>
                  <Typography level="body-xs">{activity.label}</Typography>
                </ListItemContent>
              </ListItem>
            ))}
          </List>
        </AccordionDetails>
      </Accordion>

      <Box sx={{ flexGrow: 1 }} /> {/* Spacer to push bottom elements down */}

      {/* Theme Toggle */}
      <ListItemButton 
        onClick={toggleTheme}
        sx={{ 
          borderRadius: 'md',
          mt: 2,
          mb: 4
        }}
      >
        <ListItemDecorator>{mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}</ListItemDecorator>
        <ListItemContent>{mode === 'dark' ? 'Light Mode' : 'Dark Mode'}</ListItemContent>
      </ListItemButton>

      {/* User Profile & Notifications */}
      <Box 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1, 
          mt: 2,
          p: 1,
          borderRadius: 'md',
          backgroundColor: mode === 'dark' ? 'neutral.800' : 'neutral.100',
        }}
      >
        <Avatar size="sm" src="/static/images/avatar.jpg" />
        <Box sx={{ flex: 1 }}>
          <Typography level="body-sm" fontWeight="bold" sx={{ color: mode === 'dark' ? 'common.white' : 'text.primary' }}>Admin User</Typography>
          <Typography level="body-xs" sx={{ color: mode === 'dark' ? 'neutral.400' : 'text.secondary' }}>admin@example.com</Typography>
        </Box>
        <Badge badgeContent={notificationCount} color="danger">
          <IconButton variant="plain" color="neutral" sx={{ color: mode === 'dark' ? 'common.white' : 'text.primary' }}>
            <NotificationsIcon />
          </IconButton>
        </Badge>
      </Box>
    </Sheet>
  );
}

export default Navigation;
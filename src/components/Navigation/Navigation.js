import React, { useState } from 'react';
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
  Divider
} from '@mui/joy';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import InventoryIcon from '@mui/icons-material/Inventory';
import PeopleIcon from '@mui/icons-material/People';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import BarChartIcon from '@mui/icons-material/BarChart';
import CloseIcon from '@mui/icons-material/Close';
import NotificationsIcon from '@mui/icons-material/Notifications';

function Navigation({ mobileOpen, handleDrawerToggle }) {
  const location = useLocation();
  const [notificationCount, setNotificationCount] = useState(3);

  const navigationItems = [
    { path: '/', label: 'Dashboard', icon: <DashboardIcon /> },
    { path: '/inventory', label: 'Inventory', icon: <InventoryIcon /> },
    { path: '/suppliers', label: 'Suppliers', icon: <PeopleIcon /> },
    { path: '/orders', label: 'Orders', icon: <ShoppingCartIcon /> },
    { path: '/reports', label: 'Reports', icon: <BarChartIcon /> },
  ];

  return (
    <Sheet
      variant="solid"
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        height: '100vh',
        width: 280,
        zIndex: 1200,
        display: 'flex',
        flexDirection: 'column',
        boxShadow: 'md',
        overflowY: 'auto',
        backgroundColor: 'background.body',
        p: 2
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography level="h5" sx={{ fontWeight: 'bold' }}>
          Inventory Pro
        </Typography>
        <IconButton 
          onClick={handleDrawerToggle} 
          sx={{ display: { sm: 'none' } }}
        >
          <CloseIcon />
        </IconButton>
      </Box>
      <Divider sx={{ mb: 2 }} />
      <List size="lg">
        {navigationItems.map((item) => (
          <ListItem key={item.path}>
            <ListItemButton 
              component={Link} 
              to={item.path}
              selected={location.pathname === item.path}
              sx={{
                borderRadius: 'md',
                '&.Mui-selected': {
                  backgroundColor: 'primary.softBg',
                  color: 'primary.plainColor',
                  fontWeight: 'bold',
                  '&:hover': {
                    backgroundColor: 'primary.softHoverBg',
                  },
                },
              }}
            >
              <ListItemDecorator>{item.icon}</ListItemDecorator>
              <ListItemContent>{item.label}</ListItemContent>
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider sx={{ my: 2 }} />
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Avatar size="sm" src="/static/images/avatar.jpg" />
        <Box sx={{ flex: 1 }}>
          <Typography level="body-sm" fontWeight="bold">Admin User</Typography>
          <Typography level="body-xs">admin@example.com</Typography>
        </Box>
        <Badge badgeContent={notificationCount} color="danger">
          <IconButton variant="plain" color="neutral">
            <NotificationsIcon />
          </IconButton>
        </Badge>
      </Box>
    </Sheet>
  );
}

export default Navigation;

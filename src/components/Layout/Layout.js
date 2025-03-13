import React, { useState } from 'react';
import { Box, useColorScheme } from '@mui/joy';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import { IconButton } from '@mui/joy';
import Navigation from '../Navigation/Navigation';

function Layout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { mode, setMode } = useColorScheme();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box className="app-container">
      <Box className="content-wrapper">
        <Navigation mobileOpen={mobileOpen} handleDrawerToggle={handleDrawerToggle} />
        <Box 
          className="page-content"
          sx={{ 
            pt: { xs: '64px', sm: 0 },
            pl: { xs: 0, sm: '280px' },
            transition: 'padding 0.3s ease-in-out, background-color 0.3s',
            width: '100%',
            position: 'relative',
          }}
        >
          <IconButton
            onClick={() => setMode(mode === 'light' ? 'dark' : 'light')}
            variant="soft"
            color="neutral"
            sx={{
              position: 'fixed',
              top: { xs: '14px', sm: '20px' },
              right: '60px',
              zIndex: 1100,
            }}
          >
            {mode === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
          </IconButton>
          {children}
        </Box>
      </Box>
    </Box>
  );
}

export default Layout;
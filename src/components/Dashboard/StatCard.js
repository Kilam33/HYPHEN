import React from 'react';
import { Card, Box, Typography, IconButton, Tooltip } from '@mui/joy';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';

function StatCard({ title, value, percentChange, icon, color = 'primary', tooltip }) {
  return (
    <Card
      variant="outlined"
      sx={{ 
        p: 2.5, 
        height: '100%', 
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 'md',
        }
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography level="title-sm" textColor="text.secondary">
          {title}
        </Typography>
        {tooltip && (
          <Tooltip title={tooltip} arrow>
            <IconButton size="sm" variant="plain" color="neutral">
              <InfoOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </Box>
      
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 'auto' }}>
        <Typography level="h3" fontWeight="bold">
          {value}
        </Typography>
        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center',
            p: 1,
            borderRadius: '50%',
            bgcolor: `${color}.softBg`,
            color: `${color}.solidColor`,
          }}
        >
          {icon}
        </Box>
      </Box>
      
      {percentChange !== undefined && (
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center',
            mt: 1.5,
            color: percentChange >= 0 ? 'success.500' : 'danger.500'
          }}
        >
          {percentChange >= 0 ? 
            <ArrowUpwardIcon fontSize="small" /> : 
            <ArrowDownwardIcon fontSize="small" />
          }
          <Typography level="body-sm" sx={{ ml: 0.5 }}>
            {Math.abs(percentChange)}% {percentChange >= 0 ? 'increase' : 'decrease'}
          </Typography>
        </Box>
      )}
    </Card>
  );
}

export default StatCard;
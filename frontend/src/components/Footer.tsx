import React from 'react';
import { Box, Container, Typography } from '@mui/material';

/**
 * Footer component
 * Displays copyright information at the bottom of the page
 * Styled to stick to the bottom of the viewport
 */
const Footer: React.FC = () => {
  return (
    <Box 
      component="footer" 
      sx={{ 
        py: 3,
        backgroundColor: 'background.paper',
        borderTop: 1,
        borderColor: 'divider',
        width: '100%',
        marginTop: 'auto'
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Typography variant="body2" color="text.secondary" align="center">
            &copy; {new Date().getFullYear()} Deep Shortener URL. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer; 
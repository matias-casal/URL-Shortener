import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Box, Typography, CircularProgress, Button, Container } from '@mui/material';

/**
 * Redirect page component
 * Handles URL redirection with a countdown timer
 * Shows error message for invalid or expired URLs
 */
const Redirect: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(3);

  /**
   * Fetch original URL and handle redirection
   * Includes countdown before redirecting user
   */
  useEffect(() => {
    const fetchUrl = async () => {
      try {
        const { data } = await axios.get(`/api/urls/redirect/${slug}`);
        
        // Start countdown
        const timer = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              // Redirect to the original URL
              window.location.href = data.originalUrl;
              return 0;
            }
            return prev - 1;
          });
        }, 1000);

        return () => clearInterval(timer);
      } catch (err: any) {
        setLoading(false);
        if (err.response && err.response.status === 404) {
          setError('The URL you are looking for does not exist.');
        } else {
          setError('An error occurred while redirecting.');
        }
      }
    };

    fetchUrl();
  }, [slug]);

  /**
   * Error state view
   * Displayed when URL is invalid or server error occurs
   */
  if (error) {
    return (
      <Container maxWidth="md">
        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center',
            minHeight: '60vh',
            textAlign: 'center',
            py: 4
          }}
        >
          <Typography variant="h4" component="h1" gutterBottom>
            Oops! Something went wrong
          </Typography>
          <Typography variant="body1" paragraph>
            {error}
          </Typography>
          <Button component={Link} to="/" variant="contained" color="primary">
            Go to Homepage
          </Button>
        </Box>
      </Container>
    );
  }

  /**
   * Loading state with countdown
   * Displayed while preparing to redirect
   */
  return (
    <Container maxWidth="md">
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center',
          minHeight: '60vh',
          textAlign: 'center',
          py: 4
        }}
      >
        <CircularProgress size={60} sx={{ mb: 3 }} />
        <Typography variant="h4" component="h1" gutterBottom>
          Redirecting...
        </Typography>
        <Typography variant="body1">
          You will be redirected in {countdown} seconds
        </Typography>
      </Box>
    </Container>
  );
};

export default Redirect; 
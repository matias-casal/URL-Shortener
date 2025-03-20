import React, { useState, useContext } from 'react';
import axios, { AxiosError } from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Link as RouterLink } from 'react-router-dom';
import { 
  Container, 
  Typography, 
  TextField, 
  Button, 
  Box, 
  Grid, 
  Paper, 
  Card, 
  CardContent, 
  Alert,
  IconButton,
  Chip,
  Divider,
  Stack,
  Fade,
  useTheme
} from '@mui/material';
import {
  ContentCopy as CopyIcon,
  Link as LinkIcon,
  Analytics as AnalyticsIcon,
  Edit as EditIcon,
  QrCode as QrCodeIcon,
  Check as CheckIcon
} from '@mui/icons-material';

/**
 * Interface for the shortened URL data structure
 */
interface ShortenedUrl {
  id: string;
  originalUrl: string;
  shortUrl: string;
  slug: string;
  qrCode: string;
  visitCount: number;
}

/**
 * Home page component
 * Main landing page with URL shortening functionality
 */
const Home: React.FC = () => {
  const [originalUrl, setOriginalUrl] = useState('');
  const [customSlug, setCustomSlug] = useState('');
  const [shortenedUrl, setShortenedUrl] = useState<ShortenedUrl | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  
  const { isAuthenticated, setTempUrl } = useContext(AuthContext);
  const theme = useTheme();
  
  /**
   * Handle URL shortening form submission
   * Creates a new shortened URL via API
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!originalUrl) {
      setError('Please enter a URL');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const { data } = await axios.post('/api/urls', {
        originalUrl,
        customSlug: customSlug || undefined
      });
      
      const baseUrl = window.location.origin;
      const shortUrl = `${baseUrl}/${data.data.attributes.slug}`;
      
      setShortenedUrl({
        id: data.data.id,
        originalUrl: data.data.attributes.originalUrl,
        shortUrl: shortUrl,
        slug: data.data.attributes.slug,
        qrCode: data.data.attributes.qrCode,
        visitCount: data.data.attributes.visitCount
      });
      
      setLoading(false);
    } catch (err) {
      setLoading(false);
      const axiosError = err as AxiosError<{
        errors: Array<{ detail: string }>
      }>;
      
      if (axiosError.response?.data?.errors) {
        setError(axiosError.response.data.errors[0].detail);
      } else {
        setError('An error occurred while shortening the URL');
      }
    }
  };
  
  /**
   * Copy shortened URL to clipboard
   * Shows feedback with copied state
   */
  const copyToClipboard = () => {
    if (shortenedUrl) {
      navigator.clipboard.writeText(shortenedUrl.shortUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  /**
   * Save current URL to auth context before redirecting to register
   * Allows claiming the URL after registration
   */
  const handleRegisterClick = () => {
    if (shortenedUrl) {
      // Save the shortened URL to the context before redirecting to register
      setTempUrl(shortenedUrl);
    }
  };
  
  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography 
          variant="h2" 
          component="h1" 
          gutterBottom
          fontWeight="bold"
          sx={{ 
            mb: 2,
            background: theme.palette.mode === 'dark' 
              ? 'linear-gradient(45deg, #90caf9 30%, #f48fb1 90%)' 
              : 'linear-gradient(45deg, #2196f3 30%, #f50057 90%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Deep Shortener URL
        </Typography>
        <Typography variant="h5" color="text.secondary" paragraph>
          Make your links shorter and easier to share
        </Typography>
      </Box>
      
      <Paper 
        elevation={3} 
        sx={{ 
          p: 4, 
          mb: 6,
          borderRadius: 2,
          background: theme.palette.mode === 'dark' 
            ? 'linear-gradient(to right bottom, rgba(20,20,20,0.7), rgba(30,30,30,0.8))' 
            : 'linear-gradient(to right bottom, rgba(255,255,255,0.8), rgba(245,245,245,0.9))',
          backdropFilter: 'blur(10px)',
        }}
      >
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 'medium' }}>
          Create your short link
        </Typography>
        
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="URL to shorten"
                variant="outlined"
                placeholder="Enter your long URL here"
                value={originalUrl}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setOriginalUrl(e.target.value)}
                required
                type="url"
                InputProps={{
                  startAdornment: <LinkIcon sx={{ color: 'text.secondary', mr: 1 }} />,
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Custom slug (optional)"
                variant="outlined"
                placeholder="Enter a custom slug (e.g., my-link)"
                value={customSlug}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomSlug(e.target.value)}
                InputProps={{
                  startAdornment: <EditIcon sx={{ color: 'text.secondary', mr: 1 }} />,
                }}
                helperText="Leave empty for a randomly generated slug"
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                fullWidth
                disabled={loading}
                sx={{ py: 1.5, fontWeight: 'medium' }}
              >
                {loading ? 'Shortening...' : 'Shorten URL'}
              </Button>
            </Grid>
          </Grid>
          
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </Box>
      </Paper>
      
      {shortenedUrl && (
        <Fade in={Boolean(shortenedUrl)}>
          <Paper elevation={3} sx={{ p: 4, borderRadius: 2, mb: 6 }}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'medium' }}>
              Your shortened URL is ready!
            </Typography>
            
            <Card variant="outlined" sx={{ mt: 3 }}>
              <CardContent>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Original URL
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      wordBreak: 'break-all',
                      opacity: 0.8
                    }}
                  >
                    {shortenedUrl.originalUrl}
                  </Typography>
                </Box>
                
                <Divider sx={{ my: 2 }} />
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Shortened URL
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography 
                      variant="body1" 
                      fontWeight="medium" 
                      sx={{ wordBreak: 'break-all' }}
                    >
                      {shortenedUrl.shortUrl}
                    </Typography>
                    <IconButton 
                      onClick={copyToClipboard} 
                      color={copied ? 'success' : 'primary'} 
                      size="small"
                    >
                      {copied ? <CheckIcon /> : <CopyIcon />}
                    </IconButton>
                  </Box>
                </Box>
                
                <Divider sx={{ my: 2 }} />
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                  <Stack direction="row" spacing={1}>
                    <Chip 
                      icon={<QrCodeIcon />} 
                      label="QR Code" 
                      size="small" 
                      color="primary" 
                      variant="outlined" 
                    />
                    <Chip 
                      icon={<AnalyticsIcon />}
                      label={`${shortenedUrl.visitCount} visits`} 
                      size="small" 
                      color="secondary" 
                      variant="outlined" 
                    />
                  </Stack>
                  
                  {!isAuthenticated && (
                    <Button 
                      component={RouterLink} 
                      to="/register" 
                      variant="contained" 
                      color="primary"
                      size="small"
                      onClick={handleRegisterClick}
                    >
                      Register to track links
                    </Button>
                  )}
                </Box>
              </CardContent>
            </Card>
            
            {shortenedUrl.qrCode && (
              <Box sx={{ mt: 3, textAlign: 'center' }}>
                <Typography variant="subtitle1" gutterBottom>
                  QR Code
                </Typography>
                <Box 
                  component="img" 
                  src={shortenedUrl.qrCode} 
                  alt="QR Code" 
                  sx={{ 
                    maxWidth: '200px',
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                    p: 2,
                    bgcolor: 'white'
                  }} 
                />
              </Box>
            )}
          </Paper>
        </Fade>
      )}
      
      <Box sx={{ mt: 8 }}>
        <Typography variant="h4" gutterBottom textAlign="center" sx={{ mb: 4 }}>
          Features
        </Typography>
        
        <Grid container spacing={4}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                  <LinkIcon color="primary" sx={{ fontSize: 40 }} />
                </Box>
                <Typography variant="h6" component="h3" align="center" gutterBottom>
                  Short Links
                </Typography>
                <Typography variant="body2" color="text.secondary" align="center">
                  Create short links that are easy to share and remember.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                  <QrCodeIcon color="primary" sx={{ fontSize: 40 }} />
                </Box>
                <Typography variant="h6" component="h3" align="center" gutterBottom>
                  QR Codes
                </Typography>
                <Typography variant="body2" color="text.secondary" align="center">
                  Generate QR codes for your shortened URLs.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                  <EditIcon color="primary" sx={{ fontSize: 40 }} />
                </Box>
                <Typography variant="h6" component="h3" align="center" gutterBottom>
                  Custom Slugs
                </Typography>
                <Typography variant="body2" color="text.secondary" align="center">
                  Customize your shortened URLs with meaningful slugs.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                  <AnalyticsIcon color="primary" sx={{ fontSize: 40 }} />
                </Box>
                <Typography variant="h6" component="h3" align="center" gutterBottom>
                  Link Analytics
                </Typography>
                <Typography variant="body2" color="text.secondary" align="center">
                  Track the performance of your links with visit statistics.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default Home; 
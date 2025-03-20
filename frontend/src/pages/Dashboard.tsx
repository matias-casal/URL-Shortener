import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { 
  Container, 
  Typography, 
  Box, 
  Grid, 
  Paper, 
  Card, 
  CardContent, 
  CardActions, 
  Button, 
  TextField, 
  IconButton, 
  Chip,
  Avatar,
  Divider,
  Alert,
  Collapse,
  CircularProgress,
  useTheme,
  Tooltip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Fade
} from '@mui/material';
import { 
  ContentCopy as CopyIcon, 
  QrCode as QrCodeIcon, 
  Link as LinkIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Visibility as ViewIcon,
  VisibilityOff as HideIcon,
  Refresh as RefreshIcon,
  Analytics as AnalyticsIcon,
  Check as CheckIcon
} from '@mui/icons-material';

interface UrlData {
  id: string;
  attributes: {
    originalUrl: string;
    shortUrl: string;
    slug: string;
    qrCode: string;
    visitCount: number;
    createdAt: string;
  };
}

const Dashboard: React.FC = () => {
  const [urls, setUrls] = useState<UrlData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [editingUrl, setEditingUrl] = useState<string | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string>('');
  const [customSlug, setCustomSlug] = useState<string>('');
  const [qrVisible, setQrVisible] = useState<{ [key: string]: boolean }>({});
  const [copiedUrls, setCopiedUrls] = useState<{ [key: string]: boolean }>({});
  const [refreshing, setRefreshing] = useState<boolean>(false);
  
  const { user } = useContext(AuthContext);
  const theme = useTheme();
  
  useEffect(() => {
    fetchUrls();
  }, []);
  
  const fetchUrls = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data } = await axios.get('/api/urls/user/urls');
      setUrls(data.data);
      
      setLoading(false);
    } catch (err: any) {
      setLoading(false);
      if (err.response && err.response.data && err.response.data.errors) {
        setError(err.response.data.errors[0].detail);
      } else {
        setError('Failed to load your URLs');
      }
    }
  };
  
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchUrls();
    setRefreshing(false);
  };
  
  const handleEdit = (url: UrlData) => {
    setEditingUrl(url.id);
    setOriginalUrl(url.attributes.originalUrl);
    setCustomSlug(url.attributes.slug);
  };
  
  const handleCancelEdit = () => {
    setEditingUrl(null);
    setOriginalUrl('');
    setCustomSlug('');
  };
  
  const handleUpdateUrl = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      
      await axios.put(`/api/urls/${id}`, {
        originalUrl,
        customSlug
      });
      
      await fetchUrls();
      setEditingUrl(null);
      setOriginalUrl('');
      setCustomSlug('');
    } catch (err: any) {
      setLoading(false);
      if (err.response && err.response.data && err.response.data.errors) {
        setError(err.response.data.errors[0].detail);
      } else {
        setError('Failed to update URL');
      }
    }
  };
  
  const toggleQrCode = (id: string) => {
    setQrVisible(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };
  
  const copyToClipboard = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrls(prev => ({ ...prev, [id]: true }));
    setTimeout(() => {
      setCopiedUrls(prev => ({ ...prev, [id]: false }));
    }, 2000);
  };
  
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  if (loading && urls.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center',
          minHeight: '50vh'
        }}>
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Loading your URLs...
          </Typography>
        </Box>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Box sx={{ mb: 4 }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2,
          mb: 2 
        }}>
          <Typography 
            variant="h4" 
            component="h1" 
            fontWeight="bold"
            sx={{ 
              background: theme.palette.mode === 'dark' 
                ? 'linear-gradient(45deg, #90caf9 30%, #f48fb1 90%)' 
                : 'linear-gradient(45deg, #2196f3 30%, #f50057 90%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            My URL Dashboard
          </Typography>
          
          <Box>
            <Button 
              variant="outlined" 
              color="primary" 
              startIcon={<RefreshIcon />}
              onClick={handleRefresh}
              disabled={refreshing}
              sx={{ mr: 1 }}
            >
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
            
            <Button 
              component="a" 
              href="/" 
              variant="contained" 
              color="primary"
              startIcon={<LinkIcon />}
            >
              Create New URL
            </Button>
          </Box>
        </Box>
        
        <Paper 
          elevation={0}
          sx={{ 
            p: 3, 
            mb: 4, 
            borderRadius: 2,
            bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
            border: '1px solid',
            borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar 
              sx={{ 
                bgcolor: 'primary.main', 
                width: 48, 
                height: 48,
                mr: 2
              }}
            >
              {user?.username.charAt(0).toUpperCase()}
            </Avatar>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 'medium' }}>
                Welcome, {user?.username}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Manage all your shortened URLs in one place
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}
      
      {urls.length === 0 && !loading && (
        <Paper 
          elevation={2} 
          sx={{ 
            p: 4, 
            textAlign: 'center',
            borderRadius: 2,
            bgcolor: theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.01)',
            minHeight: '200px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <QrCodeIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            You haven&apos;t created any URLs yet
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: '500px' }}>
            Start shortening your long URLs to make them easier to share and track with our powerful analytics.
          </Typography>
          <Button
            component="a"
            href="/"
            variant="contained"
            color="primary"
            startIcon={<LinkIcon />}
          >
            Create Your First Short URL
          </Button>
        </Paper>
      )}
      
      {urls.length > 0 && (
        <Grid container spacing={3}>
          {urls.map((url) => (
            <Grid item xs={12} key={url.id}>
              <Card 
                elevation={2} 
                sx={{ 
                  borderRadius: 2,
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    boxShadow: theme.shadows[4],
                    transform: 'translateY(-2px)'
                  }
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  {editingUrl === url.id ? (
                    <Box component="form" sx={{ mb: 2 }}>
                      <Typography variant="h6" sx={{ mb: 2, fontWeight: 'medium' }}>
                        Edit URL
                      </Typography>
                      
                      <Grid container spacing={2}>
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            label="Original URL"
                            variant="outlined"
                            value={originalUrl}
                            onChange={(e) => setOriginalUrl(e.target.value)}
                            placeholder="https://example.com/your-long-url"
                            required
                            InputProps={{
                              startAdornment: (
                                <LinkIcon sx={{ color: 'text.secondary', mr: 1 }} />
                              ),
                            }}
                            sx={{ mb: 2 }}
                          />
                        </Grid>
                        
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            label="Custom Slug (optional)"
                            variant="outlined"
                            value={customSlug}
                            onChange={(e) => setCustomSlug(e.target.value)}
                            placeholder="my-custom-slug"
                            InputProps={{
                              startAdornment: (
                                <EditIcon sx={{ color: 'text.secondary', mr: 1 }} />
                              ),
                            }}
                          />
                        </Grid>
                      </Grid>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                        <Button
                          onClick={handleCancelEdit}
                          startIcon={<CancelIcon />}
                          sx={{ mr: 1 }}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={() => handleUpdateUrl(url.id)}
                          variant="contained"
                          color="primary"
                          startIcon={<SaveIcon />}
                          disabled={loading}
                        >
                          Save Changes
                        </Button>
                      </Box>
                    </Box>
                  ) : (
                    <>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={8}>
                          <Box sx={{ mb: 1 }}>
                            <Typography variant="subtitle2" color="text.secondary">
                              Original URL
                            </Typography>
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                wordBreak: 'break-all',
                                opacity: 0.9,
                                mb: 2
                              }}
                            >
                              {url.attributes.originalUrl}
                            </Typography>
                            
                            <Typography variant="subtitle2" color="text.secondary">
                              Shortened URL
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                              <Typography 
                                variant="body1" 
                                fontWeight="medium" 
                                sx={{ wordBreak: 'break-all', mr: 1 }}
                              >
                                {url.attributes.shortUrl}
                              </Typography>
                              <Tooltip title={copiedUrls[url.id] ? "Copied!" : "Copy to clipboard"}>
                                <IconButton 
                                  onClick={() => copyToClipboard(url.attributes.shortUrl, url.id)} 
                                  color={copiedUrls[url.id] ? 'success' : 'primary'} 
                                  size="small"
                                >
                                  {copiedUrls[url.id] ? <CheckIcon /> : <CopyIcon />}
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </Box>
                          
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                            <Chip 
                              icon={<AnalyticsIcon />} 
                              label={`${url.attributes.visitCount} ${url.attributes.visitCount === 1 ? 'visit' : 'visits'}`} 
                              color="secondary" 
                              size="small" 
                              variant="outlined"
                            />
                            <Chip 
                              label={`Created: ${formatDate(url.attributes.createdAt)}`} 
                              size="small" 
                              variant="outlined"
                            />
                            <Chip 
                              label={`Slug: ${url.attributes.slug}`} 
                              size="small" 
                              variant="outlined"
                            />
                          </Box>
                        </Grid>
                        
                        <Grid item xs={12} sm={4}>
                          <Box sx={{ 
                            display: 'flex', 
                            flexDirection: 'column', 
                            height: '100%', 
                            justifyContent: 'center',
                            alignItems: { xs: 'flex-start', sm: 'center' }
                          }}>
                            <Button
                              variant="outlined"
                              color="primary"
                              onClick={() => toggleQrCode(url.id)}
                              startIcon={qrVisible[url.id] ? <HideIcon /> : <QrCodeIcon />}
                              sx={{ mb: 1, width: { xs: 'auto', sm: '80%' } }}
                            >
                              {qrVisible[url.id] ? 'Hide QR Code' : 'Show QR Code'}
                            </Button>
                            
                            <Button
                              variant="outlined"
                              color="primary"
                              onClick={() => handleEdit(url)}
                              startIcon={<EditIcon />}
                              sx={{ width: { xs: 'auto', sm: '80%' } }}
                            >
                              Edit URL
                            </Button>
                          </Box>
                        </Grid>
                      </Grid>
                      
                      <Collapse in={qrVisible[url.id]} timeout="auto" unmountOnExit>
                        <Divider sx={{ my: 2 }} />
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="subtitle2" gutterBottom>
                            QR Code
                          </Typography>
                          <Box 
                            component="img" 
                            src={url.attributes.qrCode} 
                            alt="QR Code" 
                            sx={{ 
                              maxWidth: '180px',
                              border: '1px solid',
                              borderColor: 'divider',
                              borderRadius: 1,
                              p: 2,
                              bgcolor: 'white'
                            }} 
                          />
                        </Box>
                      </Collapse>
                    </>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default Dashboard; 
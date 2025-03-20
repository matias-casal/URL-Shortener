import React, { useState, useContext } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { 
  Container, 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Alert, 
  Paper, 
  Avatar, 
  Link,
  CircularProgress,
  InputAdornment,
  IconButton,
  useTheme
} from '@mui/material';
import {
  LockOutlined as LockIcon,
  Visibility,
  VisibilityOff,
  Email as EmailIcon,
  Login as LoginIcon
} from '@mui/icons-material';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  
  const { login, loading, error } = useContext(AuthContext);
  const navigate = useNavigate();
  const theme = useTheme();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setFormError('Please enter both email and password');
      return;
    }
    
    try {
      setFormError(null);
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      // Error is handled by context
    }
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  return (
    <Container component="main" maxWidth="xs" sx={{ py: 8 }}>
      <Paper 
        elevation={3} 
        sx={{ 
          p: 4, 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          borderRadius: 2,
          background: theme.palette.mode === 'dark' 
            ? 'linear-gradient(to right bottom, rgba(20,20,20,0.8), rgba(30,30,30,0.9))' 
            : 'linear-gradient(to right bottom, rgba(255,255,255,0.9), rgba(245,245,245,0.95))',
          backdropFilter: 'blur(10px)',
        }}
      >
        <Avatar sx={{ 
          m: 1, 
          bgcolor: 'primary.main',
          width: 56,
          height: 56 
        }}>
          <LockIcon fontSize="large" />
        </Avatar>
        
        <Typography 
          component="h1" 
          variant="h4" 
          fontWeight="bold" 
          gutterBottom
          sx={{ 
            mb: 3,
            color: 'text.primary' 
          }}
        >
          Sign In
        </Typography>
        
        <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailIcon color="action" />
                </InputAdornment>
              ),
            }}
          />
          
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            id="password"
            autoComplete="current-password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockIcon color="action" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleTogglePasswordVisibility}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          
          {(formError || error) && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {formError || error}
            </Alert>
          )}
          
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            size="large"
            disabled={loading}
            sx={{ 
              mt: 3, 
              mb: 2,
              py: 1.5,
              position: 'relative'
            }}
            startIcon={!loading && <LoginIcon />}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" sx={{ position: 'absolute' }} />
            ) : (
              'Sign In'
            )}
          </Button>
          
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Link component={RouterLink} to="/register" variant="body2" color="primary.main">
              Don&apos;t have an account? Sign Up
            </Link>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default Login; 
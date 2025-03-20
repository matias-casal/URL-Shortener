import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import { 
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Box,
  Container,
  useMediaQuery,
  Menu,
  MenuItem,
  Avatar,
  useTheme
} from '@mui/material';
import {
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  Menu as MenuIcon,
  AccountCircle
} from '@mui/icons-material';

/**
 * Header component
 * Displays the application navigation bar with responsive design
 * Handles authentication state and theme toggling
 */
const Header: React.FC = () => {
  const { isAuthenticated, logout, user } = useContext(AuthContext);
  const { darkMode, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();
  const isMobile = useMediaQuery('(max-width:768px)');
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const theme = useTheme();
  
  /**
   * Handle user logout
   * Clears authentication and redirects to home
   */
  const handleLogout = () => {
    logout();
    navigate('/');
  };
  
  /**
   * Open mobile menu
   */
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  
  /**
   * Close mobile menu
   */
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  
  return (
    <AppBar position="static" color="default" elevation={2}>
      <Container>
        <Toolbar sx={{ justifyContent: 'space-between', padding: isMobile ? '0.5rem 0' : '0.5rem 1rem' }}>
          {/* Logo with gradient effect */}
          <Typography
            variant={isMobile ? "h6" : "h5"}
            component={Link}
            to="/"
            sx={{
              fontWeight: 700,
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              background: theme.palette.mode === 'dark' 
                ? 'linear-gradient(45deg, #90caf9 30%, #f48fb1 90%)' 
                : 'linear-gradient(45deg, #2196f3 30%, #f50057 90%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Deep Shortener URL
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {/* Theme toggle button */}
            <IconButton
              onClick={toggleTheme}
              size="large"
              color="inherit"
              sx={{ mr: 1 }}
              aria-label="toggle dark/light mode"
            >
              {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
            
            {/* Mobile menu */}
            {isMobile ? (
              <>
                <IconButton
                  color="inherit"
                  aria-label="menu"
                  onClick={handleMenuOpen}
                  size="large"
                >
                  <MenuIcon />
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleMenuClose}
                >
                  <MenuItem component={Link} to="/" onClick={handleMenuClose}>
                    Home
                  </MenuItem>
                  
                  {isAuthenticated ? (
                    <>
                      <MenuItem component={Link} to="/dashboard" onClick={handleMenuClose}>
                        Dashboard
                      </MenuItem>
                      <MenuItem onClick={() => { handleMenuClose(); handleLogout(); }}>
                        Logout
                      </MenuItem>
                    </>
                  ) : (
                    <>
                      <MenuItem component={Link} to="/login" onClick={handleMenuClose}>
                        Login
                      </MenuItem>
                      <MenuItem component={Link} to="/register" onClick={handleMenuClose}>
                        Register
                      </MenuItem>
                    </>
                  )}
                </Menu>
              </>
            ) : (
              <>
                {/* Desktop navigation */}
                <Button
                  component={Link}
                  to="/"
                  color="inherit"
                  sx={{ mr: 1 }}
                >
                  Home
                </Button>
                
                {isAuthenticated ? (
                  <>
                    <Button
                      component={Link}
                      to="/dashboard"
                      color="inherit"
                      sx={{ mr: 1 }}
                    >
                      Dashboard
                    </Button>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', ml: 1 }}>
                      <Avatar sx={{ width: 32, height: 32, mr: 1, bgcolor: 'primary.main' }}>
                        <AccountCircle />
                      </Avatar>
                      <Typography variant="body2" sx={{ mr: 2 }}>
                        My Account
                      </Typography>
                    </Box>
                    
                    <Button
                      color="secondary"
                      variant="outlined"
                      onClick={handleLogout}
                      size="small"
                    >
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      component={Link}
                      to="/login"
                      color="inherit"
                      sx={{ mr: 1 }}
                    >
                      Login
                    </Button>
                    <Button
                      component={Link}
                      to="/register"
                      color="primary"
                      variant="contained"
                    >
                      Register
                    </Button>
                  </>
                )}
              </>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Header; 
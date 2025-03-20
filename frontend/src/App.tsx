import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider as MuiThemeProvider, CssBaseline, Box } from '@mui/material';
import { CacheProvider } from '@emotion/react';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import NotFound from './pages/NotFound';
import Redirect from './pages/Redirect';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider, ThemeContext } from './context/ThemeContext';
import { lightTheme, darkTheme } from './theme';
import ProtectedRoute from './components/ProtectedRoute';
import createEmotionCache from './createEmotionCache';

/**
 * Create Emotion cache instance for styling optimization
 */
const emotionCache = createEmotionCache();

/**
 * Main application content component
 * Handles theme selection and routing configuration
 */
const AppContent: React.FC = () => {
  const { darkMode } = useContext(ThemeContext);
  
  return (
    <CacheProvider value={emotionCache}>
      <MuiThemeProvider theme={darkMode ? darkTheme : lightTheme}>
        <CssBaseline />
        <Router>
          <Box 
            sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              minHeight: '100vh' 
            }}
          >
            <Header />
            <Box 
              component="main" 
              sx={{ 
                flex: '1 0 auto',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } />
                <Route path="/:slug" element={<Redirect />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Box>
            <Footer />
          </Box>
        </Router>
      </MuiThemeProvider>
    </CacheProvider>
  );
};

/**
 * Root application component
 * Provides global context providers for authentication and theme
 */
const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App; 
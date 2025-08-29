import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import CandidateForm from './pages/CandidateForm';
import Dashboard from './pages/Dashboard';
import Candidates from './pages/Candidates';
import Employees from './pages/Employees';
import Departments from './pages/Departments';
import Positions from './pages/Positions';
import History from './pages/History';
import Users from './pages/Users';

// Dark theme with neon accents
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#00ffff', // Cyan neon
      light: '#4dffff',
      dark: '#00b3b3',
    },
    secondary: {
      main: '#ff00ff', // Magenta neon
      light: '#ff4dff',
      dark: '#b300b3',
    },
    background: {
      default: '#0a0a0a',
      paper: '#1a1a1a',
    },
    text: {
      primary: '#ffffff',
      secondary: '#b0b0b0',
    },
    error: {
      main: '#ff4444',
    },
    warning: {
      main: '#ffaa00',
    },
    success: {
      main: '#00ff88',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 600,
      textShadow: '0 0 10px rgba(0, 255, 255, 0.5)',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 500,
      textShadow: '0 0 8px rgba(0, 255, 255, 0.4)',
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 500,
      textShadow: '0 0 6px rgba(0, 255, 255, 0.3)',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600,
          boxShadow: '0 0 10px rgba(0, 255, 255, 0.3)',
          '&:hover': {
            boxShadow: '0 0 20px rgba(0, 255, 255, 0.6)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#1a1a1a',
          border: '1px solid #333',
          borderRadius: 12,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
          '&:hover': {
            boxShadow: '0 8px 30px rgba(0, 255, 255, 0.1)',
            borderColor: '#00ffff',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: '#1a1a1a',
          border: '1px solid #333',
        },
      },
    },
  },
});

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

// SuperAdmin Route Component
const SuperAdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isSuperAdmin } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (!isSuperAdmin()) {
    // Show user-friendly error message and redirect to dashboard
    alert('Access Denied: You need superadmin privileges to access the Users Management panel. You have been redirected to the Dashboard.');
    return <Navigate to="/admin" replace />;
  }
  
  return <>{children}</>;
};

// Main App Component
const AppContent: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/candidate-form" element={<CandidateForm />} />
        <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/admin" replace />} />
        
        {/* Protected admin routes */}
        <Route path="/admin" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="candidates" element={<Candidates />} />
          <Route path="employees" element={<Employees />} />
          <Route path="departments" element={<Departments />} />
          <Route path="positions" element={<Positions />} />
          <Route path="history" element={<History />} />
          <Route path="users" element={
            <SuperAdminRoute>
              <Users />
            </SuperAdminRoute>
          } />
        </Route>
      </Routes>
    </Router>
  );
};

// Root App Component
const App: React.FC = () => {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;

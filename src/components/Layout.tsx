import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Work as WorkIcon,
  Business as BusinessIcon,
  Person as PersonIcon,
  Timeline as HistoryIcon,
  AdminPanelSettings as AdminIcon,
  Logout as LogoutIcon,
  AccountCircle as AccountIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const drawerWidth = 280;

const Layout: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { mode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isSuperAdmin } = useAuth();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    handleProfileMenuClose();
  };

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/admin' },
    { text: 'Candidates', icon: <PeopleIcon />, path: '/admin/candidates' },
    { text: 'Employees', icon: <WorkIcon />, path: '/admin/employees' },
    { text: 'Departments', icon: <BusinessIcon />, path: '/admin/departments' },
    { text: 'Positions', icon: <PersonIcon />, path: '/admin/positions' },
    { text: 'History', icon: <HistoryIcon />, path: '/admin/history' },
    // Only show Users menu for superadmins
    ...(isSuperAdmin() ? [{ text: 'Users', icon: <AdminIcon />, path: '/admin/users' }] : []),
  ];

  const drawer = (
    <Box>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 2,
          background: mode === 'dark'
            ? 'linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%)'
            : 'linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%)',
          borderBottom: mode === 'dark' ? '1px solid #333' : '1px solid #e0e0e0',
        }}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Typography
            variant="h4"
            sx={{
              background: mode === 'dark'
                ? 'linear-gradient(45deg, #00ffff, #ff00ff)'
                : 'linear-gradient(45deg, #1976d2, #9c27b0)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 'bold',
              textShadow: mode === 'dark' ? '0 0 20px rgba(0, 255, 255, 0.5)' : 'none',
            }}
          >
            HR System
          </Typography>
        </motion.div>
      </Box>
      <Divider sx={{ borderColor: mode === 'dark' ? '#333' : '#e0e0e0' }} />
      <List sx={{ pt: 1 }}>
        {menuItems.map((item, index) => (
          <motion.div
            key={item.text}
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <ListItem disablePadding>
              <ListItemButton
                onClick={() => navigate(item.path)}
                selected={location.pathname === item.path}
                sx={{
                  mx: 1,
                  borderRadius: 2,
                  mb: 0.5,
                  '&.Mui-selected': {
                    backgroundColor: mode === 'dark'
                      ? 'rgba(0, 255, 255, 0.1)'
                      : 'rgba(25, 118, 210, 0.1)',
                    border: mode === 'dark'
                      ? '1px solid rgba(0, 255, 255, 0.3)'
                      : '1px solid rgba(25, 118, 210, 0.3)',
                    '&:hover': {
                      backgroundColor: mode === 'dark'
                        ? 'rgba(0, 255, 255, 0.15)'
                        : 'rgba(25, 118, 210, 0.15)',
                    },
                  },
                  '&:hover': {
                    backgroundColor: mode === 'dark'
                      ? 'rgba(255, 255, 255, 0.05)'
                      : 'rgba(0, 0, 0, 0.05)',
                    border: mode === 'dark'
                      ? '1px solid rgba(255, 255, 255, 0.1)'
                      : '1px solid rgba(0, 0, 0, 0.1)',
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    color: location.pathname === item.path
                      ? (mode === 'dark' ? '#00ffff' : '#1976d2')
                      : (mode === 'dark' ? '#b0b0b0' : '#666666'),
                    minWidth: 40,
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  sx={{
                    '& .MuiTypography-root': {
                      fontWeight: location.pathname === item.path ? 600 : 400,
                      color: location.pathname === item.path
                        ? (mode === 'dark' ? '#00ffff' : '#1976d2')
                        : (mode === 'dark' ? '#ffffff' : '#000000'),
                    },
                  }}
                />
              </ListItemButton>
            </ListItem>
          </motion.div>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          backgroundColor: mode === 'dark' ? 'rgba(26, 26, 26, 0.95)' : 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderBottom: mode === 'dark' ? '1px solid #333' : '1px solid #e0e0e0',
          boxShadow: mode === 'dark' ? '0 4px 20px rgba(0, 0, 0, 0.3)' : '0 4px 20px rgba(0, 0, 0, 0.1)',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {menuItems.find(item => item.path === location.pathname)?.text || 'Dashboard'}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton
              onClick={toggleTheme}
              sx={{
                color: mode === 'dark' ? '#00ffff' : '#1976d2',
                '&:hover': {
                  backgroundColor: mode === 'dark' ? 'rgba(0, 255, 255, 0.1)' : 'rgba(25, 118, 210, 0.1)',
                },
              }}
              title={`Switch to ${mode === 'dark' ? 'light' : 'dark'} mode`}
            >
              {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
            <Typography variant="body2" sx={{ color: mode === 'dark' ? '#b0b0b0' : '#666666' }}>
              {user?.username}
            </Typography>
            <IconButton
              onClick={handleProfileMenuOpen}
              sx={{
                color: mode === 'dark' ? '#00ffff' : '#1976d2',
                '&:hover': {
                  backgroundColor: mode === 'dark' ? 'rgba(0, 255, 255, 0.1)' : 'rgba(25, 118, 210, 0.1)',
                },
              }}
            >
              <Avatar sx={{
                width: 32,
                height: 32,
                bgcolor: mode === 'dark' ? '#00ffff' : '#1976d2',
                color: mode === 'dark' ? '#000' : '#fff'
              }}>
                <AccountIcon />
              </Avatar>
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              backgroundColor: mode === 'dark' ? '#1a1a1a' : '#ffffff',
              borderRight: mode === 'dark' ? '1px solid #333' : '1px solid #e0e0e0',
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              backgroundColor: mode === 'dark' ? '#1a1a1a' : '#ffffff',
              borderRight: mode === 'dark' ? '1px solid #333' : '1px solid #e0e0e0',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          mt: '64px',
          minHeight: 'calc(100vh - 64px)',
          background: mode === 'dark'
            ? 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)'
            : 'linear-gradient(135deg, #f5f5f5 0%, #ffffff 100%)',
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Outlet />
        </motion.div>
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleProfileMenuClose}
        sx={{
          '& .MuiPaper-root': {
            backgroundColor: mode === 'dark' ? '#1a1a1a' : '#ffffff',
            border: mode === 'dark' ? '1px solid #333' : '1px solid #e0e0e0',
            boxShadow: mode === 'dark' ? '0 8px 32px rgba(0, 0, 0, 0.5)' : '0 8px 32px rgba(0, 0, 0, 0.1)',
          },
        }}
      >
        <MenuItem onClick={handleLogout} sx={{ color: '#ff4444' }}>
          <ListItemIcon sx={{ color: '#ff4444' }}>
            <LogoutIcon />
          </ListItemIcon>
          Logout
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default Layout;

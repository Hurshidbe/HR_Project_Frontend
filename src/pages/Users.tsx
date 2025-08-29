import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { User, UserRole, CreateAdminDto } from '../types';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/api';
import { useNavigate } from 'react-router-dom';

interface UserModalProps {
  open: boolean;
  onClose: () => void;
  user?: User | null;
  onSuccess: () => void;
}

const UserModal: React.FC<UserModalProps> = ({ open, onClose, user, onSuccess }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: UserRole.Admin,
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);

  const isEditMode = !!user;

  useEffect(() => {
    if (open && user) {
      setFormData({
        username: user.username,
        password: '',
        role: user.role,
      });
    } else if (open) {
      setFormData({
        username: '',
        password: '',
        role: UserRole.Admin,
      });
    }
    setErrors({});
  }, [open, user]);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 4) {
      newErrors.username = 'Username must be at least 4 characters';
    }

    if (!isEditMode && !formData.password) {
      newErrors.password = 'Password is required';
    } else if (!isEditMode && formData.password.length < 4) {
      newErrors.password = 'Password must be at least 4 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      if (isEditMode && user) {
        // For editing, only update if password is provided
        if (formData.password) {
          await apiService.updateUser(user._id, {
            username: formData.username,
            password: formData.password,
          });
        }
      } else {
        // For creating new user
        const createData: CreateAdminDto = {
          username: formData.username,
          password: formData.password,
          role: formData.role,
        };
        await apiService.createUser(createData);
      }
      
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error saving user:', error);
      // Show error message to user
      const errorMessage = error.message || 'An error occurred while saving the user';
      setErrors({ general: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ color: '#00ffff', borderBottom: '1px solid #333' }}>
        {isEditMode ? 'Edit User' : 'Create New User'}
      </DialogTitle>
      
      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ pt: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {errors.general && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {errors.general}
              </Alert>
            )}
            
            <TextField
              fullWidth
              label="Username *"
              value={formData.username}
              onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
              error={!!errors.username}
              helperText={errors.username}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                  '&:hover fieldset': { borderColor: 'rgba(0, 255, 255, 0.5)' },
                  '&.Mui-focused fieldset': { borderColor: '#00ffff' },
                },
                '& .MuiInputLabel-root': { color: '#b0b0b0' },
                '& .MuiInputBase-input': { color: '#ffffff' },
              }}
            />

            <TextField
              fullWidth
              label={isEditMode ? 'Password (leave empty to keep current)' : 'Password *'}
              type="password"
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              error={!!errors.password}
              helperText={errors.password}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                  '&:hover fieldset': { borderColor: 'rgba(0, 255, 255, 0.5)' },
                  '&.Mui-focused fieldset': { borderColor: '#00ffff' },
                },
                '& .MuiInputLabel-root': { color: '#b0b0b0' },
                '& .MuiInputBase-input': { color: '#ffffff' },
              }}
            />

            {!isEditMode && (
              <FormControl fullWidth>
                <InputLabel sx={{ color: '#b0b0b0' }}>Role *</InputLabel>
                <Select
                  value={formData.role}
                  onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value as UserRole }))}
                  sx={{
                    color: '#ffffff',
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(0, 255, 255, 0.5)' },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#00ffff' },
                  }}
                >
                  <MenuItem value={UserRole.Admin}>Admin</MenuItem>
                  <MenuItem value={UserRole.SuperAdmin}>Super Admin</MenuItem>
                </Select>
              </FormControl>
            )}
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 2, borderTop: '1px solid #333' }}>
          <Button onClick={onClose} sx={{ color: '#b0b0b0' }}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            sx={{
              background: 'linear-gradient(45deg, #00ffff, #0080ff)',
              '&:hover': {
                background: 'linear-gradient(45deg, #00ccff, #0066cc)',
              },
            }}
          >
            {loading ? (
              <CircularProgress size={20} sx={{ color: '#ffffff' }} />
            ) : (
              isEditMode ? 'Update User' : 'Create User'
            )}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

const Users: React.FC = () => {
  const { isSuperAdmin } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });

  // Redirect if not superadmin
  useEffect(() => {
    if (!isSuperAdmin()) {
      alert('Access Denied: You need superadmin privileges to access the Users Management panel.');
      navigate('/admin', { replace: true });
    }
  }, [isSuperAdmin, navigate]);

  useEffect(() => {
    if (isSuperAdmin()) {
      fetchUsers();
    }
  }, [isSuperAdmin]);

  const fetchUsers = async () => {
    try {
      console.log('fetchUsers called, isSuperAdmin():', isSuperAdmin());
      console.log('Current user from localStorage:', JSON.parse(localStorage.getItem('user') || '{}'));
      
      setLoading(true);
      const response = await apiService.getAllUsers();
      console.log('API Response:', response); // Debug log
      
      if (response.success && response.data) {
        // Ensure we have an array, handle different possible response structures
        let usersArray: User[] = [];
        if (Array.isArray(response.data)) {
          usersArray = response.data;
        } else if (response.data.all && Array.isArray(response.data.all)) {
          usersArray = response.data.all;
        } else {
          console.warn('Unexpected API response structure:', response.data);
          usersArray = [];
        }
        
        console.log('Processed users array:', usersArray);
        setUsers(usersArray);
      } else {
        console.error('API response not successful:', response);
        setUsers([]);
        showSnackbar('Failed to fetch users: Invalid response', 'error');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
      showSnackbar('Failed to fetch users: Network error', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = () => {
    setSelectedUser(null);
    setModalOpen(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setModalOpen(true);
  };

  const handleDeleteUser = (user: User) => {
    // Prevent users from deleting themselves
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    if (user._id === currentUser._id) {
      showSnackbar('You cannot delete your own account', 'error');
      return;
    }
    
    setUserToDelete(user);
    setDeleteModalOpen(true);
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      await apiService.deleteUser(userToDelete._id);
      showSnackbar('User deleted successfully', 'success');
      fetchUsers();
    } catch (error: any) {
      console.error('Error deleting user:', error);
      showSnackbar(error.message || 'Failed to delete user', 'error');
    } finally {
      setDeleteModalOpen(false);
      setUserToDelete(null);
    }
  };

  const handleModalSuccess = () => {
    fetchUsers();
    showSnackbar(
      selectedUser ? 'User updated successfully' : 'User created successfully',
      'success'
    );
  };

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case UserRole.SuperAdmin:
        return '#ff00ff';
      case UserRole.Admin:
        return '#00ffff';
      default:
        return '#888888';
    }
  };

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case UserRole.SuperAdmin:
        return 'Super Admin';
      case UserRole.Admin:
        return 'Admin';
      default:
        return 'Unknown';
    }
  };

  if (!isSuperAdmin()) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Typography variant="h6" sx={{ color: '#ff4444' }}>
          Access Denied: Redirecting to Dashboard...
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography
            variant="h3"
            sx={{
              background: 'linear-gradient(45deg, #00ffff, #ff00ff)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 'bold',
              textShadow: '0 0 20px rgba(0, 255, 255, 0.3)',
            }}
          >
            User Management
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateUser}
            sx={{
              background: 'linear-gradient(45deg, #00ffff, #0080ff)',
              '&:hover': {
                background: 'linear-gradient(45deg, #00ccff, #0066cc)',
              },
            }}
          >
            Add User
          </Button>
        </Box>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <Card
          sx={{
            background: 'rgba(26, 26, 26, 0.8)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(0, 255, 255, 0.3)',
            borderRadius: 3,
          }}
        >
          <CardContent sx={{ p: 0 }}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress sx={{ color: '#00ffff' }} />
              </Box>
            ) : (
              <TableContainer component={Paper} sx={{ backgroundColor: 'transparent' }}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: 'rgba(0, 255, 255, 0.1)' }}>
                      <TableCell sx={{ color: '#00ffff', fontWeight: 'bold' }}>Username</TableCell>
                      <TableCell sx={{ color: '#00ffff', fontWeight: 'bold' }}>Role</TableCell>
                      <TableCell sx={{ color: '#00ffff', fontWeight: 'bold' }}>Created</TableCell>
                      <TableCell sx={{ color: '#00ffff', fontWeight: 'bold' }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {Array.isArray(users) && users.length > 0 ? (
                      users.map((user) => {
                        const isCurrentUser = user._id === JSON.parse(localStorage.getItem('user') || '{}')._id;
                        return (
                          <TableRow 
                            key={user._id} 
                            sx={{ 
                              '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.02)' },
                              backgroundColor: isCurrentUser ? 'rgba(0, 255, 255, 0.05)' : 'transparent',
                              borderLeft: isCurrentUser ? '4px solid #00ffff' : 'none',
                            }}
                          >
                            <TableCell sx={{ color: '#ffffff' }}>
                              {user.username}
                              {isCurrentUser && (
                                <Chip 
                                  label="You" 
                                  size="small" 
                                  sx={{ 
                                    ml: 1, 
                                    backgroundColor: '#00ffff', 
                                    color: '#000000',
                                    fontSize: '0.7rem',
                                    height: '20px'
                                  }} 
                                />
                              )}
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={getRoleLabel(user.role)}
                                sx={{
                                  backgroundColor: getRoleColor(user.role),
                                  color: '#000000',
                                  fontWeight: 'bold',
                                }}
                              />
                            </TableCell>
                            <TableCell sx={{ color: '#b0b0b0' }}>
                              {new Date(user.createdAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', gap: 1 }}>
                                <Tooltip title="Edit User">
                                  <IconButton
                                    onClick={() => handleEditUser(user)}
                                    disabled={isCurrentUser}
                                    sx={{ 
                                      color: isCurrentUser ? '#666666' : '#00ffff',
                                      '&:hover': { 
                                        backgroundColor: isCurrentUser ? 'transparent' : 'rgba(0, 255, 255, 0.1)' 
                                      },
                                      '&.Mui-disabled': {
                                        color: '#666666',
                                      }
                                    }}
                                  >
                                    <EditIcon />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Delete User">
                                  <IconButton
                                    onClick={() => handleDeleteUser(user)}
                                    sx={{ color: '#ff4444', '&:hover': { backgroundColor: 'rgba(255, 68, 68, 0.1)' } }}
                                  >
                                    <DeleteIcon />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} sx={{ textAlign: 'center', py: 4 }}>
                          <Typography variant="body1" sx={{ color: '#b0b0b0' }}>
                            {loading ? 'Loading users...' : 'No users found'}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* User Modal */}
      <UserModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        user={selectedUser}
        onSuccess={handleModalSuccess}
      />

      {/* Delete Confirmation Modal */}
      <Dialog open={deleteModalOpen} onClose={() => setDeleteModalOpen(false)}>
        <DialogTitle sx={{ color: '#ff4444' }}>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete user "{userToDelete?.username}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteModalOpen(false)} sx={{ color: '#b0b0b0' }}>
            Cancel
          </Button>
          <Button
            onClick={confirmDeleteUser}
            variant="contained"
            sx={{
              backgroundColor: '#ff4444',
              '&:hover': { backgroundColor: '#cc3333' },
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Users;

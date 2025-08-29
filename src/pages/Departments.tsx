import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  TextField,
  IconButton,
  Chip,
  CircularProgress,
  Alert,
  Snackbar,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { Department } from '../types';
import apiService from '../services/api';
import DepartmentModal from '../components/DepartmentModal';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';

const Departments: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);

  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [departmentToDelete, setDepartmentToDelete] = useState<Department | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{open: boolean, message: string, type: 'success' | 'error'}>({
    open: false,
    message: '',
    type: 'success'
  });

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const response = await apiService.getAllDepartments();
      if (response.success) {
        const deps = response.data.data || [];
        setDepartments(deps);
        
        
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
      showSnackbar('Failed to fetch departments', 'error');
    } finally {
      setLoading(false);
    }
  };



  const handleAddDepartment = () => {
    setSelectedDepartment(null);
    setModalOpen(true);
  };

  const handleEditDepartment = (department: Department) => {
    setSelectedDepartment(department);
    setModalOpen(true);
  };

  const handleDeleteDepartment = (department: Department) => {
    setDepartmentToDelete(department);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!departmentToDelete) return;

    setDeleteLoading(true);
    try {
      // Backend now handles cascading delete automatically
      await apiService.deleteDepartment(departmentToDelete._id);
      
      showSnackbar(`Department "${departmentToDelete.name}" and all associated positions deleted successfully`, 'success');
      fetchDepartments();
      setDeleteModalOpen(false);
    } catch (error: any) {
      showSnackbar(error.message || 'Failed to delete department', 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleModalSuccess = () => {
    showSnackbar(
      selectedDepartment 
        ? 'Department updated successfully' 
        : 'Department created successfully', 
      'success'
    );
    fetchDepartments();
  };

  const showSnackbar = (message: string, type: 'success' | 'error') => {
    setSnackbar({
      open: true,
      message,
      type
    });
  };

  const filteredDepartments = departments.filter((department) =>
    department.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress size={60} sx={{ color: '#00ffff' }} />
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
        <Typography
          variant="h3"
          sx={{
            mb: 4,
            background: 'linear-gradient(45deg, #00ffff, #ff00ff)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 'bold',
            textShadow: '0 0 20px rgba(0, 255, 255, 0.3)',
          }}
        >
          Departments
        </Typography>
      </motion.div>

      {/* Search and Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <Card
          sx={{
            mb: 3,
            background: 'rgba(26, 26, 26, 0.8)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(0, 255, 255, 0.3)',
            borderRadius: 3,
          }}
        >
          <CardContent>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  md: '2fr 1fr 0.8fr',
                },
                gap: 3,
                alignItems: 'center',
              }}
            >
              <TextField
                fullWidth
                label="Search departments"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ color: '#b0b0b0', mr: 1 }} />,
                }}
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
              
              <Button
                fullWidth
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={fetchDepartments}
                sx={{
                  borderColor: '#00ffff',
                  color: '#00ffff',
                  '&:hover': {
                    borderColor: '#00ccff',
                    backgroundColor: 'rgba(0, 255, 255, 0.1)',
                  },
                }}
              >
                Refresh
              </Button>

              <Button
                fullWidth
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAddDepartment}
                sx={{
                  background: 'linear-gradient(45deg, #00ffff, #0080ff)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #00ccff, #0066cc)',
                    boxShadow: '0 0 20px rgba(0, 255, 255, 0.4)',
                  },
                }}
              >
                Add Department
              </Button>
            </Box>
          </CardContent>
        </Card>
      </motion.div>

      {/* Departments Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <Card
          sx={{
            background: 'rgba(26, 26, 26, 0.8)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(0, 255, 255, 0.3)',
            borderRadius: 3,
          }}
        >
          <CardContent>
            {filteredDepartments.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="h6" sx={{ color: '#b0b0b0', mb: 1 }}>
                  {searchTerm ? 'No departments found' : 'No departments yet'}
                </Typography>
                <Typography variant="body2" sx={{ color: '#888888' }}>
                  {searchTerm 
                    ? 'Try adjusting your search terms' 
                    : 'Create your first department to get started'
                  }
                </Typography>
              </Box>
            ) : (
              <TableContainer component={Paper} sx={{ backgroundColor: 'transparent' }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ color: '#00ffff', fontWeight: 600 }}>Name</TableCell>
                      <TableCell sx={{ color: '#00ffff', fontWeight: 600 }}>Created</TableCell>
                      <TableCell sx={{ color: '#00ffff', fontWeight: 600 }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredDepartments.map((department) => (
                      <TableRow
                        key={department._id}
                        sx={{
                          '&:hover': {
                            backgroundColor: 'rgba(0, 255, 255, 0.05)',
                          },
                        }}
                      >
                        <TableCell sx={{ color: '#ffffff' }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                            {department.name}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ color: '#b0b0b0' }}>
                          {new Date(department.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Tooltip title="Edit Department">
                              <IconButton
                                size="small"
                                onClick={() => handleEditDepartment(department)}
                                sx={{
                                  color: '#00ffff',
                                  '&:hover': {
                                    backgroundColor: 'rgba(0, 255, 255, 0.1)',
                                  },
                                }}
                              >
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete Department">
                              <IconButton
                                size="small"
                                onClick={() => handleDeleteDepartment(department)}
                                sx={{
                                  color: '#ff4444',
                                  '&:hover': {
                                    backgroundColor: 'rgba(255, 68, 68, 0.1)',
                                  },
                                }}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Department Modal */}
      <DepartmentModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        department={selectedDepartment}
        onSuccess={handleModalSuccess}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Department"
        message={`Are you sure you want to delete "${departmentToDelete?.name}"? This will also delete all positions associated with this department.`}
        loading={deleteLoading}
      />

      {/* Success/Error Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          severity={snackbar.type}
          sx={{
            backgroundColor: snackbar.type === 'success' ? 'rgba(0, 255, 136, 0.1)' : 'rgba(255, 68, 68, 0.1)',
            color: snackbar.type === 'success' ? '#00ff88' : '#ff4444',
            border: `1px solid ${snackbar.type === 'success' ? '#00ff88' : '#ff4444'}40`,
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Departments;

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  CircularProgress,
  Snackbar,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { motion } from 'framer-motion';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { Position, Department } from '../types';
import { apiService } from '../services/api';
import PositionModal from '../components/PositionModal';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';

interface PositionWithDepartment extends Omit<Position, 'departmentId'> {
  departmentId: string | Department | null;
}

const Positions: React.FC = () => {
  const [positions, setPositions] = useState<PositionWithDepartment[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  const [departmentsLoading, setDepartmentsLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [positionToDelete, setPositionToDelete] = useState<Position | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    type: 'success' | 'error';
  }>({
    open: false,
    message: '',
    type: 'success',
  });

  useEffect(() => {
    fetchPositions();
    fetchDepartments();
  }, []);

  const fetchPositions = async () => {
    setLoading(true);
    try {
      const response = await apiService.getPositionsWithDepartments();
      if (response.success) {
        setPositions(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching positions:', error);
      showSnackbar('Failed to fetch positions', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    setDepartmentsLoading(true);
    try {
      const response = await apiService.getAllDepartments();
      if (response.success) {
        setDepartments(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
      showSnackbar('Failed to fetch departments', 'error');
    } finally {
      setDepartmentsLoading(false);
    }
  };

  const handleAddPosition = () => {
    setSelectedPosition(null);
    setModalOpen(true);
  };

  const handleEditPosition = (position: PositionWithDepartment) => {
    setSelectedPosition({
      _id: position._id,
      title: position.title,
      departmentId: typeof position.departmentId === 'string' 
        ? position.departmentId 
        : (position.departmentId && position.departmentId._id) || '',
      description: position.description,
      requirements: position.requirements,
      createdAt: position.createdAt,
      updatedAt: position.updatedAt,
    });
    setModalOpen(true);
  };

  const handleDeletePosition = (position: PositionWithDepartment) => {
    setPositionToDelete({
      _id: position._id,
      title: position.title,
      departmentId: typeof position.departmentId === 'string' 
        ? position.departmentId 
        : (position.departmentId && position.departmentId._id) || '',
      description: position.description,
      requirements: position.requirements,
      createdAt: position.createdAt,
      updatedAt: position.updatedAt,
    });
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!positionToDelete) return;

    setDeleteLoading(true);
    try {
      await apiService.deletePosition(positionToDelete._id);
      showSnackbar('Position deleted successfully', 'success');
      fetchPositions();
      setDeleteModalOpen(false);
      setPositionToDelete(null);
    } catch (error) {
      console.error('Error deleting position:', error);
      showSnackbar('Failed to delete position', 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleModalSuccess = () => {
    fetchPositions();
    fetchDepartments();
    showSnackbar(
      selectedPosition ? 'Position updated successfully' : 'Position created successfully',
      'success'
    );
  };



  const showSnackbar = (message: string, type: 'success' | 'error') => {
    setSnackbar({
      open: true,
      message,
      type,
    });
  };

  const filteredPositions = positions.filter(position => {
    // Text search filter
    const matchesSearch = position.title.toLowerCase().includes(search.toLowerCase()) ||
      (typeof position.departmentId === 'object' && position.departmentId && position.departmentId.name 
        ? position.departmentId.name.toLowerCase() 
        : '').includes(search.toLowerCase());
    
    // Department filter
    const matchesDepartment = !selectedDepartment || 
      (typeof position.departmentId === 'object' && position.departmentId && position.departmentId._id === selectedDepartment) ||
      (typeof position.departmentId === 'string' && position.departmentId === selectedDepartment);
    
    return matchesSearch && matchesDepartment;
  });

  const getDepartmentName = (position: PositionWithDepartment): string => {
    if (typeof position.departmentId === 'object' && position.departmentId && position.departmentId.name) {
      return position.departmentId.name;
    }
    // Fallback to department ID if details not populated
    return typeof position.departmentId === 'string' ? position.departmentId : 'Unknown Department';
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress size={60} sx={{ color: '#00ffff' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" sx={{ color: '#ffffff', fontWeight: 'bold' }}>
            Position Management
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddPosition}
            sx={{
              background: 'linear-gradient(45deg, #00ffff, #0099cc)',
              color: '#000000',
              fontWeight: 'bold',
              '&:hover': {
                background: 'linear-gradient(45deg, #00cccc, #006699)',
              },
            }}
          >
            Create Position
          </Button>
        </Box>

        {/* Search and Actions */}
        <Card sx={{ background: '#1a1a1a', border: '1px solid #333', mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {/* Filters Row */}
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 2, alignItems: 'center' }}>
                <TextField
                  fullWidth
                  placeholder="Search positions by title or department..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: '#333',
                      },
                      '&:hover fieldset': {
                        borderColor: '#00ffff',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#00ffff',
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: '#b0b0b0',
                    },
                    '& .MuiInputBase-input': {
                      color: '#ffffff',
                      '&::placeholder': {
                        color: '#666',
                        opacity: 1,
                      },
                    },
                  }}
                />
                <FormControl fullWidth>
                  <InputLabel sx={{ color: '#b0b0b0' }}>Filter by Department</InputLabel>
                  <Select
                    value={selectedDepartment}
                    onChange={(e) => setSelectedDepartment(e.target.value)}
                    label="Filter by Department"
                    sx={{
                      color: '#ffffff',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#333',
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#00ffff',
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#00ffff',
                      },
                      '& .MuiSvgIcon-root': {
                        color: '#b0b0b0',
                      },
                    }}
                  >
                    <MenuItem value="">
                      <em>All Departments</em>
                    </MenuItem>
                    {departments.map((dept) => (
                      <MenuItem key={dept._id} value={dept._id}>
                        {dept.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

              </Box>
              
              {/* Actions Row */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>

                  <Chip
                    label={`${filteredPositions.length} position${filteredPositions.length !== 1 ? 's' : ''}`}
                    sx={{
                      background: 'rgba(0, 255, 255, 0.2)',
                      color: '#00ffff',
                      border: '1px solid #00ffff',
                    }}
                  />
                </Box>

              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Positions Table */}
        <Card sx={{ background: '#1a1a1a', border: '1px solid #333' }}>
          <CardContent sx={{ p: 0 }}>
            <TableContainer component={Paper} sx={{ background: 'transparent' }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ background: '#2a2a2a' }}>
                    <TableCell sx={{ color: '#00ffff', fontWeight: 'bold', borderBottom: '2px solid #00ffff' }}>
                      Position Title
                    </TableCell>
                    <TableCell sx={{ color: '#00ffff', fontWeight: 'bold', borderBottom: '2px solid #00ffff' }}>
                      Department
                    </TableCell>
                    <TableCell sx={{ color: '#00ffff', fontWeight: 'bold', borderBottom: '2px solid #00ffff' }}>
                      Created
                    </TableCell>
                    <TableCell sx={{ color: '#00ffff', fontWeight: 'bold', borderBottom: '2px solid #00ffff', textAlign: 'center' }}>
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredPositions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} sx={{ textAlign: 'center', color: '#666', py: 4 }}>
                        {search ? 'No positions found matching your search.' : 'No positions available.'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredPositions.map((position) => (
                      <TableRow
                        key={position._id}
                        sx={{
                          '&:hover': {
                            backgroundColor: 'rgba(0, 255, 255, 0.05)',
                          },
                          borderBottom: '1px solid #333',
                        }}
                      >
                        <TableCell sx={{ color: '#ffffff', fontWeight: '500' }}>
                          {position.title}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={getDepartmentName(position)}
                            size="small"
                            sx={{
                              background: 'rgba(0, 255, 255, 0.2)',
                              color: '#00ffff',
                              border: '1px solid #00ffff',
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ color: '#b0b0b0' }}>
                          {new Date(position.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell sx={{ textAlign: 'center' }}>
                          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                            <IconButton
                              onClick={() => handleEditPosition(position)}
                              sx={{
                                color: '#00ffff',
                                '&:hover': {
                                  backgroundColor: 'rgba(0, 255, 255, 0.1)',
                                },
                              }}
                            >
                              <EditIcon />
                            </IconButton>
                            <IconButton
                              onClick={() => handleDeletePosition(position)}
                              sx={{
                                color: '#ff6b6b',
                                '&:hover': {
                                  backgroundColor: 'rgba(255, 107, 107, 0.1)',
                                },
                              }}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </motion.div>

      {/* Position Modal */}
      <PositionModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        position={selectedPosition}
        onSuccess={handleModalSuccess}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        open={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setPositionToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Position"
        message={`Are you sure you want to delete the position "${positionToDelete?.title}"? This action cannot be undone.`}
        loading={deleteLoading}
      />

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          severity={snackbar.type}
          sx={{
            background: snackbar.type === 'success' ? '#2e7d32' : '#d32f2f',
            color: '#ffffff',
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Positions;

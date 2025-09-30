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
  Chip,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import apiService from '../services/api';
import { Employee, Department, Position, Region, Sex } from '../types';
import EmployeeViewModal from '../components/EmployeeViewModal';
import EditEmployeeModal from '../components/EditEmployeeModal';
import { useTheme } from '../contexts/ThemeContext';

const Employees: React.FC = () => {
  const { mode } = useTheme();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('');
  const [positionFilter, setPositionFilter] = useState<string>('');
  const [regionFilter, setRegionFilter] = useState<string>('');
  const [departments, setDepartments] = useState<Department[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [snackbar, setSnackbar] = useState<{open: boolean, message: string, type: 'success' | 'error'}>({
    open: false,
    message: '',
    type: 'success'
  });
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [employeeToEdit, setEmployeeToEdit] = useState<Employee | null>(null);

  useEffect(() => {
    fetchEmployees();
    fetchDepartmentsAndPositions();
  }, []);

  const fetchEmployees = async () => {
    try {
      console.log('=== FETCH EMPLOYEES DEBUG ===');
      setLoading(true);
      const response = await apiService.getAllEmployees();
      
      console.log('Full API response:', response);
      console.log('Response data:', response.data);
      
      if (response.success) {
        // The backend returns: { success: true, data: { employees: Array } }
        const employeesData = response.data?.employees || [];
        console.log('Employees data:', employeesData);
        console.log('First employee department:', employeesData[0]?.department);
        console.log('First employee position:', employeesData[0]?.position);
        setEmployees(employeesData);
      } else {
        console.error('API returned success: false:', response.errors);
        setSnackbar({
          open: true,
          message: 'Failed to fetch employees',
          type: 'error'
        });
      }
    } catch (error: any) {
      console.error('Error fetching employees:', error);
      setSnackbar({
        open: true,
        message: error.message || 'Failed to fetch employees',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartmentsAndPositions = async () => {
    try {
      const [deptRes, posRes] = await Promise.all([
        apiService.getAllDepartments(),
        apiService.getAllPositions(),
      ]);

      if (deptRes.success) {
        const deptData = deptRes.data.data || [];
        console.log('Departments loaded:', deptData);
        setDepartments(deptData);
      }

      if (posRes.success) {
        setPositions(posRes.data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch departments/positions:', error);
    }
  };

  const filteredEmployees = employees.filter(employee => {
    // Add null checks to prevent errors
    if (!employee || !employee.fullName || !employee.email) {
      return false; // Skip invalid employees
    }
    
    const matchesSearch = employee.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDepartment = !departmentFilter || 
      (employee.department && employee.department._id === departmentFilter);
    
    const matchesPosition = !positionFilter || 
      (employee.position && employee.position._id === positionFilter);
    
    const matchesRegion = !regionFilter || employee.region === regionFilter;
    
    return matchesSearch && matchesDepartment && matchesPosition && matchesRegion;
  });

  const getDepartmentName = (departmentId: string) => {
    const dept = departments.find(d => d._id === departmentId);
    return dept ? dept.name : 'Unknown';
  };

  const getPositionName = (positionId: string) => {
    const pos = positions.find(p => p._id === positionId);
    return pos ? (pos.name || pos.title) : 'Unknown';
  };

  // Get positions filtered by selected department
  const getFilteredPositions = () => {
    if (!departmentFilter) {
      return positions; // Show all positions if no department is selected
    }
    return positions.filter(position => position.departmentId === departmentFilter);
  };

  // Handle department filter change - reset position filter when department changes
  const handleDepartmentFilterChange = (departmentId: string) => {
    setDepartmentFilter(departmentId);
    setPositionFilter(''); // Reset position filter when department changes
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'working':
        return '#00ff88';
      case 'probation':
        return '#ffaa00';
      case 'fired':
        return '#ff4444';
      default:
        return '#00ffff';
    }
  };

  const getSexLabel = (sex: Sex) => {
    return sex === Sex.male ? 'Male' : 'Female';
  };

  const handleViewEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    setViewModalOpen(true);
  };

  const handleCloseViewModal = () => {
    setViewModalOpen(false);
    setSelectedEmployee(null);
  };

  const handleEditEmployee = (employee: Employee) => {
    setEmployeeToEdit(employee);
    setEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setEditModalOpen(false);
    setEmployeeToEdit(null);
  };

  const handleEditSuccess = () => {
    setSnackbar({
      open: true,
      message: 'Employee updated successfully!',
      type: 'success',
    });
    fetchEmployees(); // Refresh the employee list
  };

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
          Employees
        </Typography>
      </motion.div>

      {/* Filters and Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <Card
          sx={{
            background: mode === 'dark' ? 'rgba(26, 26, 26, 0.8)' : 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(10px)',
            border: mode === 'dark' ? '1px solid rgba(0, 255, 255, 0.3)' : '1px solid rgba(25, 118, 210, 0.3)',
            borderRadius: 3,
            mb: 3,
          }}
        >
          <CardContent>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr 1fr 1fr 1fr' }, gap: 2 }}>
              <TextField
                fullWidth
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ color: '#00ffff', mr: 1 }} />,
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: mode === 'dark' ? '#ffffff' : '#000000',
                    '& fieldset': { borderColor: mode === 'dark' ? 'rgba(0, 255, 255, 0.3)' : 'rgba(25, 118, 210, 0.3)' },
                    '&:hover fieldset': { borderColor: mode === 'dark' ? 'rgba(0, 255, 255, 0.5)' : 'rgba(25, 118, 210, 0.5)' },
                    '&.Mui-focused fieldset': { borderColor: mode === 'dark' ? '#00ffff' : '#1976d2' },
                  },
                  '& .MuiInputLabel-root': { color: mode === 'dark' ? '#b0b0b0' : '#666666' },
                  '& .MuiInputBase-input': { color: mode === 'dark' ? '#ffffff' : '#000000' },
                }}
              />
              <FormControl fullWidth>
                <InputLabel sx={{ color: mode === 'dark' ? '#b0b0b0' : '#666666' }}>Department</InputLabel>
                <Select
                  value={departmentFilter}
                  onChange={(e) => handleDepartmentFilterChange(e.target.value)}
                  sx={{
                    color: mode === 'dark' ? '#ffffff' : '#000000',
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: mode === 'dark' ? 'rgba(0, 255, 255, 0.3)' : 'rgba(25, 118, 210, 0.3)' },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: mode === 'dark' ? 'rgba(0, 255, 255, 0.5)' : 'rgba(25, 118, 210, 0.5)' },
                  }}
                >
                  <MenuItem value="">All Departments</MenuItem>
                  {departments.map((dept) => (
                    <MenuItem key={dept._id} value={dept._id}>
                      {dept.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel sx={{ color: mode === 'dark' ? '#b0b0b0' : '#666666' }}>Position</InputLabel>
                <Select
                  value={positionFilter}
                  onChange={(e) => setPositionFilter(e.target.value)}
                  disabled={!departmentFilter} // Disable if no department is selected
                  sx={{
                    color: mode === 'dark' ? '#ffffff' : '#000000',
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: mode === 'dark' ? 'rgba(0, 255, 255, 0.3)' : 'rgba(25, 118, 210, 0.3)' },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: mode === 'dark' ? 'rgba(0, 255, 255, 0.5)' : 'rgba(25, 118, 210, 0.5)' },
                    '&.Mui-disabled': {
                      color: mode === 'dark' ? '#666666' : '#999999',
                      '& .MuiOutlinedInput-notchedOutline': { borderColor: mode === 'dark' ? '#444444' : '#cccccc' },
                    },
                  }}
                >
                  <MenuItem value="">All Positions</MenuItem>
                  {getFilteredPositions().map((pos) => (
                    <MenuItem key={pos._id} value={pos._id}>
                      {pos.title || pos.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel sx={{ color: mode === 'dark' ? '#b0b0b0' : '#666666' }}>Region</InputLabel>
                <Select
                  value={regionFilter}
                  onChange={(e) => setRegionFilter(e.target.value)}
                  sx={{
                    color: mode === 'dark' ? '#ffffff' : '#000000',
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: mode === 'dark' ? 'rgba(0, 255, 255, 0.3)' : 'rgba(25, 118, 210, 0.3)' },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: mode === 'dark' ? 'rgba(0, 255, 255, 0.5)' : 'rgba(25, 118, 210, 0.5)' },
                  }}
                >
                  <MenuItem value="">All Regions</MenuItem>
                  {Object.values(Region).map((region) => (
                    <MenuItem key={region} value={region}>
                      {region}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Button
                fullWidth
                variant="contained"
                onClick={fetchEmployees}
                sx={{
                  background: 'linear-gradient(45deg, #00ffff, #0080ff)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #00ccff, #0066cc)',
                    boxShadow: '0 0 20px rgba(0, 255, 255, 0.4)',
                  },
                }}
              >
                Refresh
              </Button>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => {
                  setSearchTerm('');
                  setDepartmentFilter('');
                  setPositionFilter('');
                  setRegionFilter('');
                }}
                sx={{
                  color: '#00ffff',
                  borderColor: 'rgba(0, 255, 255, 0.3)',
                  '&:hover': {
                    borderColor: '#00ffff',
                    backgroundColor: 'rgba(0, 255, 255, 0.1)',
                  },
                }}
              >
                Clear Filters
              </Button>
            </Box>
          </CardContent>
        </Card>
      </motion.div>

      {/* Employees Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <Card
          sx={{
            background: mode === 'dark' ? 'rgba(26, 26, 26, 0.8)' : 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(10px)',
            border: mode === 'dark' ? '1px solid rgba(0, 255, 255, 0.3)' : '1px solid rgba(25, 118, 210, 0.3)',
            borderRadius: 3,
          }}
        >
          <CardContent>
            {/* Filter Summary */}
            <Box sx={{ mb: 2, p: 2, backgroundColor: 'rgba(0, 255, 255, 0.05)', borderRadius: 2, border: '1px solid rgba(0, 255, 255, 0.1)' }}>
              <Typography variant="body2" sx={{ color: '#00ffff', mb: 1 }}>
                Showing {filteredEmployees.length} of {employees.length} employees
              </Typography>
              {(searchTerm || departmentFilter || positionFilter || regionFilter) && (
                <Typography variant="body2" sx={{ color: '#b0b0b0', fontSize: '0.875rem' }}>
                  Active filters: 
                  {searchTerm && ` Search: "${searchTerm}"`}
                  {departmentFilter && ` Department: ${departments.find(d => d._id === departmentFilter)?.name}`}
                  {positionFilter && ` Position: ${positions.find(p => p._id === positionFilter)?.title || positions.find(p => p._id === positionFilter)?.name}`}
                  {regionFilter && ` Region: ${regionFilter}`}
                </Typography>
              )}
            </Box>
            
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress sx={{ color: '#00ffff' }} />
              </Box>
            ) : filteredEmployees.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="h6" sx={{ color: '#b0b0b0', mb: 2 }}>
                  {employees.length === 0 ? 'No employees found' : 'No employees match your filters'}
                </Typography>
                <Typography variant="body2" sx={{ color: '#666' }}>
                  {employees.length === 0 
                    ? 'Employees will appear here after candidates are accepted'
                    : 'Try adjusting your search criteria'
                  }
                </Typography>
              </Box>
            ) : (
              <TableContainer component={Paper} sx={{ backgroundColor: 'transparent' }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ color: mode === 'dark' ? '#00ffff' : '#1976d2', fontWeight: 600 }}>Name</TableCell>
                      <TableCell sx={{ color: mode === 'dark' ? '#00ffff' : '#1976d2', fontWeight: 600 }}>Email</TableCell>
                      <TableCell sx={{ color: mode === 'dark' ? '#00ffff' : '#1976d2', fontWeight: 600 }}>Department</TableCell>
                      <TableCell sx={{ color: mode === 'dark' ? '#00ffff' : '#1976d2', fontWeight: 600 }}>Position</TableCell>
                      <TableCell sx={{ color: mode === 'dark' ? '#00ffff' : '#1976d2', fontWeight: 600 }}>Salary</TableCell>
                      <TableCell sx={{ color: mode === 'dark' ? '#00ffff' : '#1976d2', fontWeight: 600 }}>Status</TableCell>
                      <TableCell sx={{ color: mode === 'dark' ? '#00ffff' : '#1976d2', fontWeight: 600 }}>Region</TableCell>
                      <TableCell sx={{ color: mode === 'dark' ? '#00ffff' : '#1976d2', fontWeight: 600 }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredEmployees.map((employee, index) => (
                      <TableRow
                        key={employee._id || `employee-${index}`}
                        sx={{
                          '&:hover': {
                            backgroundColor: mode === 'dark' ? 'rgba(0, 255, 255, 0.05)' : 'rgba(25, 118, 210, 0.05)',
                          },
                        }}
                      >
                        <TableCell sx={{ color: mode === 'dark' ? '#ffffff' : '#000000' }}>{employee.fullName || 'Unknown'}</TableCell>
                        <TableCell sx={{ color: mode === 'dark' ? '#b0b0b0' : '#666666' }}>{employee.email || 'Unknown'}</TableCell>
                        <TableCell sx={{ color: mode === 'dark' ? '#b0b0b0' : '#666666' }}>
                          {employee.department ? employee.department.name : 'Unknown'}
                        </TableCell>
                        <TableCell sx={{ color: mode === 'dark' ? '#b0b0b0' : '#666666' }}>
                          {employee.position ? (employee.position.title || employee.position.name) : 'Unknown'}
                        </TableCell>
                        <TableCell sx={{ color: '#00ff88', fontWeight: 600 }}>
                          ${(employee.salary || 0).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={employee.employeeStatus || 'Unknown'}
                            size="small"
                            sx={{
                              backgroundColor: `${getStatusColor(employee.employeeStatus || 'unknown')}20`,
                              color: getStatusColor(employee.employeeStatus || 'unknown'),
                              border: `1px solid ${getStatusColor(employee.employeeStatus || 'unknown')}40`,
                              fontWeight: 600,
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ color: mode === 'dark' ? '#b0b0b0' : '#666666' }}>{employee.region || 'Unknown'}</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                                                         <Tooltip title="View Details">
                               <IconButton
                                 size="small"
                                 onClick={() => handleViewEmployee(employee)}
                                 sx={{
                                   color: mode === 'dark' ? '#00ffff' : '#1976d2',
                                   '&:hover': {
                                     backgroundColor: mode === 'dark' ? 'rgba(0, 255, 255, 0.1)' : 'rgba(25, 118, 210, 0.1)',
                                   },
                                 }}
                               >
                                 <ViewIcon />
                               </IconButton>
                             </Tooltip>
                            <Tooltip title="Edit Employee">
                              <IconButton
                                size="small"
                                onClick={() => handleEditEmployee(employee)}
                                sx={{
                                  color: '#ffaa00',
                                  '&:hover': {
                                    backgroundColor: 'rgba(255, 170, 0, 0.1)',
                                  },
                                }}
                              >
                                <EditIcon />
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

       {/* Employee View Modal */}
       <EmployeeViewModal
         open={viewModalOpen}
         onClose={handleCloseViewModal}
         employee={selectedEmployee}
       />

       {/* Edit Employee Modal */}
       <EditEmployeeModal
         open={editModalOpen}
         onClose={handleCloseEditModal}
         employee={employeeToEdit}
         onSuccess={handleEditSuccess}
       />
     </Box>
   );
 };

export default Employees;

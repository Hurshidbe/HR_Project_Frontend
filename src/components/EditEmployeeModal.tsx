import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormLabel,
} from '@mui/material';
import { motion } from 'framer-motion';
import { Employee, EmployeeStatusEnum } from '../types';
import apiService from '../services/api';

interface EditEmployeeModalProps {
  open: boolean;
  onClose: () => void;
  employee: Employee | null;
  onSuccess: () => void;
}

interface FormData {
  salary: string | number;
  position: string;
  department: string;
  status: string;
}

interface FormErrors {
  salary?: string;
  position?: string;
  department?: string;
  status?: string;
}

const EditEmployeeModal: React.FC<EditEmployeeModalProps> = ({
  open,
  onClose,
  employee,
  onSuccess,
}) => {
  const [formData, setFormData] = useState<FormData>({
    salary: '',
    position: '',
    department: '',
    status: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string>('');
  const [departments, setDepartments] = useState<any[]>([]);
  const [positions, setPositions] = useState<any[]>([]);
  const [allPositions, setAllPositions] = useState<any[]>([]); // Store all positions for filtering
  const [loadingData, setLoadingData] = useState(false);

  useEffect(() => {
    if (open && employee) {
      setFormData({
        salary: employee.salary || 0,
        position: employee.position?._id || '',
        department: employee.department?._id || '',
        status: employee.employeeStatus || EmployeeStatusEnum.working,
      });
    }
    setErrors({});
    setSubmitError('');
  }, [open, employee]);

  useEffect(() => {
    if (open) {
      fetchDepartmentsAndPositions();
    }
  }, [open]);

  // Filter positions when department changes
  useEffect(() => {
    if (formData.department && allPositions.length > 0) {
      const filteredPositions = allPositions.filter(
        pos => pos.departmentId === formData.department
      );
      setPositions(filteredPositions);
      
      // If current position doesn't belong to selected department, reset position
      if (formData.position && !filteredPositions.find(pos => pos._id === formData.position)) {
        setFormData(prev => ({ ...prev, position: '' }));
      }
    } else {
      setPositions([]);
      setFormData(prev => ({ ...prev, position: '' }));
    }
  }, [formData.department, allPositions]);

  const fetchDepartmentsAndPositions = async () => {
    setLoadingData(true);
    try {
      const [deptRes, posRes] = await Promise.all([
        apiService.getAllDepartments(),
        apiService.getAllPositions(),
      ]);

      if (deptRes.success) {
        setDepartments(deptRes.data.data || []);
      }
      if (posRes.success) {
        const positionsData = posRes.data.data || [];
        setAllPositions(positionsData); // Store all positions
        // Initially filter positions based on current department
        if (formData.department) {
          const filteredPositions = positionsData.filter(
            pos => pos.departmentId === formData.department
          );
          setPositions(filteredPositions);
        } else {
          setPositions(positionsData);
        }
      }
    } catch (error) {
      console.error('Error fetching departments and positions:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // For fired employees, salary can be 0
    if (formData.status === 'fired') {
      // Salary will be automatically set to 0, so no validation needed
    } else if (!formData.salary || Number(formData.salary) <= 0) {
      newErrors.salary = 'Salary must be a positive number';
    }

    if (!formData.position) {
      newErrors.position = 'Position is required';
    }

    if (!formData.department) {
      newErrors.department = 'Department is required';
    }

    if (!formData.status) {
      newErrors.status = 'Status is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !employee) return;

    setLoading(true);
    setSubmitError('');

    try {
      console.log('=== EDIT EMPLOYEE MODAL DEBUG ===');
      console.log('Current employee data:', employee);
      console.log('Form data to submit:', formData);
      console.log('Employee ID:', employee._id);
      console.log('Current status:', employee.employeeStatus);
      console.log('New status:', formData.status);
      console.log('Status changed?', formData.status !== employee.employeeStatus);
      
      // Update salary if changed
      if (Number(formData.salary) !== employee.salary) {
        console.log('Updating salary from', employee.salary, 'to', formData.salary);
        await apiService.updateEmployeeSalary(employee._id, Number(formData.salary));
        console.log('Salary updated successfully');
      }

      // Update position if changed
      if (formData.position !== employee.position?._id) {
        console.log('Updating position from', employee.position?._id, 'to', formData.position);
        const newPosition = positions.find(p => p._id === formData.position);
        if (newPosition) {
          console.log('Found new position object:', newPosition);
          try {
            const result = await apiService.updateEmployeePosition(employee._id, newPosition);
            console.log('Position update result:', result);
            if (result.success) {
              console.log('Position updated successfully');
            } else {
              console.error('Position update failed:', result.errors);
            }
          } catch (error) {
            console.error('Position update error:', error);
            throw error;
          }
        } else {
          console.error('New position not found in positions array');
          throw new Error('Selected position not found');
        }
      }

      // Update department if changed
      if (formData.department !== employee.department?._id) {
        console.log('Updating department from', employee.department?._id, 'to', formData.department);
        try {
          const result = await apiService.updateEmployeeDepartment(employee._id, formData.department);
          console.log('Department update result:', result);
          if (result.success) {
            console.log('Department updated successfully');
          } else {
            console.error('Department update failed:', result.errors);
          }
        } catch (error) {
          console.error('Department update error:', error);
          throw error;
        }
      }

      // Update status if changed
      if (formData.status !== employee.employeeStatus) {
        console.log('Updating status from', employee.employeeStatus, 'to', formData.status);
        console.log('Calling updateEmployeeStatus with:', { id: employee._id, status: formData.status });
        
        const statusResult = await apiService.updateEmployeeStatus(employee._id, formData.status);
        console.log('Status update result:', statusResult);
        
        if (statusResult.success) {
          console.log('Status updated successfully');
          
          // If status is changed to "fired", automatically set salary to 0
          if (formData.status === 'fired' && Number(formData.salary) !== 0) {
            console.log('Employee fired - automatically setting salary to 0');
            await apiService.updateEmployeeSalary(employee._id, 0);
            console.log('Salary automatically set to 0 for fired employee');
          }
        } else {
          console.error('Status update failed:', statusResult.errors);
        }
      }

      console.log('All updates completed successfully');
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error in handleSubmit:', error);
      setSubmitError(error.message || 'Failed to update employee');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  if (!employee) return null;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: '#1a1a1a',
          border: '1px solid rgba(255, 170, 0, 0.3)',
          borderRadius: 3,
        },
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <DialogTitle sx={{ color: '#ffaa00', borderBottom: '1px solid #333' }}>
          Edit Employee: {employee.fullName}
        </DialogTitle>
      </motion.div>

      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ pt: 2 }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            {/* Employee Info */}
            <Box sx={{ mb: 3, p: 2, backgroundColor: 'rgba(255, 170, 0, 0.05)', borderRadius: 2 }}>
              <Typography variant="h6" sx={{ color: '#ffaa00', mb: 2 }}>
                Employee Information
              </Typography>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                  gap: 2,
                }}
              >
                <Box>
                  <Typography variant="body2" sx={{ color: '#b0b0b0' }}>
                    <strong>Name:</strong> {employee.fullName}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ color: '#b0b0b0' }}>
                    <strong>Email:</strong> {employee.email}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ color: '#b0b0b0' }}>
                    <strong>Department:</strong> {employee.department?.name || 'Unknown'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ color: '#b0b0b0' }}>
                    <strong>Position:</strong> {employee.position?.title || employee.position?.name || 'Unknown'}
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Form Fields */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Typography variant="h6" sx={{ color: '#ffaa00', mb: 1 }}>
                Edit Employee Details
              </Typography>
              <TextField
                fullWidth
                label="Salary *"
                type="number"
                value={formData.status === 'fired' ? 0 : formData.salary}
                onChange={(e) => setFormData(prev => ({ ...prev, salary: e.target.value }))}
                error={!!errors.salary}
                helperText={
                  formData.status === 'fired' 
                    ? 'Salary automatically set to 0 for fired employees'
                    : errors.salary
                }
                inputProps={{ min: 0 }}
                disabled={formData.status === 'fired'}
                InputProps={{
                  startAdornment: <Typography sx={{ color: '#b0b0b0', mr: 1 }}>$</Typography>,
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                    '&:hover fieldset': { borderColor: 'rgba(255, 170, 0, 0.5)' },
                    '&.Mui-focused fieldset': { borderColor: '#ffaa00' },
                    '&.Mui-disabled': {
                      backgroundColor: 'rgba(255, 68, 68, 0.1)',
                      color: 'rgba(255, 255, 255, 0.5)',
                    },
                  },
                  '& .MuiInputLabel-root': { color: '#b0b0b0' },
                  '& .MuiInputBase-input': { color: '#ffffff' },
                }}
              />

              <FormControl fullWidth error={!!errors.department}>
                <InputLabel sx={{ color: '#b0b0b0' }}>Department *</InputLabel>
                <Select
                  value={formData.department}
                  onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                  disabled={loadingData}
                  sx={{
                    color: '#ffffff',
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 170, 0, 0.5)' },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#ffaa00' },
                  }}
                >
                  {departments.map((dept) => (
                    <MenuItem key={dept._id} value={dept._id}>
                      {dept.name}
                    </MenuItem>
                  ))}
                </Select>
                {errors.department && (
                  <Typography variant="caption" sx={{ color: '#ff4444', mt: 0.5 }}>
                    {errors.department}
                  </Typography>
                )}
              </FormControl>

              <FormControl fullWidth error={!!errors.position}>
                <InputLabel sx={{ color: '#b0b0b0' }}>Position *</InputLabel>
                <Select
                  value={formData.position}
                  onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
                  disabled={loadingData || !formData.department}
                  sx={{
                    color: '#ffffff',
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 170, 0, 0.5)' },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#ffaa00' },
                  }}
                >
                  {positions.length === 0 ? (
                    <MenuItem disabled>
                      {formData.department ? 'No positions available for this department' : 'Please select a department first'}
                    </MenuItem>
                  ) : (
                    positions.map((pos) => (
                      <MenuItem key={pos._id} value={pos._id}>
                        {pos.title}
                      </MenuItem>
                    ))
                  )}
                </Select>
                {errors.position && (
                  <Typography variant="caption" sx={{ color: '#ff4444', mt: 0.5 }}>
                    {errors.position}
                  </Typography>
                )}
                {!formData.department && (
                  <Typography variant="caption" sx={{ color: '#ffaa00', mt: 0.5 }}>
                    Please select a department first to see available positions
                  </Typography>
                )}
              </FormControl>

              {/* Employee Status - Radio Buttons */}
              <FormControl component="fieldset" error={!!errors.status}>
                <FormLabel component="legend" sx={{ color: '#b0b0b0', mb: 1 }}>
                  Employee Status *
                </FormLabel>
                <RadioGroup
                  row
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                  sx={{
                    '& .MuiFormControlLabel-root': {
                      marginRight: 3,
                    },
                    '& .MuiRadio-root': {
                      color: '#b0b0b0',
                      '&.Mui-checked': {
                        color: '#ffaa00',
                      },
                    },
                    '& .MuiFormControlLabel-label': {
                      color: '#ffffff',
                      fontSize: '0.875rem',
                    },
                  }}
                >
                  <FormControlLabel
                    value="probation"
                    control={<Radio />}
                    label="Probation"
                    sx={{
                      '& .MuiFormControlLabel-label': {
                        color: formData.status === 'probation' ? '#ff9800' : '#ffffff',
                        fontWeight: formData.status === 'probation' ? 'bold' : 'normal',
                      },
                    }}
                  />
                  <FormControlLabel
                    value="working"
                    control={<Radio />}
                    label="Working"
                    sx={{
                      '& .MuiFormControlLabel-label': {
                        color: formData.status === 'working' ? '#4caf50' : '#ffffff',
                        fontWeight: formData.status === 'working' ? 'bold' : 'normal',
                      },
                    }}
                  />
                  <FormControlLabel
                    value="fired"
                    control={<Radio />}
                    label="Fired"
                    sx={{
                      '& .MuiFormControlLabel-label': {
                        color: formData.status === 'fired' ? '#f44336' : '#ffffff',
                        fontWeight: formData.status === 'fired' ? 'bold' : 'normal',
                      },
                    }}
                  />
                </RadioGroup>
                {errors.status && (
                  <Typography variant="caption" sx={{ color: '#ff4444', mt: 0.5 }}>
                    {errors.status}
                  </Typography>
                )}
                
                {/* Warning message for fired status */}
                {formData.status === 'fired' && (
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: '#ffaa00', 
                      mt: 0.5, 
                      display: 'block',
                      fontStyle: 'italic'
                    }}
                  >
                    ⚠️ Warning: Setting status to "fired" will automatically set salary to 0
                  </Typography>
                )}
              </FormControl>

              {submitError && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <Alert severity="error" sx={{ backgroundColor: 'rgba(255, 68, 68, 0.1)' }}>
                    {submitError}
                  </Alert>
                </motion.div>
              )}
            </Box>
          </motion.div>
        </DialogContent>

        <DialogActions sx={{ p: 2, borderTop: '1px solid #333' }}>
          <Button
            onClick={handleClose}
            disabled={loading}
            sx={{ color: '#b0b0b0' }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            sx={{
              background: 'linear-gradient(45deg, #ffaa00, #ff8800)',
              '&:hover': {
                background: 'linear-gradient(45deg, #ff8800, #ff6600)',
              },
              '&:disabled': {
                background: 'rgba(255, 255, 255, 0.1)',
                color: 'rgba(255, 255, 255, 0.3)',
              },
            }}
          >
            {loading ? (
              <CircularProgress size={20} sx={{ color: '#ffffff' }} />
            ) : (
              'Update Employee'
            )}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default EditEmployeeModal;

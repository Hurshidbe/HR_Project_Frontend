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
} from '@mui/material';
import { motion } from 'framer-motion';
import { Candidate, Department, Position, EmployeeStatusEnum } from '../types';
import apiService from '../services/api';
import { useAuth } from '../contexts/AuthContext';

interface AcceptCandidateModalProps {
  open: boolean;
  onClose: () => void;
  candidate: Candidate | null;
  onSuccess: () => void;
}

interface FormData {
  department: string;
  position: string;
  salary: string | number;
  employeeStatus: EmployeeStatusEnum;
}

interface FormErrors {
  department?: string;
  position?: string;
  salary?: string;
  employeeStatus?: string;
}

const AcceptCandidateModal: React.FC<AcceptCandidateModalProps> = ({
  open,
  onClose,
  candidate,
  onSuccess,
}) => {
  const { isAuthenticated, token } = useAuth();
  
  console.log('AcceptCandidateModal - Auth status:', { isAuthenticated, hasToken: !!token });
  const [formData, setFormData] = useState<FormData>({
    department: '',
    position: '',
    salary: '',
    employeeStatus: EmployeeStatusEnum.working,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string>('');
  const [departments, setDepartments] = useState<Department[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [filteredPositions, setFilteredPositions] = useState<Position[]>([]);

  useEffect(() => {
    if (open) {
      console.log('AcceptCandidateModal opened - checking auth status');
      console.log('isAuthenticated:', isAuthenticated);
      console.log('token exists:', !!token);
      console.log('localStorage token:', localStorage.getItem('token'));
      
      // Check both AuthContext token and localStorage token
      const localStorageToken = localStorage.getItem('token');
      const hasValidToken = token && localStorageToken && token === localStorageToken;
      
      console.log('Token validation:', { 
        authContextToken: !!token, 
        localStorageToken: !!localStorageToken, 
        tokensMatch: token === localStorageToken,
        hasValidToken 
      });
      
      if (!isAuthenticated || !hasValidToken) {
        console.error('User not authenticated when opening AcceptCandidateModal');
        setSubmitError('You must be logged in to accept candidates. Please log in again.');
        return;
      }
      
      fetchDepartmentsAndPositions();
    }
  }, [open, isAuthenticated, token]);

  useEffect(() => {
    if (formData.department) {
      const filtered = positions.filter(pos => pos.departmentId === formData.department);
      setFilteredPositions(filtered);
      if (!filtered.find(pos => pos._id === formData.position)) {
        setFormData(prev => ({ ...prev, position: '' }));
      }
    } else {
      setFilteredPositions([]);
      setFormData(prev => ({ ...prev, position: '' }));
    }
  }, [formData.department, positions]);

  const fetchDepartmentsAndPositions = async () => {
    try {
      const [deptRes, posRes] = await Promise.all([
        apiService.getAllDepartments(),
        apiService.getAllPositions(),
      ]);

      if (deptRes.success) {
        setDepartments(deptRes.data.data || []);
      }

      if (posRes.success) {
        setPositions(posRes.data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch departments/positions:', error);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.department) {
      newErrors.department = 'Department is required';
    }

    if (!formData.position) {
      newErrors.position = 'Position is required';
    }

    // Salary is optional, but if provided must be positive
    if (formData.salary && Number(formData.salary) <= 0) {
      newErrors.salary = 'Salary must be a positive number';
    }

    if (!formData.employeeStatus) {
      newErrors.employeeStatus = 'Employee status is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!validateForm() || !candidate) return;
    
    // Double-check authentication before submission
    const localStorageToken = localStorage.getItem('token');
    const hasValidToken = token && localStorageToken && token === localStorageToken;
    
    if (!isAuthenticated || !hasValidToken) {
      setSubmitError('You must be logged in to accept candidates. Please log in again.');
      return;
    }
    
    console.log('Submitting with token validation:', {
      isAuthenticated,
      hasValidToken,
      tokenLength: token?.length,
      localStorageTokenLength: localStorageToken?.length
    });

    setLoading(true);
    setSubmitError('');

              try {

      
      // Find the full department and position objects
      const selectedDepartment = departments.find(dept => dept._id === formData.department);
      const selectedPosition = positions.find(pos => pos._id === formData.position);
      
      if (!selectedDepartment || !selectedPosition) {
        setSubmitError('Selected department or position not found');
        setLoading(false);
        return;
      }
      
      // Ensure API service has the current token
      const currentToken = localStorage.getItem('token');
      if (currentToken) {
        apiService.setAuthToken(currentToken);
        console.log('Updated API service token before acceptCandidate call');
      }
      
      const response = await apiService.acceptCandidate(candidate._id, {
        department: selectedDepartment,
        position: selectedPosition,
        salary: formData.salary ? Number(formData.salary) : 0, // Default to 0 if not provided
        employeeStatus: formData.employeeStatus,
      });
      
      if (response.success) {
        onSuccess();
        onClose();
        resetForm();
      } else {
        setSubmitError(response.errors?.[0] || 'Failed to accept candidate');
      }
    } catch (error: any) {
      setSubmitError(error.message || 'An error occurred while accepting the candidate');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      department: '',
      position: '',
      salary: '',
      employeeStatus: EmployeeStatusEnum.working,
    });
    setErrors({});
    setSubmitError('');
  };

  const handleClose = () => {
    if (!loading) {
      resetForm();
      onClose();
    }
  };

  if (!candidate) return null;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: '#1a1a1a',
          border: '1px solid rgba(0, 255, 255, 0.3)',
          borderRadius: 3,
        },
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <DialogTitle sx={{ color: '#00ffff', borderBottom: '1px solid #333' }}>
          Accept Candidate: {candidate.fullName}
        </DialogTitle>
      </motion.div>

      <form onSubmit={handleSubmit} action="#" method="post">
        <DialogContent sx={{ pt: 2 }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            {/* Candidate Info */}
            <Box sx={{ mb: 3, p: 2, backgroundColor: 'rgba(0, 255, 255, 0.05)', borderRadius: 2 }}>
              <Typography variant="h6" sx={{ color: '#00ffff', mb: 2 }}>
                Candidate Information
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
                    <strong>Name:</strong> {candidate.fullName}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ color: '#b0b0b0' }}>
                    <strong>Email:</strong> {candidate.email}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ color: '#b0b0b0' }}>
                    <strong>Region:</strong> {candidate.region}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ color: '#b0b0b0' }}>
                    <strong>Current Position:</strong> {candidate.jobRequirement?.position || 'N/A'}
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Form Fields */}
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                gap: 3,
              }}
            >
              <Box>
                <FormControl fullWidth error={!!errors.department}>
                  <InputLabel sx={{ color: '#b0b0b0' }}>Department *</InputLabel>
                  <Select
                    value={formData.department}
                    onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                    sx={{
                      color: '#ffffff',
                      '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                      '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(0, 255, 255, 0.5)' },
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
              </Box>

              <Box>
                <FormControl fullWidth error={!!errors.position}>
                  <InputLabel sx={{ color: '#b0b0b0' }}>Position *</InputLabel>
                  <Select
                    value={formData.position}
                    onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
                    disabled={!formData.department}
                    sx={{
                      color: '#ffffff',
                      '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                      '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(0, 255, 255, 0.5)' },
                    }}
                  >
                    {filteredPositions.map((pos) => (
                      <MenuItem key={pos._id} value={pos._id}>
                        {pos.title}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.position && (
                    <Typography variant="caption" sx={{ color: '#ff4444', mt: 0.5 }}>
                      {errors.position}
                    </Typography>
                  )}
                </FormControl>
              </Box>

              <Box>
                                                 <TextField
                  fullWidth
                  label="Salary (optional)"
                  type="number"
                  value={formData.salary}
                  onChange={(e) => setFormData(prev => ({ ...prev, salary: e.target.value }))}
                  error={!!errors.salary}
                  helperText={errors.salary || "Leave empty to set default salary of 0"}
                  inputProps={{ min: 0 }}
                  InputProps={{
                    startAdornment: <Typography sx={{ color: '#b0b0b0', mr: 1 }}>$</Typography>,
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
              </Box>

              <Box>
                <FormControl fullWidth error={!!errors.employeeStatus}>
                  <InputLabel sx={{ color: '#b0b0b0' }}>Work Status *</InputLabel>
                  <Select
                    value={formData.employeeStatus}
                    onChange={(e) => setFormData(prev => ({ ...prev, employeeStatus: e.target.value as EmployeeStatusEnum }))}
                    sx={{
                      color: '#ffffff',
                      '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                      '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(0, 255, 255, 0.5)' },
                    }}
                  >
                    {Object.values(EmployeeStatusEnum)
                      .filter(status => status !== 'fired')
                      .map((status) => (
                        <MenuItem key={status} value={status}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </MenuItem>
                      ))}
                  </Select>
                  {errors.employeeStatus && (
                    <Typography variant="caption" sx={{ color: '#ff4444', mt: 0.5 }}>
                      {errors.employeeStatus}
                    </Typography>
                  )}
                </FormControl>
              </Box>
            </Box>

            {submitError && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <Alert severity="error" sx={{ mt: 2, backgroundColor: 'rgba(255, 68, 68, 0.1)' }}>
                  {submitError}
                </Alert>
              </motion.div>
            )}
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
              background: 'linear-gradient(45deg, #00ff88, #00cc66)',
              '&:hover': {
                background: 'linear-gradient(45deg, #00cc66, #00994d)',
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
              'Accept Candidate'
            )}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AcceptCandidateModal;

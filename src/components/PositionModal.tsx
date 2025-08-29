import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  CircularProgress,
} from '@mui/material';
import { motion } from 'framer-motion';
import { Position, Department, CreatePositionDto } from '../types';
import { apiService } from '../services/api';

interface PositionModalProps {
  open: boolean;
  onClose: () => void;
  position?: Position | null;
  onSuccess: () => void;
}

interface FormData {
  title: string;
  departmentId: string;
}

interface FormErrors {
  title?: string;
  departmentId?: string;
}

const PositionModal: React.FC<PositionModalProps> = ({
  open,
  onClose,
  position,
  onSuccess,
}) => {
  const [formData, setFormData] = useState<FormData>({
    title: '',
    departmentId: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [departmentsLoading, setDepartmentsLoading] = useState(false);

  const isEditMode = !!position;

  useEffect(() => {
    if (open) {
      fetchDepartments();
              if (position) {
          setFormData({
            title: position.title,
            departmentId: position.departmentId,
          });
        } else {
        setFormData({
          title: '',
          departmentId: '',
        });
      }
      setErrors({});
    }
  }, [open, position]);

  const fetchDepartments = async () => {
    setDepartmentsLoading(true);
    try {
      const response = await apiService.getAllDepartments();
      if (response.success) {
        setDepartments(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
    } finally {
      setDepartmentsLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Position title is required';
    }

    if (!formData.departmentId) {
      newErrors.departmentId = 'Department is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const payload: CreatePositionDto = {
        title: formData.title.trim(),
        departmentId: formData.departmentId,
      };

      if (isEditMode && position) {
        await apiService.updatePosition(position._id, payload);
      } else {
        await apiService.createPosition(payload);
      }

      onSuccess();
      handleClose();
    } catch (error: any) {
      console.error('Error saving position:', error);
      // You could show a more specific error message here
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      title: '',
      departmentId: '',
    });
    setErrors({});
    setLoading(false);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          background: '#1a1a1a',
          color: '#ffffff',
          borderRadius: 2,
        },
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <DialogTitle sx={{ 
          borderBottom: '1px solid #333',
          pb: 2,
          textAlign: 'center',
          fontSize: '1.5rem',
          fontWeight: 'bold',
          color: '#00ffff'
        }}>
          {isEditMode ? 'Edit Position' : 'Create New Position'}
        </DialogTitle>

        <form onSubmit={handleSubmit}>
          <DialogContent sx={{ pt: 3 }}>
            <Box sx={{ display: 'grid', gap: 3 }}>
              {/* Position Title */}
              <TextField
                fullWidth
                label="Position Title *"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                error={!!errors.title}
                helperText={errors.title}
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
                    '&.Mui-focused': {
                      color: '#00ffff',
                    },
                  },
                  '& .MuiInputBase-input': {
                    color: '#ffffff',
                  },
                  '& .MuiFormHelperText-root': {
                    color: '#ff6b6b',
                  },
                }}
              />

              {/* Department Selection */}
              <FormControl fullWidth error={!!errors.departmentId}>
                <InputLabel sx={{ color: '#b0b0b0' }}>Department *</InputLabel>
                <Select
                  value={formData.departmentId}
                  onChange={(e) => setFormData(prev => ({ ...prev, departmentId: e.target.value }))}
                  label="Department *"
                  disabled={departmentsLoading}
                  sx={{
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#333',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#00ffff',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#00ffff',
                    },
                    '& .MuiSelect-icon': {
                      color: '#b0b0b0',
                    },
                    '& .MuiSelect-select': {
                      color: '#ffffff',
                    },
                  }}
                >
                  {departmentsLoading ? (
                    <MenuItem disabled>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CircularProgress size={16} sx={{ color: '#00ffff' }} />
                        Loading departments...
                      </Box>
                    </MenuItem>
                  ) : (
                    departments.map((dept) => (
                      <MenuItem key={dept._id} value={dept._id}>
                        {dept.name}
                      </MenuItem>
                    ))
                  )}
                </Select>
                {errors.departmentId && (
                  <Typography variant="caption" sx={{ color: '#ff6b6b', mt: 0.5, display: 'block' }}>
                    {errors.departmentId}
                  </Typography>
                )}
              </FormControl>
            </Box>
          </DialogContent>

          <DialogActions sx={{ 
            p: 3, 
            pt: 1,
            borderTop: '1px solid #333',
            gap: 2
          }}>
            <Button
              onClick={handleClose}
              disabled={loading}
              sx={{
                color: '#b0b0b0',
                borderColor: '#333',
                '&:hover': {
                  borderColor: '#666',
                  color: '#ffffff',
                },
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              sx={{
                background: 'linear-gradient(45deg, #00ffff, #0099cc)',
                color: '#000000',
                fontWeight: 'bold',
                '&:hover': {
                  background: 'linear-gradient(45deg, #00cccc, #006699)',
                },
                '&:disabled': {
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: 'rgba(255, 255, 255, 0.3)',
                },
              }}
            >
              {loading ? (
                <CircularProgress size={20} sx={{ color: '#000000' }} />
              ) : (
                isEditMode ? 'Update Position' : 'Create Position'
              )}
            </Button>
          </DialogActions>
        </form>
      </motion.div>
    </Dialog>
  );
};

export default PositionModal;

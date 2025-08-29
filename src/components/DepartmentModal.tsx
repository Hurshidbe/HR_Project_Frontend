import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
} from '@mui/material';
import { motion } from 'framer-motion';
import { Department, CreateDepartmentDto } from '../types';
import apiService from '../services/api';

interface DepartmentModalProps {
  open: boolean;
  onClose: () => void;
  department?: Department | null;
  onSuccess: () => void;
}

interface FormData {
  name: string;
}

interface FormErrors {
  name?: string;
}

const DepartmentModal: React.FC<DepartmentModalProps> = ({
  open,
  onClose,
  department,
  onSuccess,
}) => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string>('');

  const isEditMode = !!department;

  useEffect(() => {
    if (open && department) {
      setFormData({
        name: department.name,
      });
    } else if (open) {
      setFormData({
        name: '',
      });
    }
    setErrors({});
    setSubmitError('');
  }, [open, department]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Department name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setSubmitError('');

    try {
      const data: CreateDepartmentDto = {
        name: formData.name.trim(),
      };

      if (isEditMode && department) {
        await apiService.updateDepartment(department._id, data);
      } else {
        await apiService.createDepartment(data);
      }
      
      onSuccess();
      onClose();
    } catch (error: any) {
      setSubmitError(error.message || 'An error occurred while saving the department');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
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
          {isEditMode ? 'Edit Department' : 'Add New Department'}
        </DialogTitle>
      </motion.div>

      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ pt: 2 }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <TextField
                fullWidth
                label="Department Name *"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                error={!!errors.name}
                helperText={errors.name}
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
              background: 'linear-gradient(45deg, #00ffff, #0080ff)',
              '&:hover': {
                background: 'linear-gradient(45deg, #00ccff, #0066cc)',
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
              isEditMode ? 'Update Department' : 'Create Department'
            )}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default DepartmentModal;

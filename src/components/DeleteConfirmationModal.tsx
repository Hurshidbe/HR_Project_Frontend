import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  CircularProgress,
} from '@mui/material';
import { motion } from 'framer-motion';
import { Delete as DeleteIcon, Warning as WarningIcon } from '@mui/icons-material';

interface DeleteConfirmationModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  loading?: boolean;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  open,
  onClose,
  onConfirm,
  title,
  message,
  loading = false,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: '#1a1a1a',
          border: '1px solid rgba(255, 68, 68, 0.3)',
          borderRadius: 3,
        },
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <DialogTitle sx={{ color: '#ff4444', borderBottom: '1px solid #333' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <WarningIcon sx={{ color: '#ff4444' }} />
            {title}
          </Box>
        </DialogTitle>
      </motion.div>

      <DialogContent sx={{ pt: 2 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Box sx={{ textAlign: 'center', py: 2 }}>
            <DeleteIcon sx={{ fontSize: 60, color: '#ff4444', mb: 2, opacity: 0.7 }} />
            <Typography variant="body1" sx={{ color: '#b0b0b0', mb: 2 }}>
              {message}
            </Typography>
            <Typography variant="body2" sx={{ color: '#888888', fontStyle: 'italic' }}>
              This action cannot be undone.
            </Typography>
          </Box>
        </motion.div>
      </DialogContent>

      <DialogActions sx={{ p: 2, borderTop: '1px solid #333' }}>
        <Button
          onClick={onClose}
          disabled={loading}
          sx={{ color: '#b0b0b0' }}
        >
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} sx={{ color: '#ffffff' }} /> : <DeleteIcon />}
          sx={{
            background: 'linear-gradient(45deg, #ff4444, #cc3333)',
            '&:hover': {
              background: 'linear-gradient(45deg, #cc3333, #aa2222)',
            },
            '&:disabled': {
              background: 'rgba(255, 68, 68, 0.3)',
              color: 'rgba(255, 255, 255, 0.5)',
            },
          }}
        >
          {loading ? 'Deleting...' : 'Delete'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteConfirmationModal;

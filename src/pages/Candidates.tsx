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
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Snackbar,
  Tooltip,
  IconButton,
  DialogContentText
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import apiService from '../services/api';
import { Candidate, CandidateStatuses, Sex, Region } from '../types';
import AcceptCandidateModal from '../components/AcceptCandidateModal';
import ViewCandidateModal from '../components/ViewCandidateModal';
import { useTheme } from '../contexts/ThemeContext';

const Candidates: React.FC = () => {
  const { mode } = useTheme();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [regionFilter, setRegionFilter] = useState<string>('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [acceptModalOpen, setAcceptModalOpen] = useState(false);
  const [candidateToAccept, setCandidateToAccept] = useState<Candidate | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [candidateToView, setCandidateToView] = useState<Candidate | null>(null);
  const [snackbar, setSnackbar] = useState<{open: boolean, message: string, type: 'success' | 'error'}>({
    open: false,
    message: '',
    type: 'success'
  });
  const [viewingCandidateId, setViewingCandidateId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [candidateToDelete, setCandidateToDelete] = useState<Candidate | null>(null);
  const [deletingCandidateId, setDeletingCandidateId] = useState<string | null>(null);

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      const response = await apiService.getAllCandidates();
      if (response.success) {
        setCandidates(response.data);
      }
    } catch (error) {
      console.error('Error fetching candidates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptCandidate = (candidate: Candidate) => {
    setCandidateToAccept(candidate);
    setAcceptModalOpen(true);
  };

  const handleAcceptSuccess = () => {
    fetchCandidates();
    setSnackbar({
      open: true,
      message: 'Candidate accepted successfully!',
      type: 'success'
    });
  };

  const handleViewCandidate = async (candidate: Candidate) => {
    try {
      if (!candidate._id) {
        console.error('Candidate has no ID:', candidate);
        setSnackbar({
          open: true,
          message: 'Cannot view candidate: Missing ID',
          type: 'error'
        });
        return;
      }
      
      console.log('Fetching candidate details for:', candidate._id);
      setViewingCandidateId(candidate._id);
      
      // Make API call to get candidate by ID (this also updates status to "reviewing")
      const response = await apiService.getCandidateById(candidate._id);
      
      console.log('Full API response:', response);
      
      if (response.success) {
        console.log('Candidate details fetched successfully:', response.data);
        console.log('Updated candidate data:', response.data.updated);
        
        // Check if we have valid candidate data
        if (!response.data.updated) {
          console.error('No candidate data in response');
          setSnackbar({
            open: true,
            message: 'Failed to load candidate details: No data received',
            type: 'error'
          });
          setCandidateToView(candidate);
          setViewModalOpen(true);
          return;
        }
        
        // Update the candidate in the local state with the fresh data
        const updatedCandidate = response.data.updated;
        setCandidateToView(updatedCandidate);
        setViewModalOpen(true);
        
        // Show success message about status update
        const currentStatus = candidate.status || 'unknown';
        const updatedStatus = updatedCandidate.status || 'unknown';
        const candidateName = candidate.fullName || 'Unknown Candidate';
        
        const statusMessage = updatedStatus === CandidateStatuses.reviewing && currentStatus === CandidateStatuses.pending
          ? `Candidate ${candidateName} status updated to "reviewing"`
          : updatedStatus === CandidateStatuses.reviewing && currentStatus === CandidateStatuses.reviewing
          ? `Candidate ${candidateName} details loaded (already in reviewing status)`
          : `Candidate ${candidateName} details loaded (status: ${updatedStatus})`;
        
        setSnackbar({
          open: true,
          message: statusMessage,
          type: 'success'
        });
        
        // Only refresh the candidates list if status actually changed
        if (updatedStatus === CandidateStatuses.reviewing && currentStatus !== CandidateStatuses.reviewing) {
          fetchCandidates();
        }
      } else {
        console.error('Failed to fetch candidate details:', response.errors);
        // Show error message
        setSnackbar({
          open: true,
          message: `Failed to update candidate status: ${response.errors?.[0] || 'Unknown error'}`,
          type: 'error'
        });
        // Still show the modal with existing data if API fails
        setCandidateToView(candidate);
        setViewModalOpen(true);
      }
    } catch (error) {
      console.error('Error fetching candidate details:', error);
      // Show error message
      setSnackbar({
        open: true,
        message: `Error updating candidate status: ${error instanceof Error ? error.message : 'Unknown error'}`,
        type: 'error'
      });
      // Show modal with existing data if there's an error
      setCandidateToView(candidate);
      setViewModalOpen(true);
    } finally {
      setViewingCandidateId(null);
    }
  };

  const handleViewModalClose = () => {
    console.log('View modal closing, candidates still:', candidates);
    setViewModalOpen(false);
    setCandidateToView(null);
  };

  const handleRejectCandidate = async (id: string) => {
    try {
      await apiService.rejectCandidate(id);
      fetchCandidates(); // Refresh the list
    } catch (error) {
      console.error('Error rejecting candidate:', error);
    }
  };

  const handleDeleteCandidate = (candidate: Candidate) => {
    setCandidateToDelete(candidate);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteCandidate = async () => {
    if (!candidateToDelete) return;

    try {
      console.log('Attempting to delete candidate:', candidateToDelete._id, candidateToDelete.fullName);
      setDeletingCandidateId(candidateToDelete._id);
      
      const response = await apiService.deleteCandidate(candidateToDelete._id);
      console.log('Delete API response:', response);
      
      if (response.success) {
        console.log('Candidate deleted successfully from backend');
        setSnackbar({
          open: true,
          message: `Candidate ${candidateToDelete.fullName || 'Unknown'} deleted successfully`,
          type: 'success'
        });
        // Remove the candidate from the local state
        setCandidates(prev => prev.filter(c => c._id !== candidateToDelete._id));
        console.log('Candidate removed from frontend state');
      } else {
        console.error('Backend returned error:', response.errors);
        setSnackbar({
          open: true,
          message: `Failed to delete candidate: ${response.errors?.[0] || 'Unknown error'}`,
          type: 'error'
        });
      }
    } catch (error) {
      console.error('Error deleting candidate:', error);
      setSnackbar({
        open: true,
        message: `Error deleting candidate: ${error instanceof Error ? error.message : 'Unknown error'}`,
        type: 'error'
      });
    } finally {
      setDeletingCandidateId(null);
      setDeleteDialogOpen(false);
      setCandidateToDelete(null);
    }
  };

  const cancelDeleteCandidate = () => {
    setDeleteDialogOpen(false);
    setCandidateToDelete(null);
  };

  const filteredCandidates = candidates.filter((candidate) => {
    const matchesSearch = candidate.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         candidate.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || candidate.status === statusFilter;
    const matchesRegion = !regionFilter || candidate.region === regionFilter;
    
    return matchesSearch && matchesStatus && matchesRegion;
  });

  const getStatusColor = (status: CandidateStatuses) => {
    switch (status) {
      case CandidateStatuses.pending:
        return '#ffaa00';
      case CandidateStatuses.accepted:
        return '#00ff88';
      case CandidateStatuses.rejected:
        return '#ff4444';
      case CandidateStatuses.reviewing:
        return '#00ffff';
      default:
        return '#b0b0b0';
    }
  };

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
          Candidates
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
            mb: 3,
            background: mode === 'dark' ? 'rgba(26, 26, 26, 0.8)' : 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(10px)',
            border: mode === 'dark' ? '1px solid rgba(0, 255, 255, 0.3)' : '1px solid rgba(25, 118, 210, 0.3)',
            borderRadius: 3,
          }}
        >
          <CardContent>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  md: '2fr 1fr 1fr',
                },
                gap: 3,
                alignItems: 'center',
              }}
            >
              <TextField
                fullWidth
                label="Search candidates"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ color: '#b0b0b0', mr: 1 }} />,
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)' },
                    '&:hover fieldset': { borderColor: mode === 'dark' ? 'rgba(0, 255, 255, 0.5)' : 'rgba(25, 118, 210, 0.5)' },
                    '&.Mui-focused fieldset': { borderColor: mode === 'dark' ? '#00ffff' : '#1976d2' },
                  },
                  '& .MuiInputLabel-root': { color: mode === 'dark' ? '#b0b0b0' : '#666666' },
                  '& .MuiInputBase-input': { color: mode === 'dark' ? '#ffffff' : '#000000' },
                }}
              />
              <FormControl fullWidth>
                <InputLabel sx={{ color: mode === 'dark' ? '#b0b0b0' : '#666666' }}>Status</InputLabel>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  sx={{
                    color: mode === 'dark' ? '#ffffff' : '#000000',
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)' },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: mode === 'dark' ? 'rgba(0, 255, 255, 0.5)' : 'rgba(25, 118, 210, 0.5)' },
                  }}
                >
                  <MenuItem value="">All Statuses</MenuItem>
                  {Object.values(CandidateStatuses).map((status) => (
                    <MenuItem key={status} value={status}>
                      {status}
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
                    color: '#ffffff',
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(0, 255, 255, 0.5)' },
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
            </Box>
          </CardContent>
        </Card>
      </motion.div>

      {/* Candidates Table */}
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
            <TableContainer component={Paper} sx={{ backgroundColor: 'transparent' }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ color: mode === 'dark' ? '#00ffff' : '#1976d2', fontWeight: 600 }}>Name</TableCell>
                    <TableCell sx={{ color: mode === 'dark' ? '#00ffff' : '#1976d2', fontWeight: 600 }}>Email</TableCell>
                    <TableCell sx={{ color: mode === 'dark' ? '#00ffff' : '#1976d2', fontWeight: 600 }}>Region</TableCell>
                    <TableCell sx={{ color: mode === 'dark' ? '#00ffff' : '#1976d2', fontWeight: 600 }}>Status</TableCell>
                    <TableCell sx={{ color: mode === 'dark' ? '#00ffff' : '#1976d2', fontWeight: 600 }}>Position</TableCell>
                    <TableCell sx={{ color: mode === 'dark' ? '#00ffff' : '#1976d2', fontWeight: 600 }}>Actions</TableCell>
                    <TableCell sx={{ color: mode === 'dark' ? '#00ffff' : '#1976d2', fontWeight: 600, textAlign: 'center', width: '80px' }}>Delete</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredCandidates.map((candidate) => (
                    <TableRow
                      key={candidate._id}
                      sx={{
                        '&:hover': {
                          backgroundColor: mode === 'dark' ? 'rgba(0, 255, 255, 0.05)' : 'rgba(25, 118, 210, 0.05)',
                        },
                      }}
                    >
                      <TableCell sx={{ color: mode === 'dark' ? '#ffffff' : '#000000' }}>{candidate.fullName}</TableCell>
                      <TableCell sx={{ color: mode === 'dark' ? '#b0b0b0' : '#666666' }}>{candidate.email}</TableCell>
                      <TableCell sx={{ color: mode === 'dark' ? '#b0b0b0' : '#666666' }}>{candidate.region}</TableCell>
                      <TableCell>
                        <Chip
                          label={candidate.status}
                          size="small"
                          sx={{
                            backgroundColor: `${getStatusColor(candidate.status)}20`,
                            color: getStatusColor(candidate.status),
                            border: `1px solid ${getStatusColor(candidate.status)}40`,
                            fontWeight: 600,
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ color: mode === 'dark' ? '#b0b0b0' : '#666666' }}>
                        {candidate.jobRequirement?.position || 'N/A'}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ 
                          display: 'flex', 
                          gap: 1, 
                          alignItems: 'center',
                          flexWrap: 'nowrap',
                          minHeight: '40px'
                        }}>
                          {/* View Button */}
                          <Tooltip title={
                            (candidate.status || 'unknown') === CandidateStatuses.pending 
                              ? "Click to update candidate status to reviewing" 
                              : (candidate.status || 'unknown') === CandidateStatuses.reviewing
                              ? "View candidate details (already in reviewing status)"
                              : (candidate.status || 'unknown') === CandidateStatuses.accepted
                              ? "View accepted candidate details"
                              : (candidate.status || 'unknown') === CandidateStatuses.rejected
                              ? "View rejected candidate details"
                              : "View candidate details"
                          }>
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => handleViewCandidate(candidate)}
                              disabled={viewingCandidateId === candidate._id}
                              sx={{
                                borderColor: mode === 'dark' ? '#00ffff' : '#1976d2',
                                color: mode === 'dark' ? '#00ffff' : '#1976d2',
                                minWidth: 'fit-content',
                                height: '32px',
                                '&:hover': {
                                  borderColor: mode === 'dark' ? '#4dffff' : '#42a5f5',
                                  backgroundColor: mode === 'dark' ? 'rgba(0, 255, 255, 0.1)' : 'rgba(25, 118, 210, 0.1)',
                                },
                                '&:disabled': {
                                  borderColor: mode === 'dark' ? 'rgba(0, 255, 255, 0.3)' : 'rgba(25, 118, 210, 0.3)',
                                  color: mode === 'dark' ? 'rgba(0, 255, 255, 0.3)' : 'rgba(25, 118, 210, 0.3)',
                                },
                              }}
                            >
                              {viewingCandidateId === candidate._id ? (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <CircularProgress size={16} sx={{ color: 'rgba(0, 255, 255, 0.3)' }} />
                                  {(candidate.status || 'unknown') === CandidateStatuses.pending ? 'Updating to reviewing...' : 'Loading...'}
                                </Box>
                              ) : (
                                (candidate.status || 'unknown') === CandidateStatuses.pending ? 'View & Update' 
                                : (candidate.status || 'unknown') === CandidateStatuses.reviewing ? 'View'
                                : (candidate.status || 'unknown') === CandidateStatuses.accepted ? 'View Accepted'
                                : (candidate.status || 'unknown') === CandidateStatuses.rejected ? 'View Rejected'
                                : 'View'
                              )}
                            </Button>
                          </Tooltip>

                          {/* Accept Button - Only show for pending and reviewing candidates */}
                          {(candidate.status === CandidateStatuses.pending || candidate.status === CandidateStatuses.reviewing) && (
                            <Button
                              size="small"
                              variant="contained"
                              onClick={() => handleAcceptCandidate(candidate)}
                              sx={{
                                backgroundColor: '#4caf50',
                                minWidth: 'fit-content',
                                height: '32px',
                                '&:hover': {
                                  backgroundColor: '#45a049',
                                },
                              }}
                            >
                              Accept
                            </Button>
                          )}

                          {/* Reject Button - Only show for pending and reviewing candidates */}
                          {(candidate.status === CandidateStatuses.pending || candidate.status === CandidateStatuses.reviewing) && (
                            <Button
                              size="small"
                              variant="contained"
                              onClick={() => handleRejectCandidate(candidate._id)}
                              sx={{
                                backgroundColor: '#f44336',
                                minWidth: 'fit-content',
                                height: '32px',
                                '&:hover': {
                                  backgroundColor: '#da190b',
                                },
                              }}
                            >
                              Reject
                            </Button>
                          )}
                        </Box>
                      </TableCell>
                      {/* Delete Button Column - Positioned in the red area (rightmost edge) */}
                      <TableCell sx={{ textAlign: 'center', width: '80px' }}>
                        <Tooltip title="Delete candidate">
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteCandidate(candidate)}
                            disabled={deletingCandidateId === candidate._id}
                            sx={{
                              color: '#ff5722',
                              width: '32px',
                              height: '32px',
                              '&:hover': {
                                backgroundColor: 'rgba(255, 87, 34, 0.1)',
                              },
                              '&:disabled': {
                                color: 'rgba(255, 87, 34, 0.3)',
                              },
                            }}
                          >
                            {deletingCandidateId === candidate._id ? (
                              <CircularProgress size={16} sx={{ color: 'rgba(255, 87, 34, 0.3)' }} />
                            ) : (
                              <DeleteIcon />
                            )}
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </motion.div>

      {/* Accept Candidate Modal */}
      <AcceptCandidateModal
        open={acceptModalOpen}
        onClose={() => setAcceptModalOpen(false)}
        candidate={candidateToAccept}
        onSuccess={handleAcceptSuccess}
      />

      {/* View Candidate Modal */}
      <ViewCandidateModal
        open={viewModalOpen}
        onClose={handleViewModalClose}
        candidate={candidateToView}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={cancelDeleteCandidate}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">
          Delete Candidate
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Are you sure you want to delete candidate "{candidateToDelete?.fullName || 'Unknown'}"? 
            <br />
            <strong>Warning: If you delete this candidate, you will never be able to find it again.</strong>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelDeleteCandidate} color="primary">
            Cancel
          </Button>
          <Button 
            onClick={confirmDeleteCandidate} 
            color="error" 
            variant="contained"
            disabled={deletingCandidateId === candidateToDelete?._id}
          >
            {deletingCandidateId === candidateToDelete?._id ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

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

export default Candidates;

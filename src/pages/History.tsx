import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  CircularProgress,
  Alert,
  Snackbar,
  Button,
} from '@mui/material';
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
  Work as WorkIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

import { apiService } from '../services/api';

interface SalaryHistory {
  _id: string;
  employee: {
    _id: string;
    fullName: string;
    email: string;
  };
  oldSalary: number;
  newSalary: number;
  createdAt?: string;
  updatedAt?: string;
  __v: number;
}

interface PositionHistory {
  _id: string;
  employee: {
    _id: string;
    fullName: string;
    email: string;
  };
  oldPosition: {
    _id: string;
    title: string;
  };
  newPosition: {
    _id: string;
    title: string;
  };
  createdAt?: string;
  updatedAt?: string;
  __v: number;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`history-tabpanel-${index}`}
      aria-labelledby={`history-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const History: React.FC = () => {
  const isMountedRef = useRef(true);
  const [tabValue, setTabValue] = useState(0);
  const [salaryHistory, setSalaryHistory] = useState<SalaryHistory[]>([]);
  const [positionHistory, setPositionHistory] = useState<PositionHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSalaryFilter, setSelectedSalaryFilter] = useState<string>('');


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
    const fetchData = async () => {
      if (!isMountedRef.current) return;
      
      setInitialLoading(true);
      console.log('🚀 Initial data fetch started');
      
      try {
        await Promise.all([
          fetchSalaryHistory(),
          fetchPositionHistory()
        ]);
        console.log('✅ Initial data fetch completed');
      } catch (error) {
        console.error('❌ Initial data fetch failed:', error);
      } finally {
        setInitialLoading(false);
      }
    };
    
    fetchData();
  }, []); // Empty dependency array - only run once on mount

  // Separate effect for tab changes
  useEffect(() => {
    if (!isMountedRef.current) return;
    
    console.log('🔄 Tab changed to:', tabValue);
    // No need to refetch data when tabs change since we already have it
  }, [tabValue]);



  // Cleanup effect
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);



  const fetchSalaryHistory = async () => {
    setLoading(true);
    try {
      const response = await apiService.getSalaryHistory();
      
      if (response.success) {
        const salaryData = response.data.salaryHistory || [];
        console.log('🔍 Raw Salary History Data:', salaryData);
        
        // Debug each salary history record
        salaryData.forEach((record, index) => {
          console.log(`🔍 Salary Record ${index}:`, {
            employee: record.employee?.fullName,
            oldSalary: record.oldSalary,
            newSalary: record.newSalary,
            oldSalaryType: typeof record.oldSalary,
            newSalaryType: typeof record.newSalary,
            isIncrease: record.oldSalary > record.newSalary,
            isDecrease: record.oldSalary < record.newSalary
          });
        });
        
        setSalaryHistory(salaryData);
        

      } else {
        console.log('❌ Salary history failed:', response);
        showSnackbar(`Salary history failed: ${response.errors?.join(', ') || 'Unknown error'}`, 'error');
      }
    } catch (error: any) {
      console.error('❌ Error fetching salary history:', error);
      console.error('❌ Error details:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      showSnackbar(`Failed to fetch salary history: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchPositionHistory = async () => {
    console.log('🔍 fetchPositionHistory called, isMountedRef.current:', isMountedRef.current);
    
    setLoading(true);
    try {
      console.log('🔍 Fetching position history...');
      console.log('🔗 API URL:', '/api/v1/history/position');
      
      const response = await apiService.getPositionHistory();
      console.log('📊 Position history response:', response);
      
      if (response.success) {
        console.log('✅ Position history data:', response.data.positionHistory);
        setPositionHistory(response.data.positionHistory || []);
      } else {
        console.log('❌ Position history failed:', response);
        showSnackbar(`Position history failed: ${response.errors?.join(', ') || 'Unknown error'}`, 'error');
      }
    } catch (error: any) {
      console.error('❌ Error fetching position history:', error);
      console.error('❌ Error details:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      showSnackbar(`Failed to fetch position history: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };



  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setSearchTerm('');
    setSelectedSalaryFilter('');
  };

  const handleRefresh = () => {
    if (tabValue === 0) {
      fetchSalaryHistory();
    } else {
      fetchPositionHistory();
    }
  };

  const showSnackbar = (message: string, type: 'success' | 'error') => {
    setSnackbar({
      open: true,
      message,
      type,
    });
  };



  // Memoized filter functions
  const filteredSalaryHistory = useCallback(() => {
    return salaryHistory.filter((history) => {
      const employee = history.employee;
      
      if (!employee) return false;
      
      const matchesSearch = 
        employee.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      let matchesSalaryFilter = true;
      if (selectedSalaryFilter === 'increase') {
        matchesSalaryFilter = history.oldSalary > history.newSalary;
        // Debug logging for salary changes
        console.log(`🔍 Salary Filter Debug - Employee: ${employee.fullName}`);
        console.log(`   Old Salary: ${history.oldSalary}, New Salary: ${history.newSalary}`);
        console.log(`   Is Increase: ${matchesSalaryFilter} (${history.oldSalary} > ${history.newSalary})`);
      } else if (selectedSalaryFilter === 'decrease') {
        matchesSalaryFilter = history.oldSalary < history.newSalary;
        // Debug logging for salary changes
        console.log(`🔍 Salary Filter Debug - Employee: ${employee.fullName}`);
        console.log(`   Old Salary: ${history.oldSalary}, New Salary: ${history.newSalary}`);
        console.log(`   Is Decrease: ${matchesSalaryFilter} (${history.oldSalary} < ${history.newSalary})`);
      }
      
      return matchesSearch && matchesSalaryFilter;
    });
  }, [salaryHistory, searchTerm, selectedSalaryFilter]);

  const filteredPositionHistory = positionHistory.filter((history) => {
    // Use the populated employee data directly
    const employee = history.employee;
    
    if (!employee) return false;
    
    const matchesSearch = 
      employee.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase());
    
         return matchesSearch;
  });

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedSalaryFilter('');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDateTime = (dateString: string | undefined | null) => {
    try {
      // Handle undefined/null cases
      if (!dateString) {
        return 'Date Not Available';
      }
      
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Invalid Date';
      }
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch (error) {
      return 'Date Error';
    }
  };

  const getSalaryChangeType = (oldSalary: number, newSalary: number) => {
    // Debug logging for salary change type determination
    console.log(`🔍 Salary Change Type Debug:`);
    console.log(`   Old Salary: ${oldSalary} (type: ${typeof oldSalary})`);
    console.log(`   New Salary: ${newSalary} (type: ${typeof newSalary})`);
    console.log(`   Comparison: ${oldSalary} > ${newSalary} = ${oldSalary > newSalary}`);
    console.log(`   Comparison: ${oldSalary} < ${newSalary} = ${oldSalary < newSalary}`);
    
    if (oldSalary > newSalary) {
      console.log(`   Result: INCREASE ↗`);
      return { type: 'increase', color: '#4caf50', icon: '↗' };
    } else if (oldSalary < newSalary) {
      console.log(`   Result: DECREASE ↘`);
      return { type: 'decrease', color: '#f44336', icon: '↘' };
    }
    console.log(`   Result: NO CHANGE →`);
    return { type: 'no-change', color: '#9e9e9e', icon: '→' };
  };

  // Debug logging
  console.log('🔍 History component state:', {
    loading,
    tabValue,
    salaryHistory: salaryHistory.length,
    positionHistory: positionHistory.length,
    searchTerm,
    selectedSalaryFilter
  });

  console.log('🔍 Filtered results:', {
    filteredSalaryHistory: filteredSalaryHistory.length,
    filteredPositionHistory: filteredPositionHistory.length
  });

  if (initialLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress size={60} sx={{ color: '#00ffff' }} />
        <Typography variant="h6" sx={{ color: '#00ffff', ml: 2 }}>
          Loading History Data...
        </Typography>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress size={60} sx={{ color: '#00ffff' }} />
        <Typography variant="h6" sx={{ color: '#00ffff', ml: 2 }}>
          Refreshing...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
             {/* Status Info */}
               <Box sx={{ mb: 2, p: 2, bgcolor: 'rgba(0, 255, 255, 0.1)', border: '1px solid #00ffff', borderRadius: 1 }}>
          <Typography variant="body2" sx={{ color: '#00ffff' }}>
            📊 Status: {initialLoading ? 'Initial Loading...' : loading ? 'Refreshing...' : 'Ready'} | 
            Salary History: {salaryHistory.length} | 
            Position History: {positionHistory.length}
          </Typography>
        </Box>

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
          History Management
        </Typography>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <Card sx={{ background: '#1a1a1a', border: '1px solid #333', mb: 3 }}>
          <CardContent>
            <Box sx={{ borderBottom: 1, borderColor: '#333' }}>
              <Tabs
                value={tabValue}
                onChange={handleTabChange}
                sx={{
                  '& .MuiTab-root': {
                    color: '#b0b0b0',
                    '&.Mui-selected': {
                      color: '#00ffff',
                    },
                  },
                  '& .MuiTabs-indicator': {
                    backgroundColor: '#00ffff',
                  },
                }}
              >
                <Tab
                  icon={<TrendingUpIcon />}
                  label="Salary History"
                  iconPosition="start"
                />
                <Tab
                  icon={<WorkIcon />}
                  label="Position History"
                  iconPosition="start"
                />
              </Tabs>
            </Box>
          </CardContent>
        </Card>
      </motion.div>

      {/* Global Search and Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <Card sx={{ background: '#1a1a1a', border: '1px solid #333', mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: 2, alignItems: 'center' }}>
              <TextField
                fullWidth
                placeholder="Search by employee name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ color: '#b0b0b0', mr: 1 }} />,
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: '#333' },
                    '&:hover fieldset': { borderColor: '#00ffff' },
                    '&.Mui-focused fieldset': { borderColor: '#00ffff' },
                  },
                  '& .MuiInputLabel-root': { color: '#b0b0b0' },
                  '& .MuiInputBase-input': { color: '#ffffff' },
                }}
              />
              
              <Button
                variant="outlined"
                onClick={clearFilters}
                sx={{
                  color: '#ff6b6b',
                  borderColor: '#ff6b6b',
                  '&:hover': {
                    borderColor: '#ff5252',
                    backgroundColor: 'rgba(255, 107, 107, 0.1)',
                  },
                }}
              >
                Clear Filters
              </Button>

              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={handleRefresh}
                sx={{
                  color: '#00ffff',
                  borderColor: '#00ffff',
                  '&:hover': {
                    borderColor: '#00cccc',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  },
                }}
              >
                Refresh
              </Button>
            </Box>
          </CardContent>
        </Card>
      </motion.div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
                 {/* Salary History Tab */}
         <TabPanel value={tabValue} index={0}>
           {/* Salary History Filters */}
           <Card sx={{ background: '#1a1a1a', border: '1px solid #333', mb: 3 }}>
             <CardContent>
                               <Typography variant="subtitle1" sx={{ color: '#00ffff', mb: 2, fontWeight: 600 }}>
                  Salary History Filters
                </Typography>
                <Typography variant="caption" sx={{ color: '#b0b0b0', mb: 2, display: 'block' }}>
                  Note: Use the search field to find specific employees by name
                </Typography>
                               <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, alignItems: 'center' }}>
                  <FormControl fullWidth>
                    <InputLabel sx={{ color: '#b0b0b0' }}>Salary Change Type</InputLabel>
                    <Select
                      value={selectedSalaryFilter}
                      onChange={(e) => setSelectedSalaryFilter(e.target.value)}
                      label="Salary Change Type"
                      sx={{
                        color: '#ffffff',
                        '& .MuiOutlinedInput-notchedOutline': { borderColor: '#333' },
                        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#00ffff' },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#00ffff' },
                        '& .MuiSvgIcon-root': { color: '#b0b0b0' },
                      }}
                    >
                      <MenuItem value="">
                        <em>All Changes</em>
                      </MenuItem>
                      <MenuItem value="increase">Salary Increase</MenuItem>
                      <MenuItem value="decrease">Salary Decrease</MenuItem>
                    </Select>
                  </FormControl>

                  <TextField
                    fullWidth
                    placeholder="Search by employee name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                      startAdornment: <SearchIcon sx={{ color: '#b0b0b0', mr: 1 }} />,
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': { borderColor: '#333' },
                        '&:hover fieldset': { borderColor: '#00ffff' },
                        '&.Mui-focused fieldset': { borderColor: '#00ffff' },
                      },
                      '& .MuiInputLabel-root': { color: '#b0b0b0' },
                      '& .MuiInputBase-input': { color: '#ffffff' },
                    }}
                  />
                </Box>
             </CardContent>
           </Card>

           <Card sx={{ background: '#1a1a1a', border: '1px solid #333' }}>
             <CardContent>
               <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                 <Typography variant="h6" sx={{ color: '#00ffff' }}>
                   Salary Changes History
                 </Typography>
                 <Chip
                   label={`${filteredSalaryHistory().length} record${filteredSalaryHistory().length !== 1 ? 's' : ''}`}
                   sx={{
                     background: 'rgba(0, 255, 255, 0.2)',
                     color: '#00ffff',
                     border: '1px solid #00ffff',
                   }}
                 />
               </Box>

              {filteredSalaryHistory().length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                                     <Typography variant="h6" sx={{ color: '#b0b0b0', mb: 1 }}>
                                           {(searchTerm || selectedSalaryFilter) ? 'No salary history found' : 'No salary history yet'}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#888888' }}>
                      {(searchTerm || selectedSalaryFilter)
                        ? 'Try adjusting your search or filters' 
                        : 'Salary changes will appear here when employees are updated'
                      }
                   </Typography>
                </Box>
              ) : (
                <TableContainer component={Paper} sx={{ background: 'transparent' }}>
                  <Table>
                                         <TableHead>
                       <TableRow sx={{ background: '#2a2a2a' }}>
                         <TableCell sx={{ color: '#00ffff', fontWeight: 'bold' }}>Employee</TableCell>
                         <TableCell sx={{ color: '#00ffff', fontWeight: 'bold' }}>New Salary</TableCell>
                         <TableCell sx={{ color: '#00ffff', fontWeight: 'bold' }}>Old Salary</TableCell>
                         <TableCell sx={{ color: '#00ffff', fontWeight: 'bold' }}>Change</TableCell>
                         <TableCell sx={{ color: '#00ffff', fontWeight: 'bold' }}>Date</TableCell>
                       </TableRow>
                     </TableHead>
                    <TableBody>
                                             {filteredSalaryHistory().map((history) => {
                         const changeInfo = getSalaryChangeType(history.oldSalary, history.newSalary);
                         
                         return (
                           <TableRow
                             key={history._id}
                             sx={{
                               '&:hover': { backgroundColor: 'rgba(0, 255, 255, 0.05)' },
                               borderBottom: '1px solid #333',
                             }}
                           >
                             <TableCell>
                               <Box>
                                 <Typography variant="subtitle2" sx={{ color: '#ffffff', fontWeight: 600 }}>
                                   {history.employee.fullName}
                                 </Typography>
                                 <Typography variant="caption" sx={{ color: '#b0b0b0' }}>
                                   {history.employee.email}
                                 </Typography>
                               </Box>
                             </TableCell>
                                                         <TableCell sx={{ color: '#ffffff', fontWeight: 600 }}>
                               {formatCurrency(history.newSalary)}
                             </TableCell>
                             <TableCell sx={{ color: '#b0b0b0' }}>
                               {formatCurrency(history.oldSalary)}
                             </TableCell>
                            <TableCell>
                              <Chip
                                label={`${changeInfo.icon} ${changeInfo.type}`}
                                size="small"
                                sx={{
                                  backgroundColor: `${changeInfo.color}20`,
                                  color: changeInfo.color,
                                  border: `1px solid ${changeInfo.color}`,
                                  fontWeight: 600,
                                }}
                              />
                            </TableCell>
                            <TableCell sx={{ color: '#b0b0b0' }}>
                              {formatDateTime(history.createdAt || new Date().toISOString())}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
              
              
            </CardContent>
          </Card>
        </TabPanel>

        {/* Position History Tab */}
        <TabPanel value={tabValue} index={1}>
           {/* Position History Filters */}
           <Card sx={{ background: '#1a1a1a', border: '1px solid #333', mb: 3 }}>
             <CardContent>
                               <Typography variant="subtitle1" sx={{ color: '#00ffff', mb: 2, fontWeight: 600 }}>
                  Position History Filters
                </Typography>
                <Typography variant="caption" sx={{ color: '#b0b0b0', mb: 2, display: 'block' }}>
                  Note: Use the search field to find specific employees by name
                </Typography>
               <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 2, alignItems: 'center' }}>
                 <TextField
                   fullWidth
                   placeholder="Search by employee name..."
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                   InputProps={{
                     startAdornment: <SearchIcon sx={{ color: '#b0b0b0', mr: 1 }} />,
                   }}
                   sx={{
                     '& .MuiOutlinedInput-root': {
                       '& fieldset': { borderColor: '#333' },
                       '&:hover fieldset': { borderColor: '#00ffff' },
                       '&.Mui-focused fieldset': { borderColor: '#00ffff' },
                     },
                     '& .MuiInputLabel-root': { color: '#b0b0b0' },
                     '& .MuiInputBase-input': { color: '#ffffff' },
                   }}
                 />
               </Box>
             </CardContent>
           </Card>

           <Card sx={{ background: '#1a1a1a', border: '1px solid #333' }}>
             <CardContent>
               <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                 <Typography variant="h6" sx={{ color: '#00ffff' }}>
                   Position Changes History
                 </Typography>
                 <Chip
                   label={`${filteredPositionHistory.length} record${filteredPositionHistory.length !== 1 ? 's' : ''}`}
                   sx={{
                     background: 'rgba(0, 255, 255, 0.2)',
                     color: '#00ffff',
                     border: '1px solid #00ffff',
                   }}
                 />
               </Box>

              {filteredPositionHistory.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                                     <Typography variant="h6" sx={{ color: '#b0b0b0', mb: 1 }}>
                                           {searchTerm ? 'No position history found' : 'No position history yet'}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#888888' }}>
                      {searchTerm
                        ? 'Try adjusting your search or filters' 
                        : 'Position changes will appear here when employees are updated'
                      }
                   </Typography>
                </Box>
              ) : (
                <TableContainer component={Paper} sx={{ background: 'transparent' }}>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ background: '#2a2a2a' }}>
                        <TableCell sx={{ color: '#00ffff', fontWeight: 'bold' }}>Employee</TableCell>
                        <TableCell sx={{ color: '#00ffff', fontWeight: 'bold' }}>Previous Position</TableCell>
                        <TableCell sx={{ color: '#00ffff', fontWeight: 'bold' }}>New Position</TableCell>
                        <TableCell sx={{ color: '#00ffff', fontWeight: 'bold' }}>Date</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                                             {filteredPositionHistory.map((history) => {
                         return (
                           <TableRow
                             key={history._id}
                             sx={{
                               '&:hover': { backgroundColor: 'rgba(0, 255, 255, 0.05)' },
                               borderBottom: '1px solid #333',
                             }}
                           >
                             <TableCell>
                               <Box>
                                 <Typography variant="subtitle2" sx={{ color: '#ffffff', fontWeight: 600 }}>
                                   {history.employee.fullName}
                                 </Typography>
                                 <Typography variant="caption" sx={{ color: '#b0b0b0' }}>
                                   {history.employee.email}
                                 </Typography>
                               </Box>
                             </TableCell>
                             <TableCell>
                               <Chip
                                 label={history.oldPosition?.title || 'N/A'}
                                 size="small"
                                 sx={{
                                   backgroundColor: 'rgba(255, 107, 107, 0.2)',
                                   color: '#ff6b6b',
                                   border: '1px solid #ff6b6b',
                                 }}
                               />
                             </TableCell>
                             <TableCell>
                               <Chip
                                 label={history.newPosition?.title || 'N/A'}
                                 size="small"
                                 sx={{
                                   backgroundColor: 'rgba(76, 175, 80, 0.2)',
                                   color: '#4caf50',
                                   border: '1px solid #4caf50',
                                 }}
                               />
                             </TableCell>
                            <TableCell sx={{ color: '#b0b0b0' }}>
                              {formatDateTime(history.createdAt)}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </TabPanel>
      </motion.div>

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

export default History;

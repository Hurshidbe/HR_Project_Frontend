import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Chip,
} from '@mui/material';
import {
  People as PeopleIcon,
  Work as WorkIcon,
  Business as BusinessIcon,
  Person as PersonIcon,
  TrendingUp as TrendingUpIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import apiService from '../services/api';
import { useTheme } from '../contexts/ThemeContext';

interface DashboardStats {
  totalCandidates: number;
  totalEmployees: number;
  totalDepartments: number;
  totalPositions: number;
  pendingCandidates: number;
  recentHires: number;
  workingEmployees: number;
  firedEmployees: number;
}

const Dashboard: React.FC = () => {
  const { mode } = useTheme();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch all data to calculate stats
        const [candidatesRes, employeesRes, departmentsRes, positionsRes] = await Promise.all([
          apiService.getAllCandidates(),
          apiService.getAllEmployees(),
          apiService.getAllDepartments(),
          apiService.getAllPositions(),
        ]);

        const candidates = candidatesRes.success ? candidatesRes.data : [];
        const employees = employeesRes.success ? employeesRes.data.employees : [];
        const departments = departmentsRes.success ? departmentsRes.data.data : [];
        const positions = positionsRes.success ? positionsRes.data.data : [];

        const pendingCandidates = candidates.filter(
          (candidate: any) => candidate.status === 'PENDING'
        ).length;

        const recentHires = candidates.filter(
          (candidate: any) => candidate.status === 'ACCEPTED'
        ).length;

        // Count employees by status
        const workingEmployees = employees.filter(
          (employee: any) => employee.employeeStatus === 'working'
        ).length;

        const firedEmployees = employees.filter(
          (employee: any) => employee.employeeStatus === 'fired'
        ).length;

        setStats({
          totalCandidates: candidates.length,
          totalEmployees: employees.length, // Count actual employees, not accepted candidates
          totalDepartments: departments.length,
          totalPositions: positions.length,
          pendingCandidates,
          recentHires,
          workingEmployees,
          firedEmployees,
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const statCards = [
    {
      title: 'Total Candidates',
      value: stats?.totalCandidates || 0,
      icon: <PeopleIcon />,
      color: '#00ffff',
      gradient: 'linear-gradient(135deg, #00ffff, #0080ff)',
    },
    {
      title: 'Active Employees',
      value: stats?.totalEmployees || 0,
      icon: <WorkIcon />,
      color: '#00ff88',
      gradient: 'linear-gradient(135deg, #00ff88, #00cc66)',
    },
    {
      title: 'Departments',
      value: stats?.totalDepartments || 0,
      icon: <BusinessIcon />,
      color: '#ff00ff',
      gradient: 'linear-gradient(135deg, #ff00ff, #cc00cc)',
    },
    {
      title: 'Positions',
      value: stats?.totalPositions || 0,
      icon: <PersonIcon />,
      color: '#ffaa00',
      gradient: 'linear-gradient(135deg, #ffaa00, #ff8800)',
    },
  ];

  const quickActions = [
    {
      title: 'Review Candidates',
      description: `${stats?.pendingCandidates || 0} candidates pending review`,
      icon: <ScheduleIcon />,
      color: '#00ffff',
    },
    {
      title: 'Active Employees',
      description: `${stats?.totalEmployees || 0} employees currently working`,
      icon: <TrendingUpIcon />,
      color: '#00ff88',
    },
  ];

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '60vh',
        }}
      >
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
          Dashboard
        </Typography>
      </motion.div>

      {/* Statistics Cards */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(4, 1fr)',
          },
          gap: 3,
          mb: 4,
        }}
      >
        {statCards.map((card, index) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card
                sx={{
                  height: '100%',
                  background: mode === 'dark' ? 'rgba(26, 26, 26, 0.8)' : 'rgba(255, 255, 255, 0.8)',
                  backdropFilter: 'blur(10px)',
                  border: `1px solid ${card.color}40`,
                  borderRadius: 3,
                  boxShadow: mode === 'dark'
                    ? `0 8px 32px rgba(0, 0, 0, 0.3), 0 0 20px ${card.color}20`
                    : `0 8px 32px rgba(0, 0, 0, 0.1), 0 0 20px ${card.color}20`,
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: mode === 'dark'
                      ? `0 12px 40px rgba(0, 0, 0, 0.4), 0 0 30px ${card.color}30`
                      : `0 12px 40px rgba(0, 0, 0, 0.2), 0 0 30px ${card.color}30`,
                    borderColor: `${card.color}80`,
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                <CardContent sx={{ p: 3, textAlign: 'center' }}>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'center',
                      mb: 2,
                    }}
                  >
                    <Box
                      sx={{
                        width: 60,
                        height: 60,
                        borderRadius: '50%',
                        background: card.gradient,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: `0 0 20px ${card.color}40`,
                      }}
                    >
                      {React.cloneElement(card.icon, {
                        sx: { fontSize: 30, color: '#ffffff' },
                      })}
                    </Box>
                  </Box>
                  <Typography
                    variant="h4"
                    sx={{
                      mb: 1,
                      fontWeight: 'bold',
                      color: card.color,
                      textShadow: `0 0 10px ${card.color}40`,
                    }}
                  >
                    {card.value}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: mode === 'dark' ? '#b0b0b0' : '#666666', fontSize: '0.9rem' }}
                  >
                    {card.title}
                  </Typography>
                </CardContent>
              </Card>
            </motion.div>
        ))}
      </Box>

      {/* Quick Actions */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            md: 'repeat(2, 1fr)',
          },
          gap: 3,
        }}
      >
        {quickActions.map((action, index) => (
            <motion.div
              key={action.title}
              initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
            >
              <Card
                sx={{
                  background: mode === 'dark' ? 'rgba(26, 26, 26, 0.8)' : 'rgba(255, 255, 255, 0.8)',
                  backdropFilter: 'blur(10px)',
                  border: `1px solid ${action.color}40`,
                  borderRadius: 3,
                  boxShadow: mode === 'dark'
                    ? `0 8px 32px rgba(0, 0, 0, 0.3), 0 0 20px ${action.color}20`
                    : `0 8px 32px rgba(0, 0, 0, 0.1), 0 0 20px ${action.color}20`,
                  '&:hover': {
                    transform: 'translateY(-3px)',
                    boxShadow: mode === 'dark'
                      ? `0 12px 40px rgba(0, 0, 0, 0.4), 0 0 30px ${action.color}30`
                      : `0 12px 40px rgba(0, 0, 0, 0.2), 0 0 30px ${action.color}30`,
                    borderColor: `${action.color}80`,
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box
                      sx={{
                        width: 50,
                        height: 50,
                        borderRadius: '50%',
                        background: `linear-gradient(135deg, ${action.color}, ${action.color}80)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mr: 2,
                        boxShadow: `0 0 15px ${action.color}40`,
                      }}
                    >
                      {React.cloneElement(action.icon, {
                        sx: { fontSize: 24, color: '#ffffff' },
                      })}
                    </Box>
                    <Typography
                      variant="h6"
                      sx={{
                        color: mode === 'dark' ? '#ffffff' : '#000000',
                        fontWeight: 600,
                      }}
                    >
                      {action.title}
                    </Typography>
                  </Box>
                  <Typography
                    variant="body2"
                    sx={{ color: mode === 'dark' ? '#b0b0b0' : '#666666', lineHeight: 1.6 }}
                  >
                    {action.description}
                  </Typography>
                </CardContent>
              </Card>
            </motion.div>
        ))}
      </Box>

      {/* Employee Status Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        <Typography
          variant="h5"
          sx={{
            mt: 4,
            mb: 3,
            color: '#00ffff',
            fontWeight: 600,
            textShadow: '0 0 10px rgba(0, 255, 255, 0.3)',
          }}
        >
          Employee Status Breakdown
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
          <Card
            sx={{
              background: mode === 'dark' ? 'rgba(26, 26, 26, 0.8)' : 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(0, 255, 136, 0.3)',
              borderRadius: 3,
              boxShadow: mode === 'dark'
                ? '0 8px 32px rgba(0, 0, 0, 0.3), 0 0 20px rgba(0, 255, 136, 0.1)'
                : '0 8px 32px rgba(0, 0, 0, 0.1), 0 0 20px rgba(0, 255, 136, 0.1)',
            }}
          >
            <CardContent sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h4" sx={{ color: '#00ff88', fontWeight: 700, mb: 1 }}>
                {stats?.workingEmployees || 0}
              </Typography>
              <Typography variant="h6" sx={{ color: mode === 'dark' ? '#ffffff' : '#000000', mb: 1 }}>
                Working Employees
              </Typography>
              <Typography variant="body2" sx={{ color: mode === 'dark' ? '#b0b0b0' : '#666666' }}>
                Currently active and working
              </Typography>
            </CardContent>
          </Card>

          <Card
            sx={{
              background: mode === 'dark' ? 'rgba(26, 26, 26, 0.8)' : 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 68, 68, 0.3)',
              borderRadius: 3,
              boxShadow: mode === 'dark'
                ? '0 8px 32px rgba(0, 0, 0, 0.3), 0 0 20px rgba(255, 68, 68, 0.1)'
                : '0 8px 32px rgba(0, 0, 0, 0.1), 0 0 20px rgba(255, 68, 68, 0.1)',
            }}
          >
            <CardContent sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h4" sx={{ color: '#ff4444', fontWeight: 700, mb: 1 }}>
                {stats?.firedEmployees || 0}
              </Typography>
              <Typography variant="h6" sx={{ color: mode === 'dark' ? '#ffffff' : '#000000', mb: 1 }}>
                Terminated Employees
              </Typography>
              <Typography variant="body2" sx={{ color: mode === 'dark' ? '#b0b0b0' : '#666666' }}>
                No longer with the company
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </motion.div>

      {/* Welcome Message */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
      >
        <Card
          sx={{
            mt: 4,
            background: mode === 'dark'
              ? 'linear-gradient(135deg, rgba(26, 26, 26, 0.9), rgba(0, 0, 0, 0.8))'
              : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(245, 245, 245, 0.8))',
            backdropFilter: 'blur(15px)',
            border: mode === 'dark' ? '1px solid rgba(0, 255, 255, 0.3)' : '1px solid rgba(25, 118, 210, 0.3)',
            borderRadius: 3,
            boxShadow: mode === 'dark'
              ? '0 8px 32px rgba(0, 0, 0, 0.3), 0 0 20px rgba(0, 255, 255, 0.1)'
              : '0 8px 32px rgba(0, 0, 0, 0.1), 0 0 20px rgba(25, 118, 210, 0.1)',
          }}
        >
          <CardContent sx={{ p: 4, textAlign: 'center' }}>
            <Typography
              variant="h5"
              sx={{
                mb: 2,
                color: '#00ffff',
                fontWeight: 600,
                textShadow: '0 0 10px rgba(0, 255, 255, 0.5)',
              }}
            >
              Welcome to HR Management System
            </Typography>
            <Typography
              variant="body1"
              sx={{ color: mode === 'dark' ? '#b0b0b0' : '#666666', maxWidth: 600, mx: 'auto' }}
            >
              Manage your human resources efficiently with our comprehensive dashboard.
              Track candidates, employees, departments, and positions all in one place.
            </Typography>
          </CardContent>
        </Card>
      </motion.div>
    </Box>
  );
};

export default Dashboard;

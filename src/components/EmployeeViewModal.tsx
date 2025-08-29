import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Chip,
  Divider,
} from '@mui/material';
import { Employee, Sex, Region, DrivingGrade, LangGradeEnum } from '../types';

interface EmployeeViewModalProps {
  open: boolean;
  onClose: () => void;
  employee: Employee | null;
}

const EmployeeViewModal: React.FC<EmployeeViewModalProps> = ({
  open,
  onClose,
  employee,
}) => {
  if (!employee) return null;

  const formatDate = (dateInput: string | Date) => {
    if (!dateInput) return 'Not specified';
    const date = new Date(dateInput);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getSexLabel = (sex: Sex) => {
    return sex === Sex.male ? 'Male' : 'Female';
  };

  const getLangGradeLabel = (grade: string) => {
    return grade || 'Not specified';
  };

  const getDrivingGradeLabel = (grade: DrivingGrade) => {
    return grade || 'Not specified';
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
        return '#888888';
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: '#1a1a1a',
          color: '#ffffff',
          borderRadius: 2,
        },
      }}
    >
      <DialogTitle sx={{ borderBottom: '1px solid #333', pb: 2 }}>
        <Typography variant="h5" sx={{ color: '#00ffff', fontWeight: 600 }}>
          Employee Details
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        {/* Basic Information */}
        <Typography variant="h6" sx={{ color: '#00ffff', mb: 2 }}>
          Basic Information
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
          <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
            <Typography variant="body2" sx={{ color: '#b0b0b0' }}>Full Name:</Typography>
            <Typography variant="body1" sx={{ color: '#ffffff', mb: 1 }}>{employee.fullName}</Typography>
          </Box>
          <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
            <Typography variant="body2" sx={{ color: '#b0b0b0' }}>Email:</Typography>
            <Typography variant="body1" sx={{ color: '#ffffff', mb: 1 }}>{employee.email}</Typography>
          </Box>
          <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
            <Typography variant="body2" sx={{ color: '#b0b0b0' }}>Phone Number:</Typography>
            <Typography variant="body1" sx={{ color: '#ffffff', mb: 1 }}>{employee.phoneNumber}</Typography>
          </Box>
          <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
            <Typography variant="body2" sx={{ color: '#b0b0b0' }}>Telegram Username:</Typography>
            <Typography variant="body1" sx={{ color: '#ffffff', mb: 1 }}>@{employee.tgUsername}</Typography>
          </Box>
          <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
            <Typography variant="body2" sx={{ color: '#b0b0b0' }}>Sex:</Typography>
            <Typography variant="body1" sx={{ color: '#ffffff', mb: 1 }}>{getSexLabel(employee.sex)}</Typography>
          </Box>
          <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
            <Typography variant="body2" sx={{ color: '#b0b0b0' }}>Birth Date:</Typography>
            <Typography variant="body1" sx={{ color: '#ffffff', mb: 1 }}>{formatDate(employee.birthDate)}</Typography>
          </Box>
          <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
            <Typography variant="body2" sx={{ color: '#b0b0b0' }}>Region:</Typography>
            <Typography variant="body1" sx={{ color: '#ffffff', mb: 1 }}>{employee.region}</Typography>
          </Box>
          <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
            <Typography variant="body2" sx={{ color: '#b0b0b0' }}>Occupation:</Typography>
            <Typography variant="body1" sx={{ color: '#ffffff', mb: 1 }}>{employee.occupation}</Typography>
          </Box>
          <Box sx={{ flex: '1 1 100%', minWidth: 0 }}>
            <Typography variant="body2" sx={{ color: '#b0b0b0' }}>Address:</Typography>
            <Typography variant="body1" sx={{ color: '#ffffff', mb: 1 }}>{employee.address}</Typography>
          </Box>
        </Box>

        <Divider sx={{ borderColor: '#333', my: 3 }} />

        {/* Employment Information */}
        <Typography variant="h6" sx={{ color: '#00ffff', mb: 2 }}>
          Employment Information
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
          <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
            <Typography variant="body2" sx={{ color: '#b0b0b0' }}>Department:</Typography>
            <Typography variant="body1" sx={{ color: '#ffffff', mb: 1 }}>
              {employee.department?.name || 'Unknown'}
            </Typography>
          </Box>
          <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
            <Typography variant="body2" sx={{ color: '#b0b0b0' }}>Position:</Typography>
            <Typography variant="body1" sx={{ color: '#ffffff', mb: 1 }}>
              {employee.position?.title || employee.position?.name || 'Unknown'}
            </Typography>
          </Box>
          <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
            <Typography variant="body2" sx={{ color: '#b0b0b0' }}>Salary:</Typography>
            <Typography variant="body1" sx={{ color: '#00ff88', fontWeight: 600, mb: 1 }}>
              ${(employee.salary || 0).toLocaleString()}
            </Typography>
          </Box>
          <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
            <Typography variant="body2" sx={{ color: '#b0b0b0' }}>Status:</Typography>
            <Chip
              label={employee.employeeStatus || 'Unknown'}
              sx={{
                backgroundColor: getStatusColor(employee.employeeStatus || ''),
                color: '#000000',
                fontWeight: 600,
              }}
            />
          </Box>
          <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
            <Typography variant="body2" sx={{ color: '#b0b0b0' }}>Hire Date:</Typography>
            <Typography variant="body1" sx={{ color: '#ffffff', mb: 1 }}>
              {formatDate(employee.hireDate)}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ borderColor: '#333', my: 3 }} />

        {/* Job Requirements */}
        <Typography variant="h6" sx={{ color: '#00ffff', mb: 2 }}>
          Job Requirements
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
          <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
            <Typography variant="body2" sx={{ color: '#b0b0b0' }}>Desired Position:</Typography>
            <Typography variant="body1" sx={{ color: '#ffffff', mb: 1 }}>
              {employee.jobRequirement?.position || 'Not specified'}
            </Typography>
          </Box>
          <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
            <Typography variant="body2" sx={{ color: '#b0b0b0' }}>Expected Salary:</Typography>
            <Typography variant="body1" sx={{ color: '#00ff88', mb: 1 }}>
              ${(employee.jobRequirement?.salary || 0).toLocaleString()}
            </Typography>
          </Box>
        </Box>

        {/* Experience */}
        {employee.experience && employee.experience.length > 0 && (
          <>
            <Divider sx={{ borderColor: '#333', my: 3 }} />
            <Typography variant="h6" sx={{ color: '#00ffff', mb: 2 }}>
              Work Experience
            </Typography>
            {employee.experience.map((exp, index) => (
              <Box key={index} sx={{ mb: 2, p: 2, backgroundColor: '#2a2a2a', borderRadius: 1 }}>
                <Typography variant="body1" sx={{ color: '#ffffff', fontWeight: 600, mb: 1 }}>
                  {exp.position} at {exp.company}
                </Typography>
                <Typography variant="body2" sx={{ color: '#b0b0b0', mb: 1 }}>
                  {formatDate(exp.from)} - {formatDate(exp.to)}
                </Typography>
                <Typography variant="body2" sx={{ color: '#ffffff' }}>
                  Salary: {exp.salary}
                </Typography>
              </Box>
            ))}
          </>
        )}

        {/* Education */}
        {employee.education && employee.education.length > 0 && (
          <>
            <Divider sx={{ borderColor: '#333', my: 3 }} />
            <Typography variant="h6" sx={{ color: '#00ffff', mb: 2 }}>
              Education
            </Typography>
            {employee.education.map((edu, index) => (
              <Box key={index} sx={{ mb: 2, p: 2, backgroundColor: '#2a2a2a', borderRadius: 1 }}>
                <Typography variant="body1" sx={{ color: '#ffffff', fontWeight: 600, mb: 1 }}>
                  {edu.name}
                </Typography>
                <Typography variant="body2" sx={{ color: '#b0b0b0', mb: 1 }}>
                  {edu.speciality}
                </Typography>
                <Typography variant="body2" sx={{ color: '#ffffff' }}>
                  {formatDate(edu.from)} - {formatDate(edu.to)}
                </Typography>
              </Box>
            ))}
          </>
        )}

        {/* Skills */}
        <Divider sx={{ borderColor: '#333', my: 3 }} />
        <Typography variant="h6" sx={{ color: '#00ffff', mb: 2 }}>
          Skills
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
          <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
            <Typography variant="body2" sx={{ color: '#b0b0b0', mb: 1 }}>Hard Skills:</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {employee.hardSkills && employee.hardSkills.length > 0 ? (
                employee.hardSkills.map((skill, index) => (
                  <Chip
                    key={index}
                    label={skill}
                    size="small"
                    sx={{
                      backgroundColor: '#00ff88',
                      color: '#000000',
                      fontWeight: 500,
                    }}
                  />
                ))
              ) : (
                <Typography variant="body2" sx={{ color: '#888888', fontStyle: 'italic' }}>
                  No hard skills specified
                </Typography>
              )}
            </Box>
          </Box>
          <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
            <Typography variant="body2" sx={{ color: '#b0b0b0', mb: 1 }}>Soft Skills:</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {employee.softSkills && employee.softSkills.length > 0 ? (
                employee.softSkills.map((skill, index) => (
                  <Chip
                    key={index}
                    label={skill}
                    size="small"
                    sx={{
                      backgroundColor: '#ffaa00',
                      color: '#000000',
                      fontWeight: 500,
                    }}
                  />
                ))
              ) : (
                <Typography variant="body2" sx={{ color: '#888888', fontStyle: 'italic' }}>
                  No soft skills specified
                </Typography>
              )}
            </Box>
          </Box>
        </Box>

        {/* Additional Information */}
        <Divider sx={{ borderColor: '#333', my: 3 }} />
        <Typography variant="h6" sx={{ color: '#00ffff', mb: 2 }}>
          Additional Information
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
          <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
            <Typography variant="body2" sx={{ color: '#b0b0b0' }}>Driving License:</Typography>
            <Typography variant="body1" sx={{ color: '#ffffff', mb: 1 }}>
              {employee.drivingLicence && employee.drivingLicence.length > 0
                ? employee.drivingLicence.map(grade => getDrivingGradeLabel(grade)).join(', ')
                : 'None'}
            </Typography>
          </Box>
          <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
            <Typography variant="body2" sx={{ color: '#b0b0b0' }}>Criminal Records:</Typography>
            <Typography variant="body1" sx={{ color: '#ffffff', mb: 1 }}>
              {employee.criminalRecords ? 'Yes' : 'No'}
            </Typography>
          </Box>
          <Box sx={{ flex: '1 1 100%', minWidth: 0 }}>
            <Typography variant="body2" sx={{ color: '#b0b0b0' }}>Extra Information:</Typography>
            <Typography variant="body1" sx={{ color: '#ffffff', mb: 1 }}>
              {employee.extraInfo || 'No additional information'}
            </Typography>
          </Box>
        </Box>

        {/* Language Grades */}
        {employee.langGrades && employee.langGrades.length > 0 && (
          <>
            <Divider sx={{ borderColor: '#333', my: 3 }} />
            <Typography variant="h6" sx={{ color: '#00ffff', mb: 2 }}>
              Language Proficiency
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {employee.langGrades.map((lang, index) => (
                <Chip
                  key={index}
                  label={`${lang.language}: ${getLangGradeLabel(lang.grade)}`}
                  size="small"
                  sx={{
                    backgroundColor: '#4444ff',
                    color: '#ffffff',
                    fontWeight: 500,
                  }}
                />
              ))}
            </Box>
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ borderTop: '1px solid #333', pt: 2 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{
            color: '#00ffff',
            borderColor: '#00ffff',
            '&:hover': {
              borderColor: '#00ffff',
              backgroundColor: 'rgba(0, 255, 255, 0.1)',
            },
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EmployeeViewModal;

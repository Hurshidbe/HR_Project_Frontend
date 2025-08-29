import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Alert,
  Chip,
  Divider,
} from '@mui/material';
import { motion } from 'framer-motion';
import { Candidate, Sex, Region, LangGradeEnum, DrivingGrade } from '../types';

interface ViewCandidateModalProps {
  open: boolean;
  onClose: () => void;
  candidate: Candidate | null;
}

const ViewCandidateModal: React.FC<ViewCandidateModalProps> = ({
  open,
  onClose,
  candidate,
}) => {
  const [error, setError] = useState<string>('');

  // No need to fetch data since we receive the candidate object directly
  useEffect(() => {
    if (open && candidate) {
      setError('');
    }
  }, [open, candidate]);

  const handleClose = () => {
    setError('');
    onClose();
  };

  const formatDate = (dateInput: string | Date) => {
    if (!dateInput || dateInput === 'empty') return 'N/A';
    try {
      const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'Invalid Date';
    }
  };

  const getSexLabel = (sex: Sex) => {
    return sex === Sex.male ? 'Male' : 'Female';
  };

  const getLangGradeLabel = (grade: LangGradeEnum) => {
    return grade === LangGradeEnum.No ? 'No' : grade;
  };

  const getDrivingGradeLabel = (grade: DrivingGrade) => {
    return grade === DrivingGrade.No ? 'No' : grade;
  };

  if (!open) return null;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: '#1a1a1a',
          border: '1px solid rgba(0, 255, 255, 0.3)',
          borderRadius: 3,
          maxHeight: '90vh',
        },
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <DialogTitle sx={{ color: '#00ffff', borderBottom: '1px solid #333' }}>
          {candidate ? `Candidate Details: ${candidate.fullName}` : 'Candidate Details'}
        </DialogTitle>
      </motion.div>

      <DialogContent sx={{ pt: 2 }}>
        {error ? (
          <Alert severity="error" sx={{ backgroundColor: 'rgba(255, 68, 68, 0.1)' }}>
            {error}
          </Alert>
        ) : candidate ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Box sx={{ display: 'grid', gap: 3 }}>
              {/* Personal Information */}
              <Box>
                <Typography variant="h6" sx={{ color: '#00ffff', mb: 2 }}>
                  Personal Information
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                  <Box>
                    <Typography variant="body2" sx={{ color: '#b0b0b0' }}>
                      <strong>Full Name:</strong>
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#ffffff', mb: 1 }}>
                      {candidate.fullName}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" sx={{ color: '#b0b0b0' }}>
                      <strong>Email:</strong>
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#ffffff', mb: 1 }}>
                      {candidate.email}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" sx={{ color: '#b0b0b0' }}>
                      <strong>Phone Number:</strong>
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#ffffff', mb: 1 }}>
                      {candidate.phoneNumber}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" sx={{ color: '#b0b0b0' }}>
                      <strong>Telegram Username:</strong>
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#ffffff', mb: 1 }}>
                      @{candidate.tgUsername}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" sx={{ color: '#b0b0b0' }}>
                      <strong>Sex:</strong>
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#ffffff', mb: 1 }}>
                      {getSexLabel(candidate.sex)}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" sx={{ color: '#b0b0b0' }}>
                      <strong>Birth Date:</strong>
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#ffffff', mb: 1 }}>
                      {formatDate(candidate.birthDate)}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" sx={{ color: '#b0b0b0' }}>
                      <strong>Region:</strong>
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#ffffff', mb: 1 }}>
                      {candidate.region}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" sx={{ color: '#b0b0b0' }}>
                      <strong>Occupation:</strong>
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#ffffff', mb: 1 }}>
                      {candidate.occupation}
                    </Typography>
                  </Box>
                  <Box sx={{ gridColumn: { xs: '1', sm: '1 / -1' } }}>
                    <Typography variant="body2" sx={{ color: '#b0b0b0' }}>
                      <strong>Address:</strong>
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#ffffff', mb: 1 }}>
                      {candidate.address}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              <Divider sx={{ borderColor: '#333' }} />

              {/* Job Requirements */}
              <Box>
                <Typography variant="h6" sx={{ color: '#00ffff', mb: 2 }}>
                  Job Requirements
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                  <Box>
                    <Typography variant="body2" sx={{ color: '#b0b0b0' }}>
                      <strong>Desired Position:</strong>
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#ffffff', mb: 1 }}>
                      {candidate.jobRequirement.position}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" sx={{ color: '#b0b0b0' }}>
                      <strong>Expected Salary:</strong>
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#ffffff', mb: 1 }}>
                      ${candidate.jobRequirement.salary}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              <Divider sx={{ borderColor: '#333' }} />

              {/* Skills */}
              <Box>
                <Typography variant="h6" sx={{ color: '#00ffff', mb: 2 }}>
                  Skills & Qualifications
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                  <Box>
                    <Typography variant="body2" sx={{ color: '#b0b0b0', mb: 1 }}>
                      <strong>Hard Skills:</strong>
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {candidate.hardSkills.map((skill, index) => (
                        <Chip
                          key={index}
                          label={skill}
                          size="small"
                          sx={{
                            backgroundColor: 'rgba(0, 255, 255, 0.1)',
                            color: '#00ffff',
                            border: '1px solid rgba(0, 255, 255, 0.3)',
                          }}
                        />
                      ))}
                    </Box>
                  </Box>
                  <Box>
                    <Typography variant="body2" sx={{ color: '#b0b0b0', mb: 1 }}>
                      <strong>Soft Skills:</strong>
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {candidate.softSkills.map((skill, index) => (
                        <Chip
                          key={index}
                          label={skill}
                          size="small"
                          sx={{
                            backgroundColor: 'rgba(255, 0, 255, 0.1)',
                            color: '#ff00ff',
                            border: '1px solid rgba(255, 0, 255, 0.3)',
                          }}
                        />
                      ))}
                    </Box>
                  </Box>
                  <Box>
                    <Typography variant="body2" sx={{ color: '#b0b0b0', mb: 1 }}>
                      <strong>Driving License:</strong>
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {candidate.drivingLicence.map((grade, index) => (
                        <Chip
                          key={index}
                          label={getDrivingGradeLabel(grade)}
                          size="small"
                          sx={{
                            backgroundColor: 'rgba(255, 170, 0, 0.1)',
                            color: '#ffaa00',
                            border: '1px solid rgba(255, 170, 0, 0.3)',
                          }}
                        />
                      ))}
                    </Box>
                  </Box>
                  <Box>
                    <Typography variant="body2" sx={{ color: '#b0b0b0', mb: 1 }}>
                      <strong>Criminal Records:</strong>
                    </Typography>
                    <Chip
                      label={candidate.criminalRecords ? 'Yes' : 'No'}
                      size="small"
                      sx={{
                        backgroundColor: candidate.criminalRecords 
                          ? 'rgba(255, 68, 68, 0.1)' 
                          : 'rgba(0, 255, 136, 0.1)',
                        color: candidate.criminalRecords ? '#ff4444' : '#00ff88',
                        border: `1px solid ${candidate.criminalRecords ? '#ff4444' : '#00ff88'}40`,
                      }}
                    />
                  </Box>
                </Box>
              </Box>

              <Divider sx={{ borderColor: '#333' }} />

              {/* Language Skills */}
              {candidate.langGrades.length > 0 && (
                <>
                  <Box>
                    <Typography variant="h6" sx={{ color: '#00ffff', mb: 2 }}>
                      Language Skills
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {candidate.langGrades.map((lang, index) => (
                        <Chip
                          key={index}
                          label={`${lang.language}: ${lang.grade}`}
                          size="small"
                          sx={{
                            backgroundColor: 'rgba(0, 255, 136, 0.1)',
                            color: '#00ff88',
                            border: '1px solid rgba(0, 255, 136, 0.3)',
                          }}
                        />
                      ))}
                    </Box>
                  </Box>
                  <Divider sx={{ borderColor: '#333' }} />
                </>
              )}

              {/* Experience */}
              {candidate.experience.length > 0 && (
                <>
                  <Box>
                    <Typography variant="h6" sx={{ color: '#00ffff', mb: 2 }}>
                      Work Experience
                    </Typography>
                    {candidate.experience.map((exp, index) => (
                      <Box key={index} sx={{ mb: 2, p: 2, backgroundColor: 'rgba(255, 255, 255, 0.02)', borderRadius: 1 }}>
                        <Typography variant="subtitle1" sx={{ color: '#ffffff', fontWeight: 600 }}>
                          {exp.position} at {exp.company}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#b0b0b0', mb: 1 }}>
                          {formatDate(exp.from)} - {exp.to ? formatDate(exp.to) : 'Present'}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#ffffff' }}>
                          Salary: ${exp.salary}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                  <Divider sx={{ borderColor: '#333' }} />
                </>
              )}

              {/* Education */}
              {candidate.education.length > 0 && (
                <>
                  <Box>
                    <Typography variant="h6" sx={{ color: '#00ffff', mb: 2 }}>
                      Education
                    </Typography>
                    {candidate.education.map((edu, index) => (
                      <Box key={index} sx={{ mb: 2, p: 2, backgroundColor: 'rgba(255, 255, 255, 0.02)', borderRadius: 1 }}>
                        <Typography variant="subtitle1" sx={{ color: '#ffffff', fontWeight: 600 }}>
                          {edu.name} - {edu.speciality}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#b0b0b0' }}>
                          {formatDate(edu.from)} - {edu.to ? formatDate(edu.to) : 'Present'}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                  <Divider sx={{ borderColor: '#333' }} />
                </>
              )}

              {/* Courses */}
              {candidate.course.length > 0 && (
                <>
                  <Box>
                    <Typography variant="h6" sx={{ color: '#00ffff', mb: 2 }}>
                      Courses & Certifications
                    </Typography>
                    {candidate.course.map((course, index) => (
                      <Box key={index} sx={{ mb: 2, p: 2, backgroundColor: 'rgba(255, 255, 255, 0.02)', borderRadius: 1 }}>
                        <Typography variant="subtitle1" sx={{ color: '#ffffff', fontWeight: 600 }}>
                          {course.name}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#b0b0b0', mb: 1 }}>
                          {course.profession}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#b0b0b0' }}>
                          {formatDate(course.from)} - {course.to ? formatDate(course.to) : 'Present'}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                  <Divider sx={{ borderColor: '#333' }} />
                </>
              )}

              {/* Additional Information */}
              {candidate.extraInfo && candidate.extraInfo !== 'empty' && (
                <Box>
                  <Typography variant="h6" sx={{ color: '#00ffff', mb: 2 }}>
                    Additional Information
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#ffffff' }}>
                    {candidate.extraInfo}
                  </Typography>
                </Box>
              )}
            </Box>
          </motion.div>
        ) : null}
      </DialogContent>

      <DialogActions sx={{ p: 2, borderTop: '1px solid #333' }}>
        <Button
          onClick={handleClose}
          sx={{ color: '#b0b0b0' }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ViewCandidateModal;

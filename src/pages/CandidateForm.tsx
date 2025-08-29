import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Sex, 
  Region, 
  LangGradeEnum, 
  DrivingGrade,
  CreateCandidateDto,
  JobRequirementDto,
  ExperienceDto,
  EducationDto,
  CourseDto,
  LangGradeDto
} from '../types';
import apiService from '../services/api';

const CandidateForm: React.FC = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [backendStatus, setBackendStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');
  const [countdown, setCountdown] = useState(15);

  // Check backend connection on component mount
  useEffect(() => {
    const checkBackendConnection = async () => {
      try {
        await apiService.getAllCandidates();
        setBackendStatus('connected');
      } catch (error) {
        setBackendStatus('disconnected');
      }
    };
    
    checkBackendConnection();

    // Load saved form data if available
    const savedData = localStorage.getItem('candidateFormData');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        setFormData(parsedData);
      } catch (error) {
        console.log('Could not load saved form data');
      }
    }
  }, []);

  // Handle countdown timer when success page is shown
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (submitSuccess && countdown > 0) {
      interval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            navigate('/');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [submitSuccess, countdown, navigate]);

  // Cleanup countdown when component unmounts
  useEffect(() => {
    return () => {
      setCountdown(0);
    };
  }, []);

  const [formData, setFormData] = useState<Omit<CreateCandidateDto, 'birthDate' | 'experience' | 'education' | 'course'> & {
    birthDate: string;
    experience: Array<Omit<ExperienceDto, 'from' | 'to'> & { from: string; to: string }>;
    education: Array<Omit<EducationDto, 'from' | 'to'> & { from: string; to: string }>;
    course: Array<Omit<CourseDto, 'from' | 'to'> & { from: string; to: string }>;
  }>({
    fullName: '',
    sex: Sex.male,
    birthDate: '',
    phoneNumber: '',
    email: '',
    tgUsername: '',
    region: Region.Toshkent,
    address: '',
    occupation: '',
    jobRequirement: {
      position: '',
      salary: 0
    },
    experience: [],
    education: [],
    course: [],
    langGrades: [],
    hardSkills: [],
    softSkills: [],
    drivingLicence: [],
    criminalRecords: false,
    extraInfo: ''
  });

  const [skillInputs, setSkillInputs] = useState({
    hardSkill: '',
    softSkill: ''
  });

  const addExperience = () => {
    setFormData(prev => ({
      ...prev,
      experience: [...prev.experience, {
        position: '',
        company: '',
        salary: '',
        from: '',
        to: ''
      }]
    }));
  };

  const removeExperience = (index: number) => {
    setFormData(prev => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index)
    }));
  };

  const updateExperience = (index: number, field: keyof ExperienceDto, value: string) => {
    setFormData(prev => ({
      ...prev,
      experience: prev.experience.map((exp, i) => 
        i === index ? { ...exp, [field]: value } : exp
      )
    }));
  };

  const addEducation = () => {
    setFormData(prev => ({
      ...prev,
      education: [...prev.education, {
        name: '',
        speciality: '',
        from: '',
        to: ''
      }]
    }));
  };

  const removeEducation = (index: number) => {
    setFormData(prev => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index)
    }));
  };

  const updateEducation = (index: number, field: keyof EducationDto, value: string) => {
    setFormData(prev => ({
      ...prev,
      education: prev.education.map((edu, i) => 
        i === index ? { ...edu, [field]: value } : edu
      )
    }));
  };

  const addCourse = () => {
    setFormData(prev => ({
      ...prev,
      course: [...prev.course, {
        name: '',
        profession: '',
        from: '',
        to: ''
      }]
    }));
  };

  const removeCourse = (index: number) => {
    setFormData(prev => ({
      ...prev,
      course: prev.course.filter((_, i) => i !== index)
    }));
  };

  const updateCourse = (index: number, field: keyof CourseDto, value: string) => {
    setFormData(prev => ({
      ...prev,
      course: prev.course.map((crs, i) => 
        i === index ? { ...crs, [field]: value } : crs
      )
    }));
  };

  const addLangGrade = () => {
    setFormData(prev => ({
      ...prev,
      langGrades: [...prev.langGrades, {
        language: '',
        grade: ''
      }]
    }));
  };

  const removeLangGrade = (index: number) => {
    setFormData(prev => ({
      ...prev,
      langGrades: prev.langGrades.filter((_, i) => i !== index)
    }));
  };

  const updateLangGrade = (index: number, field: keyof LangGradeDto, value: string) => {
    setFormData(prev => ({
      ...prev,
      langGrades: prev.langGrades.map((lang, i) => 
        i === index ? { ...lang, [field]: value } : lang
      )
    }));
  };

  const addHardSkill = () => {
    if (skillInputs.hardSkill.trim()) {
      setFormData(prev => ({
        ...prev,
        hardSkills: [...prev.hardSkills, skillInputs.hardSkill.trim()]
      }));
      setSkillInputs(prev => ({ ...prev, hardSkill: '' }));
    }
  };

  const removeHardSkill = (index: number) => {
    setFormData(prev => ({
      ...prev,
      hardSkills: prev.hardSkills.filter((_, i) => i !== index)
    }));
  };

  const addSoftSkill = () => {
    if (skillInputs.softSkill.trim()) {
      setFormData(prev => ({
        ...prev,
        softSkills: [...prev.softSkills, skillInputs.softSkill.trim()]
      }));
      setSkillInputs(prev => ({ ...prev, softSkill: '' }));
    }
  };

  const removeSoftSkill = (index: number) => {
    setFormData(prev => ({
      ...prev,
      softSkills: prev.softSkills.filter((_, i) => i !== index)
    }));
  };

  const handleManualExit = () => {
    setCountdown(0);
    navigate('/');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError('');

    try {
      // Convert date strings to Date objects for backend
      const submitData: CreateCandidateDto = {
        ...formData,
        birthDate: new Date(formData.birthDate),
        experience: formData.experience.map(exp => ({
          ...exp,
          from: new Date(exp.from),
          to: new Date(exp.to)
        })),
        education: formData.education.map(edu => ({
          ...edu,
          from: new Date(edu.from),
          to: new Date(edu.to)
        })),
        course: formData.course.map(crs => ({
          ...crs,
          from: new Date(crs.from),
          to: new Date(crs.to)
        }))
      };

      const response = await apiService.createCandidate(submitData);

      if (response.success) {
        setSubmitSuccess(true);
        setCountdown(15); // Reset countdown to 15 seconds
        // Countdown timer will handle the redirect automatically
      } else {
        setSubmitError(response.errors?.[0] || 'Failed to submit candidate form');
      }
    } catch (error: any) {
      if (error.message.includes('Backend server is not running')) {
        setSubmitError('❌ Backend server is not running. Please start the backend server on port 5000 to submit the form.');
      } else if (error.message.includes('ERR_CONNECTION_REFUSED')) {
        setSubmitError('❌ Cannot connect to backend server. Please ensure the backend is running on port 5000.');
      } else if (error.message.includes('Backend authentication issue')) {
        setSubmitError('🔐 ' + error.message);
      } else if (error.message.includes('Backend error:')) {
        setSubmitError('❌ ' + error.message);
      } else {
        setSubmitError(error.message || 'Network error. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-lg p-8 text-center shadow-2xl max-w-md"
        >
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Success!</h2>
          <p className="text-gray-600 mb-4">Your candidate application has been submitted successfully.</p>
          
          {/* Telegram Bot Information */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <div className="text-blue-800 text-sm">
              <p className="font-medium mb-2">📱 Want to receive updates about your application?</p>
              <p className="mb-3">Start our Telegram bot to get notified about your candidate status:</p>
              <a 
                href="https://t.me/hr111_bot" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                🤖 Start HR Bot
              </a>
            </div>
          </div>
          
          <p className="text-sm text-gray-500 mb-4">
            Redirecting to home page in <span className="font-bold text-blue-600">{countdown}</span> seconds...
          </p>
          
          {/* Exit Button */}
          <button
            onClick={handleManualExit}
            className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition-colors font-medium"
          >
            Exit Now
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-800 rounded-lg shadow-xl overflow-hidden border border-purple-500/30"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-white">Candidate Application Form</h1>
              <button
                onClick={() => navigate('/')}
                className="text-white hover:text-gray-200 transition-colors"
              >
                ← Back to Home
              </button>
            </div>
          </div>

          {/* Backend Connection Status */}
          <div className={`px-6 py-3 text-sm font-medium ${
            backendStatus === 'connected' 
              ? 'bg-green-900/50 text-green-300 border-b border-green-500/30' 
              : backendStatus === 'disconnected' 
              ? 'bg-red-900/50 text-red-300 border-b border-red-500/30' 
              : 'bg-yellow-900/50 text-yellow-300 border-b border-yellow-500/30'
          }`}>
            {backendStatus === 'checking' && '🔄 Checking backend connection...'}
            {backendStatus === 'connected' && '✅ Backend connected - Form submission available'}
            {backendStatus === 'disconnected' && '❌ Backend disconnected - Form submission will fail. Please start the backend server on port 5000.'}
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-8 bg-slate-800">
            {submitError && (
              <div className="bg-red-900/50 border border-red-500/50 text-red-300 px-4 py-3 rounded">
                {submitError}
              </div>
            )}

            {/* Personal Information */}
            <div className="bg-slate-700 p-6 rounded-lg border border-purple-500/20 shadow-lg">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                <span className="w-2 h-2 bg-purple-400 rounded-full mr-3 animate-pulse"></span>
                Personal Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-600 border border-purple-500/30 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 text-white placeholder-gray-400"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Sex *
                  </label>
                  <select
                    required
                    value={formData.sex}
                    onChange={(e) => setFormData(prev => ({ ...prev, sex: e.target.value as Sex }))}
                    className="w-full px-3 py-2 bg-slate-600 border border-purple-500/30 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 text-white"
                  >
                    <option value={Sex.male}>Male</option>
                    <option value={Sex.female}>Female</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Birth Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.birthDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, birthDate: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-600 border border-purple-500/30 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-600 border border-purple-500/30 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 text-white placeholder-gray-400"
                    placeholder="Enter your phone number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-600 border border-purple-500/30 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 text-white placeholder-gray-400"
                    placeholder="Enter your email"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Telegram Username *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.tgUsername}
                    onChange={(e) => setFormData(prev => ({ ...prev, tgUsername: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-600 border border-purple-500/30 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 text-white placeholder-gray-400"
                    placeholder="Enter your Telegram username"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Region *
                  </label>
                  <select
                    required
                    value={formData.region}
                    onChange={(e) => setFormData(prev => ({ ...prev, region: e.target.value as Region }))}
                    className="w-full px-3 py-2 bg-slate-600 border border-purple-500/30 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 text-white"
                  >
                    {Object.values(Region).map(region => (
                      <option key={region} value={region}>{region}</option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Address *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.address}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-600 border border-purple-500/30 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 text-white placeholder-gray-400"
                    placeholder="Enter your address"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Occupation *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.occupation}
                    onChange={(e) => setFormData(prev => ({ ...prev, occupation: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-600 border border-purple-500/30 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 text-white placeholder-gray-400"
                    placeholder="Enter your occupation"
                  />
                </div>
              </div>
            </div>

            {/* Job Requirements */}
            <div className="bg-slate-700 p-6 rounded-lg border border-purple-500/20 shadow-lg">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                <span className="w-2 h-2 bg-blue-400 rounded-full mr-3 animate-pulse"></span>
                Job Requirements
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Desired Position *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.jobRequirement.position}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      jobRequirement: { ...prev.jobRequirement, position: e.target.value }
                    }))}
                    className="w-full px-3 py-2 bg-slate-600 border border-purple-500/30 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 text-white placeholder-gray-400"
                    placeholder="Enter desired position"
                  />
                </div>

                                 <div>
                   <label className="block text-sm font-medium text-gray-300 mb-2">
                     Expected Salary ($) *
                   </label>
                   <div className="relative">
                     <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">$</span>
                     <input
                       type="number"
                       required
                       min="0"
                       value={formData.jobRequirement.salary}
                       onChange={(e) => setFormData(prev => ({
                         ...prev,
                         jobRequirement: { ...prev.jobRequirement, salary: Number(e.target.value) }
                       }))}
                       className="w-full pl-8 pr-3 py-2 bg-slate-600 border border-purple-500/30 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 text-white placeholder-gray-400"
                       placeholder="Enter expected salary"
                     />
                   </div>
                 </div>
              </div>
            </div>

            {/* Experience */}
            <div className="bg-slate-700 p-6 rounded-lg border border-purple-500/20 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white flex items-center">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-3 animate-pulse"></span>
                  Work Experience
                </h2>
                <button
                  type="button"
                  onClick={addExperience}
                  className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-md hover:from-green-600 hover:to-emerald-600 transition-all duration-300 shadow-lg hover:shadow-green-500/25"
                >
                  + Add Experience
                </button>
              </div>
              
              {formData.experience.map((exp, index) => (
                <div key={index} className="border border-purple-500/30 rounded-lg p-4 mb-4 bg-slate-600 shadow-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-white">Experience #{index + 1}</h3>
                    <button
                      type="button"
                      onClick={() => removeExperience(index)}
                      className="text-red-400 hover:text-red-300 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Position
                      </label>
                      <input
                        type="text"
                        placeholder="Position"
                        value={exp.position}
                        onChange={(e) => updateExperience(index, 'position', e.target.value)}
                        className="w-full px-3 py-2 bg-slate-500 border border-purple-500/30 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 text-white placeholder-gray-400"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Company
                      </label>
                      <input
                        type="text"
                        placeholder="Company"
                        value={exp.company}
                        onChange={(e) => updateExperience(index, 'company', e.target.value)}
                        className="w-full px-3 py-2 bg-slate-500 border border-purple-500/30 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 text-white placeholder-gray-400"
                      />
                    </div>
                                         <div>
                       <label className="block text-sm font-medium text-gray-300 mb-2">
                         Salary ($)
                       </label>
                       <div className="relative">
                         <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">$</span>
                         <input
                           type="text"
                           placeholder="Salary"
                           value={exp.salary}
                           onChange={(e) => updateExperience(index, 'salary', e.target.value)}
                           className="w-full pl-8 pr-3 py-2 bg-slate-500 border border-purple-500/30 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 text-white placeholder-gray-400"
                         />
                       </div>
                     </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        From Date
                      </label>
                      <input
                        type="date"
                        value={exp.from}
                        onChange={(e) => updateExperience(index, 'from', e.target.value)}
                        className="w-full px-3 py-2 bg-slate-500 border border-purple-500/30 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        To Date
                      </label>
                      <input
                        type="date"
                        value={exp.to}
                        onChange={(e) => updateExperience(index, 'to', e.target.value)}
                        className="w-full px-3 py-2 bg-slate-500 border border-purple-500/30 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 text-white"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Education */}
            <div className="bg-slate-700 p-6 rounded-lg border border-purple-500/20 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white flex items-center">
                  <span className="w-2 h-2 bg-yellow-400 rounded-full mr-3 animate-pulse"></span>
                  Education
                </h2>
                <button
                  type="button"
                  onClick={addEducation}
                  className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-md hover:from-yellow-600 hover:to-orange-600 transition-all duration-300 shadow-lg hover:shadow-yellow-500/25"
                >
                  + Add Education
                </button>
              </div>
              
              {formData.education.map((edu, index) => (
                <div key={index} className="border border-purple-500/30 rounded-lg p-4 mb-4 bg-slate-600 shadow-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-white">Education #{index + 1}</h3>
                    <button
                      type="button"
                      onClick={() => removeEducation(index)}
                      className="text-red-400 hover:text-red-300 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Institution Name
                      </label>
                      <input
                        type="text"
                        placeholder="Institution Name"
                        value={edu.name}
                        onChange={(e) => updateEducation(index, 'name', e.target.value)}
                        className="w-full px-3 py-2 bg-slate-500 border border-purple-500/30 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 text-white placeholder-gray-400"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Speciality/Field
                      </label>
                      <input
                        type="text"
                        placeholder="Speciality/Field"
                        value={edu.speciality}
                        onChange={(e) => updateEducation(index, 'speciality', e.target.value)}
                        className="w-full px-3 py-2 bg-slate-500 border border-purple-500/30 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 text-white placeholder-gray-400"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        From Date
                      </label>
                      <input
                        type="date"
                        value={edu.from}
                        onChange={(e) => updateEducation(index, 'from', e.target.value)}
                        className="w-full px-3 py-2 bg-slate-500 border border-purple-500/30 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        To Date
                      </label>
                      <input
                        type="date"
                        value={edu.to}
                        onChange={(e) => updateEducation(index, 'to', e.target.value)}
                        className="w-full px-3 py-2 bg-slate-500 border border-purple-500/30 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 text-white"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Courses */}
            <div className="bg-slate-700 p-6 rounded-lg border border-purple-500/20 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white flex items-center">
                  <span className="w-2 h-2 bg-pink-400 rounded-full mr-3 animate-pulse"></span>
                  Courses & Certifications
                </h2>
                <button
                  type="button"
                  onClick={addCourse}
                  className="px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-md hover:from-pink-600 hover:to-rose-600 transition-all duration-300 shadow-lg hover:shadow-pink-500/25"
                >
                  + Add Course
                </button>
              </div>
              
              {formData.course.map((crs, index) => (
                <div key={index} className="border border-purple-500/30 rounded-lg p-4 mb-4 bg-slate-600 shadow-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-white">Course #{index + 1}</h3>
                    <button
                      type="button"
                      onClick={() => removeCourse(index)}
                      className="text-red-400 hover:text-red-300 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Course Name
                      </label>
                      <input
                        type="text"
                        placeholder="Course Name"
                        value={crs.name}
                        onChange={(e) => updateCourse(index, 'name', e.target.value)}
                        className="w-full px-3 py-2 bg-slate-500 border border-purple-500/30 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 text-white placeholder-gray-400"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Profession/Field
                      </label>
                      <input
                        type="text"
                        placeholder="Profession/Field"
                        value={crs.profession}
                        onChange={(e) => updateCourse(index, 'profession', e.target.value)}
                        className="w-full px-3 py-2 bg-slate-500 border border-purple-500/30 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 text-white placeholder-gray-400"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        From Date
                      </label>
                      <input
                        type="date"
                        value={crs.from}
                        onChange={(e) => updateCourse(index, 'from', e.target.value)}
                        className="w-full px-3 py-2 bg-slate-500 border border-purple-500/30 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        To Date
                      </label>
                      <input
                        type="date"
                        value={crs.to}
                        onChange={(e) => updateCourse(index, 'to', e.target.value)}
                        className="w-full px-3 py-2 bg-slate-500 border border-purple-500/30 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 text-white"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Language Skills */}
            <div className="bg-slate-700 p-6 rounded-lg border border-purple-500/20 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white flex items-center">
                  <span className="w-2 h-2 bg-indigo-400 rounded-full mr-3 animate-pulse"></span>
                  Language Skills
                </h2>
                <button
                  type="button"
                  onClick={addLangGrade}
                  className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-md hover:from-indigo-600 hover:to-purple-600 transition-all duration-300 shadow-lg hover:shadow-indigo-500/25"
                >
                  + Add Language
                </button>
              </div>
              
              {formData.langGrades.map((lang, index) => (
                <div key={index} className="border border-purple-500/30 rounded-lg p-4 mb-4 bg-slate-600 shadow-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-white">Language #{index + 1}</h3>
                    <button
                      type="button"
                      onClick={() => removeLangGrade(index)}
                      className="text-red-400 hover:text-red-300 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Language"
                      value={lang.language}
                      onChange={(e) => updateLangGrade(index, 'language', e.target.value)}
                      className="px-3 py-2 bg-slate-500 border border-purple-500/30 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 text-white placeholder-gray-400"
                    />
                    <select
                      value={lang.grade}
                      onChange={(e) => updateLangGrade(index, 'grade', e.target.value)}
                      className="px-3 py-2 bg-slate-500 border border-purple-500/30 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 text-white"
                    >
                      <option value="">Select Grade</option>
                      {Object.values(LangGradeEnum).map(grade => (
                        <option key={grade} value={grade}>{grade}</option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
            </div>

            {/* Skills */}
            <div className="bg-slate-700 p-6 rounded-lg border border-purple-500/20 shadow-lg">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                <span className="w-2 h-2 bg-cyan-400 rounded-full mr-3 animate-pulse"></span>
                Skills
              </h2>
              
              {/* Hard Skills */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">Hard Skills</label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    placeholder="Add hard skill"
                    value={skillInputs.hardSkill}
                    onChange={(e) => setSkillInputs(prev => ({ ...prev, hardSkill: e.target.value }))}
                    className="flex-1 px-3 py-2 bg-slate-600 border border-purple-500/30 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 text-white placeholder-gray-400"
                  />
                  <button
                    type="button"
                    onClick={addHardSkill}
                    className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-md hover:from-cyan-600 hover:to-blue-600 transition-all duration-300 shadow-lg hover:shadow-cyan-500/25"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.hardSkills.map((skill, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-cyan-900/50 text-cyan-300 border border-cyan-500/30"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeHardSkill(index)}
                        className="ml-2 text-cyan-400 hover:text-cyan-300 transition-colors"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Soft Skills */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">Soft Skills</label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    placeholder="Add soft skill"
                    value={skillInputs.softSkill}
                    onChange={(e) => setSkillInputs(prev => ({ ...prev, softSkill: e.target.value }))}
                    className="flex-1 px-3 py-2 bg-slate-600 border border-purple-500/30 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 text-white placeholder-gray-400"
                  />
                  <button
                    type="button"
                    onClick={addSoftSkill}
                    className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-md hover:from-emerald-600 hover:to-green-600 transition-all duration-300 shadow-lg hover:shadow-emerald-500/25"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.softSkills.map((skill, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-emerald-900/50 text-emerald-300 border border-emerald-500/30"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSoftSkill(index)}
                        className="ml-2 text-emerald-400 hover:text-emerald-300 transition-colors"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Driving License */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Driving License</label>
                <div className="flex flex-wrap gap-2">
                  {Object.values(DrivingGrade).map(grade => {
                    const isNoSelected = formData.drivingLicence.includes(DrivingGrade.No);
                    const isOtherSelected = formData.drivingLicence.some(g => g !== DrivingGrade.No);
                    const isDisabled = (grade === DrivingGrade.No && isOtherSelected) || 
                                     (grade !== DrivingGrade.No && isNoSelected);
                    
                    return (
                      <label key={grade} className={`inline-flex items-center ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
                        <input
                          type="checkbox"
                          checked={formData.drivingLicence.includes(grade)}
                          disabled={isDisabled}
                          onChange={(e) => {
                            if (e.target.checked) {
                              if (grade === DrivingGrade.No) {
                                // If "No" is selected, clear all other options
                                setFormData(prev => ({
                                  ...prev,
                                  drivingLicence: [DrivingGrade.No]
                                }));
                              } else {
                                // If other option is selected, remove "No" and add the new option
                                setFormData(prev => ({
                                  ...prev,
                                  drivingLicence: prev.drivingLicence
                                    .filter(g => g !== DrivingGrade.No)
                                    .concat(grade)
                                }));
                              }
                            } else {
                              // Remove the unchecked option
                              setFormData(prev => ({
                                ...prev,
                                drivingLicence: prev.drivingLicence.filter(g => g !== grade)
                              }));
                            }
                          }}
                          className="mr-2 accent-purple-500"
                        />
                        <span className="text-sm text-gray-300">{grade}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="bg-slate-700 p-6 rounded-lg border border-purple-500/20 shadow-lg">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                <span className="w-2 h-2 bg-rose-400 rounded-full mr-3 animate-pulse"></span>
                Additional Information
              </h2>
              
              <div className="mb-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.criminalRecords}
                    onChange={(e) => setFormData(prev => ({ ...prev, criminalRecords: e.target.checked }))}
                    className="mr-2 accent-purple-500"
                  />
                  <span className="text-sm text-gray-300">I have criminal records</span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Additional Information
                </label>
                <textarea
                  value={formData.extraInfo}
                  onChange={(e) => setFormData(prev => ({ ...prev, extraInfo: e.target.value }))}
                  rows={4}
                  placeholder="Any additional information you'd like to share..."
                  className="w-full px-3 py-2 bg-slate-600 border border-purple-500/30 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 text-white placeholder-gray-400"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              {backendStatus === 'disconnected' && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      localStorage.setItem('candidateFormData', JSON.stringify(formData));
                      alert('Form data saved locally! You can retrieve it later when the backend is running.');
                    }}
                    className="px-6 py-3 bg-gradient-to-r from-slate-600 to-slate-700 text-white font-semibold rounded-lg hover:from-slate-700 hover:to-slate-800 transition-all duration-300 shadow-lg hover:shadow-slate-500/25 border border-slate-500/30"
                  >
                    💾 Save Locally
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const savedData = localStorage.getItem('candidateFormData');
                      if (savedData) {
                        try {
                          const parsedData = JSON.parse(savedData);
                          setFormData(parsedData);
                          alert('Saved form data loaded successfully!');
                        } catch (error) {
                          alert('Could not load saved form data.');
                        }
                      } else {
                        alert('No saved form data found.');
                      }
                    }}
                    className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white font-semibold rounded-lg hover:from-emerald-700 hover:to-green-700 transition-all duration-300 shadow-lg hover:shadow-emerald-500/25 border border-emerald-500/30"
                  >
                    📂 Load Saved Data
                  </button>
                </>
              )}
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-purple-500/25 border border-purple-500/30"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Application'}
              </button>
            </div>

            {/* Backend Help Message */}
            {backendStatus === 'disconnected' && (
              <div className="mt-6 p-4 bg-slate-600/50 border border-purple-500/30 rounded-lg">
                <h3 className="text-sm font-medium text-purple-300 mb-2">💡 How to start the backend server:</h3>
                <ol className="text-sm text-gray-300 space-y-1 list-decimal list-inside">
                  <li>Open a new terminal/command prompt</li>
                  <li>Navigate to the <code className="bg-slate-700 px-1 rounded border border-purple-500/30">HR_Project_backend</code> folder</li>
                  <li>Run <code className="bg-slate-700 px-1 rounded border border-purple-500/30">npm install</code> (if not done already)</li>
                  <li>Run <code className="bg-slate-700 px-1 rounded border border-purple-500/30">npm run start:dev</code> or <code className="bg-slate-700 px-1 rounded border border-purple-500/30">npm start</code></li>
                  <li>Wait for the message "Server running on port 5000"</li>
                  <li>Refresh this page to check connection status</li>
                </ol>
                
                <div className="mt-4 p-3 bg-yellow-900/30 border border-yellow-500/30 rounded">
                  <h4 className="text-sm font-medium text-yellow-300 mb-2">⚠️ Known Issue:</h4>
                  <p className="text-sm text-yellow-200">
                    If you get an "Authorization header is not defined" error, this means the backend is incorrectly requiring authentication for the candidate creation endpoint. 
                    This is a backend configuration issue that needs to be fixed by the backend administrator.
                  </p>
                </div>
              </div>
            )}
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default CandidateForm;

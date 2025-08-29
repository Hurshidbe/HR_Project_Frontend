// Enums
export enum Sex {
  male = 'male',
  female = 'famale', // Fixed to match backend typo
}

export enum Region {
  Toshkent = 'Toshkent',
  Namangan = 'Namangan',
  Sirdaryo = 'Sirdaryo',
  Andijon = 'Andijon',
  Fargona = 'Fargona',
  Jizzax = 'Jizzax',
  Qashqadaryo = 'Qashqadaryo',
  Navoiy = 'Navoiy',
  Buxoro = 'Buxoro',
  Samarqand = 'Samarqand',
  Surxondaryo = 'Surxondaryo',
  Xorazm = 'Xorazm',
}

export enum LangGradeEnum {
  No = 'No',
  A1 = 'A1',
  A2 = 'A2',
  B1 = 'B1',
  B2 = 'B2',
  C1 = 'C1',
  C2 = 'C2',
}

export enum DrivingGrade {
  No = 'No',
  A = 'A',
  B = 'B',
  C = 'C',
  D = 'D',
  E = 'E',
  F = 'F',
}

export enum CandidateStatuses {
  pending = 'PENDING',
  accepted = 'ACCEPTED',
  rejected = 'REJECTED',
  reviewing = 'REVIEWING',
}

export enum UserRole {
  SuperAdmin = 'superadmin',
  Admin = 'admin',
}

export enum EmployeeStatusEnum {
  working = 'working',
  fired = 'fired',
  probation = 'probation',
}

// DTOs
export interface LoginDto {
  username: string;
  password: string;
}

export interface CreateAdminDto {
  username: string;
  password: string;
  role: UserRole;
}

export interface JobRequirementDto {
  position: string;
  salary: number;
}

export interface ExperienceDto {
  position: string;
  company: string;
  salary: string;
  from: Date;
  to: Date;
}

export interface EducationDto {
  name: string;
  speciality: string;
  from: Date;
  to: Date;
}

export interface CourseDto {
  name: string;
  profession: string;
  from: Date;
  to: Date;
}

export interface LangGradeDto {
  language: string;
  grade: string;
}

export interface CreateCandidateDto {
  fullName: string;
  sex: Sex;
  birthDate: Date;
  phoneNumber: string;
  email: string;
  tgUsername: string;
  region: Region;
  address: string;
  occupation: string;
  jobRequirement: JobRequirementDto;
  experience: ExperienceDto[];
  education: EducationDto[];
  course: CourseDto[];
  langGrades: LangGradeDto[];
  hardSkills: string[];
  softSkills: string[];
  drivingLicence: DrivingGrade[];
  criminalRecords: boolean;
  extraInfo: string;
  status?: CandidateStatuses;
  telegramId?: number;
}

export interface AcceptCandidateDto {
  department: Department;
  position: Position;
  salary: number;
  employeeStatus: EmployeeStatusEnum;
}

export interface CreateDepartmentDto {
  name: string;
  description?: string;
}

export interface CreatePositionDto {
  title: string;
  departmentId: string;
  description?: string;
  requirements?: string[];
}

// Entities
export interface User {
  _id: string;
  username: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface Candidate {
  _id: string;
  fullName: string;
  sex: Sex;
  birthDate: string;
  phoneNumber: string;
  email: string;
  tgUsername: string;
  region: Region;
  address: string;
  occupation: string;
  jobRequirement: JobRequirementDto;
  experience: ExperienceDto[];
  education: EducationDto[];
  course: CourseDto[];
  langGrades: LangGradeDto[];
  hardSkills: string[];
  softSkills: string[];
  drivingLicence: DrivingGrade[];
  criminalRecords: boolean;
  extraInfo: string;
  status: CandidateStatuses;
  telegramId?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Department {
  _id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Position {
  _id: string;
  title: string;
  name?: string; // Adding name field for compatibility
  departmentId: string;
  description?: string;
  requirements?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Employee {
  _id: string;
  fullName: string;
  sex: Sex;
  birthDate: string;
  phoneNumber: string;
  email: string;
  tgUsername: string;
  region: Region;
  address: string;
  occupation: string;
  jobRequirement: JobRequirementDto;
  experience: ExperienceDto[];
  education: EducationDto[];
  course: CourseDto[];
  langGrades: LangGradeDto[];
  hardSkills: string[];
  softSkills: string[];
  drivingLicence: DrivingGrade[];
  criminalRecords: boolean;
  extraInfo: string;
  telegramId?: number;
  department: Department;
  position: Position;
  salary: number;
  employeeStatus: EmployeeStatusEnum;
  hireDate: string;
  createdAt: string;
  updatedAt: string;
}

// API Response
export interface CustomBackendResponse<T = any> {
  success: boolean;
  data: T;
  errors?: string[];
}

// Auth Context
export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading?: boolean;
  isSuperAdmin: () => boolean;
  isAdmin: () => boolean;
}



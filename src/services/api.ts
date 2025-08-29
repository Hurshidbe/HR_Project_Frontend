import axios, { AxiosInstance } from 'axios';
import { 
  LoginDto, 
  CreateAdminDto, 
  CreateCandidateDto, 
  AcceptCandidateDto,
  CreateDepartmentDto,
  CreatePositionDto,
  CustomBackendResponse,
  User,
  Candidate,
  Department,
  Position,
  Employee
} from '../types';

class ApiService {
  private api: AxiosInstance;
  private baseURL: string;

  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    console.log('API Service initialized with baseURL:', this.baseURL);
    
    this.api = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      withCredentials: false, // Disable credentials for CORS
    });

    // Add response interceptor to handle authentication errors
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401 || error.response?.status === 403) {
          // Clear invalid token on authentication errors
          this.removeAuthToken();
          localStorage.removeItem('user');
          // You might want to redirect to login here
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );

    // Add request interceptor to include auth token
    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem('token');
      console.log('Request interceptor - Token found:', !!token, 'URL:', config.url);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('Authorization header set:', config.headers.Authorization);
        console.log('Full headers:', config.headers);
      } else {
        console.warn('No token found in localStorage for request to:', config.url);
        console.warn('localStorage contents:', {
          token: localStorage.getItem('token'),
          user: localStorage.getItem('user'),
          allKeys: Object.keys(localStorage)
        });
      }
      return config;
    });
  }

  // Auth endpoints
  async login(data: LoginDto): Promise<CustomBackendResponse<{ status: string; token: string }>> {
    try {
      console.log('Attempting login to:', `${this.baseURL}/api/v1/api/v1/users/login`);
      const response = await this.api.post('/api/v1/api/v1/users/login', data);
      console.log('Login response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Login error details:', {
        message: error.message,
        code: error.code,
        response: error.response?.data,
        status: error.response?.status,
        url: error.config?.url
      });
      
      if (error?.code === 'ERR_NETWORK' || error?.message?.includes('ERR_CONNECTION_REFUSED')) {
        throw new Error(`Network error: Cannot connect to backend server at ${this.baseURL}. Please ensure the backend is running on port 5000.`);
      } else if (error?.response?.data?.message) {
        throw new Error(`Backend error: ${error.response.data.message}`);
      } else {
        throw new Error(`Login failed: ${error.message}`);
      }
    }
  }

  // User endpoints
  async getAllUsers(): Promise<CustomBackendResponse<{ all: User[] }>> {
    // Check if user is superadmin
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (user.role !== 'superadmin') {
      throw new Error('Access denied: Only superadmin users can view all users');
    }
    
    try {
      const response = await this.api.get('/api/v1/api/v1/users');
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getUserById(id: string): Promise<CustomBackendResponse<{ findOne: User }>> {
    // Check if user is superadmin
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.role !== 'superadmin') {
      throw new Error('Access denied: Only superadmin users can view user details');
    }
    
    const response = await this.api.get(`/api/v1/api/v1/users/${id}`);
    return response.data;
  }

  async createUser(data: CreateAdminDto): Promise<CustomBackendResponse<{ admin: User }>> {
    // Check if user is superadmin
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.role !== 'superadmin') {
      throw new Error('Access denied: Only superadmin users can create new users');
    }
    
    const response = await this.api.post('/api/v1/api/v1/users', data);
    return response.data;
  }

  async updateUser(id: string, data: LoginDto): Promise<CustomBackendResponse<{ updated: User }>> {
    // Check if user is superadmin
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.role !== 'superadmin') {
      throw new Error('Access denied: Only superadmin users can update users');
    }
    
    const response = await this.api.patch(`/api/v1/api/v1/users/${id}`, data);
    return response.data;
  }

  async deleteUser(id: string): Promise<CustomBackendResponse<{ removed: User }>> {
    // Check if user is superadmin
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.role !== 'superadmin') {
      throw new Error('Access denied: Only superadmin users can delete users');
    }
    
    const response = await this.api.delete(`/api/v1/api/v1/users/${id}`);
    return response.data;
  }

  // Candidate endpoints
  async createCandidate(data: CreateCandidateDto): Promise<CustomBackendResponse<Candidate>> {
    try {
      const response = await this.api.post('/api/v1/api/v1/candidates', data);
      return response.data;
    } catch (error: any) {
      if (error?.code === 'ERR_NETWORK' || error?.message?.includes('ERR_CONNECTION_REFUSED')) {
        // Backend server is not running - provide helpful error message
        throw new Error('Backend server is not running. Please start the backend server on port 5000 or check the connection.');
      } else if (error?.response?.data?.message?.includes('Authorization header is not defined or incorrect')) {
        // Backend is expecting Authorization header even though it should be public
        throw new Error('Backend authentication issue: The candidate creation endpoint requires authentication even though it should be public. Please contact the backend administrator to fix this issue.');
      } else if (error?.response?.data?.message) {
        // Backend returned a specific error message
        throw new Error(`Backend error: ${error.response.data.message}`);
      } else {
        throw error;
      }
    }
  }

  async getAllCandidates(query?: any): Promise<CustomBackendResponse<Candidate[]>> {
    const response = await this.api.get('/api/v1/api/v1/candidates', { params: query });
    return response.data;
  }

  async rejectCandidate(id: string): Promise<CustomBackendResponse<Candidate>> {
    const response = await this.api.patch(`/api/v1/api/v1/candidates/${id}/reject`);
    return response.data;
  }

  async acceptCandidate(id: string, data: AcceptCandidateDto): Promise<CustomBackendResponse<{ accepted: Employee }>> {
    console.log('acceptCandidate called with:', { id, data });
    console.log('Current token in localStorage:', localStorage.getItem('token'));
    console.log('Current token in apiService:', this.getAuthToken());
    
    try {
      const response = await this.api.patch(`/api/v1/api/v1/candidates/${id}/accept`, data);
      console.log('acceptCandidate response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('acceptCandidate error:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Error headers:', error.response?.headers);
      throw error;
    }
  }

  async getCandidateById(id: string): Promise<CustomBackendResponse<{ updated: Candidate }>> {
    const response = await this.api.get(`/api/v1/api/v1/candidates/${id}`);
    return response.data;
  }

  async deleteCandidate(id: string): Promise<CustomBackendResponse<any>> {
    try {
      console.log('Making DELETE request to:', `/api/v1/api/v1/candidates/${id}`);
      const response = await this.api.delete(`/api/v1/api/v1/candidates/${id}`);
      console.log('Delete response received:', response);
      return response.data;
    } catch (error: any) {
      console.error('deleteCandidate API error:', error.response?.data || error.message);
      throw error;
    }
  }

  // Department endpoints
  async createDepartment(data: CreateDepartmentDto): Promise<CustomBackendResponse<Department>> {
    const response = await this.api.post('/api/v1/departments', data);
    return response.data;
  }

  async getAllDepartments(): Promise<CustomBackendResponse<{ data: Department[] }>> {
    const response = await this.api.get('/api/v1/departments');
    return response.data;
  }

  async getDepartmentsWithPositions(): Promise<CustomBackendResponse<{ data: Department[] }>> {
    const response = await this.api.get('/api/v1/departments/with-positions');
    return response.data;
  }

  async getDepartmentById(id: string): Promise<CustomBackendResponse<{ data: Department }>> {
    const response = await this.api.get(`/api/v1/departments/${id}`);
    return response.data;
  }

  async updateDepartment(id: string, data: CreateDepartmentDto): Promise<CustomBackendResponse<{ updated: Department }>> {
    const response = await this.api.patch(`/api/v1/departments/${id}`, data);
    return response.data;
  }

  async deleteDepartment(id: string): Promise<CustomBackendResponse<{ removed: Department }>> {
    const response = await this.api.delete(`/api/v1/departments/${id}`);
    return response.data;
  }

  // Position endpoints
  async createPosition(data: CreatePositionDto): Promise<CustomBackendResponse<{ created: Position }>> {
    const response = await this.api.post('/api/v1/position', data);
    return response.data;
  }

  async getAllPositions(): Promise<CustomBackendResponse<{ data: Position[] }>> {
    const response = await this.api.get('/api/v1/position');
    return response.data;
  }

  async getPositionsWithDepartments(): Promise<CustomBackendResponse<{ data: Position[] }>> {
    const response = await this.api.get('/api/v1/position/with-departments');
    return response.data;
  }

  async getPositionsByDepartment(departmentId: string): Promise<CustomBackendResponse<{ data: Position[] }>> {
    try {
      // Get all positions with departments and filter by department ID
      const response = await this.api.get('/api/v1/position/with-departments');
      console.log('🔍 getPositionsByDepartment full response:', response);
      console.log('🔍 getPositionsByDepartment response.data:', response.data);
      console.log('🔍 getPositionsByDepartment response.data.data:', response.data?.data);
      
      if (response.data?.success) {
        // The backend returns { data: { data: positions[] } }
        // So we need to access response.data.data.data
        const positionsData = response.data.data?.data;
        
        // Check if positionsData exists and is an array
        if (!positionsData || !Array.isArray(positionsData)) {
          console.error('❌ Invalid data structure:', response.data);
          console.error('❌ positionsData type:', typeof positionsData);
          console.error('❌ positionsData isArray:', Array.isArray(positionsData));
          throw new Error(`Invalid data structure received from API. Expected array, got: ${typeof positionsData}`);
        }
        
        const filteredPositions = positionsData.filter((position: any) => {
          console.log('🔍 Checking position:', position, 'departmentId:', position.departmentId);
          // Handle both string and ObjectId types for departmentId
          const positionDeptId = position.departmentId?._id || position.departmentId;
          const matches = positionDeptId === departmentId || positionDeptId?.toString() === departmentId;
          console.log('🔍 Department ID comparison:', { positionDeptId, departmentId, matches });
          return matches;
        });
        
        console.log('✅ Filtered positions for department', departmentId, ':', filteredPositions);
        
        // Return the filtered positions in the same format as the original response
        return {
          success: true,
          data: { data: filteredPositions },
          errors: []
        };
      } else {
        console.error('❌ API response not successful:', response.data);
        throw new Error(`API request failed: ${response.data?.errors?.join(', ') || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error fetching positions by department:', error);
      throw error;
    }
  }

  async getPositionById(id: string): Promise<CustomBackendResponse<{ data: Position }>> {
    const response = await this.api.get(`/api/v1/position/${id}`);
    return response.data;
  }

  async updatePosition(id: string, data: CreatePositionDto): Promise<CustomBackendResponse<{ updated: Position }>> {
    const response = await this.api.patch(`/api/v1/position/${id}`, data);
    return response.data;
  }

  async deletePosition(id: string): Promise<CustomBackendResponse<{ deleted: Position }>> {
    const response = await this.api.delete(`/api/v1/position/${id}`);
    return response.data;
  }



  // Employee endpoints
  async getAllEmployees(): Promise<CustomBackendResponse<{ employees: Employee[] }>> {
    const response = await this.api.get('/api/v1/employee');
    return response.data;
  }

  async getEmployeeById(id: string): Promise<CustomBackendResponse<{ employee: Employee }>> {
    const response = await this.api.get(`/api/v1/employee/${id}`);
    return response.data;
  }

  async updateEmployeeSalary(id: string, newSalary: number): Promise<CustomBackendResponse<{ updated: Employee }>> {
    const response = await this.api.patch(`/api/v1/employee/${id}/salary`, { newSalary });
    return response.data;
  }

  async updateEmployeePosition(id: string, newPosition: Position): Promise<CustomBackendResponse<{ updated: Employee }>> {
    try {
      const response = await this.api.patch(`/api/v1/employee/${id}/position`, {
        newPosition,
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.errors?.[0] || 'Failed to update employee position');
    }
  }

  async updateEmployeeDepartment(id: string, newDepartment: string): Promise<CustomBackendResponse<{ updated: Employee }>> {
    try {
      const response = await this.api.patch(`/api/v1/employee/${id}/department`, {
        newDepartment,
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.errors?.[0] || 'Failed to update employee department');
    }
  }

  async updateEmployeeStatus(id: string, newStatus: string): Promise<CustomBackendResponse<{ updated: Employee }>> {
    try {
      console.log('Updating employee status:', { id, newStatus });
      const response = await this.api.patch(`/api/v1/employee/${id}/status`, { status: newStatus });
      console.log('Status update response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Status update error:', error);
      if (error.response?.data?.errors?.[0]) {
        throw new Error(error.response.data.errors[0]);
      } else if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else {
        throw new Error(error.message || 'Failed to update employee status');
      }
    }
  }

  // Test method to check if status endpoint is accessible
  async testStatusEndpoint(): Promise<boolean> {
    try {
      console.log('Testing status endpoint accessibility...');
      const response = await this.api.options(`/api/v1/employee/test/status`);
      console.log('Status endpoint test response:', response);
      return true;
    } catch (error: any) {
      console.error('Status endpoint test failed:', error);
      return false;
    }
  }

  // Test method to check if we can reach the employee module
  async testEmployeeModule(): Promise<boolean> {
    try {
      console.log('Testing employee module accessibility...');
      const response = await this.api.get(`/api/v1/employee`);
      console.log('Employee module test response:', response);
      return true;
    } catch (error: any) {
      console.error('Employee module test failed:', error);
      return false;
    }
  }

  // History endpoints
  async getSalaryHistory(): Promise<CustomBackendResponse<{ salaryHistory: any[] }>> {
    const response = await this.api.get('/api/v1/history/salary');
    return response.data;
  }

  async getPositionHistory(): Promise<CustomBackendResponse<{ positionHistory: any[] }>> {
    const response = await this.api.get('/api/v1/history/position');
    return response.data;
  }

  async getSalaryHistoryByEmployee(employeeId: string): Promise<CustomBackendResponse<{ salaryHistory: any[] }>> {
    const response = await this.api.get(`/api/v1/history/salary/employee/${employeeId}`);
    return response.data;
  }

  async getPositionHistoryByEmployee(employeeId: string): Promise<CustomBackendResponse<{ positionHistory: any[] }>> {
    const response = await this.api.get(`/api/v1/history/position/employee/${employeeId}`);
    return response.data;
  }

  // Test method for history controller
  async testHistoryController(): Promise<any> {
    try {
      console.log('🧪 Testing history controller...');
      const response = await this.api.get('/api/v1/history/test');
      console.log('✅ History test response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ History test failed:', error);
      throw error;
    }
  }

  // Create test history data
  async createTestHistoryData(): Promise<any> {
    try {
      console.log('🧪 Creating test history data...');
      const response = await this.api.post('/api/v1/history/create-test-data');
      console.log('✅ Test data creation response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Test data creation failed:', error);
      throw error;
    }
  }



  // Utility methods
  getBaseURL(): string {
    return this.baseURL;
  }

  setAuthToken(token: string): void {
    localStorage.setItem('token', token);
  }

  removeAuthToken(): void {
    localStorage.removeItem('token');
  }

  getAuthToken(): string | null {
    return localStorage.getItem('token');
  }

  // Validate current authentication token
  async validateCurrentToken(): Promise<boolean> {
    try {
      const token = this.getAuthToken();
      if (!token) return false;
      
      // Instead of calling getAllUsers (which has role restrictions),
      // we'll just check if the token exists and is not empty
      return token.length > 0;
    } catch (error) {
      return false;
    }
  }
}

export const apiService = new ApiService();
export default apiService;

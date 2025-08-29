# HR Management System Frontend

A modern React-based frontend for the HR Management System, featuring a comprehensive candidate application form and admin dashboard.

## Features

### 🏠 Home Page
- **Create Candidate Form**: Direct access to the comprehensive candidate application form
- **Login as Admin**: Secure admin access to the management dashboard
- Modern, responsive design with smooth animations

### 📝 Candidate Application Form
The form includes all fields matching the backend schema:

#### Personal Information
- Full Name, Sex, Birth Date
- Phone Number, Email, Telegram Username
- Region, Address, Occupation

#### Job Requirements
- Desired Position
- Expected Salary

#### Work Experience
- Dynamic addition/removal of experience entries
- Position, Company, Salary, Date Range

#### Education
- Dynamic addition/removal of education entries
- Institution Name, Speciality, Date Range

#### Courses & Certifications
- Dynamic addition/removal of course entries
- Course Name, Profession, Date Range

#### Language Skills
- Dynamic addition/removal of language entries
- Language name and proficiency grade (A1-C2)

#### Skills
- **Hard Skills**: Technical skills with tag-based input
- **Soft Skills**: Interpersonal skills with tag-based input
- **Driving License**: Multiple choice selection

#### Additional Information
- Criminal Records checkbox
- Additional Information textarea

### 🔐 Admin Dashboard
- **Candidates Management**: View, accept, reject candidates
- **Employees Management**: Manage hired employees
- **Departments & Positions**: Organizational structure management
- **User Management**: Admin user administration

## Technology Stack

- **React 19** with TypeScript
- **React Router** for navigation
- **TailwindCSS** for styling
- **Framer Motion** for animations
- **Material-UI** for admin components
- **Axios** for API communication

## Installation & Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd hr-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   Create a `.env` file in the root directory:
   ```env
   REACT_APP_API_URL=http://localhost:3000/api/v1
   ```

4. **Start development server**
   ```bash
   npm start
   ```

5. **Build for production**
   ```bash
   npm run build
   ```

## Project Structure

```
src/
├── components/          # Reusable UI components
├── contexts/           # React contexts (Auth)
├── hooks/              # Custom React hooks
├── pages/              # Page components
│   ├── Home.tsx        # Landing page
│   ├── CandidateForm.tsx # Candidate application form
│   ├── Login.tsx       # Admin login
│   ├── Dashboard.tsx   # Admin dashboard
│   └── ...            # Other admin pages
├── services/           # API services
├── types/              # TypeScript type definitions
└── utils/              # Utility functions
```

## API Integration

The frontend integrates with the backend API endpoints:

- **POST /api/v1/candidates** - Create new candidate
- **GET /api/v1/candidates** - Fetch all candidates
- **PATCH /api/v1/candidates/:id/accept** - Accept candidate
- **PATCH /api/v1/candidates/:id/reject** - Reject candidate

## Form Validation

The candidate form includes comprehensive validation:

- **Required Fields**: All mandatory fields are marked with asterisks
- **Date Validation**: Proper date format validation
- **Email Validation**: Standard email format validation
- **Dynamic Validation**: Real-time validation feedback

## Responsive Design

The application is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile devices

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Development

### Code Style
- TypeScript for type safety
- ESLint for code quality
- Prettier for code formatting

### State Management
- React hooks for local state
- Context API for global state (authentication)

### Styling
- TailwindCSS for utility-first styling
- Custom CSS for specific components
- Responsive design principles

## Deployment

### Build Process
```bash
npm run build
```

### Deployment Options
- **Netlify**: Drag and drop the `build` folder
- **Vercel**: Connect GitHub repository
- **AWS S3**: Upload build files to S3 bucket
- **Docker**: Use the provided Dockerfile

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## Roadmap

- [ ] Enhanced form validation
- [ ] File upload support
- [ ] Multi-language support
- [ ] Advanced search and filtering
- [ ] Export functionality
- [ ] Mobile app version

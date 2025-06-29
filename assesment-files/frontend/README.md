# Project Management System - Frontend

A modern Angular-based project management system with role-based access control and real-time notifications.

## Features

### 🔐 Authentication
- **Login Form**: Users can select their role (Admin or Viewer) during login
- **Role-based Access Control**: Different permissions for Admins and Viewers
- **Secure Token Management**: JWT-based authentication with local storage

### 📋 Project Management
- **Project List View**: Display all projects with live updates every 30 seconds
- **Role-based UI**: 
  - **Admins**: Can create, edit, and delete projects
  - **Viewers**: Can only view projects and notifications
- **Project Form**: Comprehensive form with validations for creating/editing projects
- **Project Details**: Name, description, status, dates, budget, manager, and team members

### 🔔 Live Notifications
- **Real-time Updates**: Simulated notifications every 30 seconds
- **Toast Notifications**: Using ngx-toastr for user feedback
- **Notification Center**: Dropdown menu with unread count badge
- **Project-specific Notifications**: Automatic notifications for project actions

### 🎨 UI/UX Features
- **Modern Design**: Material Design components with Bootstrap styling
- **Responsive Layout**: Works on desktop, tablet, and mobile devices
- **Interactive Elements**: Hover effects, animations, and smooth transitions
- **Loading States**: Spinners and loading indicators
- **Error Handling**: User-friendly error messages

## Technology Stack

- **Frontend Framework**: Angular 17 (Standalone Components)
- **UI Components**: Angular Material
- **Styling**: Bootstrap 5 + Custom CSS
- **State Management**: RxJS Observables and BehaviorSubjects
- **HTTP Client**: Angular HttpClient
- **Notifications**: ngx-toastr
- **Routing**: Angular Router with Guards

## Project Structure

```
src/
├── app/
│   ├── _services/
│   │   ├── user-api.service.ts      # User authentication API
│   │   ├── project-api.service.ts   # Project CRUD operations
│   │   └── notification.service.ts  # Real-time notifications
│   ├── guard/
│   │   └── user-auth.guard.ts       # Route protection
│   ├── pages/
│   │   ├── home/                    # Landing page with login/signup
│   │   ├── login/                   # Login component
│   │   ├── sign-up/                 # Registration component
│   │   ├── project-list/            # Project dashboard
│   │   └── project-form/            # Create/edit project form
│   └── app.routes.ts               # Application routing
└── environments/
    └── environment.ts              # API configuration
```

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- Angular CLI (v17)
- Backend API running on `http://localhost:5000/`

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Open your browser**
   Navigate to `http://localhost:4200`

## API Endpoints

The frontend expects the following backend API endpoints:

### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login

### Projects
- `GET /projects` - Get all projects
- `GET /projects/:id` - Get project by ID
- `POST /projects` - Create new project
- `PUT /projects/:id` - Update project
- `DELETE /projects/:id` - Delete project

### Notifications
- `GET /notifications` - Get notifications

## Usage

### For Admins
1. Login with Admin role
2. View all projects in the dashboard
3. Click "New Project" to create projects
4. Use edit/delete buttons on project cards
5. Monitor notifications in the header

### For Viewers
1. Login with Viewer role
2. View all projects (read-only)
3. Monitor notifications and project updates
4. No access to create/edit/delete functions

## Features in Detail

### Project Form Validations
- **Name**: Required, 3-100 characters
- **Description**: Required, 10-500 characters
- **Status**: Required (Pending/Active/Completed)
- **Start Date**: Required
- **End Date**: Optional, must be after start date
- **Budget**: Required, positive number
- **Manager**: Required, 2-50 characters
- **Team Members**: Optional, dynamic list

### Live Updates
- Projects refresh automatically every 30 seconds
- Notifications appear in real-time
- Toast messages for user actions
- Unread notification count in header

### Responsive Design
- Mobile-first approach
- Bootstrap grid system
- Material Design components
- Touch-friendly interface

## Development

### Adding New Features
1. Create components in `src/app/pages/`
2. Add services in `src/app/_services/`
3. Update routing in `src/app/app.routes.ts`
4. Add guards if needed in `src/app/guard/`

### Styling
- Use Bootstrap classes for layout
- Material Design for components
- Custom CSS in component files
- Global styles in `src/styles.css`

## Build and Deploy

### Production Build
```bash
npm run build
```

### SSR Build (if needed)
```bash
npm run build:ssr
```

## Contributing

1. Follow Angular coding standards
2. Use TypeScript strict mode
3. Add proper error handling
4. Include unit tests for new features
5. Update documentation

## License

This project is licensed under the MIT License.

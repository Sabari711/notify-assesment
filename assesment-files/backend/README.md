# Project Management Backend

A NestJS backend application with Socket.IO, MongoDB, and role-based access control (RBAC) for project management.

## Features

- **Authentication**: JWT-based authentication with user registration and login
- **Role-Based Access Control**: Admin and Viewer roles with different permissions
- **Project Management**: CRUD operations for projects
- **Real-time Notifications**: Socket.IO integration for live notifications
- **MongoDB Integration**: Mongoose ODM for data persistence

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

## Installation

1. Clone the repository and navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp env.example .env
```

4. Update the `.env` file with your configuration:
```env
MONGODB_URI=mongodb://localhost:27017/project-management
JWT_SECRET=your-super-secret-jwt-key
PORT=3000
```

5. Start the development server:
```bash
npm run start:dev
```

The application will be available at `http://localhost:3000`

## API Endpoints

### Authentication

#### POST /auth/register
Register a new user
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "role": "viewer"
}
```

#### POST /auth/login
Login user
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

### Projects (Requires Authentication)

#### GET /projects
Get all projects (Admin, Viewer)

#### GET /projects/:id
Get project by ID (Admin, Viewer)

#### POST /projects
Create new project (Admin only)
```json
{
  "name": "Project Name",
  "description": "Project description",
  "status": "active"
}
```

#### PATCH /projects/:id
Update project (Admin only)
```json
{
  "name": "Updated Project Name",
  "description": "Updated description",
  "status": "completed"
}
```

#### DELETE /projects/:id
Delete project (Admin only)

## Role-Based Access Control

### Admin Role
- Can create, read, update, and delete projects
- Can manage all projects

### Viewer Role
- Can only read projects
- Receives real-time notifications

## WebSocket Events

### Connection
- `connected`: Sent when client connects
- `disconnected`: Sent when client disconnects

### Notifications
- `notification`: Real-time notifications for project changes
  - `project_created`: When a new project is created
  - `project_updated`: When a project is updated
  - `project_deleted`: When a project is deleted

### Room Management
- `joinRoom`: Join a specific room
- `leaveRoom`: Leave a specific room

## WebSocket Client Example

```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000');

socket.on('connected', (data) => {
  console.log('Connected:', data);
});

socket.on('notification', (notification) => {
  console.log('Notification:', notification);
});

// Join a room
socket.emit('joinRoom', 'general');
```

## Database Schema

### User Schema
```typescript
{
  email: string (unique, required),
  password: string (hashed, required),
  name: string (required),
  role: 'admin' | 'viewer' (default: 'viewer'),
  createdAt: Date,
  updatedAt: Date
}
```

### Project Schema
```typescript
{
  name: string (required),
  description: string (optional),
  status: string (default: 'active'),
  createdBy: ObjectId (ref: User, required),
  createdAt: Date,
  updatedAt: Date
}
```

## Development

### Available Scripts

- `npm run start`: Start the application
- `npm run start:dev`: Start in development mode with hot reload
- `npm run build`: Build the application
- `npm run test`: Run tests
- `npm run test:e2e`: Run end-to-end tests
- `npm run lint`: Run ESLint

### Project Structure

```
src/
├── auth/                 # Authentication module
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── auth.module.ts
│   └── jwt.strategy.ts
├── users/               # Users module
│   ├── users.service.ts
│   ├── users.module.ts
│   └── schemas/
│       └── user.schema.ts
├── projects/            # Projects module
│   ├── projects.controller.ts
│   ├── projects.service.ts
│   ├── projects.module.ts
│   └── schemas/
│       └── project.schema.ts
├── websocket/           # WebSocket module
│   ├── notification.service.ts
│   ├── websocket.gateway.ts
│   └── websocket.module.ts
├── common/              # Shared components
│   ├── dto/            # Data Transfer Objects
│   ├── guards/         # Authentication guards
│   └── decorators/     # Custom decorators
├── app.module.ts        # Main application module
└── main.ts             # Application entry point
```

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control
- Input validation with class-validator
- CORS configuration

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| MONGODB_URI | MongoDB connection string | mongodb://localhost:27017/project-management |
| JWT_SECRET | JWT signing secret | your-secret-key |
| PORT | Server port | 3000 |
| NODE_ENV | Environment | development |

## Testing

Run the test suite:
```bash
npm run test
```

Run tests in watch mode:
```bash
npm run test:watch
```

## Deployment

1. Build the application:
```bash
npm run build
```

2. Start in production mode:
```bash
npm run start:prod
```

## License

 
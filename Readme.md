# ThinkNest - Note Taking Application

A full-stack notes management application built with MongoDB, Express.js, React, and Node.js (MERN stack). This application provides a comprehensive platform for creating, organizing, and managing notes with rich text editing capabilities, user authentication, and advanced search functionality.

## Live Demo

**Application**: [https://think-nest.netlify.app](https://think-nest.netlify.app)  
**API Endpoint**: [https://thinknest-backend.vercel.app/api](https://thinknest-backend.vercel.app/api)

The application is deployed and ready to use:
- Frontend hosted on Netlify
- Backend hosted on Vercel
- Database hosted on MongoDB Atlas

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [Testing](#testing)
- [Deployment](#deployment)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Development Workflow](#development-workflow)
- [Git Branches](#git-branches)

## Features

### User Management
- User registration with email verification
- Secure login with JWT-based authentication
- Password reset functionality via email
- User profile management
- Session management with refresh tokens

### Notes Management
- Create, read, update, and delete notes
- Rich text editor with formatting options:
  - Text formatting (Bold, Italic, Underline)
  - Headings (H1, H2, H3)
  - Lists (Bullet and Numbered)
  - Text alignment (Left, Center, Right)
  - Blockquotes and code blocks
- Color-coded notes with gradient backgrounds
- Pin important notes to the top
- Archive notes for organization
- Tag-based categorization
- Search functionality across titles and content
- Filter notes by tags, pinned status, and archived status
- Statistics dashboard showing total, pinned, and archived notes

### User Interface
- Responsive design with Tailwind CSS
- Dark mode support
- Masonry grid layout for notes display
- Smooth animations and transitions
- Toast notifications for user feedback
- Modal-based interactions

## Tech Stack

### Frontend
- **React 19.2.0** - UI library
- **TypeScript 5.9.3** - Type-safe JavaScript
- **Vite 7.2.4** - Build tool and dev server
- **React Router DOM 7.11.0** - Client-side routing
- **Tiptap 3.19.0** - Rich text editor
- **Tailwind CSS 4.1.18** - Utility-first CSS framework
- **Axios 1.13.2** - HTTP client
- **Lucide React 0.562.0** - Icon library
- **React Hot Toast 2.6.0** - Toast notifications
- **Vitest 4.0.18** - Unit testing framework
- **Testing Library** - React component testing

### Backend
- **Node.js** - Runtime environment
- **Express 4.18.2** - Web framework
- **MongoDB 7.0.0** - NoSQL database
- **Mongoose 8.0.3** - MongoDB ODM
- **JWT (jsonwebtoken 9.0.3)** - Authentication tokens
- **bcryptjs 3.0.3** - Password hashing
- **Nodemailer 6.9.16** - Email sending
- **Pino 10.3.0** - Logging library
- **Mocha 11.7.5** - Testing framework
- **Chai 6.2.2** - Assertion library
- **Supertest 7.2.2** - HTTP testing

## Prerequisites

Before running this application, ensure you have the following installed:

- **Node.js** (version 18.x or higher)
- **npm** (comes with Node.js)
- **MongoDB** (version 6.x or higher)
  - Local installation or MongoDB Atlas account
- **Git** (for cloning the repository)

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/MuhammadAli7896/muhammad-ali-mern-10pshine.git
cd muhammad-ali-mern-10pshine
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

### 3. Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

## Configuration

### Backend Configuration

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a `.env` file by copying the example file:
```bash
cp .env.example .env
```

3. Update the `.env` file with your configuration:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/notes

# JWT Secrets (IMPORTANT: Change these in production)
JWT_ACCESS_SECRET=your_strong_access_secret_here_minimum_32_characters
JWT_REFRESH_SECRET=your_strong_refresh_secret_here_minimum_32_characters

# Email Configuration (Gmail SMTP)
# Follow these steps:
# 1. Go to https://myaccount.google.com/security
# 2. Enable 2-Step Verification
# 3. Go to https://myaccount.google.com/apppasswords
# 4. Create app password for "Mail" and "Other (Custom name)"
# 5. Use the 16-character app password below
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-16-character-app-password

# Client URL for CORS
CLIENT_URL=http://localhost:5173
```

### Frontend Configuration

The frontend automatically connects to `http://localhost:5000` for API requests in development mode. No additional configuration is required for local development.

To change the API URL, update the `baseURL` in:
- `frontend/src/lib/api.ts`
- `frontend/src/lib/notesApi.ts`

### MongoDB Setup

#### Option 1: Local MongoDB
1. Install MongoDB Community Edition
2. Start MongoDB service:
   - **Windows**: MongoDB runs as a service automatically
   - **macOS**: `brew services start mongodb-community`
   - **Linux**: `sudo systemctl start mongod`

#### Option 2: MongoDB Atlas (Cloud)
1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Get your connection string
4. Update `MONGODB_URI` in `.env` with the Atlas connection string

## Running the Application

### Development Mode

#### Start Backend Server

```bash
cd backend
npm run dev
```

The backend server will start on `http://localhost:5000`

#### Start Frontend Development Server

Open a new terminal:

```bash
cd frontend
npm run dev
```

The frontend will start on `http://localhost:5173`

#### Access the Application

Open your browser and navigate to:
```
http://localhost:5173
```

### Production Mode

#### Build Frontend

```bash
cd frontend
npm run build
```

This creates an optimized production build in the `dist` folder.

#### Start Backend in Production Mode

```bash
cd backend
npm run prod
```

## Testing

### Frontend Tests

The frontend includes comprehensive unit tests using Vitest and React Testing Library.

```bash
cd frontend

# Run tests
npm test

# Run tests with UI
npm run test:ui

# Run tests once
npm run test:run

# Run tests with coverage
npm run test:coverage
```

**Test Coverage**: 54 passing tests covering:
- Component rendering and interactions
- Form validation
- User authentication flows
- Search and filter functionality
- Note CRUD operations

### Backend Tests

The backend includes integration tests using Mocha, Chai, and Supertest.

```bash
cd backend

# Run tests
npm test

# Run tests in watch mode
npm run test:watch
```

**Test Coverage**: 56 passing tests covering:
- Authentication endpoints
- User registration and login
- Password reset flow
- Notes CRUD operations
- Authorization middleware
- Database operations

## Deployment

The application is deployed using:
- **Frontend**: Netlify (https://think-nest.netlify.app)
- **Backend**: Vercel (https://thinknest-backend.vercel.app)
- **Database**: MongoDB Atlas

### Quick Deploy

#### Prerequisites
- Netlify CLI installed: `npm install -g netlify-cli`
- Vercel CLI installed: `npm install -g vercel`
- Netlify account
- Vercel account
- MongoDB Atlas account (or MongoDB instance)

#### Deploy Backend to Vercel

```bash
cd backend

# Create vercel.json (already included in this repo)

# Deploy
vercel --prod

# Add environment variables
vercel env add MONGODB_URI production
vercel env add JWT_ACCESS_SECRET production
vercel env add JWT_REFRESH_SECRET production
vercel env add EMAIL_USER production
vercel env add EMAIL_PASS production
vercel env add CLIENT_URL production

# Redeploy with environment variables
vercel --prod
```

#### Deploy Frontend to Netlify

```bash
cd frontend

# Create .env.production with your Vercel backend URL
echo "VITE_API_URL=https://your-backend.vercel.app/api" > .env.production

# Build
npm run build

# Deploy
netlify deploy --prod
```

### Deployment Configuration Files

The repository includes:
- `backend/vercel.json` - Vercel configuration for Express.js
- `frontend/netlify.toml` - Netlify build configuration
- `frontend/.env.production` - Production API endpoint

For detailed deployment instructions, troubleshooting, and monitoring, see [DEPLOYMENT.md](./DEPLOYMENT.md)

## Project Structure

### Backend Structure

```
backend/
├── config/
│   └── database.js          # MongoDB connection configuration
├── controllers/
│   ├── authController.js    # Authentication logic
│   └── notesController.js   # Notes CRUD logic
├── middleware/
│   ├── auth.js             # JWT authentication middleware
│   └── errorHandler.js     # Global error handling
├── models/
│   ├── User.js             # User schema and model
│   └── Note.js             # Note schema and model
├── routes/
│   ├── auth.js             # Authentication routes
│   └── notes.js            # Notes routes
├── utils/
│   ├── logger.js           # Pino logger configuration
│   ├── tokenUtils.js       # JWT token utilities
│   ├── emailService.js     # Email sending service
│   └── responseHandler.js  # Standardized API responses
├── test/
│   ├── auth.test.js        # Authentication tests
│   └── notes.test.js       # Notes tests
├── .env.example            # Environment variables template
├── package.json            # Dependencies and scripts
└── server.js               # Express app entry point
```

### Frontend Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── AddEditNoteModal.tsx      # Note creation/editing modal
│   │   ├── NoteCard.tsx              # Individual note card
│   │   ├── RichTextEditor.tsx        # Tiptap rich text editor
│   │   ├── SearchBar.tsx             # Search and filter component
│   │   ├── UserProfileModal.tsx      # User profile management
│   │   ├── PasswordInput.tsx         # Password input with visibility toggle
│   │   ├── ProtectedRoute.tsx        # Route protection HOC
│   │   └── PublicRoute.tsx           # Public route HOC
│   ├── pages/
│   │   ├── Home.tsx                  # Landing page
│   │   ├── Login.tsx                 # Login page
│   │   ├── Signup.tsx                # Registration page
│   │   ├── Notes.tsx                 # Main notes dashboard
│   │   └── NotFound.tsx              # 404 page
│   ├── context/
│   │   └── AuthContext.tsx           # Authentication context
│   ├── hooks/
│   │   └── useAuth.ts                # Authentication hook
│   ├── lib/
│   │   ├── api.ts                    # Axios instance configuration
│   │   ├── notesApi.ts               # Notes API client
│   │   └── utils.ts                  # Utility functions
│   ├── services/
│   │   └── authService.ts            # Authentication service
│   ├── test/
│   │   └── components/               # Component tests
│   ├── App.tsx                       # Root component
│   ├── main.tsx                      # Application entry point
│   └── index.css                     # Global styles
├── public/                           # Static assets
├── .env.example                      # Environment variables template
├── package.json                      # Dependencies and scripts
├── vite.config.ts                    # Vite configuration
├── tsconfig.json                     # TypeScript configuration
└── tailwind.config.js                # Tailwind CSS configuration
```

## API Documentation

### Base URL

```
http://localhost:5000/api
```

### Authentication Endpoints

#### Register User

```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

#### Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

Response includes:
- Access token (in response body)
- Refresh token (in HTTP-only cookie)

#### Logout

```http
POST /api/auth/logout
Cookie: refreshToken=<token>
```

#### Get Current User

```http
GET /api/auth/me
Authorization: Bearer <access_token>
```

#### Update User Profile

```http
PUT /api/auth/profile
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "name": "John Updated",
  "email": "john.updated@example.com"
}
```

#### Update Password

```http
PUT /api/auth/password
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "currentPassword": "oldpassword",
  "newPassword": "newpassword"
}
```

#### Request Password Reset

```http
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "john@example.com"
}
```

#### Reset Password

```http
POST /api/auth/reset-password
Content-Type: application/json

{
  "token": "reset_token_from_email",
  "password": "newpassword"
}
```

### Notes Endpoints

#### Get All Notes

```http
GET /api/notes?search=query&tags=tag1,tag2&isPinned=true&isArchived=false&sortBy=updatedAt&order=desc
Authorization: Bearer <access_token>
```

Query Parameters:
- `search`: Search in title and content
- `tags`: Comma-separated list of tags
- `isPinned`: Filter pinned notes (true/false)
- `isArchived`: Filter archived notes (true/false)
- `sortBy`: Sort field (createdAt, updatedAt, title)
- `order`: Sort order (asc, desc)

#### Get Single Note

```http
GET /api/notes/:id
Authorization: Bearer <access_token>
```

#### Create Note

```http
POST /api/notes
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "title": "My Note",
  "content": "<p>HTML content from rich text editor</p>",
  "tags": ["personal", "important"],
  "color": "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  "isPinned": false
}
```

#### Update Note

```http
PUT /api/notes/:id
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "title": "Updated Note",
  "content": "<p>Updated HTML content</p>",
  "tags": ["updated"],
  "isPinned": true
}
```

#### Delete Note

```http
DELETE /api/notes/:id
Authorization: Bearer <access_token>
```

#### Pin/Unpin Note

```http
PUT /api/notes/:id/pin
Authorization: Bearer <access_token>
```

#### Archive/Unarchive Note

```http
PUT /api/notes/:id/archive
Authorization: Bearer <access_token>
```

#### Get Notes Statistics

```http
GET /api/notes/stats/overview
Authorization: Bearer <access_token>
```

Response:
```json
{
  "totalNotes": 25,
  "pinnedNotes": 5,
  "archivedNotes": 3
}
```

## Development Workflow

### Code Style

- **Frontend**: ESLint with TypeScript rules
- **Backend**: JavaScript ES6+ with consistent formatting

### Linting

```bash
# Frontend
cd frontend
npm run lint

# Backend (manual review)
cd backend
# Review code manually or add ESLint configuration
```

### Git Workflow

1. Create a feature branch from `develop`
2. Make changes and commit with descriptive messages
3. Push branch to remote
4. Create pull request to merge into `develop`
5. After review, merge into `develop`
6. Periodically merge `develop` into `main` for releases

### Commit Message Guidelines

Follow conventional commit format:
```
<type>(<scope>): <subject>

<body>
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

Examples:
```
feat(notes): add rich text editor with Tiptap
fix(auth): resolve token refresh issue
docs(readme): update installation instructions
test(backend): add authentication endpoint tests
```

## Git Branches

### Main Branches

- **main**: Production-ready code
- **develop**: Development branch with latest features

### Feature Branches

- **feature/frontend/testing**: Frontend testing implementation (54 tests)
- **feature/backend/testing**: Backend testing implementation (56 tests)

### Branch Naming Convention

- Feature: `feature/<scope>/<description>`
- Bug fix: `bugfix/<description>`
- Hotfix: `hotfix/<description>`
- Release: `release/<version>`

## Security Considerations

### Production Deployment Checklist

1. Change all JWT secrets to strong, random strings
2. Set `NODE_ENV=production`
3. Use HTTPS for all communications
4. Configure CORS to allow only trusted domains
5. Enable MongoDB authentication
6. Use environment-specific `.env` files
7. Never commit `.env` files to version control
8. Implement rate limiting on API endpoints
9. Set secure HTTP headers (helmet.js recommended)
10. Regular security audits: `npm audit`

## Troubleshooting

### Common Issues

#### MongoDB Connection Failed

- Ensure MongoDB is running
- Check connection string in `.env`
- Verify network connectivity for MongoDB Atlas

#### Cannot Send Emails

- Verify Gmail App Password is correct
- Enable 2-Step Verification in Google Account
- Check EMAIL_USER and EMAIL_PASS in `.env`

#### Frontend Cannot Connect to Backend

- Verify backend is running on port 5000
- Check CORS configuration in `backend/server.js`
- Verify API URLs in frontend configuration

#### Tests Failing

- Clear test database: Tests use MongoDB Memory Server
- Verify all environment variables are set
- Check Node.js version compatibility

## License

This project is created for educational purposes as part of the 10Pearls Shine program.

## Contact

For questions or support, please contact:
- Developer: Muhammad Ali
- Repository: https://github.com/MuhammadAli7896/muhammad-ali-mern-10pshine

## Acknowledgments

- 10Pearls Shine Program for the learning opportunity
- Open source community for the excellent libraries and tools
- MongoDB, Express, React, and Node.js teams for the MERN stack

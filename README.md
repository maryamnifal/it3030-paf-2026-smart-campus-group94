# it3030-paf-2026-smart-campus-group94
🚀 Overview

This module handles Google OAuth authentication, role-based access control, and resource booking integration within the Smart Campus system.

It ensures secure login, proper user management, and seamless interaction between users, admins, and campus resources.

🔑 Features Implemented
1. Google OAuth Authentication
Integrated Google login using Spring Security OAuth2
Automatic user creation on first login
JWT token generation after successful authentication
Redirect flow from backend → frontend (/auth/callback)
2. Session Management
Token, role, name, and userId stored in localStorage
Managed globally using React Context (AuthContext)
Persistent login across page refresh
3. Role-Based Access Control
Two roles:
USER (student/staff)
ADMIN
Protected routes implemented using ProtectedRoute
Role-based navigation:
Admin → /admin/dashboard
User → /user/dashboard
4. Resource Management Integration
Resources fetched from backend API
Only ACTIVE resources shown to users
Used in booking form selection
Linked with bookings via resourceId
5. Booking System Integration
Users can:
Create bookings
View their bookings
Cancel bookings
Admin can:
View all bookings
Approve / reject bookings
6. API Integration
Axios instance configured with:
Base URL
Authorization header (JWT)
Interceptors automatically attach token to requests
config.headers.Authorization = `Bearer ${token}`;
🏗️ Architecture

This module follows a client-server layered architecture:

React (Frontend)
      ↓
Spring Boot (REST API)
      ↓
MongoDB
Backend Layers:
Controller → handles API requests
Service → business logic
Repository → database operations
DTO → data transfer between layers
🔄 Authentication Flow
User clicks Login →
Google OAuth →
Spring Boot →
JWT generated →
Redirect to frontend →
Stored in AuthContext →
Used for API calls
📦 Key Components
Frontend
AuthContext → manages authentication state
AuthCallback → handles OAuth redirect
ProtectedRoute → role-based route protection
Booking & Resource pages
Backend
SecurityConfig → security setup
OAuth2SuccessHandler → login success handling
JwtAuthFilter → request authentication
Booking & Resource controllers/services
🔐 Security Notes
Secrets are stored in .env and not pushed to GitHub
JWT is used for secure API communication
Role-based authorization enforced in both frontend and backend
🚀 Future Improvements
Role-based priority (Staff vs Student)
Real-time availability checking
Booking conflict detection
Facility-specific managers

# it3030-paf-2026-smart-campus-group94
👥 Contributors
🔐 Authentication & Booking Integration

Girushana Akileswaran

🚀 Responsibilities
Implemented Google & Github OAuth 2.0 authentication
Configured Spring Security + JWT-based authentication
Developed AuthContext for global session management
Built AuthCallback flow for handling login redirects
Implemented role-based routing (ADMIN / USER)
🔑 Features
Secure login using Google accounts
Automatic user creation on first login
JWT token generation and validation
Persistent login using localStorage + Context
🔄 Auth Flow
Google Login → Spring Boot OAuth2 → JWT → React AuthContext → Protected Routes

🏢 Resource Management Module

Maryam Nifal

🚀 Responsibilities
Designed and implemented resource management system
Built full CRUD operations for resources
Integrated frontend with backend APIs
🔑 Features
Admin can:
Create resources
Edit resources
Delete resources
Users can:
View available resources
Only ACTIVE resources are available for booking
📦 Resource Structure
{
  "name": "Computer Lab 1",
  "type": "LAB",
  "capacity": 40,
  "location": "Block A",
  "status": "ACTIVE"
}
📅 Booking System Integration

Pirushalini

🚀 Responsibilities (Amri)
Integrated booking system with authentication
Connected bookings with logged-in user (userId)
Configured API communication with JWT
Built user booking UI + filtering system
🔑 Features
Users can:
Create bookings
View their bookings
Cancel bookings
Admin can:
View all bookings
Approve / reject bookings
🔄 Booking Flow
User → Select Resource → Create Booking → Admin Approval → Status Update
🎛️ Admin Dashboard & Analytics

Maryam Nifal

🚀 Responsibilities
Developed admin dashboard UI
Implemented usage analytics
📊 Features
Total bookings overview
Pending / Approved / Rejected stats
Top resources (most booked)
Peak booking hours
Recent booking activity
🧱 System Architecture

Team Contribution

🏗️ Architecture Style
Client–Server Architecture
Layered Backend Design
Frontend (React)
        ↓
Backend (Spring Boot REST API)
        ↓
Database (MongoDB)
🔹 Backend Layers
Controller → API endpoints
Service → Business logic
Repository → Database access
DTO → Data transfer
🔐 Security Implementation



🔑 Features
OAuth2 (Google & Github Login)
JWT Authentication
Role-Based Access Control
Protected Routes (Frontend + Backend)
🚀 Future Enhancements

Team Discussion

Staff vs Student priority system
Real-time availability checking
Booking conflict detection
Facility-specific managers

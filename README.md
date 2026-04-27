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

🚀 Responsibilities
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

## Module C — Maintenance & Incident Ticketing System
*Implemented by:* Kularatne P.S.C. (IT23611238)

### Overview
Module C handles the complete lifecycle of maintenance and incident 
tickets across the campus. Users can report facility and equipment 
issues, track their resolution, and communicate with staff through 
a comment system. Admins can manage tickets, assign technicians, 
and update statuses through a structured workflow.

---

### Features Implemented

#### Core Features
- Create incident tickets with category, description, priority, 
  contact details, and reporter type (Student/Staff/Admin)
- Full 3-level location selection — Building → Resource Type → 
  Specific Resource (connected to Module A)
- Upload up to 3 image attachments as evidence per ticket
- Ticket status workflow: OPEN → IN_PROGRESS → RESOLVED → CLOSED
- Admin can REJECT any ticket with a mandatory rejection reason
- Assign a technician to a ticket with their ID, name, and email
- Comment system with ownership rules:
  - Any authenticated user can add comments
  - Users can only edit and delete their own comments
  - Admin can delete any comment
- Role-based views:
  - USER sees only their own tickets
  - ADMIN sees all tickets with status and priority filters
- Admin controls: update status, assign technician, delete ticket

#### Innovation Features
- *Email notification to technician* — When a technician is 
  assigned, a branded HTML email is automatically sent with full 
  ticket details and a PDF attachment
- *PDF attachment in email* — Ticket PDF generated using iText7 
  and attached to the assignment email so technician has all 
  details without needing to login
- *Status update email to creator* — Ticket creator receives an 
  email notification on every status change (IN_PROGRESS, RESOLVED, 
  CLOSED, REJECTED) with relevant notes
- *PDF download* — Users and admins can download a professional 
  branded PDF report of any ticket using jsPDF (browser-side)
- *Reporter Type field* — Tickets record whether the reporter is 
  a Student, Staff member, or Admin

---

### REST API Endpoints

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | /api/tickets | Authenticated | Create a new incident ticket |
| GET | /api/tickets | ADMIN only | Get all tickets (with optional status/priority filters) |
| GET | /api/tickets/my | Authenticated | Get tickets created by the logged-in user |
| GET | /api/tickets/{id} | Authenticated | Get a single ticket by ID |
| PATCH | /api/tickets/{id}/status | ADMIN only | Update ticket status (workflow enforced) |
| PATCH | /api/tickets/{id}/assign | ADMIN only | Assign a technician + send email notification |
| DELETE | /api/tickets/{id} | ADMIN only | Delete a ticket |
| POST | /api/tickets/{id}/comments | Authenticated | Add a comment to a ticket |
| PUT | /api/tickets/{id}/comments/{commentId} | Owner only | Edit own comment |
| DELETE | /api/tickets/{id}/comments/{commentId} | Owner/Admin | Delete a comment |
| POST | /api/tickets/{id}/attachments | Authenticated | Upload images (max 3) 


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

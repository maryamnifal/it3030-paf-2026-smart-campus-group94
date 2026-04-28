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

# Module B — Booking Management System

**Implemented by:** Pirushalini Nageswaran (IT23579804)

---

## Overview

Module B handles the complete lifecycle of campus resource bookings. Users can browse available time slots for rooms, labs, halls, and equipment, then submit booking requests for admin approval. The system enforces strict business rules including resource status checks, capacity validation, availability window enforcement, and real-time conflict detection to prevent double bookings. Admins manage all requests through a structured approval workflow.

---

## Features Implemented

### Core Features

- **Fixed 2-hour time-slot system** — slots are generated automatically from each resource's availability windows instead of allowing free time input, eliminating invalid times and overlaps
- **Real-time slot availability** — when a user selects a resource and date, the system fetches existing bookings and displays taken slots as disabled (red) and available slots as selectable (green)
- **Booking status workflow:** `PENDING` → `APPROVED` / `REJECTED` → `CANCELLED` / `CHECKED_IN`
- **Admin approval workflow** — every booking starts as PENDING and requires admin review before it is confirmed
- **Rejection with mandatory reason** — admin must provide a rejection reason when declining; the reason is stored and displayed to the user on their booking card
- **Check-in verification** — admin can mark APPROVED bookings as CHECKED_IN when the user physically arrives, providing a complete audit trail
- **Edit booking** — users can edit date, time, purpose, and attendees on PENDING bookings; all validation rules are re-applied on update
- **Cancel booking** — users can cancel their own PENDING or APPROVED bookings at any time

### Multi-layer Validation (enforced in BookingService)

1. **Resource status check** — only ACTIVE resources can be booked; OUT_OF_SERVICE resources are blocked with a clear error message
2. **Capacity check** — expected attendees must not exceed the resource's maximum capacity
3. **Availability window check** — booking time must fall within the resource's configured availability windows (e.g. MON 08:00–18:00)
4. **Conflict detection** — no overlapping PENDING or APPROVED bookings are allowed on the same resource, date, and time slot

### Role-based Access Control

- **USER** — create, view own bookings, check slot availability, edit PENDING bookings, cancel bookings
- **ADMIN** — view all bookings, approve, reject with reason, check-in, delete; enforced via Spring Security

### Frontend Features

- **3-step booking form** — Step 1: select resource and date → Step 2: pick a time slot → Step 3: enter purpose and attendees
- **Live booking summary** — right panel updates in real time as the user fills in the form
- **Capacity progress bar** — visual indicator showing how close attendees count is to the resource maximum
- **Filter tabs** — booking history page supports filtering by All / Pending / Approved / Rejected / Cancelled
- **Resources loaded from Facilities API** — dropdown is populated dynamically from Module A, only showing ACTIVE resources

---

## REST API Endpoints

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `POST` | `/api/bookings` | Authenticated | Create a new booking request |
| `GET` | `/api/bookings/my/{userId}` | Authenticated | Get all bookings for the logged-in user |
| `GET` | `/api/bookings/availability` | Authenticated | Get booked slots for a resource on a specific date |
| `PUT` | `/api/bookings/{id}` | Authenticated | Edit a PENDING or APPROVED booking |
| `PUT` | `/api/bookings/{id}/cancel` | Authenticated | Cancel a booking |
| `GET` | `/api/bookings` | ADMIN only | Get all bookings across all users |
| `PUT` | `/api/bookings/{id}/approve` | ADMIN only | Approve a booking with optional message |
| `PUT` | `/api/bookings/{id}/reject` | ADMIN only | Reject a booking with mandatory reason |
| `PUT` | `/api/bookings/{id}/checkin` | ADMIN only | Mark an APPROVED booking as CHECKED_IN |
| `DELETE` | `/api/bookings/{id}` | ADMIN only | Permanently delete a booking |

---

## Booking Status Workflow

```
(new) ──► PENDING ──► APPROVED ──► CHECKED_IN
                │
                ├──► REJECTED
                │
                └──► CANCELLED   (user can also cancel from APPROVED)
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Java · Spring Boot 3.5 |
| Frontend | React.js · Vite · Axios |
| Database | MongoDB Atlas |
| Authentication | Google OAuth 2.0 · JWT |
| API Testing | Postman |
| Version Control | Git · GitHub |

---

## File Structure

```
backend/src/main/java/com/smartcampus/backend/
├── controller/
│   └── BookingController.java       ← 10 REST endpoints
├── service/
│   └── BookingService.java          ← all business logic & validation
├── repository/
│   └── BookingRepository.java       ← MongoDB queries
├── model/
│   ├── Booking.java                 ← MongoDB document
│   └── BookingStatus.java           ← PENDING, APPROVED, REJECTED, CANCELLED, CHECKED_IN
├── dto/
│   ├── BookingRequestDTO.java       ← validated input DTO
│   ├── BookingResponseDTO.java      ← API response DTO
│   ├── BookingUpdateDTO.java        ← edit booking DTO
│   └── StatusUpdateDTO.java         ← rejection reason DTO
└── exception/
    ├── ConflictException.java        ← 409 errors
    ├── ResourceNotFoundException.java ← 404 errors
    └── GlobalExceptionHandler.java   ← maps exceptions to HTTP responses

frontend/src/
├── pages/Bookings/
│   ├── BookingsPage.jsx             ← user booking history & management
│   └── CreateBookingPage.jsx        ← 3-step booking form with slot picker
├── pages/admin/
│   └── BookingRequests.jsx          ← admin booking management panel
└── api/
    └── bookingApi.js                ← Axios API calls for booking module
```

---

## Validation Error Responses

| Scenario | HTTP Status | Error Message |
|----------|------------|---------------|
| Resource is OUT_OF_SERVICE | `409 Conflict` | Cannot book OUT_OF_SERVICE resource. Resource must be ACTIVE. |
| Attendees exceed capacity | `409 Conflict` | Expected attendees (n) exceeds resource capacity (m). |
| Outside availability window | `409 Conflict` | Resource is not available on [DAY]. Available windows: ... |
| Double booking same slot | `409 Conflict` | This resource is already booked for the selected time slot. |
| Missing required fields | `400 Bad Request` | Per-field validation messages |
| Booking not found | `404 Not Found` | Booking not found with id: ... |
| Access admin endpoint as user | `403 Forbidden` | Access Denied |

---

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

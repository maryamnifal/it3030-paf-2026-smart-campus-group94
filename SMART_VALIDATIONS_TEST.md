# Smart Booking Validations - Test Guide

## Overview
The booking system now includes three smart validations to ensure data integrity:

1. **Resource Status Check** - Can't book OUT_OF_SERVICE or inactive resources
2. **Capacity Validation** - Attendees can't exceed resource capacity
3. **Availability Windows** - Booking time must be within resource availability windows

---

## Validation Details

### 1. Resource Status Validation ✅
**Error Message:**
```
"Cannot book [STATUS] resource. Resource must be ACTIVE."
```

**When it triggers:**
- When attempting to book a resource with `status` = `OUT_OF_SERVICE`, `INACTIVE`, or any value other than `ACTIVE`

**Example:**
```bash
curl -X POST http://localhost:8080/api/bookings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "resourceId": "out-of-service-room-id",
    "userId": "user123",
    "userName": "John Doe",
    "date": "2026-04-20",
    "startTime": "10:00:00",
    "endTime": "11:00:00",
    "purpose": "Meeting",
    "expectedAttendees": 5
  }'

# Response: 409 Conflict
# "Cannot book OUT_OF_SERVICE resource. Resource must be ACTIVE."
```

---

### 2. Capacity Validation ✅
**Error Message:**
```
"Expected attendees (X) exceeds resource capacity (Y)."
```

**When it triggers:**
- When `expectedAttendees` > `resource.capacity`

**Example:**
```bash
# Suppose "Lecture Hall A" has capacity = 100
curl -X POST http://localhost:8080/api/bookings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "resourceId": "lecture-hall-a-id",
    "userId": "user123",
    "userName": "John Doe",
    "date": "2026-04-21",
    "startTime": "14:00:00",
    "endTime": "15:00:00",
    "purpose": "Conference",
    "expectedAttendees": 250  # Exceeds 100!
  }'

# Response: 409 Conflict
# "Expected attendees (250) exceeds resource capacity (100)."
```

---

### 3. Availability Window Validation ✅
**Error Message (unavailable day):**
```
"Resource is not available on [DAY]. Available windows: [MON 08:00-18:00, FRI 09:00-17:00]"
```

**Error Message (outside time window):**
```
"Booking time (HH:MM-HH:MM) is outside resource availability window (HH:MM-HH:MM [DAY])."
```

**Format:**
- Availability windows stored as: `["MON 08:00-18:00", "TUE 08:00-18:00", "WED 08:00-18:00", "THU 08:00-18:00", "FRI 08:00-18:00"]`
- Days parsed from booking date automatically

**Example 1: Booking on unavailable day**
```bash
# Suppose resource is only available MON-FRI 08:00-18:00
curl -X POST http://localhost:8080/api/bookings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "resourceId": "lecture-hall-a-id",
    "userId": "user123",
    "userName": "John Doe",
    "date": "2026-04-19",  # Saturday!
    "startTime": "14:00:00",
    "endTime": "15:00:00",
    "purpose": "Meeting",
    "expectedAttendees": 5
  }'

# Response: 409 Conflict
# "Resource is not available on SAT. Available windows: MON 08:00-18:00, TUE 08:00-18:00, ..."
```

**Example 2: Booking outside time window**
```bash
# Suppose resource is only available MON-FRI 09:00-17:00
curl -X POST http://localhost:8080/api/bookings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "resourceId": "lecture-hall-a-id",
    "userId": "user123",
    "userName": "John Doe",
    "date": "2026-04-21",  # Monday
    "startTime": "07:00:00",  # Before 09:00!
    "endTime": "08:00:00",
    "purpose": "Meeting",
    "expectedAttendees": 5
  }'

# Response: 409 Conflict
# "Booking time (07:00-08:00) is outside resource availability window (09:00-17:00 MON)."
```

---

## Where Validations Are Applied

### Create Booking (`POST /api/bookings`)
All three validations are performed:
1. Resource status check
2. Capacity validation
3. Availability window validation
4. Time conflict check (existing)

### Update Booking (`PUT /api/bookings/{id}`)
All three validations are performed on the updated values.

**Important:** Only PENDING or APPROVED bookings can be edited.

---

## Frontend User Experience

### Error Display
When a validation fails, the frontend displays the error in a red alert box:
- **Status error:** "Cannot book [STATUS] resource. Resource must be ACTIVE."
- **Capacity error:** "Expected attendees (250) exceeds resource capacity (100)."
- **Availability error:** "Resource is not available on [DAY]. Available windows: [...]"

### Visual Feedback
- Booking form remains open if validation fails
- User can correct the information and retry
- Error message is logged to browser console (dev tools)

---

## Setting Up Resources with Availability Windows

When creating/updating a resource via the admin panel, set availability windows like:

```javascript
{
  "availabilityWindows": [
    "MON 08:00-18:00",
    "TUE 08:00-18:00",
    "WED 08:00-18:00",
    "THU 08:00-18:00",
    "FRI 08:00-18:00"
  ]
}
```

---

## Database Configuration

Resources should have:
- `status`: "ACTIVE" or "OUT_OF_SERVICE"
- `capacity`: Integer (e.g., 100)
- `availabilityWindows`: Array of strings with format "DAY HH:MM-HH:MM"

Example Resource document:
```json
{
  "_id": ObjectId("..."),
  "name": "Lecture Hall A",
  "type": "LECTURE_HALL",
  "capacity": 150,
  "location": "Building A, Floor 3",
  "status": "ACTIVE",
  "availabilityWindows": ["MON 08:00-18:00", "TUE 08:00-18:00", "WED 08:00-18:00", "THU 08:00-18:00", "FRI 08:00-18:00"],
  "description": "Large lecture hall with projector",
  "createdAt": ISODate("2026-04-15T10:00:00Z"),
  "updatedAt": ISODate("2026-04-15T10:00:00Z")
}
```

---

## Testing Checklist

- [ ] Try booking a resource with status = "OUT_OF_SERVICE"
  - Expected: Error "Cannot book OUT_OF_SERVICE resource"

- [ ] Try booking with expectedAttendees > capacity
  - Expected: Error about exceeding capacity

- [ ] Try booking on Sunday when resource only available MON-FRI
  - Expected: Error about not being available on SUN

- [ ] Try booking at 07:00 when resource availability starts at 08:00
  - Expected: Error about being outside availability window

- [ ] Try booking within all valid constraints
  - Expected: Success (201 Created)

- [ ] Try updating a booking with invalid constraints
  - Expected: Similar validation errors

---

## Code Location

- **Service validations:** [BookingService.java](./backend/src/main/java/com/smartcampus/backend/service/BookingService.java)
- **Validation methods:**
  - `validateResourceStatus(Resource resource)`
  - `validateCapacity(Resource resource, int expectedAttendees)`
  - `validateAvailabilityWindow(Resource resource, LocalDate date, LocalTime start, LocalTime end)`

# Fixed Time Slot System

## Overview
The booking system now uses **fixed time slots** instead of free-form time inputs. This prevents double-booking, invalid time ranges, and user confusion.

## How It Works

### 1. **Slot Generation**
- Slots are generated from resource **availability windows**
- Example: Resource available "MON 08:00-18:00"
- Generated slots (2-hour each):
  - 08:00-10:00
  - 10:00-12:00
  - ~~12:00-13:00~~ (lunch break, skipped)
  - 13:00-15:00
  - 15:00-17:00

### 2. **Booking Status**
For each date and resource:
- Fetch existing **APPROVED** and **PENDING** bookings
- Mark conflicting slots as disabled/booked
- Show available slots for user selection

### 3. **User Flow**
1. Select Resource
2. Select Date
3. System loads available slots (marked as ✓ or ❌)
4. User clicks an available slot
5. Start and end times are automatically set

## Data Structure

```javascript
// Database (unchanged)
{
  resourceId: "room1",
  date: "2026-04-20",
  startTime: "10:00:00",
  endTime: "12:00:00"
}

// Slot object (generated, not stored)
{
  id: "10:00-12:00",
  start: "10:00",
  end: "12:00",
  display: "10:00 - 12:00",
  isBooked: false
}
```

## Files

### Frontend

**New Files:**
- `frontend/src/utils/slotGenerator.js` - Utility functions for slot generation
- `frontend/src/components/TimeSlotSelector.jsx` - UI component for slot selection

**Modified Files:**
- `frontend/src/pages/Bookings/BookingsPage.jsx` - Integrated TimeSlotSelector into BookingForm and EditBookingModal

**Key Utilities:**
```javascript
// Generate slots from availability window
generateTimeSlots("MON 08:00-18:00", 120) 
// → [{ id: "08:00-10:00", start: "08:00", end: "10:00", ... }, ...]

// Get slots for a specific date and resource
getSlotsForDateAndResource(resource, "2026-04-20", bookings)
// → { slots: [...], availability: "MON 08:00-18:00" }

// Check if a slot is booked
isSlotBooked(slot, bookings)
// → true/false
```

## Key Features

✅ **Prevents double-booking** - Only available slots can be selected
✅ **No invalid times** - Users can't enter arbitrary times
✅ **Smart slot detection** - Overlapping bookings disable slots
✅ **Lunch break handling** - 12:00-13:00 automatically skipped
✅ **Availability checking** - Respects resource availability windows
✅ **Easy date changes** - Slot selection resets when date changes

## Backend (No Changes)

The backend API remains unchanged:
- Still accepts `startTime` and `endTime` as timestamps
- Still validates times against availability windows
- Still checks for conflicts
- All validations work with fixed slots

## Example: Booking Creation

```javascript
// User selects slot: 10:00 - 12:00
// Form automatically sets:
{
  resourceId: "room1",
  date: "2026-04-20",
  startTime: "10:00:00",  // Auto-set from slot
  endTime: "12:00:00",    // Auto-set from slot
  purpose: "Team meeting",
  expectedAttendees: 10
}
```

## Slot Duration

Currently set to **2 hours** (`120 minutes`). To change:

```javascript
// In TimeSlotSelector.jsx or slotGenerator.js
const slotDurationMinutes = 120; // Change to 60, 90, 180, etc.
```

## Customization

### Change slot duration
Edit `slotGenerator.js`:
```javascript
export const generateTimeSlots = (availabilityWindow, slotDurationMinutes = 120) {
  // Change 120 to desired minutes
}
```

### Change lunch break
Edit `slotGenerator.js`:
```javascript
// Around line 30:
if (current === 720 && slotDurationMinutes === 120) {  // 720 = 12:00 in minutes
  current += slotDurationMinutes;
  continue;
}
```

### Style available/booked slots
Edit `TimeSlotSelector.jsx`:
```javascript
const availableSlotStyle = { ... }
const bookedSlotStyle = { ... }
const selectedSlotStyle = { ... }
```

## Testing

### Test case 1: Slot generation
```javascript
import { generateTimeSlots } from "./utils/slotGenerator";

const slots = generateTimeSlots("MON 08:00-18:00");
console.log(slots);
// Output: 8 slots from 08:00 to 17:00 (12:00-13:00 skipped)
```

### Test case 2: Booking creation
1. Go to Bookings page
2. Select a resource
3. Select a date
4. Verify slots load correctly
5. Verify already-booked slots show as ❌
6. Click an available slot
7. Verify startTime and endTime update
8. Complete booking

### Test case 3: Edit booking
1. Open existing booking edit
2. Change date
3. Verify slots update
4. Select new time slot
5. Save

## Future Enhancements

- [ ] Custom slot durations per resource
- [ ] Different availability windows per day
- [ ] Prevent booking across multiple days
- [ ] Show slot capacity counter
- [ ] Calendar view with slot availability
- [ ] Bulk time slot management (admin panel)

## Debugging

Slots not showing?
- Check if resource has `availabilityWindows` defined
- Check date format is ISO (YYYY-MM-DD)
- Check browser console for errors

Unsupported day error?
- Ensure availability windows include the selected day
- Check day abbreviations: SUN, MON, TUE, WED, THU, FRI, SAT

Slots appearing as booked incorrectly?
- Check if bookings have status PENDING or APPROVED
- Verify booking times overlap with slot times
- Check backend conflict validation

/**
 * Generate fixed time slots from an availability window string
 * Input: "MON 08:00-18:00"
 * Output: ["08:00-10:00", "10:00-12:00", "13:00-15:00", "15:00-17:00"]
 * 
 * Default slot duration: 2 hours
 * Lunch break: 12:00-13:00 (skipped)
 */
export const generateTimeSlots = (availabilityWindow, slotDurationMinutes = 120) => {
  if (!availabilityWindow) return [];
  
  const parts = availabilityWindow.split(" ");
  if (parts.length < 2) return [];
  
  const timeRange = parts[1];
  const [startStr, endStr] = timeRange.split("-");
  
  if (!startStr || !endStr) return [];
  
  const slots = [];
  const startTime = timeToMinutes(startStr);
  const endTime = timeToMinutes(endStr);
  
  if (startTime === null || endTime === null) return [];
  
  let current = startTime;
  
  while (current + slotDurationMinutes <= endTime) {
    // Skip lunch break (12:00-13:00)
    if (current === 720 && slotDurationMinutes === 120) {
      current += slotDurationMinutes;
      continue;
    }
    
    const slotStart = minutesToTime(current);
    const slotEnd = minutesToTime(current + slotDurationMinutes);
    
    slots.push({
      id: `${slotStart}-${slotEnd}`,
      start: slotStart,
      end: slotEnd,
      display: `${slotStart} - ${slotEnd}`,
    });
    
    current += slotDurationMinutes;
  }
  
  return slots;
};

/**
 * Convert time string "HH:MM" to minutes since midnight
 */
const timeToMinutes = (timeStr) => {
  const [hours, minutes] = timeStr.split(":").map(Number);
  if (isNaN(hours) || isNaN(minutes)) return null;
  return hours * 60 + minutes;
};

/**
 * Convert minutes since midnight back to "HH:MM" format
 */
const minutesToTime = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
};

/**
 * Get the day of week abbreviation from a date string
 * Input: "2026-04-20" -> Output: "MON"
 */
export const getDayAbbrFromDate = (dateStr) => {
  if (!dateStr) return null;
  const date = new Date(dateStr + "T00:00:00");
  const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  return days[date.getDay()];
};

/**
 * Find matching availability window for a given date
 * Returns the window string (e.g., "MON 08:00-18:00")
 */
export const getAvailabilityForDate = (availabilityWindows, dateStr) => {
  if (!availabilityWindows || !dateStr) return null;
  
  const dayAbbr = getDayAbbrFromDate(dateStr);
  if (!dayAbbr) return null;
  
  return availabilityWindows.find((window) =>
    window.toUpperCase().startsWith(dayAbbr)
  );
};

/**
 * Check if a slot is booked
 * A slot overlaps if: slot.start < booking.endTime AND slot.end > booking.startTime
 */
export const isSlotBooked = (slot, bookings) => {
  if (!bookings || bookings.length === 0) return false;
  
  return bookings.some((booking) => {
    try {
      const slotStart = slot.start; // Format: "HH:MM"
      const slotEnd = slot.end;     // Format: "HH:MM"
      
      // Extract HH:MM from booking time (might be "HH:MM:SS")
      const bookingStart = booking.startTime?.substring(0, 5) || "";
      const bookingEnd = booking.endTime?.substring(0, 5) || "";
      
      if (!bookingStart || !bookingEnd) return false;
      
      // Overlap detection: slot overlaps if slot.start < booking.end AND slot.end > booking.start
      return slotStart < bookingEnd && slotEnd > bookingStart;
    } catch (e) {
      console.error("Error checking booking overlap:", e);
      return false;
    }
  });
};

/**
 * Get slots for a specific date and resource
 * Takes into account existing bookings
 */
export const getSlotsForDateAndResource = (resource, dateStr, bookings = []) => {
  try {
    // Validate inputs
    if (!resource) {
      return { slots: [], message: "No resource provided" };
    }
    
    if (!dateStr) {
      return { slots: [], message: "No date provided" };
    }
    
    // Get availability window for this date
    const availability = getAvailabilityForDate(resource.availabilityWindows, dateStr);
    
    if (!availability) {
      return {
        slots: [],
        message: `${resource.name || "Resource"} is not available on this day`,
      };
    }
    
    // Generate slots
    const slots = generateTimeSlots(availability);
    
    if (slots.length === 0) {
      return {
        slots: [],
        message: "Could not generate time slots from availability window",
      };
    }
    
    // Mark booked slots
    const slotsWithStatus = slots.map((slot) => ({
      ...slot,
      isBooked: isSlotBooked(slot, bookings),
    }));
    
    return {
      slots: slotsWithStatus,
      availability,
    };
  } catch (err) {
    console.error("Error generating slots:", err);
    return {
      slots: [],
      message: "Error generating slots: " + err.message,
    };
  }
};

import { useState, useEffect } from "react";
import { getSlotsForDateAndResource } from "../utils/slotGenerator";
import { getAvailability } from "../api/bookingApi"; // ✅ FIXED: was getAllBookings (admin-only)

const slotStyle = {
  padding: "12px 16px",
  borderRadius: "12px",
  border: "2px solid rgba(15,23,42,0.08)",
  background: "#fff",
  fontWeight: 600,
  fontSize: "14px",
  cursor: "pointer",
  transition: "all 0.2s ease",
  textAlign: "center",
  whiteSpace: "nowrap",
};

const availableSlotStyle = {
  ...slotStyle,
  color: "var(--secondary)",
  borderColor: "var(--primary)",
  cursor: "pointer",
};

const selectedSlotStyle = {
  ...slotStyle,
  background: "var(--primary)",
  color: "#fff",
  borderColor: "var(--primary)",
};

const bookedSlotStyle = {
  ...slotStyle,
  background: "#fee2e2",
  color: "#991b1b",
  borderColor: "#fca5a5",
  cursor: "not-allowed",
  opacity: 0.6,
};

const labelStyle = {
  display: "block",
  fontSize: "13px",
  fontWeight: 700,
  color: "var(--text-dark)",
  marginBottom: "12px",
};

function TimeSlotSelector({ resource, selectedDate, selectedSlot, onSlotSelect, disabled = false }) {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!resource || !selectedDate) {
      setSlots([]);
      setMessage("");
      return;
    }

    const fetchSlots = async () => {
      setLoading(true);
      try {
        if (!resource.availabilityWindows || resource.availabilityWindows.length === 0) {
          setSlots([]);
          setMessage("Resource has no availability windows configured");
          setLoading(false);
          return;
        }

        let bookingsForDateAndResource = [];

        try {
          // ✅ FIXED: Use getAvailability() — a public authenticated endpoint
          // getAllBookings() was admin-only → regular users got 401 → catch set [] → all slots showed free
          const response = await getAvailability(resource.id, selectedDate);
          bookingsForDateAndResource = response.data || [];
        } catch (apiErr) {
          // ✅ FIXED: No longer silently continues — shows proper error to user
          console.error("Could not fetch slot availability:", apiErr.message);
          setSlots([]);
          setMessage("Could not load slot availability. Please try again.");
          setLoading(false);
          return;
        }

        const { slots: generatedSlots, message: msg } = getSlotsForDateAndResource(
          resource,
          selectedDate,
          bookingsForDateAndResource
        );

        setSlots(generatedSlots);
        setMessage(msg || "");
      } catch (err) {
        console.error("Error fetching slots:", err);
        setSlots([]);
        setMessage("Error loading available slots: " + (err.message || "Unknown error"));
      } finally {
        setLoading(false);
      }
    };

    fetchSlots();
  }, [resource, selectedDate]);

  if (!resource || !selectedDate) {
    return (
      <div style={{ padding: "16px", color: "var(--text-muted)", fontSize: "14px" }}>
        Please select a resource and date first
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ padding: "16px", color: "var(--text-muted)", fontSize: "14px" }}>
        Loading available slots...
      </div>
    );
  }

  if (slots.length === 0) {
    return (
      <div style={{ padding: "16px", color: "#991b1b", fontSize: "14px", background: "#fee2e2", borderRadius: "12px" }}>
        {message || "No available slots for this date"}
        {resource && !resource.availabilityWindows?.length && (
          <div style={{ marginTop: "8px", fontSize: "12px" }}>
            ℹ️ This resource has no availability windows configured. Please set availability hours in the Facilities section.
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <label style={labelStyle}>Select Time Slot *</label>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
          gap: "12px",
        }}
      >
        {slots.map((slot) => (
          <button
            key={slot.id}
            onClick={() => !slot.isBooked && onSlotSelect(slot.start, slot.end)}
            disabled={slot.isBooked || disabled}
            style={
              slot.isBooked
                ? bookedSlotStyle
                : selectedSlot?.start === slot.start
                ? selectedSlotStyle
                : availableSlotStyle
            }
            title={slot.isBooked ? "This slot is already booked" : `Select ${slot.display}`}
          >
            {slot.display}
            {slot.isBooked && " ❌"}
          </button>
        ))}
      </div>
      <div style={{ fontSize: "12px", color: "var(--text-light)", marginTop: "12px" }}>
        💡 Slots are 2?? hours each. Lunch break: 12:00-13:00
      </div>
    </div>
  );
}

export default TimeSlotSelector;
package com.smartcampus.backend.service;

import com.smartcampus.backend.dto.BookingRequestDTO;
import com.smartcampus.backend.dto.BookingUpdateDTO;
import com.smartcampus.backend.dto.BookingResponseDTO;
import com.smartcampus.backend.dto.StatusUpdateDTO;
import com.smartcampus.backend.exception.ConflictException;
import com.smartcampus.backend.exception.ResourceNotFoundException;
import com.smartcampus.backend.model.Booking;
import com.smartcampus.backend.model.BookingStatus;
import com.smartcampus.backend.model.Resource;
import com.smartcampus.backend.repository.BookingRepository;
import com.smartcampus.backend.repository.ResourceRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final ResourceRepository resourceRepository;

    public BookingService(BookingRepository bookingRepository, ResourceRepository resourceRepository) {
        this.bookingRepository = bookingRepository;
        this.resourceRepository = resourceRepository;
    }

    // Create a new booking
    public BookingResponseDTO createBooking(BookingRequestDTO request) {
        Resource resource = resourceRepository.findById(request.getResourceId())
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found with id: " + request.getResourceId()));

        validateResourceStatus(resource);
        validateCapacity(resource, request.getExpectedAttendees());
        validateAvailabilityWindow(resource, request.getDate(), request.getStartTime(), request.getEndTime());

        List<Booking> conflicts = bookingRepository.findConflictingBookings(
                request.getResourceId(),
                request.getDate(),
                request.getStartTime(),
                request.getEndTime()
        );

        if (!conflicts.isEmpty()) {
            throw new ConflictException("This resource is already booked for the selected time slot.");
        }

        Booking booking = new Booking();
        booking.setResourceId(request.getResourceId());
        booking.setUserId(request.getUserId());
        booking.setUserName(request.getUserName());
        booking.setDate(request.getDate());
        booking.setStartTime(request.getStartTime());
        booking.setEndTime(request.getEndTime());
        booking.setPurpose(request.getPurpose());
        booking.setExpectedAttendees(request.getExpectedAttendees());
        booking.setStatus(BookingStatus.PENDING);

        Booking saved = bookingRepository.save(booking);
        return mapToResponse(saved);
    }

    // Get bookings for a specific user
    public List<BookingResponseDTO> getMyBookings(String userId) {
        return bookingRepository.findByUserId(userId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // Get all bookings (admin)
    public List<BookingResponseDTO> getAllBookings() {
        return bookingRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // ✅ NEW: Get booked slots for a resource on a specific date (for regular users)
    // Called by GET /api/bookings/availability?resourceId=xxx&date=2026-04-21
    // Returns PENDING + APPROVED bookings so the frontend can disable those time slots
    public List<BookingResponseDTO> getBookingsForResourceAndDate(String resourceId, String dateStr) {
        LocalDate date = LocalDate.parse(dateStr);
        return bookingRepository.findBookingsForResourceAndDate(resourceId, date)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // Update a booking (only for PENDING or APPROVED bookings)
    public BookingResponseDTO updateBooking(String id, BookingUpdateDTO request) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + id));

        if (booking.getStatus() != BookingStatus.PENDING && booking.getStatus() != BookingStatus.APPROVED) {
            throw new ConflictException("Cannot edit a " + booking.getStatus() + " booking.");
        }

        Resource resource = resourceRepository.findById(booking.getResourceId())
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found with id: " + booking.getResourceId()));

        validateResourceStatus(resource);
        validateCapacity(resource, request.getExpectedAttendees());
        validateAvailabilityWindow(resource, request.getDate(), request.getStartTime(), request.getEndTime());

        List<Booking> conflicts = bookingRepository.findConflictingBookings(
                booking.getResourceId(),
                request.getDate(),
                request.getStartTime(),
                request.getEndTime()
        );

        conflicts = conflicts.stream()
                .filter(b -> !b.getId().equals(id))
                .collect(Collectors.toList());

        if (!conflicts.isEmpty()) {
            throw new ConflictException("This resource is already booked for the new selected time slot.");
        }

        booking.setDate(request.getDate());
        booking.setStartTime(request.getStartTime());
        booking.setEndTime(request.getEndTime());
        booking.setPurpose(request.getPurpose());
        booking.setExpectedAttendees(request.getExpectedAttendees());

        return mapToResponse(bookingRepository.save(booking));
    }

    // Approve a booking
    // ✅ Updated — now accepts optional approvalMessage from admin
    public BookingResponseDTO approveBooking(String id, String approvalMessage) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + id));

        booking.setStatus(BookingStatus.APPROVED);
        if (approvalMessage != null && !approvalMessage.isBlank()) {
            booking.setApprovalMessage(approvalMessage);
        }
        return mapToResponse(bookingRepository.save(booking));
    }

    // Reject a booking
    public BookingResponseDTO rejectBooking(String id, StatusUpdateDTO statusUpdate) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + id));

        booking.setStatus(BookingStatus.REJECTED);
        booking.setRejectionReason(statusUpdate.getRejectionReason());
        return mapToResponse(bookingRepository.save(booking));
    }

    // Cancel a booking
    public BookingResponseDTO cancelBooking(String id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + id));

        booking.setStatus(BookingStatus.CANCELLED);
        return mapToResponse(bookingRepository.save(booking));
    }

    // ✅ NEW: Mark a booking as CHECKED_IN (called from admin verify screen)
    public BookingResponseDTO checkInBooking(String id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + id));
 
        if (booking.getStatus() != BookingStatus.APPROVED) {
            throw new ConflictException(
                "Only APPROVED bookings can be checked in. Current status: " + booking.getStatus()
            );
        }
 
        booking.setStatus(BookingStatus.CHECKED_IN);
        return mapToResponse(bookingRepository.save(booking));
    }

    // Delete a booking
    public void deleteBooking(String id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + id));

        bookingRepository.delete(booking);
    }

    // ─── VALIDATION HELPERS ───────────────────────────────────────────────

    private void validateResourceStatus(Resource resource) {
        if (resource.getStatus() == null || !resource.getStatus().equals("ACTIVE")) {
            throw new ConflictException("Cannot book " + (resource.getStatus() != null ? resource.getStatus() : "UNKNOWN") +
                    " resource. Resource must be ACTIVE.");
        }
    }

    private void validateCapacity(Resource resource, int expectedAttendees) {
        if (expectedAttendees > resource.getCapacity()) {
            throw new ConflictException("Expected attendees (" + expectedAttendees + ") exceeds resource capacity (" +
                    resource.getCapacity() + ").");
        }
    }

    private void validateAvailabilityWindow(Resource resource, LocalDate bookingDate, LocalTime bookingStart, LocalTime bookingEnd) {
        if (resource.getAvailabilityWindows() == null || resource.getAvailabilityWindows().isEmpty()) {
            return;
        }

        String dayOfWeek = bookingDate.getDayOfWeek().toString().substring(0, 3).toUpperCase();

        boolean foundMatchingWindow = false;
        for (String window : resource.getAvailabilityWindows()) {
            String[] parts = window.split(" ");
            if (parts.length < 2) continue;

            String windowDay = parts[0].toUpperCase();
            if (!windowDay.equals(dayOfWeek)) continue;

            foundMatchingWindow = true;

            String[] times = parts[1].split("-");
            if (times.length != 2) continue;

            LocalTime windowStart = LocalTime.parse(times[0]);
            LocalTime windowEnd = LocalTime.parse(times[1]);

            if (bookingStart.isBefore(windowStart) || bookingEnd.isAfter(windowEnd) || bookingStart.isAfter(bookingEnd)) {
                throw new ConflictException("Booking time (" + bookingStart + "-" + bookingEnd +
                        ") is outside resource availability window (" +
                        windowStart + "-" + windowEnd + " " + dayOfWeek + ").");
            }

            return;
        }

        if (!foundMatchingWindow) {
            throw new ConflictException("Resource is not available on " + dayOfWeek + ". Available windows: " +
                    String.join(", ", resource.getAvailabilityWindows()));
        }
    }

    private BookingResponseDTO mapToResponse(Booking booking) {
        BookingResponseDTO response = new BookingResponseDTO();
        response.setId(booking.getId());
        response.setResourceId(booking.getResourceId());
        response.setUserId(booking.getUserId());
        response.setUserName(booking.getUserName());
        response.setDate(booking.getDate());
        response.setStartTime(booking.getStartTime());
        response.setEndTime(booking.getEndTime());
        response.setPurpose(booking.getPurpose());
        response.setExpectedAttendees(booking.getExpectedAttendees());
        response.setStatus(booking.getStatus());
        response.setRejectionReason(booking.getRejectionReason());
        response.setApprovalMessage(booking.getApprovalMessage()); // ✅ NEW
        response.setCreatedAt(booking.getCreatedAt());
        response.setUpdatedAt(booking.getUpdatedAt());
        return response;
    }
}
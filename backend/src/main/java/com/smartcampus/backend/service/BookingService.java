package com.smartcampus.backend.service;

import com.smartcampus.backend.dto.BookingRequestDTO;
import com.smartcampus.backend.dto.BookingUpdateDTO;
import com.smartcampus.backend.dto.BookingResponseDTO;
import com.smartcampus.backend.dto.StatusUpdateDTO;
import com.smartcampus.backend.exception.ConflictException;
import com.smartcampus.backend.exception.ResourceNotFoundException;
import com.smartcampus.backend.model.Booking;
import com.smartcampus.backend.model.BookingStatus;
import com.smartcampus.backend.model.Notification;
import com.smartcampus.backend.model.Resource;
import com.smartcampus.backend.repository.BookingRepository;
import com.smartcampus.backend.repository.NotificationRepository;
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
    private final NotificationRepository notificationRepository;

    public BookingService(BookingRepository bookingRepository,
                          ResourceRepository resourceRepository,
                          NotificationRepository notificationRepository) {
        this.bookingRepository = bookingRepository;
        this.resourceRepository = resourceRepository;
        this.notificationRepository = notificationRepository;
    }

    // ─── NOTIFICATION HELPER ─────────────────────────────────────────────
    private void sendNotification(String userId, String title, String message, String type) {
        Notification notification = new Notification();
        notification.setUserId(userId);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setType(type);
        notification.setSource("SYSTEM");
        notificationRepository.save(notification);
    }

    // ─── CREATE BOOKING ───────────────────────────────────────────────────
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

        // 🔔 Notify user booking request received
        sendNotification(
            request.getUserId(),
            "Booking Request Received 📋",
            "Your booking request on " + request.getDate() +
            " (" + request.getStartTime() + " - " + request.getEndTime() +
            ") is pending approval.",
            "BOOKING"
        );

        return mapToResponse(saved);
    }

    // ─── GET MY BOOKINGS ──────────────────────────────────────────────────
    public List<BookingResponseDTO> getMyBookings(String userId) {
        return bookingRepository.findByUserId(userId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // ─── GET ALL BOOKINGS (ADMIN) ─────────────────────────────────────────
    public List<BookingResponseDTO> getAllBookings() {
        return bookingRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // ─── GET BOOKINGS FOR RESOURCE AND DATE ───────────────────────────────
    public List<BookingResponseDTO> getBookingsForResourceAndDate(String resourceId, String dateStr) {
        LocalDate date = LocalDate.parse(dateStr);
        return bookingRepository.findBookingsForResourceAndDate(resourceId, date)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // ─── UPDATE BOOKING ───────────────────────────────────────────────────
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

    // ─── APPROVE BOOKING ──────────────────────────────────────────────────
    public BookingResponseDTO approveBooking(String id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + id));

        booking.setStatus(BookingStatus.APPROVED);
        Booking saved = bookingRepository.save(booking);

        // 🔔 Notify user
        sendNotification(
            booking.getUserId(),
            "Booking Approved ✅",
            "Your booking on " + booking.getDate() +
            " (" + booking.getStartTime() + " - " + booking.getEndTime() +
            ") has been approved! You're all set.",
            "BOOKING"
        );

        return mapToResponse(saved);
    }

    // ─── REJECT BOOKING ───────────────────────────────────────────────────
    public BookingResponseDTO rejectBooking(String id, StatusUpdateDTO statusUpdate) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + id));

        booking.setStatus(BookingStatus.REJECTED);
        booking.setRejectionReason(statusUpdate.getRejectionReason());
        Booking saved = bookingRepository.save(booking);

        // 🔔 Notify user
        sendNotification(
            booking.getUserId(),
            "Booking Rejected ❌",
            "Your booking on " + booking.getDate() +
            " (" + booking.getStartTime() + " - " + booking.getEndTime() +
            ") was rejected. Reason: " + statusUpdate.getRejectionReason(),
            "BOOKING"
        );

        return mapToResponse(saved);
    }

    // ─── CANCEL BOOKING ───────────────────────────────────────────────────
    public BookingResponseDTO cancelBooking(String id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + id));

        booking.setStatus(BookingStatus.CANCELLED);
        Booking saved = bookingRepository.save(booking);

        // 🔔 Notify user
        sendNotification(
            booking.getUserId(),
            "Booking Cancelled 🚫",
            "Your booking on " + booking.getDate() +
            " (" + booking.getStartTime() + " - " + booking.getEndTime() +
            ") has been cancelled.",
            "BOOKING"
        );

        return mapToResponse(saved);
    }

    // ─── CHECK IN BOOKING ─────────────────────────────────────────────────
    public BookingResponseDTO checkInBooking(String id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + id));

        if (booking.getStatus() != BookingStatus.APPROVED) {
            throw new ConflictException(
                "Only APPROVED bookings can be checked in. Current status: " + booking.getStatus()
            );
        }

        booking.setStatus(BookingStatus.CHECKED_IN);
        Booking saved = bookingRepository.save(booking);

        // 🔔 Notify user
        sendNotification(
            booking.getUserId(),
            "Checked In Successfully 🎉",
            "You have been checked in for your booking on " + booking.getDate() +
            " (" + booking.getStartTime() + " - " + booking.getEndTime() + ").",
            "BOOKING"
        );

        return mapToResponse(saved);
    }

    // ─── DELETE BOOKING ───────────────────────────────────────────────────
    public void deleteBooking(String id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + id));
        bookingRepository.delete(booking);
    }

    // ─── VALIDATION HELPERS ───────────────────────────────────────────────
    private void validateResourceStatus(Resource resource) {
        if (resource.getStatus() == null || !resource.getStatus().equals("ACTIVE")) {
            throw new ConflictException("Cannot book " +
                (resource.getStatus() != null ? resource.getStatus() : "UNKNOWN") +
                " resource. Resource must be ACTIVE.");
        }
    }

    private void validateCapacity(Resource resource, int expectedAttendees) {
        if (expectedAttendees > resource.getCapacity()) {
            throw new ConflictException("Expected attendees (" + expectedAttendees +
                ") exceeds resource capacity (" + resource.getCapacity() + ").");
        }
    }

    private void validateAvailabilityWindow(Resource resource, LocalDate bookingDate,
                                             LocalTime bookingStart, LocalTime bookingEnd) {
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

            if (bookingStart.isBefore(windowStart) || bookingEnd.isAfter(windowEnd) ||
                    bookingStart.isAfter(bookingEnd)) {
                throw new ConflictException("Booking time (" + bookingStart + "-" + bookingEnd +
                    ") is outside resource availability window (" +
                    windowStart + "-" + windowEnd + " " + dayOfWeek + ").");
            }
            return;
        }

        if (!foundMatchingWindow) {
            throw new ConflictException("Resource is not available on " + dayOfWeek +
                ". Available windows: " + String.join(", ", resource.getAvailabilityWindows()));
        }
    }

    // ─── MAPPER ───────────────────────────────────────────────────────────
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
        response.setCreatedAt(booking.getCreatedAt());
        response.setUpdatedAt(booking.getUpdatedAt());
        return response;
    }
}
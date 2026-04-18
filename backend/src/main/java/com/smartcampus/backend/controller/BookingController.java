package com.smartcampus.backend.controller;

import com.smartcampus.backend.dto.BookingRequestDTO;
import com.smartcampus.backend.dto.BookingUpdateDTO;
import com.smartcampus.backend.dto.BookingResponseDTO;
import com.smartcampus.backend.dto.StatusUpdateDTO;
import com.smartcampus.backend.service.BookingService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = "*")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    // 1. Create a new booking
    @PostMapping
    public ResponseEntity<BookingResponseDTO> createBooking(
            @Valid @RequestBody BookingRequestDTO request) {
        BookingResponseDTO response = bookingService.createBooking(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // 2. Get my bookings (by userId)
    @GetMapping("/my/{userId}")
    public ResponseEntity<List<BookingResponseDTO>> getMyBookings(
            @PathVariable String userId) {
        return ResponseEntity.ok(bookingService.getMyBookings(userId));
    }

    // 3. Get all bookings (admin only)
    @GetMapping
    public ResponseEntity<List<BookingResponseDTO>> getAllBookings() {
        return ResponseEntity.ok(bookingService.getAllBookings());
    }

    // ✅ NEW: Public availability check for regular users
    // Returns PENDING + APPROVED bookings for a resource on a date
    // Frontend uses this to grey out already-booked time slots
    // GET /api/bookings/availability?resourceId=xxx&date=2026-04-21
    @GetMapping("/availability")
    public ResponseEntity<List<BookingResponseDTO>> getAvailability(
            @RequestParam String resourceId,
            @RequestParam String date) {
        return ResponseEntity.ok(bookingService.getBookingsForResourceAndDate(resourceId, date));
    }

    // 4. Update a booking
    @PutMapping("/{id}")
    public ResponseEntity<BookingResponseDTO> updateBooking(
            @PathVariable String id,
            @Valid @RequestBody BookingUpdateDTO request) {
        BookingResponseDTO response = bookingService.updateBooking(id, request);
        return ResponseEntity.ok(response);
    }

    // 5. Approve a booking
    @PutMapping("/{id}/approve")
    public ResponseEntity<BookingResponseDTO> approveBooking(
            @PathVariable String id) {
        return ResponseEntity.ok(bookingService.approveBooking(id));
    }

    // 6. Reject a booking
    @PutMapping("/{id}/reject")
    public ResponseEntity<BookingResponseDTO> rejectBooking(
            @PathVariable String id,
            @RequestBody StatusUpdateDTO statusUpdate) {
        return ResponseEntity.ok(bookingService.rejectBooking(id, statusUpdate));
    }

    // 7. Cancel a booking
    @PutMapping("/{id}/cancel")
    public ResponseEntity<BookingResponseDTO> cancelBooking(
            @PathVariable String id) {
        return ResponseEntity.ok(bookingService.cancelBooking(id));
    }

    // 8. Delete a booking
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBooking(
            @PathVariable String id) {
        bookingService.deleteBooking(id);
        return ResponseEntity.noContent().build();
    }
}
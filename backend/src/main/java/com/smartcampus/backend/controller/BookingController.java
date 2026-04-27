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

    @PostMapping
    public ResponseEntity<BookingResponseDTO> createBooking(
            @Valid @RequestBody BookingRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(bookingService.createBooking(request));
    }

    @GetMapping("/my/{userId}")
    public ResponseEntity<List<BookingResponseDTO>> getMyBookings(@PathVariable String userId) {
        return ResponseEntity.ok(bookingService.getMyBookings(userId));
    }

    @GetMapping
    public ResponseEntity<List<BookingResponseDTO>> getAllBookings() {
        return ResponseEntity.ok(bookingService.getAllBookings());
    }

    @GetMapping("/availability")
    public ResponseEntity<List<BookingResponseDTO>> getAvailability(
            @RequestParam String resourceId, @RequestParam String date) {
        return ResponseEntity.ok(bookingService.getBookingsForResourceAndDate(resourceId, date));
    }

    @PutMapping("/{id}")
    public ResponseEntity<BookingResponseDTO> updateBooking(
            @PathVariable String id, @Valid @RequestBody BookingUpdateDTO request) {
        return ResponseEntity.ok(bookingService.updateBooking(id, request));
    }

    // ✅ Approve — accepts optional approvalMessage via StatusUpdateDTO body
    // No Map import needed — reuses existing StatusUpdateDTO (with new approvalMessage field)
    @PutMapping("/{id}/approve")
    public ResponseEntity<BookingResponseDTO> approveBooking(
            @PathVariable String id,
            @RequestBody(required = false) StatusUpdateDTO body) {
        String message = (body != null && body.getApprovalMessage() != null)
                ? body.getApprovalMessage() : "";
        return ResponseEntity.ok(bookingService.approveBooking(id, message));
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<BookingResponseDTO> rejectBooking(
            @PathVariable String id, @RequestBody StatusUpdateDTO statusUpdate) {
        return ResponseEntity.ok(bookingService.rejectBooking(id, statusUpdate));
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<BookingResponseDTO> cancelBooking(@PathVariable String id) {
        return ResponseEntity.ok(bookingService.cancelBooking(id));
    }

    @PutMapping("/{id}/checkin")
    public ResponseEntity<BookingResponseDTO> checkInBooking(@PathVariable String id) {
        return ResponseEntity.ok(bookingService.checkInBooking(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBooking(@PathVariable String id) {
        bookingService.deleteBooking(id);
        return ResponseEntity.noContent().build();
    }
}
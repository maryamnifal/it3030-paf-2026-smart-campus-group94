package com.smartcampus.backend.repository;

import com.smartcampus.backend.model.Booking;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Repository
public interface BookingRepository extends MongoRepository<Booking, String> {

    // Get all bookings for a specific user
    List<Booking> findByUserId(String userId);

    // Get all bookings for a specific resource
    List<Booking> findByResourceId(String resourceId);

    // Conflict detection query:
    // Checks if there's an APPROVED booking on the same resource and date
    // where the time slots overlap
    @Query("{ 'resourceId': ?0, 'date': ?1, 'status': 'APPROVED', " +
           "'startTime': { $lt: ?3 }, 'endTime': { $gt: ?2 } }")
    List<Booking> findConflictingBookings(String resourceId,
                                          LocalDate date,
                                          LocalTime startTime,
                                          LocalTime endTime);
}
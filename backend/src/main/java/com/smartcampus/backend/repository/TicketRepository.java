package com.smartcampus.backend.repository;

import com.smartcampus.backend.model.Ticket;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

// NOTE TO TEAM: This repository handles the "tickets" MongoDB collection
@Repository
public interface TicketRepository extends MongoRepository<Ticket, String> {

    // Find all tickets created by a specific user (for USER role - "my tickets")
    List<Ticket> findByCreatedBy(String userId);

    // Find all tickets by status (for admin filtering)
    List<Ticket> findByStatus(String status);

    // Find all tickets by priority (for admin filtering)
    List<Ticket> findByPriority(String priority);

    // Find all tickets assigned to a specific technician
    List<Ticket> findByAssignedTo(String technicianId);

    // Find tickets by status and priority combined
    List<Ticket> findByStatusAndPriority(String status, String priority);

    // Find tickets by resource ID
    // NOTE TO TEAM: resourceId references the resource from Module A
    List<Ticket> findByResourceId(String resourceId);
}
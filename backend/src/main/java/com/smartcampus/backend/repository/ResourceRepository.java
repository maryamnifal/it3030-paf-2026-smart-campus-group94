package com.smartcampus.backend.repository;

import com.smartcampus.backend.model.Resource;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ResourceRepository extends MongoRepository<Resource, String> {

    // Find by type
    List<Resource> findByTypeIgnoreCase(String type);

    // 🔥 FIXED: Partial + case-insensitive location search
    List<Resource> findByLocationContainingIgnoreCase(String location);

    // Find by status
    List<Resource> findByStatus(String status);

    // Optional: combined filter
    List<Resource> findByTypeIgnoreCaseAndLocationContainingIgnoreCase(String type, String location);

    // Find by minimum capacity
    List<Resource> findByCapacityGreaterThanEqual(int capacity);
}
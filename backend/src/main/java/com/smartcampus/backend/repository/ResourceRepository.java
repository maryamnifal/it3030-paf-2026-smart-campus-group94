package com.smartcampus.backend.repository;

import com.smartcampus.backend.model.Resource;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ResourceRepository extends MongoRepository<Resource, String> {

    // Find by type (e.g. LAB, LECTURE_HALL)
    List<Resource> findByType(String type);

    // Find by location
    List<Resource> findByLocation(String location);

    // Find by status
    List<Resource> findByStatus(String status);

    // Find by type and location
    List<Resource> findByTypeAndLocation(String type, String location);

    // Find by minimum capacity
    List<Resource> findByCapacityGreaterThanEqual(int capacity);
}

package com.tvk.portal.repository;

import com.tvk.portal.model.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CourseRepository extends JpaRepository<Course, String> {
    // findById, findAll, save, deleteById inherited from JpaRepository
}

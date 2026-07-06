package com.tvk.portal.repository;

import com.tvk.portal.model.Enrollment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EnrollmentRepository extends JpaRepository<Enrollment, String> {

    List<Enrollment> findByStudentId(String studentId);

    List<Enrollment> findByCourseIdIn(List<String> courseIds);

    boolean existsByStudentIdAndCourseId(String studentId, String courseId);
}

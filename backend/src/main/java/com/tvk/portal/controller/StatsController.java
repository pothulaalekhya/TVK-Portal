package com.tvk.portal.controller;

import com.tvk.portal.repository.CourseRepository;
import com.tvk.portal.repository.EnrollmentRepository;
import com.tvk.portal.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/stats")
public class StatsController {

    @Autowired private UserRepository userRepository;
    @Autowired private CourseRepository courseRepository;
    @Autowired private EnrollmentRepository enrollmentRepository;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("students", userRepository.countByRole("student"));
        stats.put("trainers", userRepository.countByRole("trainer"));
        stats.put("courses", courseRepository.count());
        stats.put("totalEnrollments", enrollmentRepository.count());
        return ResponseEntity.ok(stats);
    }
}

package com.tvk.portal.controller;

import com.tvk.portal.model.Enrollment;
import com.tvk.portal.service.EnrollmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
public class EnrollmentController {

    @Autowired private EnrollmentService enrollmentService;

    /** GET /api/enrollments */
    @GetMapping("/api/enrollments")
    public ResponseEntity<List<Enrollment>> getAllEnrollments() {
        return ResponseEntity.ok(enrollmentService.getAllEnrollments());
    }

    /** POST /api/enroll */
    @PostMapping("/api/enroll")
    public ResponseEntity<Map<String, Object>> enroll(@RequestBody Map<String, String> body) {
        return ResponseEntity.status(HttpStatus.CREATED).body(enrollmentService.enroll(body));
    }

    /** POST /api/enrollment/update */
    @PostMapping("/api/enrollment/update")
    public ResponseEntity<Map<String, Object>> updateEnrollment(@RequestBody Map<String, Object> body) {
        return ResponseEntity.ok(enrollmentService.updateEnrollment(body));
    }
}

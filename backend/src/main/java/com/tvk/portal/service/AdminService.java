package com.tvk.portal.service;

import com.tvk.portal.model.SystemLog;
import com.tvk.portal.repository.ContactRequestRepository;
import com.tvk.portal.repository.CourseRepository;
import com.tvk.portal.repository.EnrollmentRepository;
import com.tvk.portal.repository.SystemLogRepository;
import com.tvk.portal.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * AdminService — aggregates dashboard stats, users list, and system logs.
 * Mirrors Express GET /api/admin/dashboard
 */
@Service
@Transactional(readOnly = true)
public class AdminService {

    @Autowired private UserRepository userRepository;
    @Autowired private CourseRepository courseRepository;
    @Autowired private EnrollmentRepository enrollmentRepository;
    @Autowired private ContactRequestRepository contactRepository;
    @Autowired private SystemLogRepository systemLogRepository;

    /**
     * GET /api/admin/dashboard
     * Returns aggregated statistics, user list, and system activity log.
     * Response format matches the Express server exactly for Angular compatibility.
     */
    public Map<String, Object> getDashboard() {
        // Build stats object
        Map<String, Object> stats = new HashMap<>();
        stats.put("students", userRepository.countByRole("student"));
        stats.put("trainers", userRepository.countByRole("trainer"));
        stats.put("courses", courseRepository.count());
        stats.put("pendingInquiries", contactRepository.countByStatus("unread"));
        stats.put("totalEnrollments", enrollmentRepository.count());

        // Get system log (50 most recent, newest first)
        List<SystemLog> systemLog = systemLogRepository.findTop50ByOrderByIdDesc();

        // Get all users
        var users = userRepository.findAll();

        Map<String, Object> response = new HashMap<>();
        response.put("stats", stats);
        response.put("systemLog", systemLog);
        response.put("users", users);

        return response;
    }
}

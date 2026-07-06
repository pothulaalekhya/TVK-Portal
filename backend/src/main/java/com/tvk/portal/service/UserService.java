package com.tvk.portal.service;

import com.tvk.portal.model.User;
import com.tvk.portal.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashMap;
import java.util.Map;

/**
 * UserService — Admin user management (update, delete).
 * Mirrors Express POST /api/users/update and DELETE /api/users/:id
 */
@Service
@Transactional
public class UserService {

    @Autowired private UserRepository userRepository;
    @Autowired private SseService sseService;

    /**
     * POST /api/users/update
     * Partial update of any user field (role, paymentStatus, approvalStatus, etc.)
     */
    public Map<String, Object> updateUser(Map<String, Object> body) {
        String id = (String) body.get("id");

        if (id == null || id.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "User ID is required.");
        }

        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found."));

        // Apply any provided fields selectively
        if (body.containsKey("name")) user.setName((String) body.get("name"));
        if (body.containsKey("email")) user.setEmail((String) body.get("email"));
        if (body.containsKey("role")) user.setRole((String) body.get("role"));
        if (body.containsKey("contactNum")) user.setContactNum((String) body.get("contactNum"));
        if (body.containsKey("collegeName")) user.setCollegeName((String) body.get("collegeName"));
        if (body.containsKey("branch")) user.setBranch((String) body.get("branch"));
        if (body.containsKey("paymentStatus")) user.setPaymentStatus((String) body.get("paymentStatus"));
        if (body.containsKey("approvalStatus")) user.setApprovalStatus((String) body.get("approvalStatus"));
        if (body.containsKey("batchNumber")) user.setBatchNumber((String) body.get("batchNumber"));
        if (body.containsKey("assignedTrainer")) user.setAssignedTrainer((String) body.get("assignedTrainer"));
        if (body.containsKey("specialization")) user.setSpecialization((String) body.get("specialization"));
        if (body.containsKey("strongTechnologies")) user.setStrongTechnologies((String) body.get("strongTechnologies"));

        userRepository.save(user);

        Map<String, Object> up = new HashMap<>();
        up.put("user", user);
        sseService.broadcast("USER_MUTATED", up);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("user", user);
        return response;
    }

    /**
     * DELETE /api/users/:id
     * Permanently deletes a user account.
     */
    public Map<String, Object> deleteUser(String id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found."));

        String name = user.getName();
        userRepository.deleteById(id);

        Map<String, Object> dp = new HashMap<>();
        dp.put("deletedId", id);
        sseService.broadcast("USER_MUTATED", dp);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Deleted user: " + name);
        return response;
    }
}

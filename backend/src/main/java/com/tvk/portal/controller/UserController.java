package com.tvk.portal.controller;

import com.tvk.portal.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired private UserService userService;

    /** POST /api/users/approve */
    @PostMapping("/approve")
    public ResponseEntity<Map<String, Object>> approveUser(@RequestBody Map<String, Object> body) {
        return ResponseEntity.ok(userService.approveCandidate(body));
    }

    /** POST /api/users/reject */
    @PostMapping("/reject")
    public ResponseEntity<Map<String, Object>> rejectUser(@RequestBody Map<String, Object> body) {
        return ResponseEntity.ok(userService.rejectCandidate(body));
    }

    /** POST /api/users/regenerate-temp-password */
    @PostMapping("/regenerate-temp-password")
    public ResponseEntity<Map<String, Object>> regenerateTempPassword(@RequestBody Map<String, Object> body) {
        return ResponseEntity.ok(userService.regenerateTempPassword(body));
    }

    /** POST /api/users/update */
    @PostMapping("/update")
    public ResponseEntity<Map<String, Object>> updateUser(@RequestBody Map<String, Object> body) {
        return ResponseEntity.ok(userService.updateUser(body));
    }

    /** POST /api/users/transition-role */
    @PostMapping("/transition-role")
    public ResponseEntity<Map<String, Object>> transitionUserRole(@RequestBody Map<String, Object> body) {
        return ResponseEntity.ok(userService.transitionUserRole(body));
    }

    /** DELETE /api/users/:id */
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteUser(@PathVariable String id) {
        return ResponseEntity.ok(userService.deleteUser(id));
    }
}

package com.tvk.portal.controller;

import com.tvk.portal.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired private AuthService authService;

    /** POST /api/auth/login */
    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, String> body) {
        return ResponseEntity.ok(authService.login(body));
    }

    /** POST /api/auth/register */
    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(@RequestBody Map<String, Object> body) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.register(body));
    }

    /** POST /api/auth/temp-password */
    @PostMapping("/temp-password")
    public ResponseEntity<Map<String, Object>> requestTempPassword(@RequestBody Map<String, String> body) {
        return ResponseEntity.ok(authService.requestTempPassword(body));
    }

    /** POST /api/auth/change-password */
    @PostMapping("/change-password")
    public ResponseEntity<Map<String, Object>> changePassword(@RequestBody Map<String, String> body) {
        return ResponseEntity.ok(authService.changePassword(body));
    }

    /** POST /api/auth/send-otp */
    @PostMapping("/send-otp")
    public ResponseEntity<Map<String, Object>> sendOtp(@RequestBody Map<String, String> body) {
        return ResponseEntity.ok(authService.sendOtp(body));
    }

    /** POST /api/auth/verify-otp */
    @PostMapping("/verify-otp")
    public ResponseEntity<Map<String, Object>> verifyOtp(@RequestBody Map<String, String> body) {
        return ResponseEntity.ok(authService.verifyOtp(body));
    }
}

package com.tvk.portal.controller;

import com.tvk.portal.model.ContactRequest;
import com.tvk.portal.service.ContactService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class ContactController {

    @Autowired private ContactService contactService;

    /** GET /api/contacts */
    @GetMapping("/contacts")
    public ResponseEntity<List<ContactRequest>> getAllContacts() {
        return ResponseEntity.ok(contactService.getAllContacts());
    }

    /** POST /api/contact */
    @PostMapping("/contact")
    public ResponseEntity<Map<String, Object>> submitContact(@RequestBody Map<String, String> body) {
        return ResponseEntity.status(HttpStatus.CREATED).body(contactService.submitContact(body));
    }

    /** POST /api/contact/respond */
    @PostMapping("/contact/respond")
    public ResponseEntity<Map<String, Object>> respondToContact(@RequestBody Map<String, String> body) {
        return ResponseEntity.ok(contactService.respondToContact(body));
    }
}

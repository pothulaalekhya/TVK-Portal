package com.tvk.portal.service;

import com.tvk.portal.model.ContactRequest;
import com.tvk.portal.repository.ContactRequestRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * ContactService — handles Contact form submissions and admin responses.
 * Mirrors Express /api/contact, /api/contacts, /api/contact/respond
 */
@Service
@Transactional
public class ContactService {

    @Autowired private ContactRequestRepository contactRepository;
    @Autowired private SseService sseService;

    public List<ContactRequest> getAllContacts() {
        return contactRepository.findAll();
    }

    /**
     * POST /api/contact
     * Saves a new inquiry from the Contact page.
     */
    public Map<String, Object> submitContact(Map<String, String> body) {
        String name = body.get("name");
        String email = body.get("email");
        String message = body.get("message");

        if (name == null || email == null || message == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Please fill out the name, email, and inquiry description fields.");
        }

        if (!AuthService.isValidEmail(email)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Please enter a valid email address (e.g. name@example.com).");
        }

        ContactRequest contact = new ContactRequest();
        contact.setId("cnt-" + System.currentTimeMillis());
        contact.setName(name);
        contact.setEmail(email);
        contact.setPhone(body.getOrDefault("phone", "Not Provided"));
        contact.setSubject(body.getOrDefault("subject", "Course Inquiry"));
        contact.setMessage(message);
        contact.setStatus("unread");
        contact.setCreatedAt(Instant.now().toString());

        contactRepository.save(contact);

        Map<String, Object> cp = new HashMap<>();
        cp.put("contact", contact);
        sseService.broadcast("CONTACT_MUTATED", cp);

        Map<String, Object> alertPayload = new HashMap<>();
        alertPayload.put("message", "🔔 New Inquiry from client '" + name + "' regarding: '" + contact.getSubject() + "'");
        sseService.broadcast("REALTIME_ALERT", alertPayload);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("contact", contact);
        return response;
    }

    /**
     * POST /api/contact/respond
     * Updates inquiry status to "read" or "replied" (Admin action).
     */
    public Map<String, Object> respondToContact(Map<String, String> body) {
        String id = body.get("id");
        String status = body.get("status");

        if (id == null || status == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Inquiry ID and new status are required.");
        }

        ContactRequest contact = contactRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Inquiry item not found."));

        contact.setStatus(status);
        contactRepository.save(contact);

        Map<String, Object> cp = new HashMap<>();
        cp.put("contactId", id);
        cp.put("updatedStatus", status);
        sseService.broadcast("CONTACT_MUTATED", cp);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("contact", contact);
        return response;
    }
}

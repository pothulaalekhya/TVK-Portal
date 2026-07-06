package com.tvk.portal.service;

import com.tvk.portal.model.SystemLog;
import com.tvk.portal.repository.SystemLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.time.Instant;
import java.util.*;
import java.util.concurrent.CopyOnWriteArrayList;

/**
 * SSE Service — manages real-time Server-Sent Events connections.
 * Mirrors the Express SSE broadcast system from server.ts.
 * All connected browsers receive updates when data changes.
 */
@Service
public class SseService {

    // Thread-safe list of all active SSE connections
    private final List<SseEmitter> emitters = new CopyOnWriteArrayList<>();

    @Autowired
    private SystemLogRepository systemLogRepository;

    /**
     * Creates a new SSE emitter for a connecting client.
     * Called by SseController when Angular opens /api/sync/stream
     */
    public SseEmitter createEmitter() {
        SseEmitter emitter = new SseEmitter(Long.MAX_VALUE); // No timeout

        // Auto-remove when client disconnects
        emitter.onCompletion(() -> emitters.remove(emitter));
        emitter.onTimeout(() -> emitters.remove(emitter));
        emitter.onError(e -> emitters.remove(emitter));

        emitters.add(emitter);
        return emitter;
    }

    /**
     * Broadcasts a message to ALL connected browser clients.
     * Also saves the event to the system log in MySQL.
     *
     * @param type    Event type (e.g. "ENROLLMENT_MUTATED", "REALTIME_ALERT")
     * @param payload Event data payload (will be JSON serialized)
     */
    public synchronized void broadcast(String type, Object payload) {
        Map<String, Object> message = new LinkedHashMap<>();
        message.put("type", type);
        message.put("payload", payload);
        message.put("timestamp", Instant.now().toString());

        // Track dead connections to remove
        List<SseEmitter> dead = new ArrayList<>();

        for (SseEmitter emitter : emitters) {
            try {
                emitter.send(SseEmitter.event()
                        .data(message, MediaType.APPLICATION_JSON));
            } catch (IOException | IllegalStateException e) {
                dead.add(emitter);
            }
        }

        emitters.removeAll(dead);

        // Save event to system log in MySQL (keep last 50 entries)
        try {
            SystemLog log = new SystemLog();
            log.setTime(Instant.now().toString());
            log.setEvent(type);
            String detail = "Broadcast: " + type + " — " +
                    payload.toString().substring(0, Math.min(100, payload.toString().length())) + "...";
            log.setDetail(detail);
            systemLogRepository.save(log);

            // Trim log to last 50 entries
            long count = systemLogRepository.count();
            if (count > 50) {
                List<SystemLog> all = systemLogRepository.findTop50ByOrderByIdDesc();
                if (!all.isEmpty()) {
                    Long minId = all.get(all.size() - 1).getId();
                    // Delete entries older than the 50th
                    systemLogRepository.findAll().stream()
                            .filter(l -> l.getId() < minId)
                            .forEach(systemLogRepository::delete);
                }
            }
        } catch (Exception e) {
            System.err.println("Failed to save system log: " + e.getMessage());
        }
    }

    /**
     * Sends a heartbeat to all clients every 30 seconds.
     * Keeps SSE connections alive and prevents timeouts.
     */
    @Scheduled(fixedRate = 30000)
    public void sendHeartbeat() {
        if (!emitters.isEmpty()) {
            Map<String, Object> payload = new HashMap<>();
            payload.put("heartbeat", true);
            broadcast("REALTIME_ALERT", payload);
        }
    }

    public int getActiveConnections() {
        return emitters.size();
    }
}

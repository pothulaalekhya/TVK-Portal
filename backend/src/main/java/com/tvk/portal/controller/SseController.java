package com.tvk.portal.controller;

import com.tvk.portal.service.SseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * SSE Controller — handles GET /api/sync/stream
 * Angular opens an EventSource connection to this endpoint.
 * All real-time updates are pushed via Server-Sent Events.
 */
@RestController
@RequestMapping("/api/sync")
public class SseController {

    @Autowired private SseService sseService;

    /** GET /api/sync/stream */
    @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter stream() {
        SseEmitter emitter = sseService.createEmitter();

        // Send welcome event immediately on connection
        try {
            Map<String, Object> welcome = new LinkedHashMap<>();
            welcome.put("type", "REALTIME_ALERT");
            Map<String, Object> payload = new LinkedHashMap<>();
            payload.put("message", "Connected to TVK Technologies Live Sync System Gateway");
            welcome.put("payload", payload);
            welcome.put("timestamp", Instant.now().toString());

            emitter.send(SseEmitter.event()
                    .data(welcome, MediaType.APPLICATION_JSON));
        } catch (IOException e) {
            emitter.completeWithError(e);
        }

        return emitter;
    }
}

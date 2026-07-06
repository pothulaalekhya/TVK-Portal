package com.tvk.portal.controller;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

/**
 * SPA Fallback Controller
 * Serves index.html for all Angular client-side routes.
 * Without this, refreshing /dashboard or /courses would return 404.
 *
 * The regex excludes paths with dots (static files) and /api routes.
 */
@Controller
public class SpaController {

    /**
     * Forward all non-file, non-API requests to Angular's index.html.
     * Examples handled:
     *   /home → index.html
     *   /courses → index.html
     *   /dashboard → index.html
     *
     * Examples NOT handled (served by other controllers/resources):
     *   /api/** → REST controllers
     *   /main-xxx.js → static resource
     *   /styles-xxx.css → static resource
     */
    @RequestMapping(value = {
        "/",
        "/home",
        "/courses",
        "/contact",
        "/dashboard",
        "/{path:[^\\.]*}"
    })
    public String spaFallback(HttpServletRequest request) {
        return "forward:/index.html";
    }
}

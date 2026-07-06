package com.tvk.portal.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Web Configuration
 * Angular build output is copied into classpath:/static/ by Maven (pom.xml resource plugin).
 * Spring Boot auto-serves classpath:/static/ — this class just makes it explicit.
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Serve Angular static files (JS, CSS, fonts, images, favicon) from classpath
        registry.addResourceHandler("/**")
                .addResourceLocations("classpath:/static/")
                .setCachePeriod(86400);
    }
}

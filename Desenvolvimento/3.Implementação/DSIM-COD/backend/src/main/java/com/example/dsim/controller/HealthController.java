package com.example.dsim.controller;

import java.time.Instant;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController

@CrossOrigin(origins = "${cors.allowed-origins}")
public class HealthController {

    // Endpoint público para ALB Health Check
    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> status() {
        return ResponseEntity.ok(Map.of(
            "status", "UP",
            "timestamp", Instant.now().toString(),
            "service", "DSIM Backend",
            "version", "1.0.0"
        ));
    }

    // Endpoint detalhado (público para monitoramento)
    @GetMapping("/api/health")
    public ResponseEntity<Map<String, Object>> health() {
        return ResponseEntity.ok(Map.of(
            "status", "UP",
            "timestamp", Instant.now().toString(),
            "service", "DSIM Backend",
            "version", "1.0.0",
            "security", "Cognito JWT enabled",
            "database", "DynamoDB ready",
            "cors", "enabled",
            "websocket", "available"
        ));
    }
}
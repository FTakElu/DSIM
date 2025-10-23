package com.example.dsim.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.example.dsim.model.DadosPulseira;
import com.example.dsim.service.MewsAlertService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/pulseira")
@RequiredArgsConstructor
@CrossOrigin(origins = "${cors.allowed-origins}")
public class PulseiraController {
    private final MewsAlertService service;

    @PostMapping("/dados")
    @PreAuthorize("hasRole('DEVICE') or hasRole('ADMIN')")
    public ResponseEntity<String> receberDados(@RequestBody DadosPulseira dados) {
        service.avaliarLeitura(dados);
        return ResponseEntity.ok("Dados recebidos e processados");
    }

    @GetMapping("/health")
    public ResponseEntity<String> healthCheck() {
        return ResponseEntity.ok("Pulseira API está funcionando");
    }
}
package com.example.dsim.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.example.dsim.model.DadosPulseira;
import com.example.dsim.service.MewsAlertService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/mews")
@RequiredArgsConstructor
@CrossOrigin(origins = "${cors.allowed-origins}")
public class MewsController {
    private final MewsAlertService service;

    @PostMapping("/avaliar")
    @PreAuthorize("hasRole('MEDICO') or hasRole('ENFERMEIRO') or hasRole('ADMIN')")
    public ResponseEntity<String> avaliar(@RequestBody DadosPulseira leitura) {
        service.avaliarLeitura(leitura);
        return ResponseEntity.ok("Leitura avaliada");
    }
}
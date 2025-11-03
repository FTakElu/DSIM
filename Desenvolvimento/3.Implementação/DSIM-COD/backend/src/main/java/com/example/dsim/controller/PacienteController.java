package com.example.dsim.controller;

import java.util.Optional;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.example.dsim.model.Paciente;
import com.example.dsim.repository.PacienteRepository;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/pacientes")
@RequiredArgsConstructor
@CrossOrigin(origins = "${cors.allowed-origins}")
public class PacienteController {
    private final PacienteRepository pacienteRepository;

    @GetMapping("/device/{deviceId}")
    @PreAuthorize("hasRole('MEDICO') or hasRole('ENFERMEIRO') or hasRole('ADMIN')")
    public ResponseEntity<Paciente> buscarPorDeviceId(@PathVariable String deviceId) {
        Optional<Paciente> paciente = pacienteRepository.buscarPorDeviceId(deviceId);
        return paciente.map(ResponseEntity::ok)
                      .orElse(ResponseEntity.notFound().build());
    }
}
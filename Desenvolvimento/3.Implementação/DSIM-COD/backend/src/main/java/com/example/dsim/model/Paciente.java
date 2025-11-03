package com.example.dsim.model;

import lombok.Data;
import java.util.Map;

@Data
public class Paciente {
    private String pacienteId;
    private String nome;
    private String dataNascimento;
    private String deviceId;
    private String cuidadorId;
    private Map<String, Double> mewsLimits; // hr_min, hr_max, temp_max, score_threshold
}
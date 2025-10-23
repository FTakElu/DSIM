package com.example.dsim.model;


import lombok.Data;

@Data
public class Alarme {
    private String alarmeId;
    private String pacienteId;
    private long timestamp;
    private int mewsScore;
    private String status; // "Active", "Resolved"
    private String motivo;
}
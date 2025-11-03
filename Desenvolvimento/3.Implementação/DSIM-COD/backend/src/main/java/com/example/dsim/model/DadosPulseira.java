package com.example.dsim.model;

import lombok.Data;

@Data
public class DadosPulseira {
    private String deviceID;
    private long timestamp;
    private Integer heartRate;          // Permite null
    private Double temperature;         // Permite null  
    private Integer oximetry;           // Permite null
    private Integer bloodPressureSystolic;   // Permite null
    private Integer bloodPressureDiastolic;  // Permite null
}
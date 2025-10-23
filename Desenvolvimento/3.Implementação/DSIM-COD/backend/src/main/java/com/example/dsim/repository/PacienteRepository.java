package com.example.dsim.repository;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.example.dsim.model.Paciente;

import lombok.RequiredArgsConstructor;
import software.amazon.awssdk.services.dynamodb.DynamoDbClient;
import software.amazon.awssdk.services.dynamodb.model.AttributeValue;
import software.amazon.awssdk.services.dynamodb.model.ScanRequest;

@Service
@RequiredArgsConstructor
public class PacienteRepository {
    private final DynamoDbClient dynamoDb;

    public Optional<Paciente> buscarPorDeviceId(String deviceId) {
        ScanRequest scan = ScanRequest.builder()
            .tableName("Pacientes")
            .filterExpression("deviceId = :dev")
            .expressionAttributeValues(Map.of(":dev", AttributeValue.builder().s(deviceId).build()))
            .limit(1)
            .build();

        var response = dynamoDb.scan(scan);
        if (response.count() == 0) return Optional.empty();

        return Optional.of(toModel(response.items().get(0)));
    }

    private Paciente toModel(Map<String, AttributeValue> item) {
        Paciente p = new Paciente();
        p.setPacienteId(item.get("pacienteId").s());
        p.setNome(item.get("nome").s());
        p.setDeviceId(item.get("deviceId").s());
        p.setCuidadorId(item.get("cuidadorId").s());
        
        // Parse dos limites MEWS
        Map<String, Double> limits = new HashMap<>();
        var mews = item.get("mewsLimits").m();
        limits.put("hr_min", Double.parseDouble(mews.get("hr_min").n()));
        limits.put("hr_max", Double.parseDouble(mews.get("hr_max").n()));
        limits.put("temp_max", Double.parseDouble(mews.get("temp_max").n()));
        limits.put("score_threshold", Double.parseDouble(mews.get("score_threshold").n()));
        p.setMewsLimits(limits);
        
        return p;
    }
}
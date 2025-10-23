package com.example.dsim.service;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import com.example.dsim.model.DadosPulseira;
import com.example.dsim.model.Paciente;
import com.example.dsim.repository.PacienteRepository;

import lombok.RequiredArgsConstructor;
import software.amazon.awssdk.services.dynamodb.DynamoDbClient;
import software.amazon.awssdk.services.dynamodb.model.AttributeValue;
import software.amazon.awssdk.services.dynamodb.model.PutItemRequest;

@Service
@RequiredArgsConstructor
public class MewsAlertService {
    private final PacienteRepository pacienteRepo;
    private final DynamoDbClient dynamoDb;
    private final SimpMessagingTemplate ws;

    public void avaliarLeitura(DadosPulseira leitura) {
        pacienteRepo.buscarPorDeviceId(leitura.getDeviceID()).ifPresent(p -> {
            int score = calcularScore(leitura, p);
            int limite = p.getMewsLimits().getOrDefault("score_threshold", 4.0).intValue();
            if (score >= limite) {
                registrarAlarme(p.getPacienteId(), leitura, score);
                String payload = String.format(
                    "{\"type\":\"MEWS_ALERT\",\"patientId\":\"%s\",\"score\":%d,\"message\":\"Alerta MEWS para %s\",\"timestamp\":%d}", 
                    p.getPacienteId(), score, p.getNome(), System.currentTimeMillis());
                ws.convertAndSend("/topic/alarms/" + p.getPacienteId(), payload);
            }
        });
    }

    private int calcularScore(DadosPulseira d, Paciente p) {
        int score = 0;
        Double hrMin = p.getMewsLimits().getOrDefault("hr_min", 50.0);
        Double hrMax = p.getMewsLimits().getOrDefault("hr_max", 110.0);
        Double tempMax = p.getMewsLimits().getOrDefault("temp_max", 38.5);

        // Verificação segura da frequência cardíaca
        if (d.getHeartRate() != null && d.getHeartRate() > 0) {
            if (d.getHeartRate() < hrMin) score += 2;
            else if (d.getHeartRate() > hrMax) score += 2;
        }
        
        // Verificação segura da temperatura
        if (d.getTemperature() != null && d.getTemperature() > 0 && d.getTemperature() > tempMax) {
            score += 2;
        }
        
        return score;
    }

    private void registrarAlarme(String pacienteId, DadosPulseira d, int score) {
        String motivo = String.format("Frequência Cardíaca (%d) fora dos limites de segurança.", 
            d.getHeartRate() != null ? d.getHeartRate() : 0);
        
        Map<String, AttributeValue> item = new HashMap<>();
        item.put("alarmeId", AttributeValue.builder().s(UUID.randomUUID().toString()).build());
        item.put("pacienteId", AttributeValue.builder().s(pacienteId).build());
        item.put("timestamp", AttributeValue.builder().n(Long.toString(System.currentTimeMillis())).build());
        item.put("mewsScore", AttributeValue.builder().n(Integer.toString(score)).build());
        item.put("status", AttributeValue.builder().s("Active").build());
        item.put("motivo", AttributeValue.builder().s(motivo).build());

        dynamoDb.putItem(PutItemRequest.builder()
            .tableName("Alarmes")
            .item(item)
            .build());
    }
}
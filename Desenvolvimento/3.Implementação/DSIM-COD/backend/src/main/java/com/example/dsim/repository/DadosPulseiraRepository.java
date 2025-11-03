package com.example.dsim.repository;

import com.example.dsim.model.DadosPulseira;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.dynamodb.DynamoDbClient;
import software.amazon.awssdk.services.dynamodb.model.AttributeValue;
import software.amazon.awssdk.services.dynamodb.model.QueryRequest;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class DadosPulseiraRepository {
    private final DynamoDbClient dynamoDb;

    public List<DadosPulseira> buscarPorDevice(String deviceID, long desde, long ate) {
        QueryRequest request = QueryRequest.builder()
            .tableName("DadosPulseira")
            .keyConditionExpression("deviceID = :id AND #ts BETWEEN :desde AND :ate")
            .expressionAttributeNames(Map.of("#ts", "timestamp"))
            .expressionAttributeValues(Map.of(
                ":id", AttributeValue.builder().s(deviceID).build(),
                ":desde", AttributeValue.builder().n(Long.toString(desde)).build(),
                ":ate", AttributeValue.builder().n(Long.toString(ate)).build()
            ))
            .build();

        var response = dynamoDb.query(request);
        return response.items().stream().map(this::toModel).toList();
    }

    private DadosPulseira toModel(Map<String, AttributeValue> item) {
        DadosPulseira d = new DadosPulseira();
        d.setDeviceID(item.get("deviceID").s());
        d.setTimestamp(Long.parseLong(item.get("timestamp").n()));
        
        // Tratamento seguro para valores que podem ser nulos
        if (item.containsKey("heartRate") && item.get("heartRate") != null) {
            d.setHeartRate(Integer.parseInt(item.get("heartRate").n()));
        }
        if (item.containsKey("temperature") && item.get("temperature") != null) {
            d.setTemperature(Double.parseDouble(item.get("temperature").n()));
        }
        if (item.containsKey("oximetry") && item.get("oximetry") != null) {
            d.setOximetry(Integer.parseInt(item.get("oximetry").n()));
        }
        if (item.containsKey("bloodPressureSystolic") && item.get("bloodPressureSystolic") != null) {
            d.setBloodPressureSystolic(Integer.parseInt(item.get("bloodPressureSystolic").n()));
        }
        if (item.containsKey("bloodPressureDiastolic") && item.get("bloodPressureDiastolic") != null) {
            d.setBloodPressureDiastolic(Integer.parseInt(item.get("bloodPressureDiastolic").n()));
        }
        
        return d;
    }
}
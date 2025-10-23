package com.example.dsim.model;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class Usuario {
    private String userId;
    private String username;
    private String nomeCompleto;
    private String email;
    private String telefone;
    private List<String> roles; // Roles do Cognito (MEDICO, ENFERMEIRO, ADMIN, DEVICE)
    private String associatedPatientId;
    private String crm; // Para médicos
    private String coren; // Para enfermeiros
    private String departamento;
    private Boolean ativo;
    private Instant dataCriacao;
    private Instant ultimoLogin;
    
    // Métodos de conveniência para verificar roles
    public boolean isMedico() {
        return roles != null && roles.contains("MEDICO");
    }
    
    public boolean isEnfermeiro() {
        return roles != null && roles.contains("ENFERMEIRO");
    }
    
    public boolean isAdmin() {
        return roles != null && roles.contains("ADMIN");
    }
    
    public boolean isDevice() {
        return roles != null && roles.contains("DEVICE");
    }
    
    public boolean hasRole(String role) {
        return roles != null && roles.contains(role.toUpperCase());
    }
}
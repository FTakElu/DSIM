package com.example.dsim.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;

import com.example.dsim.model.Usuario;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Service
@Slf4j
@RequiredArgsConstructor
public class UserService {

    /**
     * Obtém as informações do usuário autenticado a partir do JWT
     */
    public Optional<Usuario> getCurrentUser() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            
            if (authentication == null || !authentication.isAuthenticated()) {
                return Optional.empty();
            }

            Jwt jwt = (Jwt) authentication.getPrincipal();
            
            Usuario usuario = new Usuario();
            usuario.setUserId(jwt.getClaimAsString("sub"));
            usuario.setUsername(jwt.getClaimAsString("username"));
            usuario.setEmail(jwt.getClaimAsString("email"));
            usuario.setNomeCompleto(jwt.getClaimAsString("name"));
            usuario.setTelefone(jwt.getClaimAsString("phone_number"));
            
            // Extrair roles dos grupos do Cognito
            List<String> groups = jwt.getClaimAsStringList("cognito:groups");
            usuario.setRoles(groups);
            
            // Extrair atributos customizados se existirem
            usuario.setCrm(jwt.getClaimAsString("custom:crm"));
            usuario.setCoren(jwt.getClaimAsString("custom:coren"));
            usuario.setDepartamento(jwt.getClaimAsString("custom:departamento"));
            usuario.setAssociatedPatientId(jwt.getClaimAsString("custom:patient_id"));
            
            usuario.setAtivo(true);
            usuario.setUltimoLogin(Instant.now());
            
            return Optional.of(usuario);
            
        } catch (Exception e) {
            log.error("Erro ao obter informações do usuário atual", e);
            return Optional.empty();
        }
    }

    /**
     * Obtém o ID do usuário autenticado
     */
    public Optional<String> getCurrentUserId() {
        return getCurrentUser().map(Usuario::getUserId);
    }

    /**
     * Obtém o username do usuário autenticado
     */
    public Optional<String> getCurrentUsername() {
        return getCurrentUser().map(Usuario::getUsername);
    }

    /**
     * Verifica se o usuário atual tem um role específico
     */
    public boolean hasRole(String role) {
        return getCurrentUser()
                .map(user -> user.hasRole(role))
                .orElse(false);
    }

    /**
     * Verifica se o usuário atual é médico
     */
    public boolean isCurrentUserMedico() {
        return hasRole("MEDICO");
    }

    /**
     * Verifica se o usuário atual é enfermeiro
     */
    public boolean isCurrentUserEnfermeiro() {
        return hasRole("ENFERMEIRO");
    }

    /**
     * Verifica se o usuário atual é admin
     */
    public boolean isCurrentUserAdmin() {
        return hasRole("ADMIN");
    }

    /**
     * Verifica se o usuário atual é um dispositivo
     */
    public boolean isCurrentUserDevice() {
        return hasRole("DEVICE");
    }

    /**
     * Obtém o JWT token do usuário autenticado
     */
    public Optional<Jwt> getCurrentJwt() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            
            if (authentication == null || !authentication.isAuthenticated()) {
                return Optional.empty();
            }

            return Optional.of((Jwt) authentication.getPrincipal());
            
        } catch (Exception e) {
            log.error("Erro ao obter JWT do usuário atual", e);
            return Optional.empty();
        }
    }
}
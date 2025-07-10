package com.cipalam.cipalam_sistema.DTO.auth;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthLoginResponseDTO {
    private boolean success;
    private String message;
    private String usuario;
    private Integer pessoaId;
    private Long usuarioId;
    private String nomePessoa;
    private String token;
    private String tipo;
    private List<FuncionalidadeDTO> funcionalidades;

    // Propriedades adicionais para JWT
    private String accessToken;
    private String refreshToken;
    @Builder.Default
    private String tokenType = "Bearer";
    private Long expiresIn;
    private String email;

    public AuthLoginResponseDTO(boolean success, String message) {
        this.success = success;
        this.message = message;
    }
}

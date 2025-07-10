package com.cipalam.cipalam_sistema.DTO.auth;

import com.cipalam.cipalam_sistema.enums.TipoUsuario;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class RegisterResponseDTO {
    private Long id;
    private String nome;
    private String email;
    private String cpf;
    private TipoUsuario tipoUsuario;
    private String message;
    private boolean success;
}

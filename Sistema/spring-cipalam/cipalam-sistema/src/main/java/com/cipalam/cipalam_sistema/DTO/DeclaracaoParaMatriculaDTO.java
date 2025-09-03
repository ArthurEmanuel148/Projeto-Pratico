package com.cipalam.cipalam_sistema.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DeclaracaoParaMatriculaDTO {
    private Integer id;
    private String protocolo;
    private String nomeAluno;
    private String nomeResponsavel;
    private String tipoCotaDescricao;
    private LocalDate dataEnvio;
    private String status;
    private Integer diasAguardando;
}

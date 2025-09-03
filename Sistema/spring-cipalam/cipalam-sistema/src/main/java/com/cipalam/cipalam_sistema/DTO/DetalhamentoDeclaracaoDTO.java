package com.cipalam.cipalam_sistema.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DetalhamentoDeclaracaoDTO {
    private Integer id;
    private String protocolo;
    private String nomeAluno;
    private LocalDate dataNascimentoAluno;
    private String nomeResponsavel;
    private String cpfResponsavel;
    private String emailResponsavel;
    private String telefoneResponsavel;
    private BigDecimal rendaResponsavel;
    private String profissaoResponsavel;
    private String enderecoResponsavel;
    private String tipoCotaDescricao;
    private String integrantesFamilia;
    private String observacoes;
    private LocalDate dataEnvio;
    private String status;
    private Integer diasAguardando;
}

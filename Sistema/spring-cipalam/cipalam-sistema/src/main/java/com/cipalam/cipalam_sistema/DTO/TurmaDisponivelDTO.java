package com.cipalam.cipalam_sistema.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TurmaDisponivelDTO {
    private Integer id;
    private String nome;
    private String turno;
    private String descricaoCompleta;
    private Integer vagasDisponiveis;
    private Boolean temVagas;
    private Integer capacidadeMaxima;
    private String horarios;
}

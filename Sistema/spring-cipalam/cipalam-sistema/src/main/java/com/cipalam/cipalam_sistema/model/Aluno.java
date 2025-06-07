package com.cipalam.cipalam_sistema.model;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Aluno {
    private Long id;
    private String nome;
    private String cpf;
    private String dtNasc;

}

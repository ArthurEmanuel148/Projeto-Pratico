package com.cipalam.cipalam_sistema.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "tbFuncionario")
@Data
public class Funcionario {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "idFuncionario")
    private Integer idFuncionario;

    @Column(name = "tbPessoa_idPessoa")
    private Integer tbPessoaIdPessoa;

    @Column(name = "dataInicio")
    private LocalDate dataInicio;

    @Column(name = "dataFim")
    private LocalDate dataFim;

    @Column(name = "ativo")
    private Boolean ativo;

    @Column(name = "observacoes")
    private String observacoes;

    @Column(name = "dataCriacao", insertable = false, updatable = false)
    private LocalDateTime dataCriacao;

    @Column(name = "dataAtualizacao", insertable = false, updatable = false)
    private LocalDateTime dataAtualizacao;
}
package com.cipalam.cipalam_sistema.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "tbPessoa")
public class Pessoa {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "idPessoa")
    private Integer idPessoa;

    @Column(name = "NmPessoa")
    private String nmPessoa;

    @Column(name = "CpfPessoa")
    private String cpfPessoa;

    @Column(name = "caminhoImagem")
    private String caminhoImagem;

    @Column(name = "dtNascPessoa")
    private java.sql.Date dtNascPessoa;

    @Column(name = "caminhoIdentidadePessoa")
    private String caminhoIdentidadePessoa;
}
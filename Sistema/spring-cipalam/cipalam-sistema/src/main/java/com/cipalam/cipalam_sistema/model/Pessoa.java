package com.cipalam.cipalam_sistema.model;

import jakarta.persistence.*;
import lombok.Data;

// A classe Pessoa é como um "formulário digital" que:

// ✅Recebe dados pessoais do frontend
// ✅Armazena no banco de dados MySQL
// ✅Busca pessoas quando precisa
// ✅Serve de base para funcionários, responsáveis e alunos
// ✅Organiza todas as informações pessoais em um lugar só

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

    @Column(name = "email")
    private String email;

    @Column(name = "telefone")
    private String telefone;

    @Column(name = "renda")
    private Double renda;

    @Column(name = "profissao")
    private String profissao;

    @Column(name = "caminhoIdentidadePessoa")
    private String caminhoIdentidadePessoa;

    @Column(name = "ativo")
    private Boolean ativo = true;

    @Column(name = "dataCriacao")
    private java.sql.Timestamp dataCriacao;
}
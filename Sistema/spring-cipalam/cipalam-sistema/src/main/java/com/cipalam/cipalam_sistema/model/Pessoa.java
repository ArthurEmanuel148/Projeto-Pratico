package com.cipalam.cipalam_sistema.model;

import jakarta.persistence.*;
import lombok.Data;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.math.BigDecimal;
import java.time.LocalDateTime;

// A classe Pessoa é como um "formulário digital" que:
// ✅ Recebe dados pessoais do frontend
// ✅ Armazena no banco de dados MySQL
// ✅ Busca pessoas quando precisa
// ✅ Serve de base para funcionários, responsáveis e alunos
// ✅ Organiza todas as informações pessoais em um lugar só
// ✅ NOVO: Inclui dados de renda e parentesco familiar

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

    @Column(name = "caminhoIdentidadePessoa")
    private String caminhoIdentidadePessoa;

    // CAMPOS FAMILIARES - RELACIONAMENTO COM FAMÍLIA
    @Column(name = "tbFamilia_idtbFamilia")
    private Integer tbFamiliaIdtbFamilia;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tbFamilia_idtbFamilia", referencedColumnName = "idtbFamilia", insertable = false, updatable = false)
    @JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
    private Familia familia;

    @Column(name = "parentesco")
    @Enumerated(EnumType.STRING)
    private Parentesco parentesco;

    // CAMPOS DE RENDA INDIVIDUAL
    @Column(name = "tipoRenda")
    @Enumerated(EnumType.STRING)
    private TipoRenda tipoRenda;

    @Column(name = "valorRenda", precision = 10, scale = 2)
    private BigDecimal valorRenda;

    @Column(name = "descricaoRenda", length = 200)
    private String descricaoRenda;

    @Column(name = "rendaComprovada")
    private Boolean rendaComprovada = false;

    @Column(name = "caminhoComprovanteRenda")
    private String caminhoComprovanteRenda;

    // CONTROLE
    @Column(name = "ativo")
    private Boolean ativo = true;

    @Column(name = "dataCriacao")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime dataCriacao;

    @Column(name = "dataAtualizacao")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime dataAtualizacao;

    // Enum para parentesco
    public enum Parentesco {
        pai, mae, conjuge, filho, filha, irmao, irma, avo, avo_materna, avo_paterna,
        tio, tia, primo, prima, cunhado, cunhada, sogro, sogra, genro, nora, neto,
        neta, enteado, enteada, padrasto, madrasta, outros
    }

    // Enum para tipo de renda
    public enum TipoRenda {
        salario_formal, autonomo, aposentadoria, pensao, beneficio_social,
        auxilio_emergencial, seguro_desemprego, renda_informal, sem_renda, outros
    }

    // Construtor padrão
    public Pessoa() {
        this.dataCriacao = LocalDateTime.now();
        this.dataAtualizacao = LocalDateTime.now();
        this.ativo = true;
        this.rendaComprovada = false;
        this.tipoRenda = TipoRenda.sem_renda;
        this.valorRenda = BigDecimal.ZERO;
    }
}
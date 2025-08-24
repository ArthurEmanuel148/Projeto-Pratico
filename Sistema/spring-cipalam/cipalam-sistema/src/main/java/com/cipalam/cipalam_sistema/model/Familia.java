package com.cipalam.cipalam_sistema.model;

import jakarta.persistence.*;
import lombok.Data;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "tbFamilia")
@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
public class Familia {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "idtbFamilia")
    private Integer idtbFamilia;

    // ENDEREÇO COMPLETO
    @Column(name = "cep", length = 9)
    private String cep;

    @Column(name = "logradouro", length = 200)
    private String logradouro;

    @Column(name = "numero", length = 20)
    private String numero;

    @Column(name = "complemento", length = 100)
    private String complemento;

    @Column(name = "bairro", length = 100)
    private String bairro;

    @Column(name = "cidade", length = 100)
    private String cidade;

    @Column(name = "uf", length = 2)
    private String uf;

    @Column(name = "codigoIbgeCidade", length = 10)
    private String codigoIbgeCidade;

    @Column(name = "pontoReferencia", columnDefinition = "TEXT")
    private String pontoReferencia;

    // DOCUMENTAÇÃO
    @Column(name = "caminhoComprovanteresidencia")
    private String caminhoComprovanteresidencia;

    // DADOS SOCIOECONÔMICOS (numeroIntegrantes será calculado dinamicamente)
    @Column(name = "rendaFamiliarTotal", precision = 10, scale = 2)
    private BigDecimal rendaFamiliarTotal;

    @Column(name = "rendaPerCapita", precision = 10, scale = 2)
    private BigDecimal rendaPerCapita;

    @Column(name = "beneficiarioProgSocial")
    private Boolean beneficiarioProgSocial = false;

    @Column(name = "programasSociais", columnDefinition = "JSON")
    private String programasSociais;

    // SITUAÇÃO HABITACIONAL
    @Column(name = "tipoMoradia")
    @Enumerated(EnumType.STRING)
    private TipoMoradia tipoMoradia;

    @Column(name = "valorAluguelFinanciamento", precision = 10, scale = 2)
    private BigDecimal valorAluguelFinanciamento;

    // DADOS COMPLEMENTARES
    @Column(name = "observacoes", columnDefinition = "TEXT")
    private String observacoes;

    @Column(name = "situacaoFamiliar", columnDefinition = "TEXT")
    private String situacaoFamiliar;

    // CONTROLE
    @Column(name = "ativo")
    private Boolean ativo = true;

    @Column(name = "dataCriacao")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime dataCriacao;

    @Column(name = "dataAtualizacao")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime dataAtualizacao;

    // Enum para tipo de moradia
    public enum TipoMoradia {
        propria, alugada, cedida, financiada, outros
    }

    // Construtor padrão
    public Familia() {
        this.dataCriacao = LocalDateTime.now();
        this.dataAtualizacao = LocalDateTime.now();
        this.ativo = true;
        this.beneficiarioProgSocial = false;
    }
}
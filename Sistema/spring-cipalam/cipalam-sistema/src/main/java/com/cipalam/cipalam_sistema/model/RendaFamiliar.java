package com.cipalam.cipalam_sistema.model;

import jakarta.persistence.*;
import lombok.Data;
import com.fasterxml.jackson.annotation.JsonFormat;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "tbRendaFamiliar")
public class RendaFamiliar {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "idtbRendaFamiliar")
    private Integer idtbRendaFamiliar;

    @Column(name = "idtbFamilia", nullable = false)
    private Integer idtbFamilia;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "idtbFamilia", referencedColumnName = "idtbFamilia", insertable = false, updatable = false)
    private Familia familia;

    @Column(name = "nomeMembroFamilia", length = 100, nullable = false)
    private String nomeMembroFamilia;

    @Column(name = "parentesco", nullable = false)
    @Enumerated(EnumType.STRING)
    private Parentesco parentesco;

    @Column(name = "idade")
    private Integer idade;

    @Column(name = "tipoRenda", nullable = false)
    @Enumerated(EnumType.STRING)
    private TipoRenda tipoRenda;

    @Column(name = "valorRenda", precision = 10, scale = 2)
    private BigDecimal valorRenda;

    @Column(name = "descricaoRenda", length = 200)
    private String descricaoRenda;

    @Column(name = "comprovado")
    private Boolean comprovado = false;

    @Column(name = "caminhoComprovanteRenda")
    private String caminhoComprovanteRenda;

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
        auxilio_emergencial, seguro_desemprego, renda_informal, outros
    }

    // Construtor padrão
    public RendaFamiliar() {
        this.dataCriacao = LocalDateTime.now();
        this.dataAtualizacao = LocalDateTime.now();
        this.ativo = true;
        this.comprovado = false;
    }
}

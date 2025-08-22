package com.cipalam.cipalam_sistema.model;

import jakarta.persistence.*;
import lombok.Data;
import com.fasterxml.jackson.annotation.JsonFormat;
import java.time.LocalDateTime;
import java.time.LocalDate;
import java.math.BigDecimal;

@Entity
@Data
@Table(name = "tbInteresseMatricula")
public class InteresseMatricula {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "protocolo", unique = true)
    private String protocolo;

    // DADOS DO RESPONSÁVEL
    @Column(name = "nomeResponsavel", nullable = false, length = 100)
    private String nomeResponsavel;

    @Column(name = "cpfResponsavel", nullable = false, length = 14)
    private String cpfResponsavel;

    @Column(name = "dataNascimentoResponsavel", nullable = false)
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate dataNascimentoResponsavel;

    @Column(name = "telefoneResponsavel", nullable = false, length = 20)
    private String telefoneResponsavel;

    @Column(name = "emailResponsavel", nullable = false, length = 100)
    private String emailResponsavel;

    // DADOS DO ALUNO
    @Column(name = "nomeAluno", nullable = false, length = 100)
    private String nomeAluno;

    @Column(name = "dataNascimentoAluno", nullable = false)
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate dataNascimentoAluno;

    @Column(name = "cpfAluno", length = 14)
    private String cpfAluno;

    // TIPO DE VAGA
    @Column(name = "tipoCota", nullable = false)
    @Enumerated(EnumType.STRING)
    private TipoCota tipoCota;

    // INFORMAÇÕES DE RENDA (para cota econômica)
    @Column(name = "rendaFamiliar", precision = 10, scale = 2)
    private BigDecimal rendaFamiliar;

    @Column(name = "rendaPerCapita", precision = 10, scale = 2)
    private BigDecimal rendaPerCapita;

    @Column(name = "numeroIntegrantes")
    private Integer numeroIntegrantes;

    @Column(name = "enderecoCompleto", columnDefinition = "TEXT")
    private String enderecoCompleto;

    @Column(name = "integrantesRenda", columnDefinition = "JSON")
    private String integrantesRenda;

    // HORÁRIOS SELECIONADOS
    @Column(name = "horariosSelecionados", columnDefinition = "JSON")
    private String horariosSelecionados;

    // MENSAGEM ADICIONAL
    @Column(name = "mensagemAdicional", columnDefinition = "TEXT")
    private String mensagemAdicional;

    // CONTROLE DE STATUS
    @Column(name = "status")
    @Enumerated(EnumType.STRING)
    private StatusInteresse status = StatusInteresse.interesse_declarado;

    // CONTROLE DE DATAS
    @Column(name = "dataEnvio")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime dataEnvio;

    @Column(name = "dataInicioMatricula")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime dataInicioMatricula;

    @Column(name = "dataFinalizacao")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime dataFinalizacao;

    // RESPONSÁVEIS PELO PROCESSO
    @ManyToOne
    @JoinColumn(name = "funcionarioResponsavel_idPessoa")
    private Pessoa funcionarioResponsavel;

    @ManyToOne
    @JoinColumn(name = "responsavelLogin_idPessoa")
    private Pessoa responsavelLogin;

    // OBSERVAÇÕES
    @Column(name = "observacoes", columnDefinition = "TEXT")
    private String observacoes;

    @Column(name = "observacoesInternas", columnDefinition = "TEXT")
    private String observacoesInternas;

    @PrePersist
    public void prePersist() {
        if (dataEnvio == null) {
            dataEnvio = LocalDateTime.now();
        }
        if (protocolo == null) {
            protocolo = "MAT-" + System.currentTimeMillis();
        }
        if (status == null) {
            status = StatusInteresse.interesse_declarado;
        }
    }

    // Enums
    public enum TipoCota {
        livre, economica, funcionario
    }

    public enum StatusInteresse {
        em_preenchimento,
        interesse_declarado,
        matricula_iniciada,
        documentos_pendentes,
        documentos_completos,
        matricula_aprovada,
        matricula_cancelada
    }
}

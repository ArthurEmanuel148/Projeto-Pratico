package com.cipalam.cipalam_sistema.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "tbDocumentoMatricula")
public class DocumentoMatricula {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idDocumentoMatricula;

    @ManyToOne
    @JoinColumn(name = "tbInteresseMatricula_id", nullable = true)
    private InteresseMatricula interesseMatricula;

    @ManyToOne
    @JoinColumn(name = "tbTipoDocumento_idTipoDocumento", nullable = false)
    private TipoDocumento tipoDocumento;

    @Column(name = "status")
    private String status = "pendente"; // pendente, anexado, assinado, aprovado, rejeitado

    @Column(name = "caminhoArquivo")
    private String caminhoArquivo;

    @Column(name = "nomeArquivoOriginal")
    private String nomeArquivoOriginal;

    @Column(name = "tipoArquivo")
    private String tipoArquivo; // PDF, JPG, PNG, etc.

    @Column(name = "tamanhoArquivo")
    private Integer tamanhoArquivo;

    @Column(name = "assinaturaDigital", length = 5000)
    private String assinaturaDigital; // Para documentos assinados digitalmente

    @Column(name = "dataEnvio")
    private LocalDateTime dataEnvio;

    @Column(name = "dataAssinatura")
    private LocalDateTime dataAssinatura;

    @Column(name = "dataAprovacao")
    private LocalDateTime dataAprovacao;

    @Column(name = "observacoes", length = 2000)
    private String observacoes;

    @ManyToOne
    @JoinColumn(name = "funcionarioAprovador_idPessoa")
    private Pessoa funcionarioAprovador;

    @Column(name = "tbPessoa_idPessoa")
    private Long tbPessoaIdPessoa; // Para documentos específicos de uma pessoa

    @PrePersist
    public void prePersist() {
        if (status == null) {
            status = "pendente";
        }
    }
}

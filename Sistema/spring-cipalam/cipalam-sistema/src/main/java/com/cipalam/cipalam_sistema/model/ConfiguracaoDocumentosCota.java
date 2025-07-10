package com.cipalam.cipalam_sistema.model;

import jakarta.persistence.*;
import lombok.Data;
import com.fasterxml.jackson.annotation.JsonFormat;
import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "tbConfiguracaoDocumentosCota")
public class ConfiguracaoDocumentosCota {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "tipoCota", nullable = false)
    @Enumerated(EnumType.STRING)
    private TipoCota tipoCota;

    @Column(name = "documentosObrigatorios", columnDefinition = "JSON", nullable = false)
    private String documentosObrigatorios;

    @Column(name = "dataAtualizacao")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime dataAtualizacao;

    @ManyToOne
    @JoinColumn(name = "funcionarioResponsavel_idPessoa")
    private Pessoa funcionarioResponsavel;

    @PrePersist
    @PreUpdate
    public void preUpdate() {
        this.dataAtualizacao = LocalDateTime.now();
    }

    public enum TipoCota {
        livre, economica, funcionario
    }
}

package com.cipalam.cipalam_sistema.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "tbInteresseMatricula")
public class InteresseMatricula {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "protocolo", unique = true)
    private String protocolo;

    @Column(name = "nomeCompleto")
    private String nomeCompleto;

    @Column(name = "cpf")
    private String cpf;

    @Column(name = "email")
    private String email;

    @Column(name = "telefone")
    private String telefone;

    @Column(name = "tipoEscola")
    private String tipoEscola;

    @Column(name = "anoLetivo")
    private String anoLetivo;

    @Column(name = "serieDesejada")
    private String serieDesejada;

    @Column(name = "tipoCota")
    private String tipoCota;

    @Column(name = "dataEnvio")
    private LocalDateTime dataEnvio;

    @PrePersist
    public void prePersist() {
        if (dataEnvio == null) {
            dataEnvio = LocalDateTime.now();
        }
        if (protocolo == null) {
            protocolo = "INT-" + System.currentTimeMillis();
        }
    }
}

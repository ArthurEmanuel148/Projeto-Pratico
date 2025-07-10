package com.cipalam.cipalam_sistema.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "tbPermissao")
public class Permissao {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "idPermissao")
    private Integer idPermissao;

    @ManyToOne
    @JoinColumn(name = "tbPessoa_idPessoa", nullable = false)
    private Pessoa pessoa;

    @ManyToOne
    @JoinColumn(name = "tbFuncionalidade_idFuncionalidade", nullable = false)
    private Funcionalidade funcionalidade;

    @Column(name = "temPermissao")
    private Boolean temPermissao = false;

    @Column(name = "dataCriacao")
    private LocalDateTime dataCriacao;

    @Column(name = "dataAtualizacao")
    private LocalDateTime dataAtualizacao;

    @PrePersist
    public void prePersist() {
        LocalDateTime now = LocalDateTime.now();
        this.dataCriacao = now;
        this.dataAtualizacao = now;
    }

    @PreUpdate
    public void preUpdate() {
        this.dataAtualizacao = LocalDateTime.now();
    }
}

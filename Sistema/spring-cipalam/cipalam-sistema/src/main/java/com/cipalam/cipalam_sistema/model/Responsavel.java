package com.cipalam.cipalam_sistema.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "tbResponsavel")
@Data
public class Responsavel {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "idResponsavel")
    private Integer id;

    @Column(name = "tbPessoa_idPessoa")
    private Integer pessoaId;

    @Column(name = "tbFamilia_idtbFamilia")
    private Integer familiaId;

    // Construtor padrão
    public Responsavel() {
    }

    // Construtor com pessoaId
    public Responsavel(Integer pessoaId) {
        this.pessoaId = pessoaId;
    }
}

package com.cipalam.cipalam_sistema.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "tblogin")
@Data
public class Login {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idtblogin;

    private String usuario;
    private String senha;

    @ManyToOne
    @JoinColumn(name = "tbPessoa_idPessoa")
    private Pessoa pessoa;

    public Long getId() {
        return idtblogin != null ? idtblogin.longValue() : null;
    }
}
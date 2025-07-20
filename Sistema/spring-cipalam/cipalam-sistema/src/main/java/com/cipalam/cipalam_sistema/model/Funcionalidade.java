package com.cipalam.cipalam_sistema.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "tbFuncionalidade")
public class Funcionalidade {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "idFuncionalidade")
    private Integer idFuncionalidade;

    @Column(name = "chave", unique = true, nullable = false)
    private String chave;

    @Column(name = "nomeAmigavel", nullable = false)
    private String nomeAmigavel;

    @Column(name = "descricao")
    private String descricao;

    @Column(name = "icone")
    private String icone;

    @Column(name = "pai")
    private String pai;

    @Enumerated(EnumType.STRING)
    @Column(name = "categoria")
    private CategoriaFuncionalidade categoria;

    @Column(name = "ativo")
    private Boolean ativo = true;

    @Column(name = "ordemExibicao")
    private Integer ordemExibicao = 0;

    public enum CategoriaFuncionalidade {
        menu, acao, configuracao
    }
}

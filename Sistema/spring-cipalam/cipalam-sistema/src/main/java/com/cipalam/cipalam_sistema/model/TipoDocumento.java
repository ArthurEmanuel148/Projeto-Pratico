package com.cipalam.cipalam_sistema.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "tbTipoDocumento")
public class TipoDocumento {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idTipoDocumento;

    @Column(name = "nome")
    private String nome;

    @Column(name = "descricao", length = 2000)
    private String descricao;

    @Column(name = "obrigatorio")
    private Boolean obrigatorio = true;

    @Column(name = "requerAssinatura")
    private Boolean requerAssinatura = false;

    @Column(name = "requerAnexo")
    private Boolean requerAnexo = true;

    @Column(name = "tipoCota")
    private String tipoCota; // NULL = todos, ou específico para determinada cota

    @Column(name = "ativo")
    private Boolean ativo = true;

    @Column(name = "ordemExibicao")
    private Integer ordemExibicao = 0;

    @Column(name = "templateDocumento", length = 5000)
    private String templateDocumento; // Conteúdo do template para documentos que requerem assinatura
}

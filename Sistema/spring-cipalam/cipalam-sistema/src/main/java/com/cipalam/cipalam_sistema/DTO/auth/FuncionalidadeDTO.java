package com.cipalam.cipalam_sistema.DTO.auth;

import com.cipalam.cipalam_sistema.model.Funcionalidade;
import lombok.Data;

@Data
public class FuncionalidadeDTO {
    private Integer id;
    private String chave;
    private String nomeAmigavel;
    private String descricao;
    private String icone;
    private String pai;
    private String categoria;
    private Boolean ativo;
    private Integer ordemExibicao;

    public FuncionalidadeDTO(Funcionalidade funcionalidade) {
        this.id = funcionalidade.getIdFuncionalidade();
        this.chave = funcionalidade.getChave();
        this.nomeAmigavel = funcionalidade.getNomeAmigavel();
        this.descricao = funcionalidade.getDescricao();
        this.icone = funcionalidade.getIcone();
        this.pai = funcionalidade.getPai();
        this.categoria = funcionalidade.getCategoria() != null ? funcionalidade.getCategoria().name() : null;
        this.ativo = funcionalidade.getAtivo();
        this.ordemExibicao = funcionalidade.getOrdemExibicao();
    }
}

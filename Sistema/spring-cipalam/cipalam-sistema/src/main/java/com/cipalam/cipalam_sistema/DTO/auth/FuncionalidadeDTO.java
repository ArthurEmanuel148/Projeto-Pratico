package com.cipalam.cipalam_sistema.DTO.auth;

import com.cipalam.cipalam_sistema.model.Funcionalidade;
import lombok.Data;

@Data
public class FuncionalidadeDTO {
    private Integer id;
    private String chave;
    private String nomeAmigavel;
    private String descricao;
    private String rota;
    private String icone;
    private String pai;
    private Boolean ativo;

    public FuncionalidadeDTO(Funcionalidade funcionalidade) {
        this.id = funcionalidade.getIdFuncionalidade();
        this.chave = funcionalidade.getChave();
        this.nomeAmigavel = funcionalidade.getNomeAmigavel();
        this.descricao = funcionalidade.getDescricao();
        this.rota = funcionalidade.getRota();
        this.icone = funcionalidade.getIcone();
        this.pai = funcionalidade.getPai();
        this.ativo = funcionalidade.getAtivo();
    }
}

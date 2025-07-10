package com.cipalam.cipalam_sistema.DTO.auth;

import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
public class MenuItemDTO {
    private Integer id;
    private String chave;
    private String nomeAmigavel;
    private String descricao;
    private String rota;
    private String icone;
    private String pai;
    private Boolean ativo;
    private List<MenuItemDTO> filhos;

    public MenuItemDTO(FuncionalidadeDTO funcionalidade) {
        this.id = funcionalidade.getId();
        this.chave = funcionalidade.getChave();
        this.nomeAmigavel = funcionalidade.getNomeAmigavel();
        this.descricao = funcionalidade.getDescricao();
        this.rota = funcionalidade.getRota();
        this.icone = funcionalidade.getIcone();
        this.pai = funcionalidade.getPai();
        this.ativo = funcionalidade.getAtivo();
        this.filhos = new ArrayList<>();
    }

    public void addFilho(MenuItemDTO filho) {
        this.filhos.add(filho);
    }
}

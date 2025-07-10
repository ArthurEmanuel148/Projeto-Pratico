package com.cipalam.cipalam_sistema.enums;

public enum TipoUsuario {
    RESPONSAVEL("ROLE_RESPONSAVEL", "Responsável"),
    PROFESSOR("ROLE_PROFESSOR", "Professor"),
    FUNCIONARIO("ROLE_FUNCIONARIO", "Funcionário"),
    ADMIN("ROLE_ADMIN", "Administrador");

    private final String role;
    private final String descricao;

    TipoUsuario(String role, String descricao) {
        this.role = role;
        this.descricao = descricao;
    }

    public String getRole() {
        return role;
    }

    public String getDescricao() {
        return descricao;
    }
}

package com.cipalam.cipalam_sistema.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "tbTipoDocumento")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "idTipoDocumento")
public class TipoDocumento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "idTipoDocumento")
    private Long idTipoDocumento;

    @Column(name = "nome", nullable = false, length = 100)
    private String nome;

    @Column(name = "descricao", columnDefinition = "TEXT")
    private String descricao;

    @Enumerated(EnumType.STRING)
    @Column(name = "modalidadeEntrega", nullable = false, columnDefinition = "ENUM('ASSINADO', 'ANEXADO') DEFAULT 'ANEXADO'")
    private ModalidadeEntrega modalidadeEntrega = ModalidadeEntrega.ANEXADO;

    @Enumerated(EnumType.STRING)
    @Column(name = "quemDeveFornencer", nullable = false, columnDefinition = "ENUM('RESPONSAVEL', 'ALUNO', 'TODOS_INTEGRANTES', 'FAMILIA') DEFAULT 'RESPONSAVEL'")
    private QuemDeveFornencer quemDeveFornencer = QuemDeveFornencer.RESPONSAVEL;

    @Column(name = "ativo", nullable = false, columnDefinition = "BOOLEAN DEFAULT TRUE")
    private Boolean ativo = true;

    @Column(name = "dataCriacao", nullable = false, updatable = false)
    private LocalDateTime dataCriacao;

    @Column(name = "dataAtualizacao")
    private LocalDateTime dataAtualizacao;

    @PrePersist
    protected void onCreate() {
        dataCriacao = LocalDateTime.now();
        dataAtualizacao = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        dataAtualizacao = LocalDateTime.now();
    }

    public enum ModalidadeEntrega {
        ASSINADO, ANEXADO
    }

    public enum QuemDeveFornencer {
        RESPONSAVEL, ALUNO, TODOS_INTEGRANTES, FAMILIA
    }

    // Método helper para verificar se requer anexação
    public boolean requerAnexacao() {
        return modalidadeEntrega == ModalidadeEntrega.ANEXADO;
    }

    // Método helper para verificar se requer assinatura
    public boolean requerAssinatura() {
        return modalidadeEntrega == ModalidadeEntrega.ASSINADO;
    }

    // Método helper para verificar se é documento de identidade
    public boolean isDocumentoIdentidade() {
        return nome != null && (nome.toLowerCase().contains("identidade") ||
                nome.toLowerCase().contains("rg") ||
                nome.toLowerCase().contains("cpf") ||
                nome.toLowerCase().contains("certidão") ||
                nome.toLowerCase().contains("carteira"));
    }

    // Métodos de compatibilidade com versão anterior (deprecated)
    @Deprecated
    public Boolean getObrigatorio() {
        return true; // Por enquanto, todos são considerados obrigatórios na configuração de cota
    }

    @Deprecated
    public Boolean getRequerAssinatura() {
        return modalidadeEntrega == ModalidadeEntrega.ASSINADO;
    }

    @Deprecated
    public Boolean getRequerAnexo() {
        return modalidadeEntrega == ModalidadeEntrega.ANEXADO;
    }

    @Deprecated
    public Integer getOrdemExibicao() {
        return 0; // Não usamos mais ordem de exibição, ordenamos por nome
    }

    @Deprecated
    public String getTemplateDocumento() {
        return null; // Campo removido da nova estrutura
    }
}

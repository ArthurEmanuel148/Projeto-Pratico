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
    
    @Column(name = "obrigatorio", nullable = false, columnDefinition = "BOOLEAN DEFAULT TRUE")
    private Boolean obrigatorio = true;
    
    @Column(name = "requerAssinatura", nullable = false, columnDefinition = "BOOLEAN DEFAULT FALSE")
    private Boolean requerAssinatura = false;
    
    @Column(name = "requerAnexo", nullable = false, columnDefinition = "BOOLEAN DEFAULT TRUE")
    private Boolean requerAnexo = true;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "tipoCota")
    private TipoCota tipoCota;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "escopo", nullable = false, columnDefinition = "ENUM('familia', 'aluno', 'ambos') DEFAULT 'ambos'")
    private EscopoDocumento escopo = EscopoDocumento.ambos;
    
    @Column(name = "ativo", nullable = false, columnDefinition = "BOOLEAN DEFAULT TRUE")
    private Boolean ativo = true;
    
    @Column(name = "ordemExibicao", nullable = false, columnDefinition = "INT DEFAULT 0")
    private Integer ordemExibicao = 0;
    
    @Column(name = "templateDocumento", columnDefinition = "TEXT")
    private String templateDocumento;
    
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
    
    public enum TipoCota {
        livre, economica, funcionario
    }
    
    public enum EscopoDocumento {
        familia, aluno, ambos
    }
    
    // Método helper para verificar se é documento de identidade
    public boolean isDocumentoIdentidade() {
        return nome != null && (
            nome.toLowerCase().contains("identidade") ||
            nome.toLowerCase().contains("rg") ||
            nome.toLowerCase().contains("cpf") ||
            nome.toLowerCase().contains("certidão") ||
            nome.toLowerCase().contains("carteira")
        );
    }
    
    // Método helper para verificar tipo de processamento
    public String getTipoProcessamento() {
        if (requerAssinatura && requerAnexo) {
            return "AMBOS";
        } else if (requerAssinatura) {
            return "ASSINATURA";
        } else if (requerAnexo) {
            return "ANEXO";
        } else {
            return "DECLARATIVO";
        }
    }
}

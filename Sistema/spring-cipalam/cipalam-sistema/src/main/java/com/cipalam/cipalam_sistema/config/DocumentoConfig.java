package com.cipalam.cipalam_sistema.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import java.util.Arrays;
import java.util.List;

@Data
@Configuration
@ConfigurationProperties(prefix = "cipalam.documentos")
public class DocumentoConfig {
    
    /**
     * Diretório base para armazenamento de documentos
     */
    private String diretorioBase = "./cipalam_documentos";
    
    /**
     * Tamanho máximo permitido para arquivos (em bytes)
     * Padrão: 10MB
     */
    private long tamanhoMaximo = 10 * 1024 * 1024;
    
    /**
     * Tipos de arquivo permitidos (extensões)
     */
    private List<String> tiposPermitidos = Arrays.asList(
        "pdf", "jpg", "jpeg", "png", "doc", "docx", "zip", "rar"
    );
    
    /**
     * URL base para servir arquivos estaticamente
     */
    private String urlBase = "/cipalam_documentos";
    
    /**
     * Se deve criar backup dos arquivos antes de substituir
     */
    private boolean criarBackup = true;
    
    /**
     * Padrão de nomenclatura para arquivos
     * Variáveis disponíveis: {tipo}, {pessoa}, {familia}, {timestamp}, {uuid}, {extensao}
     */
    private String padraoNome = "{tipo}_{pessoa}_{timestamp}_{uuid}.{extensao}";
    
    /**
     * Estrutura de pastas organizada
     */
    private EstruturaPastas estrutura = new EstruturaPastas();
    
    @Data
    public static class EstruturaPastas {
        private boolean organizarPorFamilia = true;
        private boolean organizarPorTipo = true;
        private boolean organizarPorAno = true;
        
        /**
         * Padrão de estrutura de pastas
         * Exemplo: familia/{idFamilia}/responsavel/2025/rg/
         */
        public String obterCaminhoPasta(Long idFamilia, String tipoDocumento, String categoriaResponsavel) {
            StringBuilder caminho = new StringBuilder();
            
            if (organizarPorFamilia && idFamilia != null) {
                caminho.append("familia/").append(idFamilia).append("/");
            }
            
            if (categoriaResponsavel != null) {
                caminho.append(categoriaResponsavel.toLowerCase()).append("/");
            }
            
            if (organizarPorAno) {
                caminho.append("2025/");
            }
            
            if (organizarPorTipo && tipoDocumento != null) {
                caminho.append(tipoDocumento.toLowerCase().replaceAll("[^a-z0-9]", "_")).append("/");
            }
            
            return caminho.toString();
        }
    }
    
    /**
     * Validação de configuração
     */
    public void validar() {
        if (tamanhoMaximo <= 0) {
            throw new IllegalArgumentException("Tamanho máximo deve ser maior que zero");
        }
        
        if (tiposPermitidos == null || tiposPermitidos.isEmpty()) {
            throw new IllegalArgumentException("Deve haver pelo menos um tipo de arquivo permitido");
        }
        
        if (diretorioBase == null || diretorioBase.trim().isEmpty()) {
            throw new IllegalArgumentException("Diretório base é obrigatório");
        }
    }
}

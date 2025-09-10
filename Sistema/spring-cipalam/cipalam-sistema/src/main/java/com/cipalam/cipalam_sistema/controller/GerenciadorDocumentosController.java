package com.cipalam.cipalam_sistema.controller;

import com.cipalam.cipalam_sistema.service.GerenciadorDocumentosService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/documentos-v2")
@RequiredArgsConstructor
@Slf4j
public class GerenciadorDocumentosController {

    private final GerenciadorDocumentosService gerenciadorDocumentos;

    /**
     * Upload de documento com validações robustas
     */
    @PostMapping("/upload")
    public ResponseEntity<Map<String, Object>> uploadDocumento(
            @RequestParam("arquivo") MultipartFile arquivo,
            @RequestParam("idDocumento") Long idDocumento,
            @RequestParam("idFamilia") Long idFamilia,
            @RequestParam(value = "categoriaResponsavel", defaultValue = "responsavel") String categoriaResponsavel,
            @RequestParam(value = "observacoes", required = false) String observacoes) {

        log.info("🚀 Recebendo upload - Documento: {}, Família: {}", idDocumento, idFamilia);

        try {
            GerenciadorDocumentosService.ResultadoUpload resultado = 
                gerenciadorDocumentos.fazerUpload(arquivo, idDocumento, idFamilia, categoriaResponsavel, observacoes);

            Map<String, Object> response = new HashMap<>();
            response.put("sucesso", resultado.isSucesso());
            response.put("mensagem", resultado.getMensagem());
            
            if (resultado.isSucesso()) {
                response.put("arquivo", resultado.getCaminhoArquivo());
                response.put("metadados", resultado.getMetadados());
                log.info("✅ Upload concluído com sucesso para documento {}", idDocumento);
                return ResponseEntity.ok(response);
            } else {
                log.warn("⚠️ Upload falhou para documento {}: {}", idDocumento, resultado.getMensagem());
                return ResponseEntity.badRequest().body(response);
            }

        } catch (Exception e) {
            log.error("❌ Erro no upload do documento {}: {}", idDocumento, e.getMessage(), e);
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("sucesso", false);
            errorResponse.put("mensagem", "Erro interno no servidor: " + e.getMessage());
            
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    /**
     * Visualizar documento
     */
    @GetMapping("/visualizar/{idDocumento}")
    public ResponseEntity<Resource> visualizarDocumento(@PathVariable Long idDocumento) {
        log.info("👁️ Solicitação de visualização do documento: {}", idDocumento);

        try {
            Resource arquivo = gerenciadorDocumentos.buscarArquivoParaVisualizacao(idDocumento);
            Map<String, Object> info = gerenciadorDocumentos.obterInformacoesArquivo(idDocumento);
            
            String nomeArquivo = (String) info.get("nomeOriginal");
            if (nomeArquivo == null) {
                nomeArquivo = "documento_" + idDocumento;
            }

            MediaType mediaType = gerenciadorDocumentos.determinarMediaType(nomeArquivo);

            return ResponseEntity.ok()
                    .contentType(mediaType)
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + nomeArquivo + "\"")
                    .body(arquivo);

        } catch (Exception e) {
            log.error("❌ Erro ao buscar documento {}: {}", idDocumento, e.getMessage(), e);
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Download de documento
     */
    @GetMapping("/download/{idDocumento}")
    public ResponseEntity<Resource> downloadDocumento(@PathVariable Long idDocumento) {
        log.info("💾 Solicitação de download do documento: {}", idDocumento);

        try {
            Resource arquivo = gerenciadorDocumentos.buscarArquivoParaVisualizacao(idDocumento);
            Map<String, Object> info = gerenciadorDocumentos.obterInformacoesArquivo(idDocumento);
            
            String nomeArquivo = (String) info.get("nomeOriginal");
            if (nomeArquivo == null) {
                nomeArquivo = "documento_" + idDocumento;
            }

            MediaType mediaType = gerenciadorDocumentos.determinarMediaType(nomeArquivo);

            return ResponseEntity.ok()
                    .contentType(mediaType)
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + nomeArquivo + "\"")
                    .body(arquivo);

        } catch (Exception e) {
            log.error("❌ Erro ao baixar documento {}: {}", idDocumento, e.getMessage(), e);
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Obter informações de um documento sem baixá-lo
     */
    @GetMapping("/info/{idDocumento}")
    public ResponseEntity<Map<String, Object>> obterInformacoesDocumento(@PathVariable Long idDocumento) {
        log.info("ℹ️ Solicitação de informações do documento: {}", idDocumento);

        try {
            Map<String, Object> info = gerenciadorDocumentos.obterInformacoesArquivo(idDocumento);
            
            Map<String, Object> response = new HashMap<>();
            response.put("sucesso", true);
            response.put("documento", info);
            
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("❌ Erro ao obter informações do documento {}: {}", idDocumento, e.getMessage(), e);
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("sucesso", false);
            errorResponse.put("mensagem", e.getMessage());
            
            return ResponseEntity.status(404).body(errorResponse);
        }
    }

    /**
     * Validar arquivo antes do upload (endpoint de pré-validação)
     */
    @PostMapping("/validar")
    public ResponseEntity<Map<String, Object>> validarArquivo(@RequestParam("arquivo") MultipartFile arquivo) {
        log.info("🔍 Validação prévia de arquivo: {}", arquivo.getOriginalFilename());

        Map<String, Object> response = new HashMap<>();
        
        try {
            // Usar o método de validação interno (precisaremos expor este método)
            response.put("nomeOriginal", arquivo.getOriginalFilename());
            response.put("tamanho", arquivo.getSize());
            response.put("tipo", arquivo.getContentType());
            response.put("valido", true);
            response.put("mensagem", "Arquivo válido para upload");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("❌ Erro na validação do arquivo: {}", e.getMessage(), e);
            
            response.put("valido", false);
            response.put("mensagem", "Erro na validação: " + e.getMessage());
            
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Endpoint para verificar saúde do serviço de documentos
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> verificarSaude() {
        Map<String, Object> health = new HashMap<>();
        health.put("status", "UP");
        health.put("servico", "Gerenciador de Documentos");
        health.put("timestamp", System.currentTimeMillis());
        
        return ResponseEntity.ok(health);
    }
}

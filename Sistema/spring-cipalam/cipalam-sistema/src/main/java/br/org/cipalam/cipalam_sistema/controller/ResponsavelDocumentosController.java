package br.org.cipalam.cipalam_sistema.controller;

import br.org.cipalam.cipalam_sistema.dto.FamiliaDocumentosDTO;
import br.org.cipalam.cipalam_sistema.service.ResponsavelDocumentosService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/responsavel-documentos")
@CrossOrigin(origins = "*")
public class ResponsavelDocumentosController {

    private static final Logger logger = LoggerFactory.getLogger(ResponsavelDocumentosController.class);

    @Autowired
    private ResponsavelDocumentosService responsavelDocumentosService;

    /**
     * Busca todos os documentos da família organizados por pessoa
     * GET /api/responsavel/{idResponsavel}/familia/documentos
     */
    @GetMapping("/{idResponsavel}/familia/documentos")
    public ResponseEntity<?> buscarDocumentosFamilia(@PathVariable Long idResponsavel) {
        try {
            logger.info("🔍 Buscando documentos da família para responsável ID: {}", idResponsavel);

            if (idResponsavel == null || idResponsavel <= 0) {
                logger.warn("⚠️ ID do responsável inválido: {}", idResponsavel);
                Map<String, Object> error = new HashMap<>();
                error.put("erro", "ID do responsável é obrigatório e deve ser válido");
                error.put("codigo", "INVALID_RESPONSIBLE_ID");
                return ResponseEntity.badRequest().body(error);
            }

            // Buscar documentos da família
            FamiliaDocumentosDTO familiaDocumentos = responsavelDocumentosService
                    .buscarDocumentosPorFamilia(idResponsavel);

            if (familiaDocumentos == null) {
                logger.warn("⚠️ Nenhum documento encontrado para o responsável ID: {}", idResponsavel);
                Map<String, Object> error = new HashMap<>();
                error.put("erro", "Família não encontrada ou sem documentos configurados");
                error.put("codigo", "FAMILY_NOT_FOUND");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
            }

            logger.info("✅ Documentos da família encontrados: {} pessoas, {} documentos totais",
                    familiaDocumentos.getDocumentosPorPessoa().size(),
                    familiaDocumentos.getResumo().getTotalDocumentos());

            return ResponseEntity.ok(familiaDocumentos);

        } catch (Exception e) {
            logger.error("❌ Erro inesperado ao buscar documentos da família para responsável ID {}: {}",
                    idResponsavel, e.getMessage(), e);

            Map<String, Object> error = new HashMap<>();
            error.put("erro", "Erro interno do servidor ao buscar documentos da família");
            error.put("codigo", "INTERNAL_SERVER_ERROR");
            error.put("detalhes", e.getMessage());

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Busca informações básicas do responsável e família
     * GET /api/responsavel/{idResponsavel}/info
     */
    @GetMapping("/{idResponsavel}/info")
    public ResponseEntity<?> buscarInformacoesResponsavel(@PathVariable Long idResponsavel) {
        try {
            logger.info("🔍 Buscando informações do responsável ID: {}", idResponsavel);

            if (idResponsavel == null || idResponsavel <= 0) {
                logger.warn("⚠️ ID do responsável inválido: {}", idResponsavel);
                Map<String, Object> error = new HashMap<>();
                error.put("erro", "ID do responsável é obrigatório e deve ser válido");
                error.put("codigo", "INVALID_RESPONSIBLE_ID");
                return ResponseEntity.badRequest().body(error);
            }

            // Buscar informações básicas
            Map<String, Object> informacoes = responsavelDocumentosService.buscarInformacoesResponsavel(idResponsavel);

            if (informacoes == null || informacoes.isEmpty()) {
                logger.warn("⚠️ Responsável não encontrado para ID: {}", idResponsavel);
                Map<String, Object> error = new HashMap<>();
                error.put("erro", "Responsável não encontrado");
                error.put("codigo", "RESPONSIBLE_NOT_FOUND");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
            }

            logger.info("✅ Informações do responsável encontradas: {}", informacoes.get("nome"));
            return ResponseEntity.ok(informacoes);

        } catch (Exception e) {
            logger.error("❌ Erro inesperado ao buscar informações do responsável ID {}: {}",
                    idResponsavel, e.getMessage(), e);

            Map<String, Object> error = new HashMap<>();
            error.put("erro", "Erro interno do servidor ao buscar informações do responsável");
            error.put("codigo", "INTERNAL_SERVER_ERROR");
            error.put("detalhes", e.getMessage());

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Busca estatísticas dos documentos da família
     * GET /api/responsavel/{idResponsavel}/estatisticas
     */
    @GetMapping("/{idResponsavel}/estatisticas")
    public ResponseEntity<?> buscarEstatisticasDocumentos(@PathVariable Long idResponsavel) {
        try {
            logger.info("📊 Buscando estatísticas de documentos para responsável ID: {}", idResponsavel);

            if (idResponsavel == null || idResponsavel <= 0) {
                logger.warn("⚠️ ID do responsável inválido: {}", idResponsavel);
                Map<String, Object> error = new HashMap<>();
                error.put("erro", "ID do responsável é obrigatório e deve ser válido");
                error.put("codigo", "INVALID_RESPONSIBLE_ID");
                return ResponseEntity.badRequest().body(error);
            }

            // Buscar estatísticas
            Map<String, Object> estatisticas = responsavelDocumentosService.buscarEstatisticasDocumentos(idResponsavel);

            if (estatisticas == null || estatisticas.isEmpty()) {
                logger.warn("⚠️ Nenhuma estatística encontrada para responsável ID: {}", idResponsavel);
                Map<String, Object> error = new HashMap<>();
                error.put("erro", "Estatísticas não encontradas");
                error.put("codigo", "STATISTICS_NOT_FOUND");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
            }

            logger.info("✅ Estatísticas encontradas para responsável ID: {}", idResponsavel);
            return ResponseEntity.ok(estatisticas);

        } catch (Exception e) {
            logger.error("❌ Erro inesperado ao buscar estatísticas para responsável ID {}: {}",
                    idResponsavel, e.getMessage(), e);

            Map<String, Object> error = new HashMap<>();
            error.put("erro", "Erro interno do servidor ao buscar estatísticas");
            error.put("codigo", "INTERNAL_SERVER_ERROR");
            error.put("detalhes", e.getMessage());

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Anexa um documento
     * POST /api/responsavel/familia/anexar-documento
     */
    @PostMapping("/familia/anexar-documento")
    public ResponseEntity<?> anexarDocumento(
            @RequestParam("arquivo") MultipartFile arquivo,
            @RequestParam("idDocumentoMatricula") Long idDocumentoMatricula,
            @RequestParam("idPessoa") Long idPessoa) {
        try {
            logger.info("📎 Anexando documento - ID Documento: {}, ID Pessoa: {}, Arquivo: {}",
                    idDocumentoMatricula, idPessoa, arquivo.getOriginalFilename());

            // Validar parâmetros
            if (arquivo.isEmpty()) {
                Map<String, Object> error = new HashMap<>();
                error.put("erro", "Arquivo é obrigatório");
                error.put("codigo", "FILE_REQUIRED");
                return ResponseEntity.badRequest().body(error);
            }

            // Validar tipo de arquivo
            String contentType = arquivo.getContentType();
            if (!isValidFileType(contentType)) {
                Map<String, Object> error = new HashMap<>();
                error.put("erro", "Tipo de arquivo não permitido. Use PDF, JPG ou PNG");
                error.put("codigo", "INVALID_FILE_TYPE");
                return ResponseEntity.badRequest().body(error);
            }

            // Validar tamanho (5MB)
            if (arquivo.getSize() > 5 * 1024 * 1024) {
                Map<String, Object> error = new HashMap<>();
                error.put("erro", "Arquivo muito grande. Máximo permitido: 5MB");
                error.put("codigo", "FILE_TOO_LARGE");
                return ResponseEntity.badRequest().body(error);
            }

            // Anexar documento
            boolean sucesso = responsavelDocumentosService.anexarDocumento(arquivo, idDocumentoMatricula, idPessoa);

            if (sucesso) {
                Map<String, Object> response = new HashMap<>();
                response.put("sucesso", true);
                response.put("mensagem", "Documento anexado com sucesso");
                return ResponseEntity.ok(response);
            } else {
                Map<String, Object> error = new HashMap<>();
                error.put("erro", "Erro ao anexar documento");
                error.put("codigo", "ATTACHMENT_FAILED");
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
            }

        } catch (Exception e) {
            logger.error("❌ Erro ao anexar documento: {}", e.getMessage(), e);
            Map<String, Object> error = new HashMap<>();
            error.put("erro", "Erro interno do servidor");
            error.put("codigo", "INTERNAL_SERVER_ERROR");
            error.put("detalhes", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Remove um documento
     * DELETE
     * /api/responsavel/familia/remover-documento/{idDocumentoMatricula}/{idPessoa}
     */
    @DeleteMapping("/familia/remover-documento/{idDocumentoMatricula}/{idPessoa}")
    public ResponseEntity<?> removerDocumento(
            @PathVariable Long idDocumentoMatricula,
            @PathVariable Long idPessoa) {
        try {
            logger.info("🗑️ Removendo documento - ID Documento: {}, ID Pessoa: {}", idDocumentoMatricula, idPessoa);

            boolean sucesso = responsavelDocumentosService.removerDocumento(idDocumentoMatricula, idPessoa);

            if (sucesso) {
                Map<String, Object> response = new HashMap<>();
                response.put("sucesso", true);
                response.put("mensagem", "Documento removido com sucesso");
                return ResponseEntity.ok(response);
            } else {
                Map<String, Object> error = new HashMap<>();
                error.put("erro", "Documento não encontrado ou erro ao remover");
                error.put("codigo", "REMOVAL_FAILED");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
            }

        } catch (Exception e) {
            logger.error("❌ Erro ao remover documento: {}", e.getMessage(), e);
            Map<String, Object> error = new HashMap<>();
            error.put("erro", "Erro interno do servidor");
            error.put("codigo", "INTERNAL_SERVER_ERROR");
            error.put("detalhes", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Baixa um documento
     * GET /api/responsavel/familia/baixar-documento/{idDocumentoMatricula}
     */
    @GetMapping("/familia/baixar-documento/{idDocumentoMatricula}")
    public ResponseEntity<?> baixarDocumento(@PathVariable Long idDocumentoMatricula) {
        try {
            logger.info("⬇️ Baixando documento ID: {}", idDocumentoMatricula);

            byte[] arquivoBytes = responsavelDocumentosService.baixarDocumento(idDocumentoMatricula);

            if (arquivoBytes != null && arquivoBytes.length > 0) {
                return ResponseEntity.ok()
                        .header("Content-Disposition", "attachment; filename=\"documento.pdf\"")
                        .header("Content-Type", "application/octet-stream")
                        .body(arquivoBytes);
            } else {
                Map<String, Object> error = new HashMap<>();
                error.put("erro", "Documento não encontrado");
                error.put("codigo", "DOCUMENT_NOT_FOUND");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
            }

        } catch (Exception e) {
            logger.error("❌ Erro ao baixar documento: {}", e.getMessage(), e);
            Map<String, Object> error = new HashMap<>();
            error.put("erro", "Erro interno do servidor");
            error.put("codigo", "INTERNAL_SERVER_ERROR");
            error.put("detalhes", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Valida tipo de arquivo
     */
    private boolean isValidFileType(String contentType) {
        return contentType != null && (contentType.equals("application/pdf") ||
                contentType.equals("image/jpeg") ||
                contentType.equals("image/jpg") ||
                contentType.equals("image/png"));
    }

    /**
     * Gera documentos de matrícula para um interesse específico
     * POST /api/responsavel/gerar-documentos/{interesseId}
     */
    @PostMapping("/gerar-documentos/{interesseId}")
    public ResponseEntity<?> gerarDocumentosMatricula(@PathVariable Long interesseId) {
        try {
            logger.info("📋 Gerando documentos para interesse ID: {}", interesseId);

            boolean sucesso = responsavelDocumentosService.gerarDocumentosMatricula(interesseId);

            if (sucesso) {
                Map<String, Object> response = new HashMap<>();
                response.put("sucesso", true);
                response.put("mensagem", "Documentos de matrícula gerados com sucesso");
                response.put("interesseId", interesseId);
                return ResponseEntity.ok(response);
            } else {
                Map<String, Object> error = new HashMap<>();
                error.put("erro", "Erro ao gerar documentos de matrícula");
                error.put("codigo", "GENERATION_FAILED");
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
            }

        } catch (Exception e) {
            logger.error("❌ Erro ao gerar documentos: {}", e.getMessage(), e);
            Map<String, Object> error = new HashMap<>();
            error.put("erro", "Erro interno do servidor");
            error.put("codigo", "INTERNAL_SERVER_ERROR");
            error.put("detalhes", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

}

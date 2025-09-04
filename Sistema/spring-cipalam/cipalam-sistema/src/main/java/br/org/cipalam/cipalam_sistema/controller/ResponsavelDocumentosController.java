package br.org.cipalam.cipalam_sistema.controller;

import br.org.cipalam.cipalam_sistema.dto.FamiliaDocumentosDTO;
import br.org.cipalam.cipalam_sistema.service.ResponsavelDocumentosService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/responsavel")
@CrossOrigin(origins = "*")
public class ResponsavelDocumentosController {

    private static final Logger logger = LoggerFactory.getLogger(ResponsavelDocumentosController.class);

    @Autowired
    private ResponsavelDocumentosService responsavelDocumentosService;

    /**
     * Busca todos os documentos da família organizados por pessoa
     * GET /api/responsavel/{idResponsavel}/documentos
     */
    @GetMapping("/{idResponsavel}/documentos")
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
}

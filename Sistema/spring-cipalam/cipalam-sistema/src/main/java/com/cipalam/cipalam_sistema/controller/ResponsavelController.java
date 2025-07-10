package com.cipalam.cipalam_sistema.controller;

import com.cipalam.cipalam_sistema.service.auth.UserPrincipal;
import com.cipalam.cipalam_sistema.service.DocumentoMatriculaService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/responsavel")
@RequiredArgsConstructor
@Slf4j
@PreAuthorize("hasRole('RESPONSAVEL')")
public class ResponsavelController {

    private final DocumentoMatriculaService documentoMatriculaService;

    @GetMapping("/dashboard")
    public ResponseEntity<?> getDashboard(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        log.info("Acessando dashboard do responsável: {}", userPrincipal.getUsername());

        try {
            // Buscar informações do dashboard
            Map<String, Object> dashboardData = documentoMatriculaService.getDashboardData(userPrincipal.getId());

            return ResponseEntity.ok(dashboardData);
        } catch (Exception e) {
            log.error("Erro ao buscar dados do dashboard para responsável: {}", userPrincipal.getUsername(), e);
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Erro ao carregar dados do dashboard"));
        }
    }

    @GetMapping("/documentos-pendentes")
    public ResponseEntity<?> getDocumentosPendentes(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        log.info("Buscando documentos pendentes para responsável: {}", userPrincipal.getUsername());

        try {
            List<Map<String, Object>> documentosPendentes = documentoMatriculaService
                    .buscarPendentesPorUsuario(userPrincipal.getId());

            return ResponseEntity.ok(Map.of(
                    "documentos", documentosPendentes,
                    "totalPendentes", documentosPendentes.size()));
        } catch (Exception e) {
            log.error("Erro ao buscar documentos pendentes para responsável: {}", userPrincipal.getUsername(), e);
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Erro ao buscar documentos pendentes"));
        }
    }

    @PostMapping("/anexar-documento")
    public ResponseEntity<?> anexarDocumento(
            @RequestParam("documentoId") Long documentoId,
            @RequestParam("arquivo") MultipartFile arquivo,
            @RequestParam(value = "observacoes", required = false) String observacoes,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {

        log.info("Anexando documento {} para responsável: {}", documentoId, userPrincipal.getUsername());

        try {
            // Validações de segurança
            if (arquivo.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "message", "Arquivo não pode estar vazio"));
            }

            // Validar tipo de arquivo
            String contentType = arquivo.getContentType();
            if (contentType == null || (!contentType.equals("application/pdf") &&
                    !contentType.startsWith("image/"))) {
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "message", "Tipo de arquivo não permitido. Use PDF ou imagens."));
            }

            // Validar tamanho (10MB)
            if (arquivo.getSize() > 10 * 1024 * 1024) {
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "message", "Arquivo muito grande. Máximo 10MB."));
            }

            // Processar anexo
            Map<String, Object> resultado = documentoMatriculaService.anexarDocumento(
                    documentoId, arquivo, observacoes, userPrincipal.getId());

            log.info("Documento {} anexado com sucesso para responsável: {}", documentoId, userPrincipal.getUsername());

            return ResponseEntity.ok(resultado);
        } catch (Exception e) {
            log.error("Erro ao anexar documento {} para responsável: {}", documentoId, userPrincipal.getUsername(), e);
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Erro ao anexar documento: " + e.getMessage()));
        }
    }

    @PostMapping("/assinar-documento")
    public ResponseEntity<?> assinarDocumento(
            @Valid @RequestBody Map<String, Object> request,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {

        Long documentoId = ((Number) request.get("documentoId")).longValue();
        log.info("Assinando documento {} para responsável: {}", documentoId, userPrincipal.getUsername());

        try {
            Map<String, Object> resultado = documentoMatriculaService.assinarDocumento(
                    documentoId,
                    (String) request.get("assinatura"),
                    (String) request.get("observacoes"),
                    userPrincipal.getId());

            log.info("Documento {} assinado com sucesso para responsável: {}", documentoId,
                    userPrincipal.getUsername());

            return ResponseEntity.ok(resultado);
        } catch (Exception e) {
            log.error("Erro ao assinar documento {} para responsável: {}", documentoId, userPrincipal.getUsername(), e);
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Erro ao assinar documento: " + e.getMessage()));
        }
    }

    @GetMapping("/template-documento/{tipoDocumentoId}")
    public ResponseEntity<?> getTemplateDocumento(
            @PathVariable Long tipoDocumentoId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {

        log.info("Buscando template do documento {} para responsável: {}", tipoDocumentoId,
                userPrincipal.getUsername());

        try {
            Map<String, Object> template = documentoMatriculaService.getTemplateDocumento(tipoDocumentoId);
            return ResponseEntity.ok(template);
        } catch (Exception e) {
            log.error("Erro ao buscar template do documento {} para responsável: {}",
                    tipoDocumentoId, userPrincipal.getUsername(), e);
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Erro ao buscar template do documento"));
        }
    }

    @GetMapping("/status-matricula")
    public ResponseEntity<?> getStatusMatricula(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        log.info("Buscando status da matrícula para responsável: {}", userPrincipal.getUsername());

        try {
            Map<String, Object> status = documentoMatriculaService.getStatusMatricula(userPrincipal.getId());
            return ResponseEntity.ok(status);
        } catch (Exception e) {
            log.error("Erro ao buscar status da matrícula para responsável: {}", userPrincipal.getUsername(), e);
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Erro ao buscar status da matrícula"));
        }
    }
}

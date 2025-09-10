package com.cipalam.cipalam_sistema.controller;

import com.cipalam.cipalam_sistema.service.auth.UserPrincipal;
import com.cipalam.cipalam_sistema.service.DocumentoMatriculaService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.Map;

@RestController
@RequestMapping("/api/funcionario")
@RequiredArgsConstructor
@Slf4j
@PreAuthorize("hasRole('FUNCIONARIO') or hasRole('ADMIN')")
public class FuncionarioController {

    private final DocumentoMatriculaService documentoMatriculaService;

    @PostMapping("/aprovar-documento")
    @PreAuthorize("permitAll()") // Permitir acesso temporário para testes
    public ResponseEntity<?> aprovarDocumento(
            @Valid @RequestBody Map<String, Object> request,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {

        Long documentoId = ((Number) request.get("documentoId")).longValue();
        String observacoes = (String) request.get("observacoes");

        // Usar ID padrão para teste se não houver usuário autenticado
        Long funcionarioId = userPrincipal != null ? userPrincipal.getId() : 1L;

        log.info("Funcionário {} aprovando documento ID: {}", funcionarioId, documentoId);

        try {
            Map<String, Object> resultado = documentoMatriculaService.aprovarDocumento(
                    documentoId,
                    observacoes,
                    funcionarioId);

            log.info("Documento {} aprovado com sucesso pelo funcionário: {}", documentoId, funcionarioId);

            return ResponseEntity.ok(resultado);
        } catch (Exception e) {
            log.error("Erro ao aprovar documento {} pelo funcionário: {}", documentoId, funcionarioId, e);
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Erro ao aprovar documento: " + e.getMessage()));
        }
    }

    @PostMapping("/rejeitar-documento")
    @PreAuthorize("permitAll()") // Permitir acesso temporário para testes
    public ResponseEntity<?> rejeitarDocumento(
            @Valid @RequestBody Map<String, Object> request,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {

        Long documentoId = ((Number) request.get("documentoId")).longValue();
        String motivoRejeicao = (String) request.get("motivoRejeicao");

        // Usar ID padrão para teste se não houver usuário autenticado
        Long funcionarioId = userPrincipal != null ? userPrincipal.getId() : 1L;

        log.info("Funcionário {} rejeitando documento ID: {}", funcionarioId, documentoId);

        try {
            if (motivoRejeicao == null || motivoRejeicao.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "message", "Motivo da rejeição é obrigatório"));
            }

            Map<String, Object> resultado = documentoMatriculaService.rejeitarDocumento(
                    documentoId,
                    motivoRejeicao,
                    funcionarioId);

            log.info("Documento {} rejeitado com sucesso pelo funcionário: {}", documentoId, funcionarioId);

            return ResponseEntity.ok(resultado);
        } catch (Exception e) {
            log.error("Erro ao rejeitar documento {} pelo funcionário: {}", documentoId, funcionarioId, e);
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Erro ao rejeitar documento: " + e.getMessage()));
        }
    }

    @GetMapping("/documentos-para-aprovacao")
    @PreAuthorize("permitAll()") // Permitir acesso temporário para testes
    public ResponseEntity<?> getDocumentosParaAprovacao(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        Long funcionarioId = userPrincipal != null ? userPrincipal.getId() : 1L;
        log.info("Funcionário {} buscando documentos para aprovação", funcionarioId);

        try {
            var documentos = documentoMatriculaService.buscarDocumentosParaAprovacao();

            return ResponseEntity.ok(Map.of(
                    "documentos", documentos,
                    "total", documentos.size()));
        } catch (Exception e) {
            log.error("Erro ao buscar documentos para aprovação pelo funcionário: {}", userPrincipal.getUsername(), e);
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Erro ao buscar documentos para aprovação"));
        }
    }

    @GetMapping("/dashboard")
    public ResponseEntity<?> getDashboardFuncionario(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        log.info("Acessando dashboard do funcionário: {}", userPrincipal.getUsername());

        try {
            Map<String, Object> dashboardData = documentoMatriculaService
                    .getDashboardFuncionario(userPrincipal.getId());

            return ResponseEntity.ok(dashboardData);
        } catch (Exception e) {
            log.error("Erro ao buscar dados do dashboard para funcionário: {}", userPrincipal.getUsername(), e);
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Erro ao carregar dados do dashboard"));
        }
    }
}

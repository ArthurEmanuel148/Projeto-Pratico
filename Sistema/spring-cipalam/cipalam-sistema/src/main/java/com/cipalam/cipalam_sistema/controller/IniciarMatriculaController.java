package com.cipalam.cipalam_sistema.controller;

import com.cipalam.cipalam_sistema.DTO.IniciarMatriculaRequest;
import com.cipalam.cipalam_sistema.DTO.IniciarMatriculaResponse;
import com.cipalam.cipalam_sistema.service.IniciarMatriculaService;
import com.cipalam.cipalam_sistema.service.MatriculaService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/matriculas")
@CrossOrigin(origins = { "http://localhost:8100", "http://localhost:4200" })
public class IniciarMatriculaController {

    private static final Logger logger = LoggerFactory.getLogger(IniciarMatriculaController.class);

    @Autowired
    private IniciarMatriculaService iniciarMatriculaService;

    @Autowired
    private MatriculaService matriculaService;

    /**
     * Lista declarações de interesse prontas para matrícula
     * Consulta diretamente a tabela tbInteresseMatricula
     */
    @GetMapping("/declaracoes")
    public ResponseEntity<List<Map<String, Object>>> listarDeclaracoes() {
        try {
            List<Map<String, Object>> declaracoes = iniciarMatriculaService.listarDeclaracoesParaMatricula();
            return ResponseEntity.ok(declaracoes);
        } catch (Exception e) {
            logger.error("Erro ao listar declarações para matrícula", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Obtém detalhes de uma declaração específica
     * Consulta dados completos da tabela tbInteresseMatricula
     */
    @GetMapping("/declaracoes/{id}")
    public ResponseEntity<Map<String, Object>> detalharDeclaracao(@PathVariable Integer id) {
        try {
            Map<String, Object> detalhes = iniciarMatriculaService.detalharDeclaracao(id);
            if (detalhes != null && !detalhes.isEmpty()) {
                return ResponseEntity.ok(detalhes);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            logger.error("Erro ao detalhar declaração", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Lista turmas disponíveis para matrícula
     * Consulta diretamente a tabela tbTurma com cálculos de vagas
     */
    @GetMapping("/turmas")
    public ResponseEntity<List<Map<String, Object>>> listarTurmas() {
        try {
            List<Map<String, Object>> turmas = iniciarMatriculaService.listarTurmasDisponiveis();
            return ResponseEntity.ok(turmas);
        } catch (Exception e) {
            logger.error("Erro ao listar turmas disponíveis", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Lista documentos pendentes para um responsável específico
     * Consulta tabelas tbDocumentoMatricula e tbTipoDocumento diretamente
     */
    @GetMapping("/documentos/{cpfResponsavel}")
    public ResponseEntity<List<Map<String, Object>>> listarDocumentosPendentes(@PathVariable String cpfResponsavel) {
        try {
            List<Map<String, Object>> documentos = iniciarMatriculaService.listarDocumentosPendentes(cpfResponsavel);
            return ResponseEntity.ok(documentos);
        } catch (Exception e) {
            logger.error("Erro ao listar documentos pendentes", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Valida se a matrícula pode ser iniciada
     */
    @PostMapping("/validar")
    public ResponseEntity<?> validarIniciarMatricula(@RequestBody IniciarMatriculaRequest request) {
        try {
            Map<String, Object> resultado = iniciarMatriculaService.validarIniciarMatricula(
                    request.getIdDeclaracao().intValue(),
                    request.getIdTurma().intValue());

            return ResponseEntity.ok(resultado);
        } catch (Exception e) {
            logger.error("Erro ao validar início de matrícula", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Erro ao validar matrícula: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * Executa o processo de iniciar matrícula
     */
    @PostMapping("/iniciar")
    public ResponseEntity<?> iniciarMatricula(@RequestBody IniciarMatriculaRequest request) {
        try {
            // Usar MatriculaService que tem a criptografia BCrypt implementada
            IniciarMatriculaResponse response = matriculaService.iniciarMatricula(request);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Erro ao iniciar matrícula", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Erro ao iniciar matrícula: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * Endpoint para testar conectividade
     */
    @GetMapping("/test")
    public ResponseEntity<Map<String, String>> test() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "OK");
        response.put("message", "API Iniciar Matrícula funcionando");
        response.put("timestamp", java.time.Instant.now().toString());
        return ResponseEntity.ok(response);
    }
}

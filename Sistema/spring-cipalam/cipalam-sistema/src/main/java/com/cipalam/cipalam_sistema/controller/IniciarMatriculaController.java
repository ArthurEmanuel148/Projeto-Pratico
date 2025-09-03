package com.cipalam.cipalam_sistema.controller;

import com.cipalam.cipalam_sistema.DTO.IniciarMatriculaRequest;
import com.cipalam.cipalam_sistema.DTO.IniciarMatriculaResponse;
import com.cipalam.cipalam_sistema.service.IniciarMatriculaService;
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

    @Autowired
    private IniciarMatriculaService iniciarMatriculaService;

    /**
     * Listar declarações de interesse prontas para matrícula
     * Utiliza a view vw_declaracoes_para_matricula do banco
     */
    @GetMapping("/declaracoes")
    public ResponseEntity<?> listarDeclaracoesParaMatricula() {
        try {
            List<Map<String, Object>> declaracoes = iniciarMatriculaService.listarDeclaracoesParaMatricula();
            return ResponseEntity.ok(declaracoes);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Erro ao listar declarações: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * Detalhar uma declaração específica para visualização completa
     * Utiliza a view vw_detalhamento_declaracao do banco
     */
    @GetMapping("/declaracoes/{id}")
    public ResponseEntity<?> detalharDeclaracao(@PathVariable Integer id) {
        try {
            Map<String, Object> detalhes = iniciarMatriculaService.detalharDeclaracao(id);
            if (detalhes != null) {
                return ResponseEntity.ok(detalhes);
            } else {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("message", "Declaração não encontrada");
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Erro ao detalhar declaração: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * Listar turmas disponíveis para seleção (com vagas)
     * Utiliza a view vw_turmas_para_selecao do banco
     */
    @GetMapping("/turmas/disponiveis")
    public ResponseEntity<?> listarTurmasDisponiveis() {
        try {
            List<Map<String, Object>> turmas = iniciarMatriculaService.listarTurmasDisponiveis();
            return ResponseEntity.ok(turmas);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Erro ao listar turmas disponíveis: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * Validar se uma declaração pode ser matriculada em uma turma específica
     * Utiliza a function fn_ValidarIniciarMatricula do banco
     */
    @GetMapping("/validar/{declaracaoId}/{turmaId}")
    public ResponseEntity<?> validarIniciarMatricula(
            @PathVariable Integer declaracaoId,
            @PathVariable Integer turmaId) {
        try {
            Map<String, Object> validacao = iniciarMatriculaService.validarIniciarMatricula(declaracaoId, turmaId);
            return ResponseEntity.ok(validacao);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("valido", false);
            errorResponse.put("mensagem", "Erro na validação: " + e.getMessage());
            return ResponseEntity.ok(errorResponse);
        }
    }

    /**
     * Iniciar matrícula - Endpoint principal
     * Utiliza a procedure sp_IniciarMatricula do banco que automatiza todo o
     * processo
     */
    @PostMapping("/iniciar")
    public ResponseEntity<?> iniciarMatricula(@RequestBody IniciarMatriculaRequest request) {
        try {
            IniciarMatriculaResponse response = iniciarMatriculaService.iniciarMatricula(
                    request.getIdDeclaracao(),
                    request.getIdTurma(),
                    request.getIdFuncionario());

            if (response.getSucesso()) {
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }
        } catch (Exception e) {
            IniciarMatriculaResponse errorResponse = new IniciarMatriculaResponse(
                    "Erro ao iniciar matrícula: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * Obter informações para seleção de turma
     * Utiliza a procedure sp_ObterInfoSelecaoTurma do banco
     */
    @GetMapping("/info-selecao-turma/{declaracaoId}")
    public ResponseEntity<?> obterInfoSelecaoTurma(@PathVariable Integer declaracaoId) {
        try {
            Map<String, Object> info = iniciarMatriculaService.obterInfoSelecaoTurma(declaracaoId);
            return ResponseEntity.ok(info);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Erro ao obter informações: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * Listar documentos pendentes de um responsável
     * Utiliza a procedure sp_ListarDocumentosResponsavel do banco
     */
    @GetMapping("/documentos-pendentes/{cpfResponsavel}")
    public ResponseEntity<?> listarDocumentosPendentes(@PathVariable String cpfResponsavel) {
        try {
            List<Map<String, Object>> documentos = iniciarMatriculaService.listarDocumentosPendentes(cpfResponsavel);
            return ResponseEntity.ok(documentos);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Erro ao listar documentos: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
}

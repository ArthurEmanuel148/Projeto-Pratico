package com.cipalam.cipalam_sistema.controller;

import com.cipalam.cipalam_sistema.model.Turma;
import com.cipalam.cipalam_sistema.service.TurmaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/turmas")
@CrossOrigin(origins = { "http://localhost:8100", "http://localhost:4200" })
public class TurmaController {

    @Autowired
    private TurmaService turmaService;

    @GetMapping
    public ResponseEntity<?> listarTodas() {
        try {
            List<Turma> turmas = turmaService.listarTodas();
            return ResponseEntity.ok(turmas);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Erro ao listar turmas: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> buscarPorId(@PathVariable Integer id) {
        try {
            Optional<Turma> turma = turmaService.buscarPorId(id);
            if (turma.isPresent()) {
                return ResponseEntity.ok(turma.get());
            } else {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("message", "Turma não encontrada");
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Erro ao buscar turma: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @PostMapping
    public ResponseEntity<?> criar(@RequestBody Turma turma) {
        try {
            Turma novaTurma = turmaService.salvar(turma);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Turma criada com sucesso!");
            response.put("turma", novaTurma);

            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Erro ao criar turma: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> atualizar(@PathVariable Integer id, @RequestBody Turma turma) {
        try {
            Turma turmaAtualizada = turmaService.atualizar(id, turma);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Turma atualizada com sucesso!");
            response.put("turma", turmaAtualizada);

            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Erro ao atualizar turma: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletar(@PathVariable Integer id) {
        try {
            turmaService.deletar(id);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Turma excluída com sucesso!");

            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Erro ao excluir turma: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @GetMapping("/ativas")
    public ResponseEntity<?> listarAtivas() {
        try {
            List<Turma> turmas = turmaService.listarAtivas();
            return ResponseEntity.ok(turmas);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Erro ao listar turmas ativas: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @GetMapping("/com-vagas")
    public ResponseEntity<?> listarComVagas() {
        try {
            List<Turma> turmas = turmaService.listarComVagas();
            return ResponseEntity.ok(turmas);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Erro ao listar turmas com vagas: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
}

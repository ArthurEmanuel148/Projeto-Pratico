package com.cipalam.cipalam_sistema.controller;

import com.cipalam.cipalam_sistema.model.Turma;
import com.cipalam.cipalam_sistema.service.TurmaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "success", false,
                    "message", "Erro ao listar turmas: " + e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> buscarPorId(@PathVariable Integer id) {
        try {
            Optional<Turma> turma = turmaService.buscarPorId(id);
            if (turma.isPresent()) {
                return ResponseEntity.ok(turma.get());
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                        "success", false,
                        "message", "Turma não encontrada"));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "success", false,
                    "message", "Erro ao buscar turma: " + e.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<?> criar(@RequestBody Turma turma) {
        try {
            // Validações de campos obrigatórios
            if (turma.getNomeTurma() == null || turma.getNomeTurma().trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                        "success", false,
                        "message", "Nome da turma é obrigatório"));
            }

            if (turma.getCapacidadeMaxima() == null || turma.getCapacidadeMaxima() <= 0) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                        "success", false,
                        "message", "Capacidade máxima é obrigatória e deve ser maior que zero"));
            }

            Turma novaTurma = turmaService.salvar(turma);

            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                    "success", true,
                    "message", "Turma criada com sucesso!",
                    "turma", novaTurma));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                    "success", false,
                    "message", "Erro ao criar turma: " + e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> atualizar(@PathVariable Integer id, @RequestBody Turma turma) {
        try {
            // Validações de campos obrigatórios
            if (turma.getNomeTurma() == null || turma.getNomeTurma().trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                        "success", false,
                        "message", "Nome da turma é obrigatório"));
            }

            if (turma.getCapacidadeMaxima() == null || turma.getCapacidadeMaxima() <= 0) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                        "success", false,
                        "message", "Capacidade máxima é obrigatória e deve ser maior que zero"));
            }

            Turma turmaAtualizada = turmaService.atualizar(id, turma);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Turma atualizada com sucesso!",
                    "turma", turmaAtualizada));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                    "success", false,
                    "message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                    "success", false,
                    "message", "Erro ao atualizar turma: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletar(@PathVariable Integer id) {
        try {
            turmaService.deletar(id);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Turma excluída com sucesso!"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                    "success", false,
                    "message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "success", false,
                    "message", "Erro ao excluir turma: " + e.getMessage()));
        }
    }

    @GetMapping("/ativas")
    public ResponseEntity<?> listarAtivas() {
        try {
            List<Turma> turmas = turmaService.listarAtivas();
            return ResponseEntity.ok(turmas);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "success", false,
                    "message", "Erro ao listar turmas ativas: " + e.getMessage()));
        }
    }

    @GetMapping("/com-vagas")
    public ResponseEntity<?> listarComVagas() {
        try {
            List<Turma> turmas = turmaService.listarComVagas();
            return ResponseEntity.ok(turmas);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "success", false,
                    "message", "Erro ao listar turmas com vagas: " + e.getMessage()));
        }
    }
}

package com.cipalam.cipalam_sistema.controller;

import com.cipalam.cipalam_sistema.model.InteresseMatricula;
import com.cipalam.cipalam_sistema.service.InteresseMatriculaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/interesse-matricula")
@CrossOrigin(origins = { "http://localhost:8100", "http://localhost:4200" })
public class InteresseMatriculaController {

    @Autowired
    private InteresseMatriculaService interesseMatriculaService;

    @PostMapping
    public ResponseEntity<?> criarInteresse(@RequestBody InteresseMatricula interesse) {
        try {
            InteresseMatricula novoInteresse = interesseMatriculaService.criarInteresse(interesse);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Declaração de interesse enviada com sucesso!");
            response.put("protocolo", novoInteresse.getProtocolo());
            response.put("interesse", novoInteresse);

            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Erro ao enviar declaração de interesse: " + e.getMessage());

            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    @GetMapping
    public ResponseEntity<List<InteresseMatricula>> listarTodos() {
        List<InteresseMatricula> interesses = interesseMatriculaService.listarTodos();
        return ResponseEntity.ok(interesses);
    }

    @GetMapping("/{id}")
    public ResponseEntity<InteresseMatricula> buscarPorId(@PathVariable Integer id) {
        Optional<InteresseMatricula> interesse = interesseMatriculaService.buscarPorId(id);
        return interesse.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/protocolo/{protocolo}")
    public ResponseEntity<InteresseMatricula> buscarPorProtocolo(@PathVariable String protocolo) {
        Optional<InteresseMatricula> interesse = interesseMatriculaService.buscarPorProtocolo(protocolo);
        return interesse.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<InteresseMatricula> atualizar(@PathVariable Integer id,
            @RequestBody InteresseMatricula interesse) {
        try {
            InteresseMatricula interesseAtualizado = interesseMatriculaService.atualizar(id, interesse);
            return ResponseEntity.ok(interesseAtualizado);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/{id}/iniciar-matricula")
    public ResponseEntity<?> iniciarMatricula(@PathVariable Integer id, @RequestParam Integer funcionarioId) {
        try {
            Map<String, Object> resultado = interesseMatriculaService.iniciarMatricula(id, funcionarioId);
            return ResponseEntity.ok(resultado);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Erro ao iniciar matrícula: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    @GetMapping("/responsavel/{responsavelId}")
    public ResponseEntity<List<InteresseMatricula>> buscarPorResponsavel(@PathVariable Integer responsavelId) {
        List<InteresseMatricula> interesses = interesseMatriculaService.buscarPorResponsavel(responsavelId);
        return ResponseEntity.ok(interesses);
    }

    @GetMapping("/verificar-responsavel/{cpf}")
    public ResponseEntity<?> verificarResponsavel(@PathVariable String cpf) {
        try {
            Map<String, Object> resultado = interesseMatriculaService.verificarResponsavelExiste(cpf);
            return ResponseEntity.ok(resultado);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("existe", false);
            errorResponse.put("dadosResponsavel", null);
            errorResponse.put("message", "Erro ao verificar responsável: " + e.getMessage());
            return ResponseEntity.ok(errorResponse);
        }
    }

    @PostMapping("/autenticar-responsavel")
    public ResponseEntity<?> autenticarResponsavel(@RequestBody Map<String, String> dados) {
        try {
            String cpf = dados.get("cpf");
            String senha = dados.get("senha");

            Map<String, Object> resultado = interesseMatriculaService.autenticarResponsavel(cpf, senha);
            return ResponseEntity.ok(resultado);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("autenticado", false);
            errorResponse.put("dadosResponsavel", null);
            errorResponse.put("message", "Erro na autenticação: " + e.getMessage());
            return ResponseEntity.ok(errorResponse);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Integer id) {
        try {
            interesseMatriculaService.deletar(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
}

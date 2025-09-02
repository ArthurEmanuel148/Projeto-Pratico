package com.cipalam.cipalam_sistema.controller;

import com.cipalam.cipalam_sistema.DTO.PessoaCadastroDTO;
import com.cipalam.cipalam_sistema.model.Login;
import com.cipalam.cipalam_sistema.model.Pessoa;
import com.cipalam.cipalam_sistema.service.PessoaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/pessoa")
public class PessoaController {
    @Autowired
    private PessoaService pessoaService;

    @PostMapping("/cadastro-funcionario")
    public ResponseEntity<?> cadastrarFuncionario(@RequestBody PessoaCadastroDTO dto) {
        try {
            // Garantir que o tipo seja funcionario ou professor
            if (dto.getTipo() == null) {
                dto.setTipo("funcionario");
            }

            Pessoa pessoa = pessoaService.cadastrarPessoaComTipoELogin(dto);
            return ResponseEntity.status(HttpStatus.CREATED).body(pessoa);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @PostMapping("/cadastro-completo")
    public ResponseEntity<?> cadastrarCompleto(@RequestBody PessoaCadastroDTO dto) {
        try {
            Pessoa pessoa = pessoaService.cadastrarPessoaComTipoELogin(dto);
            return ResponseEntity.status(HttpStatus.CREATED).body(pessoa);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @PostMapping
    public Pessoa cadastrar(@RequestBody Pessoa pessoa) {
        return pessoaService.cadastrarPessoa(pessoa);
    }

    @GetMapping
    public List<Pessoa> listar() {
        return pessoaService.listarPessoas();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Pessoa> buscarPorId(@PathVariable Integer id) {
        return pessoaService.buscarPessoaPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Pessoa> atualizar(@PathVariable Integer id, @RequestBody Pessoa pessoa) {
        try {
            return ResponseEntity.ok(pessoaService.atualizarPessoa(id, pessoa));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Integer id) {
        pessoaService.deletarPessoa(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Login loginRequest) {
        Optional<Map<String, Object>> resultado = pessoaService.login(loginRequest.getUsuario(),
                loginRequest.getSenha());
        if (resultado.isPresent()) {
            return ResponseEntity.ok(resultado.get());
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Usuário ou senha inválidos");
        }
    }

    @GetMapping("/funcionarios")
    public ResponseEntity<?> listarFuncionarios() {
        try {
            List<Map<String, Object>> funcionarios = pessoaService.listarFuncionarios();
            return ResponseEntity.ok(funcionarios);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    @GetMapping("/funcionarios/{id}")
    public ResponseEntity<?> buscarFuncionarioPorId(@PathVariable Integer id) {
        try {
            Map<String, Object> funcionario = pessoaService.buscarFuncionarioPorId(id);
            if (funcionario != null) {
                return ResponseEntity.ok(funcionario);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    @PutMapping("/funcionarios/{id}")
    public ResponseEntity<?> atualizarFuncionario(@PathVariable Integer id, @RequestBody PessoaCadastroDTO dto) {
        try {
            Map<String, Object> funcionarioAtualizado = pessoaService.atualizarFuncionario(id, dto);
            return ResponseEntity.ok(funcionarioAtualizado);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @PostMapping("/corrigir-funcionarios")
    public ResponseEntity<?> corrigirFuncionarios() {
        try {
            Map<String, Object> resultado = pessoaService.corrigirFuncionarios();
            return ResponseEntity.ok(resultado);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }
}
package com.cipalam.cipalam_sistema.controller;

import com.cipalam.cipalam_sistema.model.TipoDocumento;
import com.cipalam.cipalam_sistema.service.TipoDocumentoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/tipos-documento")
@CrossOrigin(origins = { "http://localhost:8100", "http://localhost:4200" })
public class TipoDocumentoController {

    @Autowired
    private TipoDocumentoService tipoDocumentoService;

    @GetMapping
    public ResponseEntity<List<TipoDocumento>> listarTodos() {
        List<TipoDocumento> tipos = tipoDocumentoService.listarTodos();
        return ResponseEntity.ok(tipos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TipoDocumento> buscarPorId(@PathVariable Integer id) {
        Optional<TipoDocumento> tipo = tipoDocumentoService.buscarPorId(id);
        return tipo.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/cota/{tipoCota}")
    public ResponseEntity<List<TipoDocumento>> listarPorCota(@PathVariable String tipoCota) {
        List<TipoDocumento> tipos = tipoDocumentoService.listarPorCota(tipoCota);
        return ResponseEntity.ok(tipos);
    }

    @GetMapping("/ativos")
    public ResponseEntity<List<TipoDocumento>> listarAtivos() {
        List<TipoDocumento> tipos = tipoDocumentoService.listarAtivos();
        return ResponseEntity.ok(tipos);
    }

    @PostMapping
    public ResponseEntity<TipoDocumento> criar(@RequestBody TipoDocumento tipoDocumento) {
        TipoDocumento novoTipo = tipoDocumentoService.salvar(tipoDocumento);
        return ResponseEntity.ok(novoTipo);
    }

    @PutMapping("/{id}")
    public ResponseEntity<TipoDocumento> atualizar(@PathVariable Integer id, @RequestBody TipoDocumento tipoDocumento) {
        try {
            TipoDocumento tipoAtualizado = tipoDocumentoService.atualizar(id, tipoDocumento);
            return ResponseEntity.ok(tipoAtualizado);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Integer id) {
        try {
            tipoDocumentoService.deletar(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}

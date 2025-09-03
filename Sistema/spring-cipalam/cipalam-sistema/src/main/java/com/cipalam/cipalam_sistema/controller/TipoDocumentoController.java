package com.cipalam.cipalam_sistema.controller;

import com.cipalam.cipalam_sistema.model.TipoDocumento;
import com.cipalam.cipalam_sistema.service.TipoDocumentoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/tipos-documento")
@CrossOrigin(origins = { "http://localhost:8100", "http://localhost:4200" })
public class TipoDocumentoController {

    @Autowired
    private TipoDocumentoService tipoDocumentoService;

    /**
     * Lista todos os tipos de documentos com paginação e filtros
     */
    @GetMapping
    public ResponseEntity<Page<TipoDocumento>> listarTiposDocumentos(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String nome,
            @RequestParam(required = false) TipoDocumento.ModalidadeEntrega modalidadeEntrega,
            @RequestParam(required = false) TipoDocumento.QuemDeveFornencer quemDeveFornencer,
            @RequestParam(required = false) Boolean ativo) {

        Page<TipoDocumento> tipos = tipoDocumentoService.listarTiposDocumentos(
                page, size, nome, modalidadeEntrega, quemDeveFornencer, ativo);
        return ResponseEntity.ok(tipos);
    }

    /**
     * Lista todos os tipos de documentos ativos
     */
    @GetMapping("/ativos")
    public ResponseEntity<List<TipoDocumento>> listarAtivos() {
        List<TipoDocumento> tipos = tipoDocumentoService.listarTiposDocumentosAtivos();
        return ResponseEntity.ok(tipos);
    }

    /**
     * Lista documentos organizados por escopo
     */
    @GetMapping("/organizados")
    public ResponseEntity<TipoDocumentoService.DocumentosOrganizados> listarDocumentosOrganizados() {
        TipoDocumentoService.DocumentosOrganizados documentos = tipoDocumentoService.listarDocumentosOrganizados();
        return ResponseEntity.ok(documentos);
    }

    /**
     * Busca tipo de documento por ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<TipoDocumento> buscarPorId(@PathVariable Long id) {
        Optional<TipoDocumento> tipo = tipoDocumentoService.buscarPorId(id);
        return tipo.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Cria um novo tipo de documento
     */
    @PostMapping
    public ResponseEntity<?> criarTipoDocumento(@Valid @RequestBody TipoDocumento tipoDocumento) {
        try {
            TipoDocumento tipoSalvo = tipoDocumentoService.criarTipoDocumento(tipoDocumento);
            return ResponseEntity.status(HttpStatus.CREATED).body(tipoSalvo);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("erro", e.getMessage()));
        }
    }

    /**
     * Atualiza um tipo de documento existente
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> atualizarTipoDocumento(
            @PathVariable Long id,
            @Valid @RequestBody TipoDocumento tipoDocumento) {
        try {
            TipoDocumento tipoAtualizado = tipoDocumentoService.atualizarTipoDocumento(id, tipoDocumento);
            return ResponseEntity.ok(tipoAtualizado);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("erro", e.getMessage()));
        }
    }

    /**
     * Desativa um tipo de documento (soft delete)
     */
    @PatchMapping("/{id}/desativar")
    public ResponseEntity<?> desativarTipoDocumento(@PathVariable Long id) {
        try {
            tipoDocumentoService.desativarTipoDocumento(id);
            return ResponseEntity.ok(Map.of("mensagem", "Tipo de documento desativado com sucesso"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("erro", e.getMessage()));
        }
    }

    /**
     * Remove permanentemente um tipo de documento
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> removerTipoDocumento(@PathVariable Long id) {
        try {
            tipoDocumentoService.removerTipoDocumento(id);
            return ResponseEntity.ok(Map.of("mensagem", "Tipo de documento removido com sucesso"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("erro", e.getMessage()));
        }
    }

    /**
     * Busca documentos por modalidade de entrega
     */
    @GetMapping("/modalidade-entrega/{modalidadeEntrega}")
    public ResponseEntity<List<TipoDocumento>> buscarPorModalidadeEntrega(
            @PathVariable TipoDocumento.ModalidadeEntrega modalidadeEntrega) {
        List<TipoDocumento> tipos = tipoDocumentoService.buscarPorModalidadeEntrega(modalidadeEntrega);
        return ResponseEntity.ok(tipos);
    }

    /**
     * Busca documentos por quem deve fornecer
     */
    @GetMapping("/quem-deve-fornencer/{quemDeveFornencer}")
    public ResponseEntity<List<TipoDocumento>> buscarPorQuemDeveFornencer(
            @PathVariable TipoDocumento.QuemDeveFornencer quemDeveFornencer) {
        List<TipoDocumento> tipos = tipoDocumentoService.buscarPorQuemDeveFornencer(quemDeveFornencer);
        return ResponseEntity.ok(tipos);
    }

    /**
     * Busca documentos por nome
     */
    @GetMapping("/buscar")
    public ResponseEntity<List<TipoDocumento>> buscarPorNome(@RequestParam String nome) {
        List<TipoDocumento> tipos = tipoDocumentoService.buscarPorNome(nome);
        return ResponseEntity.ok(tipos);
    }

    /**
     * Endpoint para testar se está funcionando
     */
    @GetMapping("/teste")
    public ResponseEntity<Map<String, Object>> teste() {
        return ResponseEntity.ok(Map.of(
                "status", "funcionando",
                "timestamp", System.currentTimeMillis(),
                "mensagem", "CRUD de Tipos de Documento implementado com sucesso!"));
    }
}

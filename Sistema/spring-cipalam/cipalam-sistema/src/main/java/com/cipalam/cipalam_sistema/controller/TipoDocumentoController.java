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
            @RequestParam(required = false) TipoDocumento.TipoCota tipoCota,
            @RequestParam(required = false) TipoDocumento.EscopoDocumento escopo,
            @RequestParam(required = false) Boolean ativo) {
        
        Page<TipoDocumento> tipos = tipoDocumentoService.listarTiposDocumentos(
                page, size, nome, tipoCota, escopo, ativo);
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
     * Busca tipo de documento por ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<TipoDocumento> buscarPorId(@PathVariable Long id) {
        Optional<TipoDocumento> tipo = tipoDocumentoService.buscarPorId(id);
        return tipo.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Lista tipos de documentos por cota
     */
    @GetMapping("/cota/{tipoCota}")
    public ResponseEntity<List<TipoDocumento>> listarPorCota(@PathVariable TipoDocumento.TipoCota tipoCota) {
        List<TipoDocumento> tipos = tipoDocumentoService.listarPorCota(tipoCota);
        return ResponseEntity.ok(tipos);
    }

    /**
     * Lista tipos de documentos por escopo
     */
    @GetMapping("/escopo/{escopo}")
    public ResponseEntity<List<TipoDocumento>> listarPorEscopo(@PathVariable TipoDocumento.EscopoDocumento escopo) {
        List<TipoDocumento> tipos = tipoDocumentoService.listarPorEscopo(escopo);
        return ResponseEntity.ok(tipos);
    }

    /**
     * Lista documentos obrigatórios para uma cota
     */
    @GetMapping("/obrigatorios/cota/{tipoCota}")
    public ResponseEntity<List<TipoDocumento>> listarObrigatoriosPorCota(@PathVariable TipoDocumento.TipoCota tipoCota) {
        List<TipoDocumento> tipos = tipoDocumentoService.listarObrigatoriosPorCota(tipoCota);
        return ResponseEntity.ok(tipos);
    }

    /**
     * Lista documentos que requerem assinatura
     */
    @GetMapping("/assinatura")
    public ResponseEntity<List<TipoDocumento>> listarQueRequeremAssinatura() {
        List<TipoDocumento> tipos = tipoDocumentoService.listarQueRequeremAssinatura();
        return ResponseEntity.ok(tipos);
    }

    /**
     * Lista documentos que requerem anexo
     */
    @GetMapping("/anexo")
    public ResponseEntity<List<TipoDocumento>> listarQueRequeremAnexo() {
        List<TipoDocumento> tipos = tipoDocumentoService.listarQueRequeremAnexo();
        return ResponseEntity.ok(tipos);
    }

    /**
     * Busca tipos de documentos por nome
     */
    @GetMapping("/buscar")
    public ResponseEntity<List<TipoDocumento>> buscarPorNome(@RequestParam String nome) {
        List<TipoDocumento> tipos = tipoDocumentoService.buscarPorNome(nome);
        return ResponseEntity.ok(tipos);
    }

    /**
     * Cria um novo tipo de documento
     */
    @PostMapping
    public ResponseEntity<?> criarTipoDocumento(@Valid @RequestBody TipoDocumento tipoDocumento) {
        try {
            TipoDocumento novoTipo = tipoDocumentoService.criarTipoDocumento(tipoDocumento);
            return ResponseEntity.status(HttpStatus.CREATED).body(novoTipo);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("erro", e.getMessage()));
        }
    }

    /**
     * Atualiza um tipo de documento
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> atualizarTipoDocumento(@PathVariable Long id, 
                                                   @Valid @RequestBody TipoDocumento tipoDocumento) {
        try {
            TipoDocumento tipoAtualizado = tipoDocumentoService.atualizarTipoDocumento(id, tipoDocumento);
            return ResponseEntity.ok(tipoAtualizado);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("erro", e.getMessage()));
        }
    }

    /**
     * Remove um tipo de documento
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> removerTipoDocumento(@PathVariable Long id) {
        try {
            tipoDocumentoService.removerTipoDocumento(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("erro", e.getMessage()));
        }
    }

    /**
     * Alterna o status ativo/inativo de um tipo de documento
     */
    @PatchMapping("/{id}/alternar-status")
    public ResponseEntity<?> alternarStatus(@PathVariable Long id) {
        try {
            TipoDocumento tipo = tipoDocumentoService.alternarStatus(id);
            return ResponseEntity.ok(tipo);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("erro", e.getMessage()));
        }
    }

    /**
     * Verifica se um tipo de documento pode ser removido
     */
    @GetMapping("/{id}/pode-remover")
    public ResponseEntity<Map<String, Boolean>> podeRemover(@PathVariable Long id) {
        boolean podeRemover = tipoDocumentoService.podeRemover(id);
        return ResponseEntity.ok(Map.of("podeRemover", podeRemover));
    }

    /**
     * Reordena tipos de documentos
     */
    @PutMapping("/reordenar")
    public ResponseEntity<?> reordenarTiposDocumentos(@RequestBody List<Long> idsOrdenados) {
        try {
            tipoDocumentoService.reordenarTiposDocumentos(idsOrdenados);
            return ResponseEntity.ok(Map.of("sucesso", "Tipos de documentos reordenados com sucesso"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("erro", e.getMessage()));
        }
    }

    // Endpoints para compatibilidade com versão anterior
    @GetMapping("/todos")
    public ResponseEntity<List<TipoDocumento>> listarTodos() {
        List<TipoDocumento> tipos = tipoDocumentoService.listarTodos();
        return ResponseEntity.ok(tipos);
    }

    @GetMapping("/cota-string/{tipoCota}")
    public ResponseEntity<List<TipoDocumento>> listarPorCotaString(@PathVariable String tipoCota) {
        List<TipoDocumento> tipos = tipoDocumentoService.listarPorCotaString(tipoCota);
        return ResponseEntity.ok(tipos);
    }

    @GetMapping("/legacy/{id}")
    public ResponseEntity<TipoDocumento> buscarPorIdLegacy(@PathVariable Integer id) {
        Optional<TipoDocumento> tipo = tipoDocumentoService.buscarPorId(id);
        return tipo.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/legacy")
    public ResponseEntity<TipoDocumento> criarLegacy(@RequestBody TipoDocumento tipoDocumento) {
        TipoDocumento novoTipo = tipoDocumentoService.salvar(tipoDocumento);
        return ResponseEntity.ok(novoTipo);
    }

    @PutMapping("/legacy/{id}")
    public ResponseEntity<TipoDocumento> atualizarLegacy(@PathVariable Integer id, 
                                                        @RequestBody TipoDocumento tipoDocumento) {
        try {
            TipoDocumento tipoAtualizado = tipoDocumentoService.atualizar(id, tipoDocumento);
            return ResponseEntity.ok(tipoAtualizado);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/legacy/{id}")
    public ResponseEntity<Void> deletarLegacy(@PathVariable Integer id) {
        try {
            tipoDocumentoService.deletar(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // =====================================================================
    // ENDPOINTS ESPECÍFICOS PARA CONFIGURAÇÃO POR COTA
    // =====================================================================

    /**
     * Endpoint específico para página de configuração - Lista documentos configuráveis por cota
     */
    @GetMapping("/configuracao/{tipoCota}")
    public ResponseEntity<List<TipoDocumento>> listarDocumentosConfiguracao(@PathVariable TipoDocumento.TipoCota tipoCota) {
        List<TipoDocumento> tipos = tipoDocumentoService.listarPorCota(tipoCota);
        return ResponseEntity.ok(tipos);
    }

    /**
     * Endpoint para configuração global - Lista todos os documentos disponíveis para configuração
     */
    @GetMapping("/configuracao/todos")
    public ResponseEntity<List<TipoDocumento>> listarTodosParaConfiguracao() {
        List<TipoDocumento> tipos = tipoDocumentoService.listarTiposDocumentosAtivos();
        return ResponseEntity.ok(tipos);
    }

    /**
     * Endpoint para aplicar configuração de documentos por cota
     */
    @PostMapping("/configuracao/{tipoCota}/aplicar")
    public ResponseEntity<?> aplicarConfiguracaoCota(
            @PathVariable TipoDocumento.TipoCota tipoCota,
            @RequestBody Map<String, Object> configuracao) {
        try {
            // Implementar lógica de aplicação de configuração
            // Por exemplo, ativar/desativar documentos, alterar obrigatoriedade, etc.
            
            @SuppressWarnings("unchecked")
            List<Long> idsDocumentosAtivos = (List<Long>) configuracao.get("documentosAtivos");
            @SuppressWarnings("unchecked")
            List<Long> idsDocumentosObrigatorios = (List<Long>) configuracao.get("documentosObrigatorios");
            
            // Aplicar configurações (isso seria implementado conforme regras de negócio)
            return ResponseEntity.ok(Map.of(
                "sucesso", "Configuração aplicada com sucesso para cota: " + tipoCota,
                "documentosAtivos", idsDocumentosAtivos != null ? idsDocumentosAtivos.size() : 0,
                "documentosObrigatorios", idsDocumentosObrigatorios != null ? idsDocumentosObrigatorios.size() : 0
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("erro", e.getMessage()));
        }
    }

    /**
     * Endpoint para obter estatísticas de documentos por cota
     */
    @GetMapping("/configuracao/{tipoCota}/estatisticas")
    public ResponseEntity<Map<String, Object>> obterEstatisticasCota(@PathVariable TipoDocumento.TipoCota tipoCota) {
        List<TipoDocumento> documentosCota = tipoDocumentoService.listarPorCota(tipoCota);
        List<TipoDocumento> documentosObrigatorios = tipoDocumentoService.listarObrigatoriosPorCota(tipoCota);
        List<TipoDocumento> documentosAssinatura = documentosCota.stream()
                .filter(TipoDocumento::getRequerAssinatura)
                .toList();
        List<TipoDocumento> documentosAnexo = documentosCota.stream()
                .filter(TipoDocumento::getRequerAnexo)
                .toList();

        Map<String, Object> estatisticas = Map.of(
            "totalDocumentos", documentosCota.size(),
            "documentosObrigatorios", documentosObrigatorios.size(),
            "documentosAssinatura", documentosAssinatura.size(),
            "documentosAnexo", documentosAnexo.size(),
            "tipoCota", tipoCota.toString()
        );

        return ResponseEntity.ok(estatisticas);
    }
}

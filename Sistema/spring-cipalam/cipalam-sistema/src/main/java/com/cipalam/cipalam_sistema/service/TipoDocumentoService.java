package com.cipalam.cipalam_sistema.service;

import com.cipalam.cipalam_sistema.model.TipoDocumento;
import com.cipalam.cipalam_sistema.repository.TipoDocumentoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class TipoDocumentoService {

    @Autowired
    private TipoDocumentoRepository tipoDocumentoRepository;

    /**
     * Lista todos os tipos de documentos com paginação e filtros
     */
    public Page<TipoDocumento> listarTiposDocumentos(int page, int size, String nome,
            TipoDocumento.TipoProcessamento tipoProcessamento,
            TipoDocumento.EscopoDocumento escopo,
            Boolean ativo) {
        Pageable pageable = PageRequest.of(page, size);
        return tipoDocumentoRepository.findWithFilters(nome, tipoProcessamento, escopo, ativo, pageable);
    }

    /**
     * Lista todos os tipos de documentos ativos
     */
    public List<TipoDocumento> listarTiposDocumentosAtivos() {
        return tipoDocumentoRepository.findByAtivoTrueOrderByNomeAsc();
    }

    /**
     * Lista documentos organizados por escopo para a interface
     */
    public DocumentosOrganizados listarDocumentosOrganizados() {
        return new DocumentosOrganizados(
                tipoDocumentoRepository.findByEscopoAndAtivoTrueOrderByNomeAsc(TipoDocumento.EscopoDocumento.FAMILIA),
                tipoDocumentoRepository.findByEscopoAndAtivoTrueOrderByNomeAsc(TipoDocumento.EscopoDocumento.ALUNO),
                tipoDocumentoRepository
                        .findByEscopoAndAtivoTrueOrderByNomeAsc(TipoDocumento.EscopoDocumento.TODOS_INTEGRANTES));
    }

    /**
     * Busca tipo de documento por ID
     */
    public Optional<TipoDocumento> buscarPorId(Long id) {
        return tipoDocumentoRepository.findById(id);
    }

    /**
     * Cria um novo tipo de documento
     */
    public TipoDocumento criarTipoDocumento(TipoDocumento tipoDocumento) {
        // Validações
        validarTipoDocumento(tipoDocumento);

        return tipoDocumentoRepository.save(tipoDocumento);
    }

    /**
     * Atualiza um tipo de documento existente
     */
    public TipoDocumento atualizarTipoDocumento(Long id, TipoDocumento tipoDocumentoAtualizado) {
        TipoDocumento tipoDocumentoExistente = tipoDocumentoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tipo de documento não encontrado com ID: " + id));

        // Atualiza os campos
        tipoDocumentoExistente.setNome(tipoDocumentoAtualizado.getNome());
        tipoDocumentoExistente.setDescricao(tipoDocumentoAtualizado.getDescricao());
        tipoDocumentoExistente.setTipoProcessamento(tipoDocumentoAtualizado.getTipoProcessamento());
        tipoDocumentoExistente.setEscopo(tipoDocumentoAtualizado.getEscopo());
        tipoDocumentoExistente.setAtivo(tipoDocumentoAtualizado.getAtivo());

        // Validações
        validarTipoDocumento(tipoDocumentoExistente);

        return tipoDocumentoRepository.save(tipoDocumentoExistente);
    }

    /**
     * Remove um tipo de documento (soft delete)
     */
    public void desativarTipoDocumento(Long id) {
        TipoDocumento tipoDocumento = tipoDocumentoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tipo de documento não encontrado com ID: " + id));

        tipoDocumento.setAtivo(false);
        tipoDocumentoRepository.save(tipoDocumento);
    }

    /**
     * Remove permanentemente um tipo de documento
     */
    public void removerTipoDocumento(Long id) {
        TipoDocumento tipoDocumento = tipoDocumentoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tipo de documento não encontrado com ID: " + id));

        // Verifica se pode ser removido
        if (!tipoDocumentoRepository.podeRemoverTipoDocumento(id)) {
            throw new RuntimeException(
                    "Este tipo de documento não pode ser removido pois está sendo utilizado em matrículas");
        }

        tipoDocumentoRepository.delete(tipoDocumento);
    }

    /**
     * Busca documentos por tipo de processamento
     */
    public List<TipoDocumento> buscarPorTipoProcessamento(TipoDocumento.TipoProcessamento tipoProcessamento) {
        return tipoDocumentoRepository.findByTipoProcessamentoAndAtivoTrueOrderByNomeAsc(tipoProcessamento);
    }

    /**
     * Busca documentos por escopo
     */
    public List<TipoDocumento> buscarPorEscopo(TipoDocumento.EscopoDocumento escopo) {
        return tipoDocumentoRepository.findByEscopoAndAtivoTrueOrderByNomeAsc(escopo);
    }

    /**
     * Busca documentos por nome
     */
    public List<TipoDocumento> buscarPorNome(String nome) {
        return tipoDocumentoRepository.findByNomeContainingIgnoreCaseAndAtivoTrueOrderByNomeAsc(nome);
    }

    /**
     * Valida um tipo de documento
     */
    private void validarTipoDocumento(TipoDocumento tipoDocumento) {
        if (tipoDocumento.getNome() == null || tipoDocumento.getNome().trim().isEmpty()) {
            throw new RuntimeException("Nome do tipo de documento é obrigatório");
        }

        if (tipoDocumento.getTipoProcessamento() == null) {
            throw new RuntimeException("Tipo de processamento é obrigatório");
        }

        if (tipoDocumento.getEscopo() == null) {
            throw new RuntimeException("Escopo é obrigatório");
        }

        // Verificar se já existe outro tipo com o mesmo nome (considerando apenas
        // ativos)
        List<TipoDocumento> tiposExistentes = tipoDocumentoRepository
                .findByNomeContainingIgnoreCaseAndAtivoTrueOrderByNomeAsc(tipoDocumento.getNome().trim());
        boolean nomeJaExiste = tiposExistentes.stream()
                .anyMatch(td -> td.getNome().equalsIgnoreCase(tipoDocumento.getNome().trim())
                        && !td.getIdTipoDocumento().equals(tipoDocumento.getIdTipoDocumento()));

        if (nomeJaExiste) {
            throw new RuntimeException("Já existe um tipo de documento com esse nome");
        }
    }

    /**
     * Classe para organizar documentos por escopo
     */
    public static class DocumentosOrganizados {
        private List<TipoDocumento> documentosFamilia;
        private List<TipoDocumento> documentosAluno;
        private List<TipoDocumento> documentosTodosIntegrantes;

        public DocumentosOrganizados(List<TipoDocumento> documentosFamilia,
                List<TipoDocumento> documentosAluno,
                List<TipoDocumento> documentosTodosIntegrantes) {
            this.documentosFamilia = documentosFamilia;
            this.documentosAluno = documentosAluno;
            this.documentosTodosIntegrantes = documentosTodosIntegrantes;
        }

        // Getters
        public List<TipoDocumento> getDocumentosFamilia() {
            return documentosFamilia;
        }

        public List<TipoDocumento> getDocumentosAluno() {
            return documentosAluno;
        }

        public List<TipoDocumento> getDocumentosTodosIntegrantes() {
            return documentosTodosIntegrantes;
        }
    }

    // Métodos de compatibilidade com versão anterior (deprecated)
    @Deprecated
    public List<TipoDocumento> listarPorCota(String tipoCota) {
        return listarTiposDocumentosAtivos(); // Por enquanto retorna todos os ativos
    }

    @Deprecated
    public List<TipoDocumento> listarTodos() {
        return tipoDocumentoRepository.findAll();
    }
}

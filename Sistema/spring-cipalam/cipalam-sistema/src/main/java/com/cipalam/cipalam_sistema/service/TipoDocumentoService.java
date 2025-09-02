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
                                                   TipoDocumento.TipoCota tipoCota, 
                                                   TipoDocumento.EscopoDocumento escopo, 
                                                   Boolean ativo) {
        Pageable pageable = PageRequest.of(page, size);
        return tipoDocumentoRepository.findWithFilters(nome, tipoCota, escopo, ativo, pageable);
    }

    /**
     * Lista todos os tipos de documentos ativos
     */
    public List<TipoDocumento> listarTiposDocumentosAtivos() {
        return tipoDocumentoRepository.findByAtivoTrueOrderByOrdemExibicaoAsc();
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
        // Se não foi definida ordem de exibição, pega a próxima disponível
        if (tipoDocumento.getOrdemExibicao() == null || tipoDocumento.getOrdemExibicao() == 0) {
            tipoDocumento.setOrdemExibicao(tipoDocumentoRepository.findProximaOrdemExibicao());
        }
        
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
        tipoDocumentoExistente.setObrigatorio(tipoDocumentoAtualizado.getObrigatorio());
        tipoDocumentoExistente.setRequerAssinatura(tipoDocumentoAtualizado.getRequerAssinatura());
        tipoDocumentoExistente.setRequerAnexo(tipoDocumentoAtualizado.getRequerAnexo());
        tipoDocumentoExistente.setTipoCota(tipoDocumentoAtualizado.getTipoCota());
        tipoDocumentoExistente.setEscopo(tipoDocumentoAtualizado.getEscopo());
        tipoDocumentoExistente.setAtivo(tipoDocumentoAtualizado.getAtivo());
        tipoDocumentoExistente.setOrdemExibicao(tipoDocumentoAtualizado.getOrdemExibicao());
        tipoDocumentoExistente.setTemplateDocumento(tipoDocumentoAtualizado.getTemplateDocumento());

        // Validações
        validarTipoDocumento(tipoDocumentoExistente);

        return tipoDocumentoRepository.save(tipoDocumentoExistente);
    }

    /**
     * Remove um tipo de documento
     */
    public void removerTipoDocumento(Long id) {
        TipoDocumento tipoDocumento = tipoDocumentoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tipo de documento não encontrado com ID: " + id));

        // Verifica se pode ser removido
        if (!tipoDocumentoRepository.podeRemoverTipoDocumento(id)) {
            throw new RuntimeException("Este tipo de documento não pode ser removido pois está sendo utilizado em matrículas");
        }

        tipoDocumentoRepository.delete(tipoDocumento);
    }

    /**
     * Alterna o status ativo/inativo de um tipo de documento
     */
    public TipoDocumento alternarStatus(Long id) {
        TipoDocumento tipoDocumento = tipoDocumentoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tipo de documento não encontrado com ID: " + id));

        tipoDocumento.setAtivo(!tipoDocumento.getAtivo());
        return tipoDocumentoRepository.save(tipoDocumento);
    }

    /**
     * Lista tipos de documentos para uma cota específica
     */
    public List<TipoDocumento> listarPorCota(TipoDocumento.TipoCota tipoCota) {
        return tipoDocumentoRepository.findDocumentosParaCota(tipoCota);
    }

    /**
     * Lista tipos de documentos para um escopo específico
     */
    public List<TipoDocumento> listarPorEscopo(TipoDocumento.EscopoDocumento escopo) {
        return tipoDocumentoRepository.findDocumentosParaEscopo(escopo);
    }

    /**
     * Lista documentos obrigatórios para uma cota
     */
    public List<TipoDocumento> listarObrigatoriosPorCota(TipoDocumento.TipoCota tipoCota) {
        return tipoDocumentoRepository.findDocumentosObrigatoriosParaCota(tipoCota);
    }

    /**
     * Lista documentos que requerem assinatura
     */
    public List<TipoDocumento> listarQueRequeremAssinatura() {
        return tipoDocumentoRepository.findByRequerAssinaturaAndAtivoTrueOrderByOrdemExibicaoAsc(true);
    }

    /**
     * Lista documentos que requerem anexo
     */
    public List<TipoDocumento> listarQueRequeremAnexo() {
        return tipoDocumentoRepository.findByRequerAnexoAndAtivoTrueOrderByOrdemExibicaoAsc(true);
    }

    /**
     * Verifica se um tipo de documento pode ser removido
     */
    public boolean podeRemover(Long id) {
        return tipoDocumentoRepository.podeRemoverTipoDocumento(id);
    }

    /**
     * Busca tipos de documentos por nome
     */
    public List<TipoDocumento> buscarPorNome(String nome) {
        return tipoDocumentoRepository.findByNomeContainingIgnoreCaseOrderByOrdemExibicaoAsc(nome);
    }

    /**
     * Reordena tipos de documentos
     */
    public void reordenarTiposDocumentos(List<Long> idsOrdenados) {
        for (int i = 0; i < idsOrdenados.size(); i++) {
            Long id = idsOrdenados.get(i);
            Optional<TipoDocumento> optTipoDocumento = tipoDocumentoRepository.findById(id);
            if (optTipoDocumento.isPresent()) {
                TipoDocumento tipoDocumento = optTipoDocumento.get();
                tipoDocumento.setOrdemExibicao(i + 1);
                tipoDocumentoRepository.save(tipoDocumento);
            }
        }
    }

    /**
     * Valida os dados de um tipo de documento
     */
    private void validarTipoDocumento(TipoDocumento tipoDocumento) {
        if (tipoDocumento.getNome() == null || tipoDocumento.getNome().trim().isEmpty()) {
            throw new RuntimeException("Nome do tipo de documento é obrigatório");
        }

        if (tipoDocumento.getNome().length() > 100) {
            throw new RuntimeException("Nome do tipo de documento não pode ter mais de 100 caracteres");
        }

        if (tipoDocumento.getEscopo() == null) {
            throw new RuntimeException("Escopo do tipo de documento é obrigatório");
        }

        if (tipoDocumento.getOrdemExibicao() == null || tipoDocumento.getOrdemExibicao() < 1) {
            throw new RuntimeException("Ordem de exibição deve ser um número positivo");
        }

        // Se não requer assinatura nem anexo, deve ser pelo menos declarativo
        if (!tipoDocumento.getRequerAssinatura() && !tipoDocumento.getRequerAnexo()) {
            // Pode ser um documento puramente declarativo - permitido
        }

        // Verifica se já existe outro documento com a mesma ordem (exceto ele mesmo)
        if (tipoDocumento.getIdTipoDocumento() != null) {
            boolean existeOutroComMesmaOrdem = tipoDocumentoRepository
                    .existsByOrdemExibicaoAndIdTipoDocumentoNot(
                            tipoDocumento.getOrdemExibicao(), 
                            tipoDocumento.getIdTipoDocumento()
                    );
            if (existeOutroComMesmaOrdem) {
                throw new RuntimeException("Já existe outro tipo de documento com a ordem de exibição: " + 
                                           tipoDocumento.getOrdemExibicao());
            }
        }
    }

    /**
     * Método para compatibilidade com configuração por cota (legado)
     */
    public List<TipoDocumento> listarPorCotaString(String tipoCota) {
        if (tipoCota == null) {
            return listarTiposDocumentosAtivos();
        }
        
        TipoDocumento.TipoCota tipoCotaEnum;
        try {
            tipoCotaEnum = TipoDocumento.TipoCota.valueOf(tipoCota);
        } catch (IllegalArgumentException e) {
            return listarTiposDocumentosAtivos();
        }
        
        return listarPorCota(tipoCotaEnum);
    }

    // Métodos para compatibilidade com versão anterior
    public List<TipoDocumento> listarTodos() {
        return tipoDocumentoRepository.findAll();
    }

    public List<TipoDocumento> listarAtivos() {
        return listarTiposDocumentosAtivos();
    }

    public List<TipoDocumento> listarPorCota(String tipoCota) {
        return listarPorCotaString(tipoCota);
    }

    public List<TipoDocumento> buscarPorTipoCota(String tipoCota) {
        return listarPorCotaString(tipoCota);
    }

    public Optional<TipoDocumento> buscarPorId(Integer id) {
        return buscarPorId(id.longValue());
    }

    public TipoDocumento salvar(TipoDocumento tipoDocumento) {
        return criarTipoDocumento(tipoDocumento);
    }

    public TipoDocumento atualizar(Integer id, TipoDocumento tipoDocumentoAtualizado) {
        return atualizarTipoDocumento(id.longValue(), tipoDocumentoAtualizado);
    }

    public void deletar(Integer id) {
        removerTipoDocumento(id.longValue());
    }
}

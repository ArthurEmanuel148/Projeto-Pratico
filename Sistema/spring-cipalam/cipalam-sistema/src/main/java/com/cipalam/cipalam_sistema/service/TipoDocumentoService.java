package com.cipalam.cipalam_sistema.service;

import com.cipalam.cipalam_sistema.model.TipoDocumento;
import com.cipalam.cipalam_sistema.repository.TipoDocumentoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class TipoDocumentoService {

    @Autowired
    private TipoDocumentoRepository tipoDocumentoRepository;

    public List<TipoDocumento> listarTodos() {
        return tipoDocumentoRepository.findAll();
    }

    public List<TipoDocumento> listarAtivos() {
        return tipoDocumentoRepository.findAllAtivos();
    }

    public List<TipoDocumento> listarPorCota(String tipoCota) {
        return tipoDocumentoRepository.findTiposDocumentosPorCota(tipoCota);
    }

    public List<TipoDocumento> buscarPorTipoCota(String tipoCota) {
        return tipoDocumentoRepository.findTiposDocumentosPorCota(tipoCota);
    }

    public Optional<TipoDocumento> buscarPorId(Integer id) {
        return tipoDocumentoRepository.findById(id);
    }

    public TipoDocumento salvar(TipoDocumento tipoDocumento) {
        return tipoDocumentoRepository.save(tipoDocumento);
    }

    public TipoDocumento atualizar(Integer id, TipoDocumento tipoDocumentoAtualizado) {
        TipoDocumento tipoDocumento = tipoDocumentoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tipo de documento não encontrado"));

        tipoDocumento.setNome(tipoDocumentoAtualizado.getNome());
        tipoDocumento.setDescricao(tipoDocumentoAtualizado.getDescricao());
        tipoDocumento.setObrigatorio(tipoDocumentoAtualizado.getObrigatorio());
        tipoDocumento.setRequerAssinatura(tipoDocumentoAtualizado.getRequerAssinatura());
        tipoDocumento.setRequerAnexo(tipoDocumentoAtualizado.getRequerAnexo());
        tipoDocumento.setTipoCota(tipoDocumentoAtualizado.getTipoCota());
        tipoDocumento.setAtivo(tipoDocumentoAtualizado.getAtivo());
        tipoDocumento.setOrdemExibicao(tipoDocumentoAtualizado.getOrdemExibicao());
        tipoDocumento.setTemplateDocumento(tipoDocumentoAtualizado.getTemplateDocumento());

        return tipoDocumentoRepository.save(tipoDocumento);
    }

    public void deletar(Integer id) {
        if (!tipoDocumentoRepository.existsById(id)) {
            throw new RuntimeException("Tipo de documento não encontrado");
        }
        tipoDocumentoRepository.deleteById(id);
    }
}

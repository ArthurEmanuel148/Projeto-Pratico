package com.cipalam.cipalam_sistema.service;

import com.cipalam.cipalam_sistema.model.InteresseMatricula;
import com.cipalam.cipalam_sistema.repository.InteresseMatriculaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class InteresseMatriculaService {

    @Autowired
    private InteresseMatriculaRepository interesseMatriculaRepository;

    public InteresseMatricula criarInteresse(InteresseMatricula interesse) {
        return interesseMatriculaRepository.save(interesse);
    }

    public List<InteresseMatricula> listarTodos() {
        return interesseMatriculaRepository.findAll();
    }

    public Optional<InteresseMatricula> buscarPorId(Integer id) {
        return interesseMatriculaRepository.findById(id);
    }

    public Optional<InteresseMatricula> buscarPorProtocolo(String protocolo) {
        return interesseMatriculaRepository.findByProtocolo(protocolo);
    }

    public void deletar(Integer id) {
        interesseMatriculaRepository.deleteById(id);
    }

    public InteresseMatricula atualizar(Integer id, InteresseMatricula interesseAtualizado) {
        InteresseMatricula interesse = interesseMatriculaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Interesse de matrícula não encontrado"));

        interesse.setNomeCompleto(interesseAtualizado.getNomeCompleto());
        interesse.setCpf(interesseAtualizado.getCpf());
        interesse.setEmail(interesseAtualizado.getEmail());
        interesse.setTelefone(interesseAtualizado.getTelefone());
        interesse.setTipoEscola(interesseAtualizado.getTipoEscola());
        interesse.setAnoLetivo(interesseAtualizado.getAnoLetivo());
        interesse.setSerieDesejada(interesseAtualizado.getSerieDesejada());
        interesse.setTipoCota(interesseAtualizado.getTipoCota());

        return interesseMatriculaRepository.save(interesse);
    }
}

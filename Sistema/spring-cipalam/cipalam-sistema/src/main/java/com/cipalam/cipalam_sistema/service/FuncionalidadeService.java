package com.cipalam.cipalam_sistema.service;

import com.cipalam.cipalam_sistema.model.Funcionalidade;
import com.cipalam.cipalam_sistema.repository.FuncionalidadeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class FuncionalidadeService {

    @Autowired
    private FuncionalidadeRepository funcionalidadeRepository;

    public List<Funcionalidade> listarTodas() {
        return funcionalidadeRepository.findAll();
    }

    public List<Funcionalidade> listarTodasFuncionalidades() {
        return funcionalidadeRepository.findAll();
    }

    public List<Funcionalidade> listarFuncionalidadesAtivas() {
        return funcionalidadeRepository.findByAtivoTrue();
    }

    public Optional<Funcionalidade> buscarPorId(Integer id) {
        return funcionalidadeRepository.findById(id);
    }

    public Optional<Funcionalidade> buscarPorChave(String chave) {
        return funcionalidadeRepository.findByChave(chave);
    }

    public Funcionalidade salvar(Funcionalidade funcionalidade) {
        return funcionalidadeRepository.save(funcionalidade);
    }

    public void deletar(Integer id) {
        funcionalidadeRepository.deleteById(id);
    }
}

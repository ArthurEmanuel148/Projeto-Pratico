package com.cipalam.cipalam_sistema.service;

import com.cipalam.cipalam_sistema.model.Funcionalidade;
import com.cipalam.cipalam_sistema.model.Permissao;
import com.cipalam.cipalam_sistema.model.Pessoa;
import com.cipalam.cipalam_sistema.repository.FuncionalidadeRepository;
import com.cipalam.cipalam_sistema.repository.PermissaoRepository;
import com.cipalam.cipalam_sistema.repository.PessoaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class PermissaoService {

    @Autowired
    private PermissaoRepository permissaoRepository;

    @Autowired
    private FuncionalidadeRepository funcionalidadeRepository;

    @Autowired
    private PessoaRepository pessoaRepository;

    public Map<String, Boolean> getPermissoesPorPessoa(Integer pessoaId) {
        List<Permissao> permissoes = permissaoRepository.findByPessoaId(pessoaId);
        Map<String, Boolean> permissoesMap = new HashMap<>();

        for (Permissao permissao : permissoes) {
            permissoesMap.put(permissao.getFuncionalidade().getChave(), permissao.getTemPermissao());
        }

        return permissoesMap;
    }

    public List<Permissao> getPermissoesAtivasPorPessoa(Integer pessoaId) {
        return permissaoRepository.findByPessoaIdAndTemPermissaoTrue(pessoaId);
    }

    @Transactional
    public void salvarPermissoesPessoa(Integer pessoaId, Map<String, Boolean> permissoes) {
        Pessoa pessoa = pessoaRepository.findById(pessoaId)
                .orElseThrow(() -> new RuntimeException("Pessoa não encontrada"));

        // Remove todas as permissões existentes para esta pessoa
        permissaoRepository.deleteByPessoa(pessoa);

        // Adiciona as novas permissões
        for (Map.Entry<String, Boolean> entry : permissoes.entrySet()) {
            String chaveFuncionalidade = entry.getKey();
            Boolean temPermissao = entry.getValue();

            Funcionalidade funcionalidade = funcionalidadeRepository.findByChave(chaveFuncionalidade)
                    .orElseThrow(() -> new RuntimeException("Funcionalidade não encontrada: " + chaveFuncionalidade));

            Permissao permissao = new Permissao();
            permissao.setPessoa(pessoa);
            permissao.setFuncionalidade(funcionalidade);
            permissao.setTemPermissao(temPermissao);

            permissaoRepository.save(permissao);
        }
    }

    @Transactional
    public void darTodasPermissoes(Integer pessoaId) {
        Pessoa pessoa = pessoaRepository.findById(pessoaId)
                .orElseThrow(() -> new RuntimeException("Pessoa não encontrada"));

        List<Funcionalidade> todasFuncionalidades = funcionalidadeRepository.findAll();

        // Remove todas as permissões existentes
        permissaoRepository.deleteByPessoa(pessoa);

        // Adiciona todas as permissões como true
        for (Funcionalidade funcionalidade : todasFuncionalidades) {
            Permissao permissao = new Permissao();
            permissao.setPessoa(pessoa);
            permissao.setFuncionalidade(funcionalidade);
            permissao.setTemPermissao(true);

            permissaoRepository.save(permissao);
        }
    }

    public Map<String, Boolean> buscarPermissoesPorPessoa(Integer pessoaId) {
        return getPermissoesPorPessoa(pessoaId);
    }

    @Transactional
    public void criarPermissoesPorChaves(Integer pessoaId, List<String> chavesPermissoes) {
        Pessoa pessoa = pessoaRepository.findById(pessoaId)
                .orElseThrow(() -> new RuntimeException("Pessoa não encontrada"));

        // Remove todas as permissões existentes para esta pessoa
        permissaoRepository.deleteByPessoa(pessoa);

        List<Funcionalidade> todasFuncionalidades = funcionalidadeRepository.findAll();

        // Cria permissões baseadas nas chaves fornecidas
        for (Funcionalidade funcionalidade : todasFuncionalidades) {
            Permissao permissao = new Permissao();
            permissao.setPessoa(pessoa);
            permissao.setFuncionalidade(funcionalidade);
            permissao.setTemPermissao(chavesPermissoes.contains(funcionalidade.getChave()));

            permissaoRepository.save(permissao);
        }
    }
}

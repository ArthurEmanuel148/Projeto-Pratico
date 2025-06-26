package com.cipalam.cipalam_sistema.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.cipalam.cipalam_sistema.DTO.PessoaCadastroDTO;
import com.cipalam.cipalam_sistema.model.*;
import com.cipalam.cipalam_sistema.repository.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class PessoaService {
    @Autowired
    private PessoaRepository pessoaRepo;

    @Autowired
    private LoginRepository loginRepo;
    @Autowired
    private AlunoRepository alunoRepo;
    @Autowired
    private ProfessorRepository professorRepo;
    @Autowired
    private PermissaoService permissaoService;
    @Autowired
    private FuncionalidadeService funcionalidadeService;

    public Pessoa cadastrarPessoa(Pessoa pessoa) {
        return pessoaRepo.save(pessoa);
    }

    public List<Pessoa> listarPessoas() {
        return pessoaRepo.findAll();
    }

    public Optional<Pessoa> buscarPessoaPorId(Integer id) {
        return pessoaRepo.findById(id);
    }

    public Pessoa atualizarPessoa(Integer id, Pessoa pessoaAtualizada) {
        Pessoa pessoa = pessoaRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Pessoa não encontrada"));
        pessoa.setNmPessoa(pessoaAtualizada.getNmPessoa());
        pessoa.setCpfPessoa(pessoaAtualizada.getCpfPessoa());
        pessoa.setCaminhoImagem(pessoaAtualizada.getCaminhoImagem());
        pessoa.setDtNascPessoa(pessoaAtualizada.getDtNascPessoa());
        pessoa.setCaminhoIdentidadePessoa(pessoaAtualizada.getCaminhoIdentidadePessoa());
        return pessoaRepo.save(pessoa);
    }

    public void deletarPessoa(Integer id) {
        pessoaRepo.deleteById(id);
    }

    @Transactional
    public Pessoa cadastrarPessoaComTipoELogin(PessoaCadastroDTO dto) {
        Pessoa pessoa = pessoaRepo.save(dto.getPessoa());

        if (dto.getUsuario() != null && dto.getSenha() != null) {
            Login login = new Login();
            login.setUsuario(dto.getUsuario());
            login.setSenha(dto.getSenha());
            login.setPessoa(pessoa);
            loginRepo.save(login);
        }

        switch (dto.getTipo().toLowerCase()) {
            case "aluno":
                Aluno aluno = new Aluno();
                aluno.setPessoa(pessoa);
                alunoRepo.save(aluno);
                break;
            case "professor":
            case "funcionario":
                Professor professor = new Professor();
                professor.setPessoa(pessoa);
                professorRepo.save(professor);

                // Se houver permissões especificadas no DTO, criar as permissões
                if (dto.getPermissoes() != null && !dto.getPermissoes().isEmpty()) {
                    permissaoService.criarPermissoesPorChaves(pessoa.getIdPessoa(), dto.getPermissoes());
                }
                break;
            // outros tipos...
        }

        return pessoa;
    }

    public Optional<Map<String, Object>> login(String usuario, String senha) {
        Optional<Login> loginOpt = loginRepo.findByUsuarioAndSenha(usuario, senha);
        if (loginOpt.isPresent()) {
            Pessoa pessoa = loginOpt.get().getPessoa();
            String tipo = "funcionario"; // tipo padrão

            // Verificar se é administrador
            if (pessoa.getNmPessoa().equals("Administrador do Sistema") || usuario.equals("admin")) {
                tipo = "admin";
            } else if (professorRepo.existsByPessoa_IdPessoa(pessoa.getIdPessoa())) {
                tipo = "professor";
            } else if (alunoRepo.existsByPessoa_IdPessoa(pessoa.getIdPessoa())) {
                tipo = "aluno";
            }

            // Buscar permissões do usuário
            Map<String, Boolean> permissoes = permissaoService.buscarPermissoesPorPessoa(pessoa.getIdPessoa());

            Map<String, Object> info = new HashMap<>();
            info.put("pessoa", pessoa);
            info.put("tipo", tipo);
            info.put("permissoes", permissoes);
            return Optional.of(info);
        }
        return Optional.empty();
    }
}
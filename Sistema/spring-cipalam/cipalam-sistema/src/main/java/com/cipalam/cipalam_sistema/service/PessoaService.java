package com.cipalam.cipalam_sistema.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.cipalam.cipalam_sistema.DTO.PessoaCadastroDTO;
import com.cipalam.cipalam_sistema.model.*;
import com.cipalam.cipalam_sistema.repository.*;

import java.util.ArrayList;
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

<<<<<<< Updated upstream
    @Autowired
    private FuncionarioRepository funcionarioRepo;
=======
>>>>>>> Stashed changes

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private PermissaoService permissaoService;
    // @Autowired
    // private FuncionalidadeService funcionalidadeService; // Comentado pois não
    // está sendo usado

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
            // Criptografar a senha antes de salvar
            login.setSenha(passwordEncoder.encode(dto.getSenha()));
            login.setPessoa(pessoa);
            loginRepo.save(login);
        }

        switch (dto.getTipo().toLowerCase()) {
            case "aluno":
                Aluno aluno = new Aluno();
                aluno.setPessoa(pessoa);
                alunoRepo.save(aluno);
                break;
            case "funcionario":
                // Criar funcionário na nova tabela tbFuncionario
                Funcionario funcionario = new Funcionario();
                funcionario.setTbPessoaIdPessoa(pessoa.getIdPessoa());
                funcionario.setDataInicio(java.time.LocalDate.now());
                funcionario.setAtivo(true);
                funcionarioRepo.save(funcionario);

                // Se houver permissões especificadas no DTO, criar as permissões
                if (dto.getPermissoes() != null && !dto.getPermissoes().isEmpty()) {
                    permissaoService.criarPermissoesPorChaves(pessoa.getIdPessoa(), dto.getPermissoes());
                }
                break;
            case "responsavel":
                // Responsavel responsavel = new Responsavel();
                // responsavel.setPessoa(pessoa);
                // responsavelRepo.save(responsavel);
                break;
            // outros tipos...
        }

        return pessoa;
    }

    public Optional<Map<String, Object>> login(String usuario, String senha) {
        Optional<Login> loginOpt = loginRepo.findByUsuario(usuario);
        if (loginOpt.isPresent()) {
            Login login = loginOpt.get();
<<<<<<< Updated upstream
            // Verificar se a senha está correta usando BCrypt
=======
            // Verifica a senha usando o PasswordEncoder
>>>>>>> Stashed changes
            if (passwordEncoder.matches(senha, login.getSenha())) {
                Pessoa pessoa = login.getPessoa();
                String tipo = "funcionario"; // tipo padrão

                // Verificar se é administrador
                if (pessoa.getNmPessoa().equals("Administrador do Sistema") || usuario.equals("admin")) {
                    tipo = "admin";
<<<<<<< Updated upstream
=======
                } else if (professorRepo.existsByPessoa_IdPessoa(pessoa.getIdPessoa())) {
                    tipo = "professor";
>>>>>>> Stashed changes
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
        }
        return Optional.empty();
    }

    // public boolean isFuncionario(Integer pessoaId) {
    // // Verificar se a pessoa é professor (funcionário) ou se tem permissões
    // // especiais
    // return professorRepo.existsByPessoa_IdPessoa(pessoaId);
    // }

    public List<Map<String, Object>> listarFuncionarios() {
        List<Map<String, Object>> funcionarios = new java.util.ArrayList<>();

        // Buscar todas as pessoas que têm login
        List<Login> logins = loginRepo.findAll();

        for (Login login : logins) {
            Pessoa pessoa = login.getPessoa();
            Map<String, Object> funcionarioInfo = new HashMap<>();

            funcionarioInfo.put("idPessoa", pessoa.getIdPessoa());
            funcionarioInfo.put("nome", pessoa.getNmPessoa());
            funcionarioInfo.put("cpf", pessoa.getCpfPessoa());
            funcionarioInfo.put("email", pessoa.getEmail());
            funcionarioInfo.put("telefone", pessoa.getTelefone());
            funcionarioInfo.put("usuario", login.getUsuario());

            // Verificar se está na tabela tbFuncionario
            boolean isFuncionario = funcionarioRepo.existsByTbPessoaIdPessoa(pessoa.getIdPessoa());
            funcionarioInfo.put("isFuncionario", isFuncionario);

            // Buscar permissões
            Map<String, Boolean> permissoes = permissaoService.buscarPermissoesPorPessoa(pessoa.getIdPessoa());
            funcionarioInfo.put("permissoes", permissoes);

            funcionarios.add(funcionarioInfo);
        }

        return funcionarios;
    }

    @Transactional
    public Map<String, Object> corrigirFuncionarios() {
        int funcionariosCriados = 0;
        List<String> pessoasCorrigidas = new ArrayList<>();

        // Buscar todas as pessoas que têm login mas não estão na tabela tbFuncionario
        List<Login> logins = loginRepo.findAll();

        for (Login login : logins) {
            Pessoa pessoa = login.getPessoa();
            boolean isFuncionario = funcionarioRepo.existsByTbPessoaIdPessoa(pessoa.getIdPessoa());

            if (!isFuncionario) {
                // Criar registro de funcionário
                Funcionario funcionario = new Funcionario();
                funcionario.setTbPessoaIdPessoa(pessoa.getIdPessoa());
                funcionario.setDataInicio(java.time.LocalDate.now());
                funcionario.setAtivo(true);
                funcionario.setObservacoes("Funcionário criado automaticamente durante correção do sistema");
                funcionarioRepo.save(funcionario);

                funcionariosCriados++;
                pessoasCorrigidas.add(pessoa.getNmPessoa() + " (ID: " + pessoa.getIdPessoa() + ")");
            }
        }

        Map<String, Object> resultado = new HashMap<>();
        resultado.put("funcionariosCriados", funcionariosCriados);
        resultado.put("pessoasCorrigidas", pessoasCorrigidas);
        resultado.put("message", "Correção concluída: " + funcionariosCriados + " funcionários criados");

        return resultado;
    }
}
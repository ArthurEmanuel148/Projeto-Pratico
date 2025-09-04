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

    @Autowired
    private FuncionarioRepository funcionarioRepo;

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
            Pessoa pessoa = login.getPessoa();
            String tipo = "";
            List<String> permissoes = new ArrayList<>();

            // Verificar se é administrador
            if (pessoa.getNmPessoa().equals("Administrador do Sistema") || usuario.equals("admin")) {
                tipo = "admin";
            } else if (funcionarioRepo.existsByTbPessoaIdPessoa(pessoa.getIdPessoa())) {
                tipo = "funcionario";
            } else if (alunoRepo.existsByPessoa_IdPessoa(pessoa.getIdPessoa())) {
                tipo = "aluno";
            }

            // Buscar permissões se necessário
            // permissoes = permissaoService.buscarPermissoesPorPessoa(pessoa.getIdPessoa());

            Map<String, Object> info = new HashMap<>();
            info.put("tipo", tipo);
            info.put("permissoes", permissoes);
            return Optional.of(info);
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

        // Buscar apenas as pessoas que estão na tabela tbFuncionario
        List<Funcionario> funcionariosList = funcionarioRepo.findAll();

        for (Funcionario funcionario : funcionariosList) {
            // Buscar a pessoa pelo ID
            Optional<Pessoa> pessoaOpt = pessoaRepo.findById(funcionario.getTbPessoaIdPessoa());
            if (pessoaOpt.isPresent()) {
                Pessoa pessoa = pessoaOpt.get();
                Map<String, Object> funcionarioInfo = new HashMap<>();

                funcionarioInfo.put("id", pessoa.getIdPessoa());
                funcionarioInfo.put("idPessoa", pessoa.getIdPessoa());
                funcionarioInfo.put("nome", pessoa.getNmPessoa());
                funcionarioInfo.put("nmPessoa", pessoa.getNmPessoa());
                funcionarioInfo.put("cpf", pessoa.getCpfPessoa());
                funcionarioInfo.put("cpfPessoa", pessoa.getCpfPessoa());
                funcionarioInfo.put("email", pessoa.getEmail());
                funcionarioInfo.put("telefone", pessoa.getTelefone());
                funcionarioInfo.put("dataNascimento", pessoa.getDtNascPessoa());
                funcionarioInfo.put("dtNascPessoa", pessoa.getDtNascPessoa());
                funcionarioInfo.put("dataEntradaInstituto", funcionario.getDataInicio());
                funcionarioInfo.put("dataInicio", funcionario.getDataInicio());
                funcionarioInfo.put("tipo", "funcionario");

                // Buscar informações de login
                List<Login> logins = loginRepo.findAll();
                for (Login login : logins) {
                    if (login.getPessoa().getIdPessoa().equals(pessoa.getIdPessoa())) {
                        funcionarioInfo.put("usuario", login.getUsuario());
                        break;
                    }
                }

                // Buscar permissões
                Map<String, Boolean> permissoes = permissaoService.buscarPermissoesPorPessoa(pessoa.getIdPessoa());
                funcionarioInfo.put("permissoes", permissoes);

                funcionarios.add(funcionarioInfo);
            }
        }

        return funcionarios;
    }

    public Map<String, Object> buscarFuncionarioPorId(Integer id) {
        // Verificar se a pessoa existe e é um funcionário
        Optional<Pessoa> pessoaOpt = pessoaRepo.findById(id);
        if (!pessoaOpt.isPresent()) {
            return null;
        }

        Pessoa pessoa = pessoaOpt.get();

        // Verificar se é funcionário
        boolean isFuncionario = funcionarioRepo.existsByTbPessoaIdPessoa(pessoa.getIdPessoa());
        if (!isFuncionario) {
            return null;
        }

        Map<String, Object> funcionarioInfo = new HashMap<>();
        funcionarioInfo.put("id", pessoa.getIdPessoa());
        funcionarioInfo.put("idPessoa", pessoa.getIdPessoa());
        funcionarioInfo.put("nome", pessoa.getNmPessoa());
        funcionarioInfo.put("nmPessoa", pessoa.getNmPessoa());
        funcionarioInfo.put("cpf", pessoa.getCpfPessoa());
        funcionarioInfo.put("cpfPessoa", pessoa.getCpfPessoa());
        funcionarioInfo.put("email", pessoa.getEmail());
        funcionarioInfo.put("telefone", pessoa.getTelefone());
        funcionarioInfo.put("dataNascimento", pessoa.getDtNascPessoa());
        funcionarioInfo.put("dtNascPessoa", pessoa.getDtNascPessoa());
        funcionarioInfo.put("tipo", "funcionario");

        // Buscar informações específicas do funcionário (data de entrada)
        Optional<Funcionario> funcionarioOpt = funcionarioRepo.findByTbPessoaIdPessoa(pessoa.getIdPessoa());
        if (funcionarioOpt.isPresent()) {
            Funcionario funcionario = funcionarioOpt.get();
            funcionarioInfo.put("dataEntradaInstituto", funcionario.getDataInicio());
            funcionarioInfo.put("dataInicio", funcionario.getDataInicio());
        }

        // Buscar informações de login
        List<Login> logins = loginRepo.findAll();
        for (Login login : logins) {
            if (login.getPessoa().getIdPessoa().equals(pessoa.getIdPessoa())) {
                funcionarioInfo.put("usuario", login.getUsuario());
                break;
            }
        }

        // Buscar permissões
        Map<String, Boolean> permissoes = permissaoService.buscarPermissoesPorPessoa(pessoa.getIdPessoa());
        funcionarioInfo.put("permissoes", permissoes);

        return funcionarioInfo;
    }

    @Transactional
    public Map<String, Object> atualizarFuncionario(Integer id, PessoaCadastroDTO dto) {
        try {
            // Verificar se a pessoa existe e é um funcionário
            Optional<Pessoa> pessoaOpt = pessoaRepo.findById(id);
            if (!pessoaOpt.isPresent()) {
                throw new RuntimeException("Funcionário não encontrado");
            }

            Pessoa pessoa = pessoaOpt.get();

            // Verificar se é funcionário
            boolean isFuncionario = funcionarioRepo.existsByTbPessoaIdPessoa(pessoa.getIdPessoa());
            if (!isFuncionario) {
                throw new RuntimeException("Pessoa não é um funcionário");
            }

            // Atualizar dados da pessoa
            pessoa.setNmPessoa(dto.getPessoa().getNmPessoa());
            pessoa.setEmail(dto.getPessoa().getEmail());
            pessoa.setTelefone(dto.getPessoa().getTelefone());
            if (dto.getPessoa().getCpfPessoa() != null && !dto.getPessoa().getCpfPessoa().isEmpty()) {
                pessoa.setCpfPessoa(dto.getPessoa().getCpfPessoa());
            }
            if (dto.getPessoa().getDtNascPessoa() != null) {
                pessoa.setDtNascPessoa(dto.getPessoa().getDtNascPessoa());
            }

            pessoa = pessoaRepo.save(pessoa);

            // Atualizar dados do funcionário (data de entrada)
            Optional<Funcionario> funcionarioOpt = funcionarioRepo.findByTbPessoaIdPessoa(pessoa.getIdPessoa());
            if (funcionarioOpt.isPresent()) {
                // Por enquanto, não vamos alterar a data de entrada para evitar problemas
                // Se necessário, pode ser implementado depois
            }

            // Atualizar login se fornecido
            if (dto.getUsuario() != null && !dto.getUsuario().isEmpty()) {
                List<Login> logins = loginRepo.findAll();
                for (Login login : logins) {
                    if (login.getPessoa().getIdPessoa().equals(pessoa.getIdPessoa())) {
                        login.setUsuario(dto.getUsuario());
                        if (dto.getSenha() != null && !dto.getSenha().isEmpty()) {
                            login.setSenha(dto.getSenha());
                        }
                        loginRepo.save(login);
                        break;
                    }
                }
            }

            // Atualizar permissões
            if (dto.getPermissoes() != null && !dto.getPermissoes().isEmpty()) {
                try {
                    permissaoService.atualizarPermissoesPorChaves(pessoa.getIdPessoa(), dto.getPermissoes());
                    System.out.println("Permissões atualizadas com sucesso para pessoa ID: " + pessoa.getIdPessoa());
                } catch (Exception e) {
                    System.err.println("Erro ao atualizar permissões: " + e.getMessage());
                    throw new RuntimeException("Erro ao atualizar permissões: " + e.getMessage());
                }
            }

            // Retornar dados atualizados
            return buscarFuncionarioPorId(id);

        } catch (Exception e) {
            throw new RuntimeException("Erro ao atualizar funcionário: " + e.getMessage());
        }
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
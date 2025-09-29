package com.cipalam.cipalam_sistema.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.cipalam.cipalam_sistema.DTO.PessoaCadastroDTO;
import com.cipalam.cipalam_sistema.model.*;
import com.cipalam.cipalam_sistema.repository.*;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
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
        System.out.println("=== INÍCIO CADASTRO PESSOA ===");
        System.out.println("DTO completo recebido:");
        System.out.println("  pessoa objeto: " + dto.getPessoa());
        System.out.println("  nmPessoa: " + dto.getNmPessoa());
        System.out.println("  email: " + dto.getEmail());
        System.out.println("  telefone: " + dto.getTelefone());
        System.out.println("  cpfPessoa: " + dto.getCpfPessoa());
        System.out.println("  dtNascPessoa: " + dto.getDtNascPessoa());
        System.out.println("  dataInicio: " + dto.getDataInicio());
        System.out.println("  usuario: " + dto.getUsuario());
        System.out.println("  tipo: " + dto.getTipo());

        // Construir objeto pessoa a partir dos campos do DTO
        Pessoa pessoa;
        if (dto.getPessoa() != null) {
            // Se existe objeto pessoa, usar ele
            pessoa = dto.getPessoa();
            System.out.println("✅ Usando objeto pessoa existente");
        } else {
            // Se não existe, criar a partir dos campos individuais
            pessoa = new Pessoa();
            System.out.println("⚙️ Criando novo objeto pessoa a partir dos campos individuais");
        }

        // Sempre preencher os campos com os valores do DTO (sobrescreve se necessário)
        if (dto.getNmPessoa() != null) {
            pessoa.setNmPessoa(dto.getNmPessoa());
            System.out.println("✅ Nome definido: " + dto.getNmPessoa());
        }
        if (dto.getEmail() != null) {
            pessoa.setEmail(dto.getEmail());
            System.out.println("✅ Email definido: " + dto.getEmail());
        }
        if (dto.getTelefone() != null) {
            pessoa.setTelefone(dto.getTelefone());
            System.out.println("✅ Telefone definido: " + dto.getTelefone());
        }
        if (dto.getCpfPessoa() != null) {
            pessoa.setCpfPessoa(dto.getCpfPessoa());
            System.out.println("✅ CPF definido: " + dto.getCpfPessoa());
        }

        // Tratar data de nascimento especialmente
        if (dto.getDtNascPessoa() != null && !dto.getDtNascPessoa().trim().isEmpty()) {
            try {
                LocalDate localDate = LocalDate.parse(dto.getDtNascPessoa(), DateTimeFormatter.ISO_LOCAL_DATE);
                pessoa.setDtNascPessoa(java.sql.Date.valueOf(localDate));
                System.out.println("✅ Data nascimento convertida: " + dto.getDtNascPessoa() + " -> " + pessoa.getDtNascPessoa());
            } catch (Exception e) {
                System.err.println("❌ ERRO ao converter data de nascimento: " + dto.getDtNascPessoa());
                e.printStackTrace();
                throw new RuntimeException("Data de nascimento inválida: " + dto.getDtNascPessoa());
            }
        } else {
            System.err.println("❌ ERRO: Data de nascimento está vazia ou nula");
            throw new RuntimeException("Data de nascimento é obrigatória");
        }

        // Definir ativo baseado no DTO ou true por padrão
        if (dto.getAtivo() != null) {
            pessoa.setAtivo(dto.getAtivo());
            System.out.println("✅ Ativo definido: " + dto.getAtivo());
        } else {
            pessoa.setAtivo(true);
            System.out.println("✅ Ativo definido como padrão: true");
        }

        System.out.println("=== PESSOA ANTES DE SALVAR ===");
        System.out.println("nmPessoa: " + pessoa.getNmPessoa());
        System.out.println("email: " + pessoa.getEmail());
        System.out.println("telefone: " + pessoa.getTelefone());
        System.out.println("cpfPessoa: " + pessoa.getCpfPessoa());
        System.out.println("dtNascPessoa: " + pessoa.getDtNascPessoa());
        System.out.println("ativo: " + pessoa.getAtivo());

        // Salvar a pessoa
        Pessoa pessoaSalva = pessoaRepo.save(pessoa);
        System.out.println("✅ Pessoa salva com ID: " + pessoaSalva.getIdPessoa());

        if (dto.getUsuario() != null && dto.getSenha() != null) {
            Login login = new Login();
            login.setUsuario(dto.getUsuario());
            // Criptografar a senha antes de salvar
            login.setSenha(passwordEncoder.encode(dto.getSenha()));
            login.setPessoa(pessoaSalva);
            loginRepo.save(login);
        }

        switch (dto.getTipo().toLowerCase()) {
            case "aluno":
                Aluno aluno = new Aluno();
                aluno.setPessoa(pessoaSalva);
                alunoRepo.save(aluno);
                break;
            case "funcionario":
                // Criar funcionário na nova tabela tbFuncionario
                Funcionario funcionario = new Funcionario();
                funcionario.setTbPessoaIdPessoa(pessoaSalva.getIdPessoa());
                // Usar a data fornecida no DTO ou a data atual como padrão
                LocalDate dataInicio = dto.getDataInicioAsLocalDate();
                funcionario.setDataInicio(dataInicio != null ? dataInicio : java.time.LocalDate.now());

                System.out.println("=== DADOS FUNCIONÁRIO BACKEND ===");
                System.out.println("Data recebida (string): " + dto.getDataInicio());
                System.out.println("Data convertida (LocalDate): " + dataInicio);
                System.out.println("Data final salva: " + funcionario.getDataInicio());
                funcionario.setAtivo(true);
                funcionarioRepo.save(funcionario);

                // Se houver permissões especificadas no DTO, criar as permissões
                if (dto.getPermissoes() != null && !dto.getPermissoes().isEmpty()) {
                    permissaoService.criarPermissoesPorChaves(pessoaSalva.getIdPessoa(), dto.getPermissoes());
                }
                break;
            case "responsavel":
                // Responsavel responsavel = new Responsavel();
                // responsavel.setPessoa(pessoa);
                // responsavelRepo.save(responsavel);
                break;
            // outros tipos...
        }

        return pessoaSalva;
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
            // permissoes =
            // permissaoService.buscarPermissoesPorPessoa(pessoa.getIdPessoa());

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
            System.out.println("=== SERVICE - ATUALIZARFUNCIONARIO ===");
            System.out.println("ID: " + id);
            System.out.println("DTO toString: " + dto.toString());
            System.out.println("DTO class: " + dto.getClass().getName());

            // Verificar campos principais do DTO
            System.out.println("=== CAMPOS DO DTO ===");
            System.out.println("nmPessoa: " + dto.getNmPessoa());
            System.out.println("email: " + dto.getEmail());
            System.out.println("telefone: " + dto.getTelefone());
            System.out.println("cpfPessoa: " + dto.getCpfPessoa());
            System.out.println("dtNascPessoa: " + dto.getDtNascPessoa());
            System.out.println("dataInicio: " + dto.getDataInicio());
            System.out.println("usuario: " + dto.getUsuario());
            System.out.println("senha: " + dto.getSenha());
            System.out.println("tipo: " + dto.getTipo());
            System.out.println("permissoes: " + dto.getPermissoes());
            System.out.println("pessoa objeto: " + dto.getPessoa());

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

            // Adicionar logs para debug
            System.out.println("=== DADOS RECEBIDOS PARA ATUALIZAÇÃO ===");
            System.out.println("DTO completo: " + dto);
            System.out.println("DTO.getPessoa(): " + dto.getPessoa());
            if (dto.getPessoa() != null) {
                System.out.println("Nome da pessoa: " + dto.getPessoa().getNmPessoa());
                System.out.println("Email da pessoa: " + dto.getPessoa().getEmail());
                System.out.println("CPF da pessoa: " + dto.getPessoa().getCpfPessoa());
                System.out.println("Telefone da pessoa: " + dto.getPessoa().getTelefone());
            }

            // Atualizar dados da pessoa - verificar se vem do objeto pessoa ou direto no
            // DTO
            String nomeParaAtualizar = null;
            String emailParaAtualizar = null;
            String telefoneParaAtualizar = null;
            String cpfParaAtualizar = null;

            if (dto.getPessoa() != null) {
                // Formato antigo com objeto pessoa
                nomeParaAtualizar = dto.getPessoa().getNmPessoa();
                emailParaAtualizar = dto.getPessoa().getEmail();
                telefoneParaAtualizar = dto.getPessoa().getTelefone();
                cpfParaAtualizar = dto.getPessoa().getCpfPessoa();
            } else {
                // Formato novo com campos diretos no DTO
                nomeParaAtualizar = dto.getNmPessoa();
                emailParaAtualizar = dto.getEmail();
                telefoneParaAtualizar = dto.getTelefone();
                cpfParaAtualizar = dto.getCpfPessoa();
            }

            if (nomeParaAtualizar != null && !nomeParaAtualizar.trim().isEmpty()) {
                pessoa.setNmPessoa(nomeParaAtualizar);
            }
            if (emailParaAtualizar != null && !emailParaAtualizar.trim().isEmpty()) {
                pessoa.setEmail(emailParaAtualizar);
            }
            if (telefoneParaAtualizar != null && !telefoneParaAtualizar.trim().isEmpty()) {
                pessoa.setTelefone(telefoneParaAtualizar);
            }
            if (cpfParaAtualizar != null && !cpfParaAtualizar.isEmpty()) {
                pessoa.setCpfPessoa(cpfParaAtualizar);
            }

            // Atualizar data de nascimento se fornecida (converter string para
            // java.sql.Date)
            String dataNascString = dto.getDtNascPessoa();
            if (dataNascString != null && !dataNascString.trim().isEmpty()) {
                try {
                    LocalDate localDate = LocalDate.parse(dataNascString);
                    pessoa.setDtNascPessoa(java.sql.Date.valueOf(localDate));
                } catch (Exception e) {
                    System.err.println(
                            "Erro ao converter data de nascimento: " + dataNascString + " - " + e.getMessage());
                }
            }

            // Atualizar status ativo se fornecido
            if (dto.getAtivo() != null) {
                pessoa.setAtivo(dto.getAtivo());
                System.out.println("Status ativo atualizado para: " + dto.getAtivo());
            }

            System.out.println("=== PESSOA APÓS ATUALIZAÇÃO ===");
            System.out.println("Nome: " + pessoa.getNmPessoa());
            System.out.println("Email: " + pessoa.getEmail());

            pessoa = pessoaRepo.save(pessoa);

            // ATUALIZAR ESPECIFICAMENTE A TABELA tbFuncionario
            System.out.println("=== ATUALIZAÇÃO TABELA tbFuncionario ===");
            System.out.println("Pessoa ID: " + pessoa.getIdPessoa());
            System.out.println("DTO dataInicio: " + dto.getDataInicio());

            // Buscar o registro na tabela tbFuncionario pela pessoa
            Optional<Funcionario> funcionarioOpt = funcionarioRepo.findByTbPessoaIdPessoa(pessoa.getIdPessoa());

            if (funcionarioOpt.isPresent()) {
                Funcionario funcionario = funcionarioOpt.get();
                System.out.println("Funcionário ID: " + funcionario.getIdFuncionario());
                System.out.println("Data ANTES: " + funcionario.getDataInicio());

                // Se foi enviada uma nova data no DTO, usar ela
                if (dto.getDataInicio() != null && !dto.getDataInicio().trim().isEmpty()) {
                    LocalDate novaData = dto.getDataInicioAsLocalDate();
                    System.out.println("Nova data convertida: " + novaData);

                    if (novaData != null) {
                        funcionario.setDataInicio(novaData);
                        System.out.println("Data setada no objeto: " + funcionario.getDataInicio());

                        // Salvar especificamente na tabela tbFuncionario
                        Funcionario funcionarioSalvo = funcionarioRepo.save(funcionario);
                        System.out.println("Data DEPOIS do save: " + funcionarioSalvo.getDataInicio());

                        // Flush para garantir que foi para o banco
                        funcionarioRepo.flush();
                        System.out.println("Flush executado");

                        // Verificação final - buscar novamente
                        Optional<Funcionario> verificacao = funcionarioRepo
                                .findByTbPessoaIdPessoa(pessoa.getIdPessoa());
                        if (verificacao.isPresent()) {
                            System.out
                                    .println("VERIFICAÇÃO FINAL - Data no banco: " + verificacao.get().getDataInicio());
                        }
                    } else {
                        System.out.println("ERRO: Conversão da data resultou em null");
                    }
                } else {
                    System.out.println("AVISO: Nenhuma data fornecida no DTO");
                }
            } else {
                System.out.println("ERRO CRÍTICO: Registro não encontrado na tbFuncionario para pessoa ID "
                        + pessoa.getIdPessoa());
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
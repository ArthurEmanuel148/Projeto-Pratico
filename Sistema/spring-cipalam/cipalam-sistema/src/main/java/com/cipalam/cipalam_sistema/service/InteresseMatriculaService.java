package com.cipalam.cipalam_sistema.service;

import com.cipalam.cipalam_sistema.model.InteresseMatricula;
import com.cipalam.cipalam_sistema.model.Login;
import com.cipalam.cipalam_sistema.model.Pessoa;
import com.cipalam.cipalam_sistema.repository.InteresseMatriculaRepository;
import com.cipalam.cipalam_sistema.repository.LoginRepository;
import com.cipalam.cipalam_sistema.repository.PessoaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class InteresseMatriculaService {

    @Autowired
    private InteresseMatriculaRepository interesseMatriculaRepository;

    @Autowired
    private PessoaRepository pessoaRepository;

    @Autowired
    private LoginRepository loginRepository;

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

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

        // Atualizar campos do responsável
        interesse.setNomeResponsavel(interesseAtualizado.getNomeResponsavel());
        interesse.setCpfResponsavel(interesseAtualizado.getCpfResponsavel());
        interesse.setDataNascimentoResponsavel(interesseAtualizado.getDataNascimentoResponsavel());
        interesse.setTelefoneResponsavel(interesseAtualizado.getTelefoneResponsavel());
        interesse.setEmailResponsavel(interesseAtualizado.getEmailResponsavel());

        // Atualizar campos do aluno
        interesse.setNomeAluno(interesseAtualizado.getNomeAluno());
        interesse.setDataNascimentoAluno(interesseAtualizado.getDataNascimentoAluno());
        interesse.setCpfAluno(interesseAtualizado.getCpfAluno());

        // Atualizar outros campos
        interesse.setTipoCota(interesseAtualizado.getTipoCota());
        interesse.setRendaFamiliar(interesseAtualizado.getRendaFamiliar());
        interesse.setRendaPerCapita(interesseAtualizado.getRendaPerCapita());
        interesse.setNumeroIntegrantes(interesseAtualizado.getNumeroIntegrantes());
        interesse.setEnderecoCompleto(interesseAtualizado.getEnderecoCompleto());
        interesse.setIntegrantesRenda(interesseAtualizado.getIntegrantesRenda());
        interesse.setHorariosSelecionados(interesseAtualizado.getHorariosSelecionados());
        interesse.setMensagemAdicional(interesseAtualizado.getMensagemAdicional());
        interesse.setObservacoes(interesseAtualizado.getObservacoes());

        return interesseMatriculaRepository.save(interesse);
    }

    public Map<String, Object> iniciarMatricula(Integer interesseId, Integer funcionarioId) {
        InteresseMatricula interesse = interesseMatriculaRepository.findById(interesseId)
                .orElseThrow(() -> new RuntimeException("Interesse de matrícula não encontrado"));

        Pessoa funcionario = pessoaRepository.findById(funcionarioId)
                .orElseThrow(() -> new RuntimeException("Funcionário não encontrado"));

        // Criar pessoa para o responsável se não existir
        Pessoa responsavel = pessoaRepository.findByCpfPessoa(interesse.getCpfResponsavel())
                .orElseGet(() -> {
                    Pessoa novoResponsavel = new Pessoa();
                    novoResponsavel.setNmPessoa(interesse.getNomeResponsavel());
                    novoResponsavel.setCpfPessoa(interesse.getCpfResponsavel());
                    novoResponsavel.setDtNascPessoa(java.sql.Date.valueOf(interesse.getDataNascimentoResponsavel()));
                    return pessoaRepository.save(novoResponsavel);
                });

        // Atualizar interesse (sem criar login aqui - login será criado apenas no
        // MatriculaController)
        interesse.setStatus(InteresseMatricula.StatusInteresse.matricula_iniciada);
        interesse.setDataInicioMatricula(LocalDateTime.now());
        interesse.setFuncionarioResponsavel(funcionario);
        interesse.setResponsavelLogin(responsavel);
        interesseMatriculaRepository.save(interesse);

        Map<String, Object> resultado = new HashMap<>();
        resultado.put("success", true);
        resultado.put("message", "Matrícula iniciada com sucesso!");
        resultado.put("interesse", interesse);

        return resultado;
    }

    public List<InteresseMatricula> buscarPorResponsavel(Integer responsavelId) {
        return interesseMatriculaRepository.findByResponsavelLogin_IdPessoa(responsavelId);
    }

    public Map<String, Object> verificarResponsavelExiste(String cpf) {
        Map<String, Object> resultado = new HashMap<>();

        // Primeiro, buscar na tabela Pessoa se existe alguém com esse CPF
        Optional<Pessoa> pessoaExistente = pessoaRepository.findByCpfPessoa(cpf);

        if (pessoaExistente.isPresent()) {
            Pessoa pessoa = pessoaExistente.get();

            // Verificar se essa pessoa é um responsável (tem entrada na tbResponsavel)
            // Para isso, vamos verificar se existe alguma declaração de interesse com esse
            // CPF
            List<InteresseMatricula> interessesAnteriores = interesseMatriculaRepository.findByCpfResponsavel(cpf);

            Map<String, Object> dadosResponsavel = new HashMap<>();
            dadosResponsavel.put("nome", pessoa.getNmPessoa());
            dadosResponsavel.put("cpf", pessoa.getCpfPessoa());
            dadosResponsavel.put("dataNascimento", pessoa.getDtNascPessoa().toString());
            dadosResponsavel.put("email", pessoa.getEmail());
            dadosResponsavel.put("telefone", pessoa.getTelefone());

            // Se há declarações anteriores, usar os dados mais recentes
            if (!interessesAnteriores.isEmpty()) {
                InteresseMatricula interesseRecente = interessesAnteriores.get(interessesAnteriores.size() - 1);

                // Atualizar com dados mais recentes se disponíveis
                if (interesseRecente.getEmailResponsavel() != null) {
                    dadosResponsavel.put("email", interesseRecente.getEmailResponsavel());
                }
                if (interesseRecente.getTelefoneResponsavel() != null) {
                    dadosResponsavel.put("telefone", interesseRecente.getTelefoneResponsavel());
                }

                // Se houver dados de endereço na última declaração, incluir
                if (interesseRecente.getCep() != null && !interesseRecente.getCep().isEmpty()) {
                    Map<String, String> endereco = new HashMap<>();
                    endereco.put("cep", interesseRecente.getCep());
                    endereco.put("logradouro", interesseRecente.getLogradouro());
                    endereco.put("numero", interesseRecente.getNumero());
                    endereco.put("complemento", interesseRecente.getComplemento());
                    endereco.put("bairro", interesseRecente.getBairro());
                    endereco.put("cidade", interesseRecente.getCidade());
                    endereco.put("estado", interesseRecente.getUf());
                    dadosResponsavel.put("endereco", endereco);
                }
            }

            resultado.put("existe", true);
            resultado.put("dadosResponsavel", dadosResponsavel);
            resultado.put("jaEraResponsavel", !interessesAnteriores.isEmpty());
            resultado.put("interessesAnteriores", interessesAnteriores.size());
        } else {
            // Pessoa não existe no sistema
            resultado.put("existe", false);
            resultado.put("dadosResponsavel", null);
        }

        return resultado;
    }

    public Map<String, Object> autenticarResponsavel(String cpf, String senha) {
        Map<String, Object> resultado = new HashMap<>();

        // Primeiro, verificar se o responsável existe
        Optional<Pessoa> pessoaExistente = pessoaRepository.findByCpfPessoa(cpf);

        if (pessoaExistente.isPresent()) {
            Pessoa pessoa = pessoaExistente.get();

            // Buscar o login do responsável no banco de dados
            Optional<Login> loginExistente = loginRepository.findByPessoa(pessoa);

            if (loginExistente.isPresent()) {
                Login login = loginExistente.get();

                // Verificar se a senha informada confere com a senha hasheada do banco
                if (passwordEncoder.matches(senha, login.getSenha())) {
                    Map<String, Object> dadosResponsavel = new HashMap<>();
                    dadosResponsavel.put("nome", pessoa.getNmPessoa());
                    dadosResponsavel.put("cpf", pessoa.getCpfPessoa());
                    dadosResponsavel.put("dataNascimento", pessoa.getDtNascPessoa().toString());
                    dadosResponsavel.put("email", pessoa.getEmail());
                    dadosResponsavel.put("telefone", pessoa.getTelefone());

                    // Buscar dados mais recentes das declarações anteriores
                    List<InteresseMatricula> interessesAnteriores = interesseMatriculaRepository
                            .findByCpfResponsavel(cpf);
                    if (!interessesAnteriores.isEmpty()) {
                        InteresseMatricula interesseRecente = interessesAnteriores.get(interessesAnteriores.size() - 1);

                        // Atualizar com dados mais recentes se disponíveis
                        if (interesseRecente.getEmailResponsavel() != null) {
                            dadosResponsavel.put("email", interesseRecente.getEmailResponsavel());
                        }
                        if (interesseRecente.getTelefoneResponsavel() != null) {
                            dadosResponsavel.put("telefone", interesseRecente.getTelefoneResponsavel());
                        }
                    }

                    resultado.put("autenticado", true);
                    resultado.put("dadosResponsavel", dadosResponsavel);
                    resultado.put("message", "Autenticação realizada com sucesso");
                } else {
                    resultado.put("autenticado", false);
                    resultado.put("dadosResponsavel", null);
                    resultado.put("message", "Senha incorreta");
                }
            } else {
                resultado.put("autenticado", false);
                resultado.put("dadosResponsavel", null);
                resultado.put("message", "Login não encontrado para este responsável");
            }
        } else {
            resultado.put("autenticado", false);
            resultado.put("dadosResponsavel", null);
            resultado.put("message", "Responsável não encontrado");
        }

        return resultado;
    }
}

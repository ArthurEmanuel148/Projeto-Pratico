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

import jakarta.persistence.EntityManager;
import jakarta.persistence.Query;
import jakarta.persistence.StoredProcedureQuery;
import jakarta.persistence.ParameterMode;

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

    @Autowired
    private EntityManager entityManager;

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public InteresseMatricula criarInteresse(InteresseMatricula interesse) {
        return interesseMatriculaRepository.save(interesse);
    }

    public List<InteresseMatricula> listarTodos() {
        // Filtra apenas declarações que não estão matriculadas
        return interesseMatriculaRepository.findAll().stream()
                .filter(interesse -> interesse.getStatus() != InteresseMatricula.StatusInteresse.matriculado)
                .collect(java.util.stream.Collectors.toList());
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
        interesse.setNumeroIntegrantes(interesseAtualizado.getNumeroIntegrantes());
        interesse.setIntegrantesRenda(interesseAtualizado.getIntegrantesRenda());
        interesse.setHorariosSelecionados(interesseAtualizado.getHorariosSelecionados());
        interesse.setObservacoesResponsavel(interesseAtualizado.getObservacoesResponsavel());

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
                    novoResponsavel.setEmail(interesse.getEmailResponsavel());
                    novoResponsavel.setTelefone(interesse.getTelefoneResponsavel());
                    novoResponsavel.setRenda(interesse.getRendaResponsavel());
                    novoResponsavel.setProfissao(interesse.getProfissaoResponsavel());
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

                // Verificar se a senha está em texto claro (não começa com $2a$, $2b$ ou $2y$)
                boolean senhaEmTextoClaro = !login.getSenha().startsWith("$2") && login.getSenha().length() <= 10;

                boolean senhaCorreta = false;

                if (senhaEmTextoClaro) {
                    // Comparar diretamente e depois criptografar
                    if (senha.equals(login.getSenha())) {
                        senhaCorreta = true;
                        // Criptografar a senha e salvar
                        String senhaCriptografada = passwordEncoder.encode(senha);
                        login.setSenha(senhaCriptografada);
                        loginRepository.save(login);
                    }
                } else {
                    // Verificar usando BCrypt
                    senhaCorreta = passwordEncoder.matches(senha, login.getSenha());
                }

                if (senhaCorreta) {
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

    /**
     * Métodos para configuração de documentos por cota
     */
    public Map<String, Object> getConfiguracaoDocumentos() {
        Map<String, Object> configuracao = new HashMap<>();

        // Configuração padrão simulada
        configuracao.put("funcionario", List.of("rg", "cpf", "comprovanteVinculo"));
        configuracao.put("economica",
                List.of("rg", "cpf", "comprovanteRenda", "comprovanteEndereco", "declaracaoComposicaoFamiliar"));
        configuracao.put("livre", List.of("rg", "cpf", "comprovanteEndereco"));

        return configuracao;
    }

    public Map<String, Object> salvarConfiguracaoDocumentos(Map<String, Object> configuracao) {
        // Por enquanto, apenas simular o salvamento
        // Em uma implementação real, isso salvaria na tabela
        // tbConfiguracaoDocumentosCota

        Map<String, Object> resultado = new HashMap<>();
        resultado.put("success", true);
        resultado.put("message", "Configuração salva com sucesso");
        resultado.put("configuracao", configuracao);

        return resultado;
    }

    /**
     * Lista declarações prontas para matrícula usando a tabela real
     * tbInteresseMatricula
     */
    public List<Map<String, Object>> listarDeclaracoesParaMatricula() {
        String sql = """
                    SELECT
                        id,
                        protocolo,
                        nomeAluno,
                        nomeResponsavel,
                        CASE
                            WHEN tipoCota = 'livre' THEN 'Cota Livre'
                            WHEN tipoCota = 'economica' THEN 'Cota Econômica'
                            WHEN tipoCota = 'funcionario' THEN 'Cota Funcionário'
                            ELSE tipoCota
                        END as tipoCotaDescricao,
                        dataEnvio,
                        DATEDIFF(CURDATE(), DATE(dataEnvio)) as diasAguardando
                    FROM tbInteresseMatricula
                    WHERE status = 'interesse_declarado'
                    ORDER BY dataEnvio ASC
                """;

        Query query = entityManager.createNativeQuery(sql);
        @SuppressWarnings("unchecked")
        List<Object[]> results = query.getResultList();
        return results.stream().map(row -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", row[0]);
            map.put("protocolo", row[1]);
            map.put("nomeAluno", row[2]);
            map.put("nomeResponsavel", row[3]);
            map.put("tipoCotaDescricao", row[4]);
            map.put("dataEnvio", row[5]);
            map.put("diasAguardando", row[6]);
            return map;
        }).toList();
    }

    /**
     * Inicia matrícula completa usando as procedures do banco de dados
     * Chama sp_IniciarMatricula que automatiza todo o processo
     */
    public Map<String, Object> iniciarMatriculaCompleta(Integer declaracaoId, Integer turmaId, Integer funcionarioId) {
        try {
            // Primeiro validar
            Map<String, Object> validacao = validarIniciarMatricula(declaracaoId, turmaId);
            if (!(Boolean) validacao.get("valido")) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("message", validacao.get("mensagem"));
                return errorResponse;
            }

            // Executar a procedure sp_IniciarMatricula usando JPA
            StoredProcedureQuery storedProcedure = entityManager.createStoredProcedureQuery("sp_IniciarMatricula");
            storedProcedure.registerStoredProcedureParameter(1, Integer.class, ParameterMode.IN);
            storedProcedure.registerStoredProcedureParameter(2, Integer.class, ParameterMode.IN);
            storedProcedure.registerStoredProcedureParameter(3, Integer.class, ParameterMode.IN);

            storedProcedure.setParameter(1, declaracaoId);
            storedProcedure.setParameter(2, turmaId);
            storedProcedure.setParameter(3, funcionarioId);

            boolean hasResult = storedProcedure.execute();
            Map<String, Object> dadosMatricula = new HashMap<>();

            if (hasResult) {
                @SuppressWarnings("unchecked")
                List<Object[]> results = storedProcedure.getResultList();
                if (!results.isEmpty()) {
                    Object[] row = results.get(0);
                    dadosMatricula.put("idFamilia", row[0]);
                    dadosMatricula.put("idResponsavel", row[1]);
                    dadosMatricula.put("idAluno", row[2]);
                    dadosMatricula.put("matricula", row[3]);
                    dadosMatricula.put("loginResponsavel", row[4]);
                    dadosMatricula.put("senhaTemporaria", row[5]);
                    dadosMatricula.put("protocoloDeclaracao", row[6]);
                    dadosMatricula.put("nomeAluno", row[7]);
                    dadosMatricula.put("nomeResponsavel", row[8]);

                    // Criar login após a stored procedure se não existir
                    Integer idResponsavel = (Integer) dadosMatricula.get("idResponsavel");
                    String loginUsuario = (String) dadosMatricula.get("loginResponsavel");
                    String senhaTemporaria = (String) dadosMatricula.get("senhaTemporaria");

                    if (idResponsavel != null && loginUsuario != null && senhaTemporaria != null
                            && !senhaTemporaria.equals("Login já existente")) {

                        // Verificar se login não existe
                        Optional<Login> loginExistente = loginRepository.findByUsuario(loginUsuario);
                        if (loginExistente.isEmpty()) {
                            // Criar login com senha criptografada corretamente
                            Login novoLogin = new Login();
                            novoLogin.setUsuario(loginUsuario);
                            novoLogin.setSenha(passwordEncoder.encode(senhaTemporaria));

                            // Buscar pessoa
                            Optional<Pessoa> pessoa = pessoaRepository.findById(idResponsavel);
                            if (pessoa.isPresent()) {
                                novoLogin.setPessoa(pessoa.get());
                                loginRepository.save(novoLogin);

                                System.out.println("✅ Login criado com sucesso:");
                                System.out.println("   Usuário: " + loginUsuario);
                                System.out.println("   Senha temporária: " + senhaTemporaria);
                            }
                        }
                    }
                }
            }

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Matrícula iniciada com sucesso!");
            response.put("dadosMatricula", dadosMatricula);

            return response;

        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Erro ao processar matrícula: " + e.getMessage());
            return errorResponse;
        }
    }

    /**
     * Valida se uma declaração pode ser matriculada em uma turma usando a function
     * do banco
     */
    public Map<String, Object> validarIniciarMatricula(Integer declaracaoId, Integer turmaId) {
        String sql = "SELECT fn_ValidarIniciarMatricula(:declaracaoId, :turmaId) as resultado";

        Query query = entityManager.createNativeQuery(sql);
        query.setParameter("declaracaoId", declaracaoId);
        query.setParameter("turmaId", turmaId);

        String resultado = (String) query.getSingleResult();

        Map<String, Object> response = new HashMap<>();
        response.put("valido", "OK".equals(resultado));
        response.put("mensagem", resultado);

        return response;
    }

    /**
     * Busca dados da matrícula recém-criada para retorno
     */
    private Map<String, Object> obterDadosMatriculaCriada(Integer declaracaoId) {
        String sql = """
                    SELECT
                        a.tbFamilia_idtbFamilia as idFamilia,
                        a.tbPessoa_idPessoa as idAluno,
                        p_resp.idPessoa as idResponsavel,
                        a.matricula,
                        l.usuario as loginResponsavel,
                        CONCAT('Últimos 4 dígitos do CPF: ', RIGHT(REPLACE(p_resp.cpfPessoa, '.', ''), 4)) as senhaTemporaria,
                        a.protocoloDeclaracao,
                        p_aluno.nmPessoa as nomeAluno,
                        p_resp.nmPessoa as nomeResponsavel
                    FROM tbAluno a
                    INNER JOIN tbPessoa p_aluno ON a.tbPessoa_idPessoa = p_aluno.idPessoa
                    INNER JOIN tbFamilia f ON a.tbFamilia_idtbFamilia = f.idtbFamilia
                    INNER JOIN tbResponsavel r ON f.idtbFamilia = r.tbFamilia_idtbFamilia
                    INNER JOIN tbPessoa p_resp ON r.tbPessoa_idPessoa = p_resp.idPessoa
                    INNER JOIN tblogin l ON p_resp.idPessoa = l.tbPessoa_idPessoa
                    WHERE a.protocoloDeclaracao = (
                        SELECT protocolo FROM tbInteresseMatricula WHERE id = :declaracaoId
                    )
                    ORDER BY a.tbPessoa_idPessoa DESC
                    LIMIT 1
                """;

        Query query = entityManager.createNativeQuery(sql);
        query.setParameter("declaracaoId", declaracaoId);

        @SuppressWarnings("unchecked")
        List<Object[]> results = query.getResultList();
        if (results.isEmpty()) {
            return new HashMap<>();
        }

        Object[] row = results.get(0);
        Map<String, Object> map = new HashMap<>();
        map.put("idFamilia", row[0]);
        map.put("idAluno", row[1]);
        map.put("idResponsavel", row[2]);
        map.put("matricula", row[3]);
        map.put("loginResponsavel", row[4]);
        map.put("senhaTemporaria", row[5]);
        map.put("protocoloDeclaracao", row[6]);
        map.put("nomeAluno", row[7]);
        map.put("nomeResponsavel", row[8]);

        return map;
    }

    /**
     * Processa matrícula usando a procedure existente
     */
    public boolean processarMatricula(Integer idDeclaracao, Integer idTurma) {
        try {
            StoredProcedureQuery procedureQuery = entityManager
                    .createStoredProcedureQuery("sp_IniciarMatricula")
                    .registerStoredProcedureParameter("p_idDeclaracao", Integer.class, ParameterMode.IN)
                    .registerStoredProcedureParameter("p_idTurma", Integer.class, ParameterMode.IN)
                    .registerStoredProcedureParameter("p_idFuncionario", Integer.class, ParameterMode.IN)
                    .setParameter("p_idDeclaracao", idDeclaracao)
                    .setParameter("p_idTurma", idTurma)
                    .setParameter("p_idFuncionario", 1); // ID do funcionário logado (ajustar conforme necessário)

            procedureQuery.execute();
            return true;
        } catch (Exception e) {
            throw new RuntimeException("Erro ao processar matrícula: " + e.getMessage());
        }
    }

    /**
     * Atualiza status da declaração de interesse
     */
    public void atualizarStatus(Integer idDeclaracao, String novoStatus) {
        try {
            Optional<InteresseMatricula> interesse = interesseMatriculaRepository.findById(idDeclaracao);
            if (interesse.isPresent()) {
                InteresseMatricula declaracao = interesse.get();
                // Converter string para enum
                InteresseMatricula.StatusInteresse statusEnum = InteresseMatricula.StatusInteresse.valueOf(novoStatus);
                declaracao.setStatus(statusEnum);
                interesseMatriculaRepository.save(declaracao);
            } else {
                throw new RuntimeException("Declaração não encontrada com ID: " + idDeclaracao);
            }
        } catch (Exception e) {
            throw new RuntimeException("Erro ao atualizar status da declaração: " + e.getMessage());
        }
    }

    /**
     * Finaliza a matrícula marcando status como 'matriculado'
     * Usa a procedure sp_FinalizarMatricula do banco de dados
     */
    public Map<String, Object> finalizarMatricula(Integer declaracaoId, Integer funcionarioId) {
        try {
            StoredProcedureQuery query = entityManager
                    .createStoredProcedureQuery("sp_FinalizarMatricula")
                    .registerStoredProcedureParameter("p_idDeclaracao", Integer.class, ParameterMode.IN)
                    .registerStoredProcedureParameter("p_idFuncionario", Integer.class, ParameterMode.IN);

            query.setParameter("p_idDeclaracao", declaracaoId);
            query.setParameter("p_idFuncionario", funcionarioId);

            // Executar a procedure
            query.execute();

            // Obter resultado
            @SuppressWarnings("unchecked")
            List<Object[]> results = query.getResultList();

            Map<String, Object> response = new HashMap<>();
            if (!results.isEmpty()) {
                Object[] row = results.get(0);
                response.put("success", true);
                response.put("resultado", row[0]); // SUCCESS
                response.put("message", row[1]); // mensagem
                response.put("matricula", row[2]); // matriculaAluno
                response.put("nomeAluno", row[3]); // nomeAluno
            } else {
                response.put("success", true);
                response.put("message", "Matrícula finalizada com sucesso");
            }

            return response;

        } catch (Exception e) {
            throw new RuntimeException("Erro ao finalizar matrícula: " + e.getMessage());
        }
    }

    /**
     * Buscar documentos solicitados para uma matrícula específica
     */
    @SuppressWarnings("unchecked")
    public List<Map<String, Object>> buscarDocumentosSolicitados(Integer interesseId) {
        try {
            String sql = "SELECT dm.idDocumentoMatricula, " +
                    "       td.nome as tipoDocumento, " +
                    "       CASE " +
                    "           WHEN dm.observacoes LIKE '%Documento da família%' THEN 'Família' " +
                    "           WHEN dm.observacoes LIKE '%Documento do aluno%' THEN 'Aluno' " +
                    "           WHEN dm.observacoes REGEXP 'Documento de .+ \\(.+\\)' THEN " +
                    "               SUBSTRING_INDEX(SUBSTRING_INDEX(dm.observacoes, 'Documento de ', -1), ' (', 1) " +
                    "           ELSE 'Não especificado' " +
                    "       END as nomeIntegrante, " +
                    "       CASE " +
                    "           WHEN dm.observacoes LIKE '%Documento da família%' THEN 'Geral' " +
                    "           WHEN dm.observacoes LIKE '%Documento do aluno%' THEN 'Aluno' " +
                    "           WHEN dm.observacoes REGEXP '\\(.+\\)' THEN " +
                    "               SUBSTRING_INDEX(SUBSTRING_INDEX(dm.observacoes, '(', -1), ')', 1) " +
                    "           ELSE 'Não especificado' " +
                    "       END as parentesco, " +
                    "       dm.status, " +
                    "       dm.observacoes " +
                    "FROM tbDocumentoMatricula dm " +
                    "INNER JOIN tbTipoDocumento td ON dm.tbTipoDocumento_idTipoDocumento = td.idTipoDocumento " +
                    "WHERE dm.tbInteresseMatricula_id = :interesseId " +
                    "ORDER BY " +
                    "   CASE " +
                    "       WHEN dm.observacoes LIKE '%Documento da família%' THEN 1 " +
                    "       WHEN dm.observacoes LIKE '%Documento do aluno%' THEN 2 " +
                    "       ELSE 3 " +
                    "   END, " +
                    "   td.nome";

            Query query = entityManager.createNativeQuery(sql);
            query.setParameter("interesseId", interesseId);

            List<Object[]> results = query.getResultList();

            return results.stream()
                    .map(row -> {
                        Map<String, Object> documento = new HashMap<>();
                        documento.put("id", row[0]);
                        documento.put("tipoDocumento", row[1]);
                        documento.put("nomeIntegrante", row[2]);
                        documento.put("parentesco", row[3]);
                        documento.put("status", row[4] != null ? row[4] : "pendente");
                        documento.put("observacoes", row[5]);
                        return documento;
                    })
                    .collect(java.util.stream.Collectors.toList());

        } catch (Exception e) {
            throw new RuntimeException("Erro ao buscar documentos solicitados: " + e.getMessage());
        }
    }
}

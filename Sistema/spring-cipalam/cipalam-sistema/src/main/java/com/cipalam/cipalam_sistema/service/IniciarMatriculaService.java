package com.cipalam.cipalam_sistema.service;

import com.cipalam.cipalam_sistema.DTO.IniciarMatriculaResponse;
import com.cipalam.cipalam_sistema.repository.InteresseMatriculaRepository;
import com.cipalam.cipalam_sistema.repository.TurmaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.EntityManager;
import jakarta.persistence.Query;
import jakarta.persistence.StoredProcedureQuery;
import jakarta.persistence.ParameterMode;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class IniciarMatriculaService {

    @Autowired
    private EntityManager entityManager;

    @Autowired
    private InteresseMatriculaRepository interesseMatriculaRepository;

    @Autowired
    private TurmaRepository turmaRepository;

    /**
     * Lista declarações prontas para matrícula usando a view do banco
     */
    public List<Map<String, Object>> listarDeclaracoesParaMatricula() {
        String sql = """
                    SELECT
                        id,
                        protocolo,
                        nomeAluno,
                        nomeResponsavel,
                        tipoCotaDescricao,
                        dataEnvio,
                        status,
                        diasAguardando
                    FROM vw_declaracoes_para_matricula
                    ORDER BY diasAguardando DESC
                """;

        Query query = entityManager.createNativeQuery(sql);
        List<Object[]> results = query.getResultList();

        return results.stream().map(row -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", row[0]);
            map.put("protocolo", row[1]);
            map.put("nomeAluno", row[2]);
            map.put("nomeResponsavel", row[3]);
            map.put("tipoCotaDescricao", row[4]);
            map.put("dataEnvio", row[5]);
            map.put("status", row[6]);
            map.put("diasAguardando", row[7]);
            return map;
        }).toList();
    }

    /**
     * Detalha uma declaração específica usando a view do banco
     */
    public Map<String, Object> detalharDeclaracao(Integer id) {
        String sql = """
                    SELECT
                        id,
                        protocolo,
                        nomeAluno,
                        dataNascimentoAluno,
                        nomeResponsavel,
                        cpfResponsavel,
                        emailResponsavel,
                        telefoneResponsavel,
                        rendaResponsavel,
                        profissaoResponsavel,
                        enderecoResponsavel,
                        tipoCotaDescricao,
                        integrantesFamilia,
                        observacoes,
                        dataEnvio,
                        status,
                        diasAguardando
                    FROM vw_detalhamento_declaracao
                    WHERE id = :id
                """;

        Query query = entityManager.createNativeQuery(sql);
        query.setParameter("id", id);

        List<Object[]> results = query.getResultList();
        if (results.isEmpty()) {
            return null;
        }

        Object[] row = results.get(0);
        Map<String, Object> map = new HashMap<>();
        map.put("id", row[0]);
        map.put("protocolo", row[1]);
        map.put("nomeAluno", row[2]);
        map.put("dataNascimentoAluno", row[3]);
        map.put("nomeResponsavel", row[4]);
        map.put("cpfResponsavel", row[5]);
        map.put("emailResponsavel", row[6]);
        map.put("telefoneResponsavel", row[7]);
        map.put("rendaResponsavel", row[8]);
        map.put("profissaoResponsavel", row[9]);
        map.put("enderecoResponsavel", row[10]);
        map.put("tipoCotaDescricao", row[11]);
        map.put("integrantesFamilia", row[12]);
        map.put("observacoes", row[13]);
        map.put("dataEnvio", row[14]);
        map.put("status", row[15]);
        map.put("diasAguardando", row[16]);

        return map;
    }

    /**
     * Lista turmas disponíveis para seleção usando a view do banco
     */
    public List<Map<String, Object>> listarTurmasDisponiveis() {
        String sql = """
                    SELECT
                        id,
                        nome,
                        turno,
                        descricaoCompleta,
                        vagasDisponiveis,
                        temVagas,
                        capacidadeMaxima
                    FROM vw_turmas_para_selecao
                    WHERE temVagas = TRUE
                    ORDER BY nome, turno
                """;

        Query query = entityManager.createNativeQuery(sql);
        List<Object[]> results = query.getResultList();

        return results.stream().map(row -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", row[0]);
            map.put("nome", row[1]);
            map.put("turno", row[2]);
            map.put("descricaoCompleta", row[3]);
            map.put("vagasDisponiveis", row[4]);
            map.put("temVagas", row[5]);
            map.put("capacidadeMaxima", row[6]);
            return map;
        }).toList();
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
     * Método principal - Inicia matrícula usando a procedure do banco
     * Chama sp_IniciarMatricula que automatiza todo o processo
     */
    @Transactional
    public IniciarMatriculaResponse iniciarMatricula(Long declaracaoId, Long turmaId, Long funcionarioId) {
        try {
            // Primeiro validar
            Map<String, Object> validacao = validarIniciarMatricula(declaracaoId.intValue(), turmaId.intValue());
            if (!(Boolean) validacao.get("valido")) {
                return new IniciarMatriculaResponse((String) validacao.get("mensagem"));
            }

            // Executar a procedure sp_IniciarMatricula usando JPA
            StoredProcedureQuery storedProcedure = entityManager.createStoredProcedureQuery("sp_IniciarMatricula");
            storedProcedure.registerStoredProcedureParameter(1, Integer.class, ParameterMode.IN);
            storedProcedure.registerStoredProcedureParameter(2, Integer.class, ParameterMode.IN);
            storedProcedure.registerStoredProcedureParameter(3, Integer.class, ParameterMode.IN);

            storedProcedure.setParameter(1, declaracaoId.intValue());
            storedProcedure.setParameter(2, turmaId.intValue());
            storedProcedure.setParameter(3, funcionarioId.intValue());

            storedProcedure.execute();

            // Buscar os dados da matrícula criada para retornar
            Map<String, Object> dadosMatricula = obterDadosMatriculaCriada(declaracaoId.intValue());

            return new IniciarMatriculaResponse(
                    (Long) dadosMatricula.get("idFamilia"),
                    (Long) dadosMatricula.get("idResponsavel"),
                    (Long) dadosMatricula.get("idAluno"),
                    (String) dadosMatricula.get("matricula"),
                    (String) dadosMatricula.get("loginResponsavel"),
                    (String) dadosMatricula.get("senhaTemporaria"));

        } catch (Exception e) {
            return new IniciarMatriculaResponse("Erro ao iniciar matrícula: " + e.getMessage());
        }
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
                        CONCAT('Últimos 4 dígitos do CPF: ', RIGHT(REPLACE(p_resp.cpfPessoa, '.', ''), 4)) as senhaTemporaria
                    FROM tbAluno a
                    INNER JOIN tbPessoa p_aluno ON a.tbPessoa_idPessoa = p_aluno.idPessoa
                    INNER JOIN tbFamilia f ON a.tbFamilia_idtbFamilia = f.idtbFamilia
                    INNER JOIN tbPessoa p_resp ON f.tbResponsavel_tbPessoa_idPessoa = p_resp.idPessoa
                    INNER JOIN tblogin l ON p_resp.idPessoa = l.pessoa_idPessoa
                    WHERE a.protocoloDeclaracao = (
                        SELECT protocolo FROM tbInteresseMatricula WHERE id = :declaracaoId
                    )
                    ORDER BY a.id DESC
                    LIMIT 1
                """;

        Query query = entityManager.createNativeQuery(sql);
        query.setParameter("declaracaoId", declaracaoId);

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

        return map;
    }

    /**
     * Obtém informações para seleção de turma usando a procedure do banco
     */
    public Map<String, Object> obterInfoSelecaoTurma(Integer declaracaoId) {
        try {
            StoredProcedureQuery storedProcedure = entityManager.createStoredProcedureQuery("sp_ObterInfoSelecaoTurma");
            storedProcedure.registerStoredProcedureParameter(1, Integer.class, ParameterMode.IN);
            storedProcedure.setParameter(1, declaracaoId);

            storedProcedure.execute();

            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("declaracaoId", declaracaoId);

            return result;

        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Erro ao executar procedure: " + e.getMessage());
            return error;
        }
    }

    /**
     * Lista documentos pendentes de um responsável usando a view do banco
     */
    public List<Map<String, Object>> listarDocumentosPendentes(String cpfResponsavel) {
        String sql = """
                    SELECT
                        tipoDocumento,
                        descricaoDocumento,
                        obrigatorio,
                        statusEnvio,
                        dataEnvio,
                        observacoes
                    FROM vw_documentos_responsavel
                    WHERE cpfResponsavel = :cpfResponsavel
                    ORDER BY obrigatorio DESC, tipoDocumento
                """;

        Query query = entityManager.createNativeQuery(sql);
        query.setParameter("cpfResponsavel", cpfResponsavel);

        List<Object[]> results = query.getResultList();

        return results.stream().map(row -> {
            Map<String, Object> map = new HashMap<>();
            map.put("tipoDocumento", row[0]);
            map.put("descricaoDocumento", row[1]);
            map.put("obrigatorio", row[2]);
            map.put("statusEnvio", row[3]);
            map.put("dataEnvio", row[4]);
            map.put("observacoes", row[5]);
            return map;
        }).toList();
    }

    /**
     * Conta documentos pendentes usando a function do banco
     */
    public Integer contarDocumentosPendentes(String cpfResponsavel) {
        String sql = "SELECT fn_CountDocumentosPendentesResponsavel(:cpfResponsavel) as total";

        Query query = entityManager.createNativeQuery(sql);
        query.setParameter("cpfResponsavel", cpfResponsavel);

        return (Integer) query.getSingleResult();
    }
}

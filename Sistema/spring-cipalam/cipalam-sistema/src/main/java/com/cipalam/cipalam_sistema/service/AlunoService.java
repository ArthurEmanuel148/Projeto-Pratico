package com.cipalam.cipalam_sistema.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AlunoService {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    /**
     * Lista alunos de uma turma específica
     */
    public List<Map<String, Object>> listarAlunosPorTurma(Integer idTurma) {
        String sql = """
                SELECT
                    a.tbPessoa_idPessoa as idAluno,
                    p.NmPessoa as nomeAluno,
                    p.CpfPessoa as cpfAluno,
                    p.dtNascPessoa as dataNascimentoAluno,
                    a.matricula,
                    a.dataMatricula,
                    a.statusAluno,
                    a.tbTurma_idtbTurma as idTurma,
                    t.nomeTurma,
                    -- Dados da família
                    f.idtbFamilia,
                    f.tipoCota,
                    f.cep,
                    f.cidade,
                    f.uf,
                    -- Dados do responsável
                    pr.idPessoa as idResponsavel,
                    pr.NmPessoa as nomeResponsavel,
                    pr.CpfPessoa as cpfResponsavel,
                    pr.telefone as telefoneResponsavel,
                    pr.email as emailResponsavel,
                    -- Dados da escola
                    a.escolaAluno,
                    a.municipioEscola,
                    a.ufEscola,
                    -- Datas de controle
                    a.dataInicioMatricula,
                    a.dataFinalizacaoMatricula,
                    a.protocoloDeclaracao,
                    a.dataCriacao,
                    -- Status formatado
                    CASE a.statusAluno
                        WHEN 'matriculado' THEN 'Matriculado'
                        WHEN 'cursando' THEN 'Cursando'
                        WHEN 'concluido' THEN 'Concluído'
                        WHEN 'evadido' THEN 'Evadido'
                        WHEN 'transferido' THEN 'Transferido'
                        ELSE a.statusAluno
                    END as statusFormatado
                FROM tbAluno a
                INNER JOIN tbPessoa p ON a.tbPessoa_idPessoa = p.idPessoa
                INNER JOIN tbTurma t ON a.tbTurma_idtbTurma = t.idtbTurma
                INNER JOIN tbFamilia f ON a.tbFamilia_idtbFamilia = f.idtbFamilia
                INNER JOIN tbResponsavel r ON f.idtbFamilia = r.tbFamilia_idtbFamilia
                INNER JOIN tbPessoa pr ON r.tbPessoa_idPessoa = pr.idPessoa
                WHERE a.ativo = TRUE AND a.tbTurma_idtbTurma = ?
                ORDER BY p.NmPessoa
                """;

        return jdbcTemplate.queryForList(sql, idTurma);
    }

    /**
     * Obtém detalhes completos de um aluno
     */
    public Map<String, Object> obterDetalhesCompletos(Integer idAluno) {
        String sql = """
                SELECT
                    -- Dados básicos do aluno
                    a.tbPessoa_idPessoa as idAluno,
                    p.NmPessoa as nomeAluno,
                    p.CpfPessoa as cpfAluno,
                    p.dtNascPessoa as dataNascimentoAluno,
                    p.telefone as telefoneAluno,
                    p.email as emailAluno,
                    p.caminhoImagem as fotoAluno,
                    p.caminhoIdentidadePessoa as documentoIdentidadeAluno,

                    -- Dados da matrícula
                    a.matricula,
                    a.dataMatricula,
                    a.statusAluno,
                    a.protocoloDeclaracao,
                    a.dataInicioMatricula,
                    a.dataFinalizacaoMatricula,
                    a.caminhoFichaInscricao,
                    a.observacoesResponsavel,

                    -- Dados da escola
                    a.escolaAluno,
                    a.codigoInepEscola,
                    a.municipioEscola,
                    a.ufEscola,
                    a.horariosSelecionados,

                    -- Dados da turma
                    t.idtbTurma,
                    t.nomeTurma,
                    t.horarioInicio,
                    t.horarioFim,
                    CONCAT(
                        DATE_FORMAT(t.horarioInicio, '%H:%i'),
                        ' às ',
                        DATE_FORMAT(t.horarioFim, '%H:%i')
                    ) as horarioTurmaFormatado,

                    -- Dados da família
                    f.idtbFamilia,
                    f.tipoCota,
                    f.cep,
                    f.logradouro,
                    f.numero,
                    f.complemento,
                    f.bairro,
                    f.cidade,
                    f.uf,
                    f.pontoReferencia,
                    f.numeroIntegrantes,
                    f.integrantesRenda,
                    f.caminhoComprovanteresidencia,

                    -- Dados do responsável principal
                    pr.idPessoa as idResponsavel,
                    pr.NmPessoa as nomeResponsavel,
                    pr.CpfPessoa as cpfResponsavel,
                    pr.dtNascPessoa as dataNascimentoResponsavel,
                    pr.telefone as telefoneResponsavel,
                    pr.email as emailResponsavel,
                    pr.renda as rendaResponsavel,
                    pr.profissao as profissaoResponsavel,
                    pr.caminhoImagem as fotoResponsavel,
                    pr.caminhoIdentidadePessoa as documentoIdentidadeResponsavel,

                    -- Funcionário que fez a matrícula
                    pf.idPessoa as idFuncionarioMatricula,
                    pf.NmPessoa as nomeFuncionarioMatricula,

                    -- Endereço completo formatado
                    CONCAT(
                        COALESCE(f.logradouro, ''),
                        CASE WHEN f.numero IS NOT NULL THEN CONCAT(', ', f.numero) ELSE '' END,
                        CASE WHEN f.complemento IS NOT NULL THEN CONCAT(', ', f.complemento) ELSE '' END,
                        CASE WHEN f.bairro IS NOT NULL THEN CONCAT(' - ', f.bairro) ELSE '' END,
                        CASE WHEN f.cidade IS NOT NULL THEN CONCAT(', ', f.cidade) ELSE '' END,
                        CASE WHEN f.uf IS NOT NULL THEN CONCAT('/', f.uf) ELSE '' END,
                        CASE WHEN f.cep IS NOT NULL THEN CONCAT(' - CEP: ', f.cep) ELSE '' END
                    ) as enderecoCompleto,

                    -- Status formatado
                    CASE a.statusAluno
                        WHEN 'matriculado' THEN 'Matriculado'
                        WHEN 'cursando' THEN 'Cursando'
                        WHEN 'concluido' THEN 'Concluído'
                        WHEN 'evadido' THEN 'Evadido'
                        WHEN 'transferido' THEN 'Transferido'
                        ELSE a.statusAluno
                    END as statusFormatado,

                    -- Tipo de cota formatado
                    CASE f.tipoCota
                        WHEN 'livre' THEN 'Cota Livre'
                        WHEN 'economica' THEN 'Cota Econômica'
                        WHEN 'funcionario' THEN 'Cota Funcionário'
                        ELSE f.tipoCota
                    END as tipoCotaFormatado

                FROM tbAluno a
                INNER JOIN tbPessoa p ON a.tbPessoa_idPessoa = p.idPessoa
                INNER JOIN tbTurma t ON a.tbTurma_idtbTurma = t.idtbTurma
                INNER JOIN tbFamilia f ON a.tbFamilia_idtbFamilia = f.idtbFamilia
                INNER JOIN tbResponsavel r ON f.idtbFamilia = r.tbFamilia_idtbFamilia
                INNER JOIN tbPessoa pr ON r.tbPessoa_idPessoa = pr.idPessoa
                LEFT JOIN tbPessoa pf ON a.funcionarioMatricula_idPessoa = pf.idPessoa
                WHERE a.ativo = TRUE AND a.tbPessoa_idPessoa = ?
                """;

        List<Map<String, Object>> result = jdbcTemplate.queryForList(sql, idAluno);
        return result.isEmpty() ? null : result.get(0);
    }

    /**
     * Lista integrantes da família do aluno
     */
    public List<Map<String, Object>> listarIntegrantesFamilia(Integer idAluno) {
        String sql = """
                SELECT
                    i.idIntegrante,
                    i.tbFamilia_idtbFamilia as idFamilia,
                    a.tbPessoa_idPessoa as idAluno,
                    pa.NmPessoa as nomeAluno,
                    i.nomeIntegrante,
                    i.cpfIntegrante,
                    i.dataNascimento,
                    i.parentesco,
                    i.renda,
                    i.profissao,
                    i.observacoes,
                    -- Dados da pessoa se existir
                    pi.idPessoa as idPessoaIntegrante,
                    pi.telefone as telefoneIntegrante,
                    pi.email as emailIntegrante,
                    pi.caminhoImagem as fotoIntegrante,
                    -- Parentesco formatado
                    CASE i.parentesco
                        WHEN 'pai' THEN 'Pai'
                        WHEN 'mae' THEN 'Mãe'
                        WHEN 'conjuge' THEN 'Cônjuge'
                        WHEN 'filho' THEN 'Filho'
                        WHEN 'filha' THEN 'Filha'
                        WHEN 'irmao' THEN 'Irmão'
                        WHEN 'irma' THEN 'Irmã'
                        WHEN 'avo' THEN 'Avô'
                        WHEN 'ava' THEN 'Avó'
                        WHEN 'tio' THEN 'Tio'
                        WHEN 'tia' THEN 'Tia'
                        WHEN 'sobrinho' THEN 'Sobrinho'
                        WHEN 'sobrinha' THEN 'Sobrinha'
                        WHEN 'primo' THEN 'Primo'
                        WHEN 'prima' THEN 'Prima'
                        WHEN 'responsavel' THEN 'Responsável'
                        WHEN 'tutor' THEN 'Tutor'
                        WHEN 'outro' THEN 'Outro'
                        ELSE i.parentesco
                    END as parentescoFormatado
                FROM tbIntegranteFamilia i
                INNER JOIN tbFamilia f ON i.tbFamilia_idtbFamilia = f.idtbFamilia
                INNER JOIN tbAluno a ON f.idtbFamilia = a.tbFamilia_idtbFamilia
                INNER JOIN tbPessoa pa ON a.tbPessoa_idPessoa = pa.idPessoa
                LEFT JOIN tbPessoa pi ON i.tbPessoa_idPessoa = pi.idPessoa
                WHERE i.ativo = TRUE AND a.ativo = TRUE AND a.tbPessoa_idPessoa = ?
                ORDER BY i.nomeIntegrante
                """;

        return jdbcTemplate.queryForList(sql, idAluno);
    }

    /**
     * Busca o ID do aluno vinculado a um responsável
     * Usado para o painel do responsável visualizar documentos após matrícula
     * finalizada
     */
    public Integer buscarAlunoPorResponsavel(Integer idResponsavel) {
        try {
            String sql = """
                    SELECT a.tbPessoa_idPessoa as idAluno
                    FROM tbAluno a
                    INNER JOIN tbFamilia f ON a.tbFamilia_idtbFamilia = f.idtbFamilia
                    INNER JOIN tbResponsavel r ON f.idtbFamilia = r.tbFamilia_idtbFamilia
                    WHERE r.tbPessoa_idPessoa = ?
                    AND a.ativo = TRUE
                    LIMIT 1
                    """;

            List<Map<String, Object>> result = jdbcTemplate.queryForList(sql, idResponsavel);

            if (result.isEmpty()) {
                System.out.println("SERVICE: Nenhum aluno encontrado para responsável ID: " + idResponsavel);
                return null;
            }

            Integer idAluno = (Integer) result.get(0).get("idAluno");
            System.out.println("SERVICE: Aluno encontrado - ID: " + idAluno + " para responsável ID: " + idResponsavel);
            return idAluno;

        } catch (Exception e) {
            System.err.println("SERVICE: Erro ao buscar aluno por responsável: " + e.getMessage());
            e.printStackTrace();
            return null;
        }
    }

    /**
     * Alterar turma do aluno
     */
    @Transactional
    public boolean alterarTurma(Integer idAluno, Integer novaTurmaId, String observacoes) {
        try {
            // Verificar se a nova turma tem vagas
            String verificarVagasSql = """
                    SELECT capacidadeMaxima, capacidadeAtual
                    FROM tbTurma
                    WHERE idtbTurma = ? AND ativo = TRUE
                    """;

            List<Map<String, Object>> turmaInfo = jdbcTemplate.queryForList(verificarVagasSql, novaTurmaId);
            if (turmaInfo.isEmpty()) {
                throw new RuntimeException("Turma não encontrada ou inativa");
            }

            Map<String, Object> turma = turmaInfo.get(0);
            Integer capacidadeMaxima = (Integer) turma.get("capacidadeMaxima");
            Integer capacidadeAtual = (Integer) turma.get("capacidadeAtual");

            if (capacidadeAtual >= capacidadeMaxima) {
                throw new RuntimeException("Turma não possui vagas disponíveis");
            }

            // Obter turma atual do aluno
            String turmaAtualSql = "SELECT tbTurma_idtbTurma FROM tbAluno WHERE tbPessoa_idPessoa = ?";
            Integer turmaAtualId = jdbcTemplate.queryForObject(turmaAtualSql, Integer.class, idAluno);

            // Atualizar turma do aluno
            String updateAlunoSql = """
                    UPDATE tbAluno
                    SET tbTurma_idtbTurma = ?,
                        dataAtualizacao = CURRENT_TIMESTAMP
                    WHERE tbPessoa_idPessoa = ?
                    """;

            int rowsUpdated = jdbcTemplate.update(updateAlunoSql, novaTurmaId, idAluno);

            if (rowsUpdated > 0) {
                // Atualizar capacidade da turma antiga (diminuir)
                if (turmaAtualId != null && !turmaAtualId.equals(novaTurmaId)) {
                    jdbcTemplate.update(
                            "UPDATE tbTurma SET capacidadeAtual = capacidadeAtual - 1 WHERE idtbTurma = ?",
                            turmaAtualId);
                }

                // Atualizar capacidade da nova turma (aumentar)
                jdbcTemplate.update(
                        "UPDATE tbTurma SET capacidadeAtual = capacidadeAtual + 1 WHERE idtbTurma = ?",
                        novaTurmaId);

                return true;
            }

            return false;
        } catch (Exception e) {
            throw new RuntimeException("Erro ao alterar turma do aluno: " + e.getMessage());
        }
    }

    /**
     * Lista documentos da família do aluno (incluindo documentos da família e de
     * todos os integrantes)
     */
    public List<Map<String, Object>> listarDocumentosAluno(Integer idAluno) {
        System.out.println("=== LISTANDO DOCUMENTOS PARA ALUNO ID: " + idAluno + " ===");

        // Primeiro buscar informações do aluno
        String sqlAluno = """
                SELECT
                    a.tbFamilia_idtbFamilia,
                    im.id as tbInteresseMatricula_id
                FROM tbAluno a
                LEFT JOIN tbInteresseMatricula im ON a.protocoloDeclaracao = im.protocolo
                WHERE a.tbPessoa_idPessoa = ?
                LIMIT 1
                """;

        Map<String, Object> alunoInfo = null;
        try {
            alunoInfo = jdbcTemplate.queryForMap(sqlAluno, idAluno);
            System.out.println("Informações do aluno encontradas: " + alunoInfo);
        } catch (Exception e) {
            System.err.println("Aluno não encontrado: " + idAluno + ", erro: " + e.getMessage());
            e.printStackTrace();
            return new ArrayList<>();
        }

        String sql = """
                SELECT
                    dm.idDocumentoMatricula,
                    dm.status,
                    dm.caminhoArquivo,
                    dm.nomeArquivoOriginal,
                    dm.tipoArquivo,
                    dm.tamanhoArquivo,
                    dm.dataEnvio,
                    dm.dataAprovacao,
                    dm.observacoes,
                    dm.motivoRejeicao,
                    dm.tbAluno_idPessoa,
                    dm.tbPessoa_idPessoa,
                    dm.tbFamilia_idtbFamilia,
                    dm.tbInteresseMatricula_id,
                    td.nome as tipoDocumento,
                    td.descricao as descricaoDocumento,
                    td.escopo as categoria,
                    CASE
                        WHEN p.idPessoa IS NOT NULL THEN p.NmPessoa
                        WHEN td.escopo = 'FAMILIA' THEN 'Família'
                        WHEN td.escopo = 'ALUNO' THEN pa.NmPessoa
                        ELSE 'Desconhecido'
                    END as nomeIntegrante,
                    CASE
                        WHEN i.parentesco IS NOT NULL THEN i.parentesco
                        WHEN dm.tbAluno_idPessoa IS NOT NULL THEN 'Aluno'
                        ELSE NULL
                    END as parentesco
                FROM tbDocumentoMatricula dm
                INNER JOIN tbTipoDocumento td ON dm.tbTipoDocumento_idTipoDocumento = td.idTipoDocumento
                LEFT JOIN tbPessoa p ON dm.tbPessoa_idPessoa = p.idPessoa
                LEFT JOIN tbPessoa pa ON dm.tbAluno_idPessoa = pa.idPessoa
                LEFT JOIN tbIntegranteFamilia i ON dm.tbPessoa_idPessoa = i.tbPessoa_idPessoa AND dm.tbFamilia_idtbFamilia = i.tbFamilia_idtbFamilia
                WHERE (
                    -- Documentos específicos do ALUNO
                    (dm.tbAluno_idPessoa = ? AND td.escopo = 'ALUNO') OR
                    -- Documentos da FAMÍLIA (sem pessoa específica)
                    (dm.tbFamilia_idtbFamilia = ? AND td.escopo = 'FAMILIA' AND dm.tbPessoa_idPessoa IS NULL AND dm.tbAluno_idPessoa IS NULL) OR
                    -- Documentos de TODOS_INTEGRANTES (cada pessoa tem o seu)
                    (dm.tbFamilia_idtbFamilia = ? AND td.escopo = 'TODOS_INTEGRANTES' AND dm.tbPessoa_idPessoa IS NOT NULL)
                )
                ORDER BY td.escopo, td.nome, dm.dataCriacao DESC
                """;

        try {
            Integer familiaId = alunoInfo != null ? (Integer) alunoInfo.get("tbFamilia_idtbFamilia") : null;

            System.out.println("Debug - Buscando documentos para:");
            System.out.println("  idAluno: " + idAluno);
            System.out.println("  familiaId: " + familiaId);

            return jdbcTemplate.query(sql, (rs, rowNum) -> {
                Map<String, Object> documento = new HashMap<>();
                documento.put("id", rs.getInt("idDocumentoMatricula"));
                documento.put("tipoDocumento", rs.getString("tipoDocumento"));
                documento.put("descricao", rs.getString("descricaoDocumento"));
                documento.put("categoria", rs.getString("categoria"));
                documento.put("status", rs.getString("status"));
                documento.put("nomeArquivoOriginal", rs.getString("nomeArquivoOriginal"));
                documento.put("caminhoArquivo", rs.getString("caminhoArquivo"));
                documento.put("tipoArquivo", rs.getString("tipoArquivo"));
                documento.put("tamanhoArquivo", rs.getLong("tamanhoArquivo"));
                documento.put("dataEnvio", rs.getTimestamp("dataEnvio"));
                documento.put("dataAprovacao", rs.getTimestamp("dataAprovacao"));
                documento.put("observacoes", rs.getString("observacoes"));
                documento.put("motivoRejeicao", rs.getString("motivoRejeicao"));
                documento.put("nomeIntegrante", rs.getString("nomeIntegrante"));
                documento.put("parentesco", rs.getString("parentesco"));
                documento.put("obrigatorio", true);
                documento.put("podeAprovar", true);

                // Log para debug
                System.out.println("📄 Doc ID " + rs.getInt("idDocumentoMatricula") +
                        " - Status: " + rs.getString("status") +
                        " - Arquivo: " + rs.getString("nomeArquivoOriginal"));

                return documento;
            }, idAluno, familiaId, familiaId);
        } catch (Exception e) {
            System.err.println("Erro ao buscar documentos do aluno " + idAluno + ": " + e.getMessage());
            e.printStackTrace();
            return new ArrayList<>();
        }
    }

    /**
     * Lista documentos do aluno organizados no formato FamiliaDocumentos para o
     * painel do responsável
     * Retorna estrutura compatível com a interface do responsável
     */
    public Map<String, Object> listarDocumentosAlunoParaResponsavel(Integer idAluno, Integer idResponsavel) {
        System.out.println("=== ORGANIZANDO DOCUMENTOS PARA RESPONSÁVEL - Aluno ID: " + idAluno + " ===");

        try {
            // 1. Buscar informações básicas do responsável e família
            String sqlResponsavel = """
                    SELECT
                        p.idPessoa,
                        p.NmPessoa,
                        p.email,
                        f.idtbFamilia
                    FROM tbPessoa p
                    INNER JOIN tbResponsavel r ON p.idPessoa = r.tbPessoa_idPessoa
                    INNER JOIN tbFamilia f ON r.tbFamilia_idtbFamilia = f.idtbFamilia
                    WHERE p.idPessoa = ?
                    LIMIT 1
                    """;

            Map<String, Object> responsavelInfo = jdbcTemplate.queryForMap(sqlResponsavel, idResponsavel);
            Integer familiaId = (Integer) responsavelInfo.get("idtbFamilia");

            // 2. Buscar documentos do aluno
            List<Map<String, Object>> documentos = listarDocumentosAluno(idAluno);

            // 3. Organizar documentos por pessoa BASEADO NA CATEGORIA
            Map<String, List<Map<String, Object>>> documentosPorPessoa = new HashMap<>();

            for (Map<String, Object> doc : documentos) {
                // Transformar estrutura para formato compatível com declaração
                Map<String, Object> docTransformado = new HashMap<>();

                // Dados principais do documento
                docTransformado.put("id", doc.get("id"));
                docTransformado.put("idDocumentoMatricula", doc.get("id"));
                docTransformado.put("status", doc.get("status"));
                docTransformado.put("statusDescricao", doc.get("status"));
                docTransformado.put("nomeArquivo", doc.get("nomeArquivoOriginal"));
                docTransformado.put("dataEnvio", doc.get("dataEnvio"));
                docTransformado.put("dataAprovacao", doc.get("dataAprovacao"));
                docTransformado.put("observacoes", doc.get("observacoes"));
                docTransformado.put("obrigatorio", doc.get("obrigatorio"));

                // Criar objeto tipoDocumento aninhado (compatível com declaração)
                Map<String, Object> tipoDocumento = new HashMap<>();
                tipoDocumento.put("id", 0); // ID genérico para tipo
                tipoDocumento.put("nome", doc.get("tipoDocumento"));
                tipoDocumento.put("descricao", doc.get("descricao"));
                tipoDocumento.put("categoria", doc.get("categoria"));
                docTransformado.put("tipoDocumento", tipoDocumento);

                String categoria = (String) doc.get("categoria");
                String nomeIntegrante = (String) doc.get("nomeIntegrante");
                String parentesco = (String) doc.get("parentesco");

                // Criar chave única BASEADA NA CATEGORIA do documento
                String chavePessoa;
                if ("FAMILIA".equals(categoria)) {
                    chavePessoa = "FAMILIA_Família";
                } else if ("ALUNO".equals(categoria)) {
                    chavePessoa = "ALUNO_" + (nomeIntegrante != null ? nomeIntegrante : "Aluno");
                } else if ("TODOS_INTEGRANTES".equals(categoria)) {
                    chavePessoa = "INTEGRANTE_" + (nomeIntegrante != null ? nomeIntegrante : "Integrante") + "_"
                            + (parentesco != null ? parentesco : "");
                } else {
                    chavePessoa = categoria + "_" + (nomeIntegrante != null ? nomeIntegrante : "Outros");
                }

                documentosPorPessoa.computeIfAbsent(chavePessoa, k -> new ArrayList<>()).add(docTransformado);
            }

            // 4. Transformar em lista de DocumentoPorPessoa
            List<Map<String, Object>> documentosPorPessoaLista = new ArrayList<>();
            for (Map.Entry<String, List<Map<String, Object>>> entry : documentosPorPessoa.entrySet()) {
                List<Map<String, Object>> docsIntegrante = entry.getValue();
                if (!docsIntegrante.isEmpty()) {
                    Map<String, Object> primeiroDoc = docsIntegrante.get(0);
                    String chavePessoa = entry.getKey();

                    // Extrair categoria da chave
                    String categoriaChave = chavePessoa.split("_")[0];

                    Map<String, Object> pessoa = new HashMap<>();
                    pessoa.put("id", 0); // ID genérico

                    // Definir nome e parentesco baseado na categoria
                    if ("FAMILIA".equals(categoriaChave)) {
                        pessoa.put("nome", "Família");
                        pessoa.put("parentesco", "familia");
                    } else if ("ALUNO".equals(categoriaChave)) {
                        pessoa.put("nome", primeiroDoc.get("nomeIntegrante"));
                        pessoa.put("parentesco", "aluno");
                    } else if ("INTEGRANTE".equals(categoriaChave)) {
                        pessoa.put("nome", primeiroDoc.get("nomeIntegrante"));
                        pessoa.put("parentesco",
                                primeiroDoc.get("parentesco") != null ? primeiroDoc.get("parentesco") : "integrante");
                    } else {
                        pessoa.put("nome", primeiroDoc.get("nomeIntegrante"));
                        pessoa.put("parentesco",
                                primeiroDoc.get("parentesco") != null ? primeiroDoc.get("parentesco") : "outro");
                    }

                    Map<String, Object> pessoaDocumentos = new HashMap<>();
                    pessoaDocumentos.put("pessoa", pessoa);
                    pessoaDocumentos.put("documentos", docsIntegrante);

                    documentosPorPessoaLista.add(pessoaDocumentos);
                }
            }

            // 5. Calcular resumo (matrícula finalizada usa 'enviado' ao invés de 'anexado')
            Map<String, Integer> resumo = new HashMap<>();
            int totalDocumentos = documentos.size();
            int pendentes = 0, anexados = 0, aprovados = 0, rejeitados = 0;

            for (Map<String, Object> doc : documentos) {
                String status = ((String) doc.get("status")).toLowerCase();
                switch (status) {
                    case "pendente" -> pendentes++;
                    case "anexado", "enviado" -> anexados++; // Aceita tanto 'anexado' quanto 'enviado'
                    case "aprovado" -> aprovados++;
                    case "rejeitado" -> rejeitados++;
                }
            }

            resumo.put("totalDocumentos", totalDocumentos);
            resumo.put("pendentes", pendentes);
            resumo.put("anexados", anexados);
            resumo.put("aprovados", aprovados);
            resumo.put("rejeitados", rejeitados);

            // 6. Montar resposta final
            Map<String, Object> familia = new HashMap<>();
            familia.put("id", familiaId);

            Map<String, Object> responsavel = new HashMap<>();
            responsavel.put("id", responsavelInfo.get("idPessoa"));
            responsavel.put("nome", responsavelInfo.get("NmPessoa"));
            responsavel.put("email", responsavelInfo.get("email"));
            familia.put("responsavel", responsavel);

            Map<String, Object> response = new HashMap<>();
            response.put("familia", familia);
            response.put("documentosPorPessoa", documentosPorPessoaLista);
            response.put("resumo", resumo);

            System.out.println("✅ Documentos organizados: " + documentosPorPessoaLista.size() + " pessoas, "
                    + totalDocumentos + " documentos");

            return response;

        } catch (Exception e) {
            System.err.println("❌ Erro ao organizar documentos para responsável: " + e.getMessage());
            e.printStackTrace();
            return new HashMap<>();
        }
    }

    /**
     * Obter documento específico por ID
     */
    public Map<String, Object> obterDocumento(Integer idDocumento) {
        String sql = """
                SELECT
                    dm.idDocumentoMatricula,
                    dm.status,
                    dm.caminhoArquivo,
                    dm.nomeArquivoOriginal,
                    dm.tipoArquivo,
                    dm.tamanhoArquivo,
                    dm.dataEnvio,
                    dm.dataAprovacao,
                    dm.observacoes,
                    dm.motivoRejeicao,
                    td.nome as tipoDocumento,
                    td.descricao as descricaoDocumento,
                    td.escopo as categoria
                FROM tbDocumentoMatricula dm
                INNER JOIN tbTipoDocumento td ON dm.tbTipoDocumento_idTipoDocumento = td.idTipoDocumento
                WHERE dm.idDocumentoMatricula = ?
                """;

        try {
            return jdbcTemplate.queryForMap(sql, idDocumento);
        } catch (Exception e) {
            System.err.println("Erro ao buscar documento " + idDocumento + ": " + e.getMessage());
            return null;
        }
    }

    /**
     * Aprovar um documento
     */
    @Transactional
    public boolean aprovarDocumento(Integer idDocumento, String observacoes) {
        try {
            String sql = """
                    UPDATE tbDocumentoMatricula
                    SET status = 'aprovado',
                        dataAprovacao = NOW(),
                        observacoes = ?,
                        dataAtualizacao = NOW()
                    WHERE idDocumentoMatricula = ?
                    """;

            int rowsAffected = jdbcTemplate.update(sql, observacoes, idDocumento);

            if (rowsAffected > 0) {
                System.out.println("Documento " + idDocumento + " aprovado com sucesso");
                return true;
            } else {
                System.err.println("Nenhuma linha afetada ao aprovar documento " + idDocumento);
                return false;
            }

        } catch (Exception e) {
            System.err.println("Erro ao aprovar documento " + idDocumento + ": " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }

    /**
     * Rejeitar um documento
     */
    @Transactional
    public boolean rejeitarDocumento(Integer idDocumento, String motivoRejeicao) {
        try {
            String sql = """
                    UPDATE tbDocumentoMatricula
                    SET status = 'rejeitado',
                        motivoRejeicao = ?,
                        dataAtualizacao = NOW()
                    WHERE idDocumentoMatricula = ?
                    """;

            int rowsAffected = jdbcTemplate.update(sql, motivoRejeicao, idDocumento);

            if (rowsAffected > 0) {
                System.out.println("Documento " + idDocumento + " rejeitado com sucesso");
                return true;
            } else {
                System.err.println("Nenhuma linha afetada ao rejeitar documento " + idDocumento);
                return false;
            }

        } catch (Exception e) {
            System.err.println("Erro ao rejeitar documento " + idDocumento + ": " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }

    /**
     * Anexar documento por responsável em matrícula finalizada
     * Salva o arquivo e atualiza tbDocumentoMatricula
     */
    @Transactional
    public boolean anexarDocumentoPorResponsavel(
            org.springframework.web.multipart.MultipartFile arquivo,
            Integer documentoId,
            Integer responsavelId) {
        try {
            System.out.println("=== ANEXANDO DOCUMENTO POR RESPONSÁVEL ===");
            System.out.println("Responsável ID: " + responsavelId);
            System.out.println("Documento ID: " + documentoId);
            System.out.println("Arquivo: " + arquivo.getOriginalFilename());

            // 1. Buscar informações do documento para saber onde salvar
            String sqlDocumento = """
                    SELECT
                        dm.idDocumentoMatricula,
                        dm.tbFamilia_idtbFamilia,
                        dm.tbAluno_idPessoa,
                        dm.tbPessoa_idPessoa,
                        td.escopo
                    FROM tbDocumentoMatricula dm
                    INNER JOIN tbTipoDocumento td ON dm.tbTipoDocumento_idTipoDocumento = td.idTipoDocumento
                    WHERE dm.idDocumentoMatricula = ?
                    """;

            Map<String, Object> docInfo = jdbcTemplate.queryForMap(sqlDocumento, documentoId);
            String escopo = (String) docInfo.get("escopo");

            System.out.println("📋 Informações do documento:");
            System.out.println("  - Escopo: " + escopo);
            System.out.println("  - Família ID: " + docInfo.get("tbFamilia_idtbFamilia"));
            System.out.println("  - Aluno ID: " + docInfo.get("tbAluno_idPessoa"));
            System.out.println("  - Pessoa ID: " + docInfo.get("tbPessoa_idPessoa"));

            // 2. Determinar o caminho do arquivo baseado no escopo
            String nomeArquivo = arquivo.getOriginalFilename();
            String extensao = nomeArquivo.substring(nomeArquivo.lastIndexOf("."));
            String timestamp = String.valueOf(System.currentTimeMillis());
            String nomeArquivoFinal = "doc_" + documentoId + "_" + timestamp + extensao;

            // Caminho base dos documentos
            String caminhoBase = "/Applications/XAMPP/xamppfiles/htdocs/GitHub/Projeto-Pratico/cipalam_documentos/";
            String caminhoRelativo = "";

            // Definir subcaminho baseado no escopo
            switch (escopo.toUpperCase()) {
                case "FAMILIA":
                    caminhoRelativo = "familia/" + nomeArquivoFinal;
                    break;
                case "ALUNO":
                    caminhoRelativo = "aluno/" + nomeArquivoFinal;
                    break;
                case "TODOS_INTEGRANTES":
                    caminhoRelativo = "integrantes/" + nomeArquivoFinal;
                    break;
                default:
                    caminhoRelativo = "outros/" + nomeArquivoFinal;
            }

            String caminhoCompleto = caminhoBase + caminhoRelativo;

            // 3. Salvar o arquivo no disco
            java.io.File diretorio = new java.io.File(caminhoCompleto).getParentFile();
            if (!diretorio.exists()) {
                diretorio.mkdirs();
            }

            arquivo.transferTo(new java.io.File(caminhoCompleto));
            System.out.println("✅ Arquivo salvo em: " + caminhoCompleto);

            // 4. Atualizar o registro em tbDocumentoMatricula
            String sqlUpdate = """
                    UPDATE tbDocumentoMatricula
                    SET caminhoArquivo = ?,
                        nomeArquivoOriginal = ?,
                        tipoArquivo = ?,
                        tamanhoArquivo = ?,
                        status = 'enviado',
                        dataEnvio = NOW(),
                        dataAtualizacao = NOW()
                    WHERE idDocumentoMatricula = ?
                    """;

            int rowsAffected = jdbcTemplate.update(
                    sqlUpdate,
                    caminhoRelativo,
                    nomeArquivo,
                    arquivo.getContentType(),
                    arquivo.getSize(),
                    documentoId);

            System.out.println("📊 Resultado da atualização:");
            System.out.println("  - Linhas afetadas: " + rowsAffected);
            System.out.println("  - Caminho relativo salvo: " + caminhoRelativo);
            System.out.println("  - Status definido: anexado");

            if (rowsAffected > 0) {
                System.out.println("✅ Documento anexado com sucesso!");

                // Verificar se realmente foi atualizado
                String sqlVerificar = "SELECT status, caminhoArquivo FROM tbDocumentoMatricula WHERE idDocumentoMatricula = ?";
                Map<String, Object> verificacao = jdbcTemplate.queryForMap(sqlVerificar, documentoId);
                System.out.println("🔍 Verificação após atualização:");
                System.out.println("  - Status atual: " + verificacao.get("status"));
                System.out.println("  - Caminho atual: " + verificacao.get("caminhoArquivo"));

                return true;
            } else {
                System.err.println("❌ Nenhuma linha foi atualizada");
                return false;
            }

        } catch (Exception e) {
            System.err.println("❌ Erro ao anexar documento: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }

    /**
     * Obter arquivo físico do documento (retorna bytes do arquivo)
     */
    public byte[] obterArquivoDocumento(Integer idDocumento) {
        try {
            System.out.println("========================================");
            System.out.println("📂 SERVICE: Buscando arquivo do documento ID: " + idDocumento);

            // Buscar o caminho do arquivo no banco de dados
            String sql = "SELECT caminhoArquivo FROM tbDocumentoMatricula WHERE idDocumentoMatricula = ?";
            String caminhoArquivo = jdbcTemplate.queryForObject(sql, String.class, idDocumento);

            if (caminhoArquivo == null || caminhoArquivo.isEmpty()) {
                System.err.println("❌ Caminho do arquivo não encontrado no banco");
                return null;
            }

            System.out.println("📍 Caminho no banco: " + caminhoArquivo);

            // Caminho base dos documentos
            String caminhoBase = "/Applications/XAMPP/xamppfiles/htdocs/GitHub/Projeto-Pratico/cipalam_documentos/";
            String caminhoCompleto;

            // Verificar se o caminho já é absoluto (legado) ou relativo (novo)
            if (caminhoArquivo.startsWith("/Applications/XAMPP")) {
                // Caminho absoluto (legado) - usar direto
                caminhoCompleto = caminhoArquivo;
                System.out.println("📌 Usando caminho absoluto (legado)");
            } else {
                // Caminho relativo (novo) - concatenar com base
                caminhoCompleto = caminhoBase + caminhoArquivo;
                System.out.println("📌 Usando caminho relativo (novo)");
            }

            System.out.println("📂 Caminho completo: " + caminhoCompleto);

            // Ler o arquivo
            java.io.File arquivo = new java.io.File(caminhoCompleto);

            if (!arquivo.exists()) {
                System.err.println("❌ Arquivo não existe no disco: " + caminhoCompleto);
                return null;
            }

            System.out.println("✅ Arquivo encontrado! Tamanho: " + arquivo.length() + " bytes");

            // Ler todos os bytes do arquivo
            java.nio.file.Path path = arquivo.toPath();
            byte[] bytes = java.nio.file.Files.readAllBytes(path);

            System.out.println("✅ Arquivo lido com sucesso: " + bytes.length + " bytes");
            System.out.println("========================================");

            return bytes;

        } catch (Exception e) {
            System.err.println("========================================");
            System.err.println("❌ SERVICE: Erro ao obter arquivo do documento");
            System.err.println("Mensagem: " + e.getMessage());
            e.printStackTrace();
            System.err.println("========================================");
            return null;
        }
    }
}

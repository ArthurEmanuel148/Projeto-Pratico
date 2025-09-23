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
                    COALESCE(p.NmPessoa, 'Família') as nomeIntegrante
                FROM tbDocumentoMatricula dm
                INNER JOIN tbTipoDocumento td ON dm.tbTipoDocumento_idTipoDocumento = td.idTipoDocumento
                LEFT JOIN tbPessoa p ON dm.tbPessoa_idPessoa = p.IdPessoa
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
                documento.put("obrigatorio", true);
                documento.put("podeAprovar", true);

                return documento;
            }, idAluno, familiaId, familiaId);
        } catch (Exception e) {
            System.err.println("Erro ao buscar documentos do aluno " + idAluno + ": " + e.getMessage());
            e.printStackTrace();
            return new ArrayList<>();
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
}
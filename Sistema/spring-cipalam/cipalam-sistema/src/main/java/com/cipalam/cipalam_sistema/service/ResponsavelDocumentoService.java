package com.cipalam.cipalam_sistema.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class ResponsavelDocumentoService {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    /**
     * Busca todos os documentos da família organizados por pessoa
     */
    public Map<String, Object> buscarDocumentosPorFamilia(Long idResponsavel) {
        // Buscar informações básicas da família
        Map<String, Object> infoFamilia = buscarInfoResponsavel(idResponsavel);

        // Buscar membros da família
        List<Map<String, Object>> membrosFamilia = buscarMembrosFamilia(idResponsavel);

        // Buscar documentos por pessoa
        List<Map<String, Object>> documentosPorPessoa = new ArrayList<>();

        for (Map<String, Object> membro : membrosFamilia) {
            Long idPessoa = ((Number) membro.get("idPessoa")).longValue();
            String parentesco = (String) membro.get("parentesco");

            Map<String, Object> pessoaDocumentos = new HashMap<>();
            pessoaDocumentos.put("pessoa", membro);
            pessoaDocumentos.put("documentos", buscarDocumentosPorPessoa(idPessoa, parentesco));

            documentosPorPessoa.add(pessoaDocumentos);
        }

        // Calcular resumo
        Map<String, Object> resumo = calcularResumo(documentosPorPessoa);

        // Montar resposta final
        Map<String, Object> resultado = new HashMap<>();
        resultado.put("familia", infoFamilia);
        resultado.put("documentosPorPessoa", documentosPorPessoa);
        resultado.put("resumo", resumo);

        return resultado;
    }

    /**
     * Busca informações básicas do responsável
     */
    public Map<String, Object> buscarInfoResponsavel(Long idResponsavel) {
        String sql = """
                    SELECT
                        p.idPessoa as id,
                        p.nome,
                        p.email,
                        f.idtbFamilia as idFamilia
                    FROM tbPessoa p
                    INNER JOIN tbFamilia f ON p.idPessoa = f.tbPessoa_idPessoa
                    WHERE p.idPessoa = ?
                """;

        List<Map<String, Object>> resultados = jdbcTemplate.queryForList(sql, idResponsavel);

        if (resultados.isEmpty()) {
            throw new RuntimeException("Responsável não encontrado");
        }

        Map<String, Object> responsavel = resultados.get(0);

        Map<String, Object> familia = new HashMap<>();
        familia.put("id", responsavel.get("idFamilia"));

        Map<String, Object> responsavelInfo = new HashMap<>();
        responsavelInfo.put("id", responsavel.get("id"));
        responsavelInfo.put("nome", responsavel.get("nome"));
        responsavelInfo.put("email", responsavel.get("email"));

        familia.put("responsavel", responsavelInfo);

        return familia;
    }

    /**
     * Busca todos os membros da família
     */
    private List<Map<String, Object>> buscarMembrosFamilia(Long idResponsavel) {
        String sql = """
                    SELECT DISTINCT
                        p.idPessoa,
                        p.nome,
                        CASE
                            WHEN p.idPessoa = f.tbPessoa_idPessoa THEN 'responsavel'
                            WHEN a.idPessoa IS NOT NULL THEN 'aluno'
                            ELSE 'integrante'
                        END as parentesco
                    FROM tbFamilia f
                    INNER JOIN tbIntegranteFamilia if_fam ON f.idtbFamilia = if_fam.tbFamilia_idtbFamilia
                    INNER JOIN tbPessoa p ON if_fam.tbPessoa_idPessoa = p.idPessoa
                    LEFT JOIN tbAluno a ON p.idPessoa = a.idPessoa
                    WHERE f.tbPessoa_idPessoa = ?

                    UNION

                    SELECT
                        p.idPessoa,
                        p.nome,
                        'responsavel' as parentesco
                    FROM tbPessoa p
                    INNER JOIN tbFamilia f ON p.idPessoa = f.tbPessoa_idPessoa
                    WHERE p.idPessoa = ?

                    ORDER BY
                        CASE parentesco
                            WHEN 'responsavel' THEN 1
                            WHEN 'aluno' THEN 2
                            ELSE 3
                        END,
                        nome
                """;

        return jdbcTemplate.queryForList(sql, idResponsavel, idResponsavel);
    }

    /**
     * Busca documentos específicos para uma pessoa
     */
    private List<Map<String, Object>> buscarDocumentosPorPessoa(Long idPessoa, String parentesco) {
        // Buscar tipos de documentos aplicáveis para esta pessoa
        String sqlTipos = """
                    SELECT
                        td.idTipoDocumento,
                        td.nome,
                        td.descricao,
                        td.escopo as categoria,
                        td.tipoProcessamento
                    FROM tbTipoDocumento td
                    WHERE td.ativo = 1
                    AND (
                        td.escopo = 'FAMILIA' OR
                        (td.escopo = 'ALUNO' AND ? = 'aluno') OR
                        td.escopo = 'TODOS_INTEGRANTES'
                    )
                    ORDER BY td.nome
                """;

        List<Map<String, Object>> tiposDocumentos = jdbcTemplate.queryForList(sqlTipos, parentesco);

        List<Map<String, Object>> documentos = new ArrayList<>();

        for (Map<String, Object> tipo : tiposDocumentos) {
            // Verificar se já existe documento matricula para este tipo e pessoa
            String sqlDocumento = """
                        SELECT
                            dm.idDocumentoMatricula,
                            dm.status,
                            dm.nomeArquivoOriginal,
                            dm.dataEnvio,
                            dm.dataAprovacao,
                            dm.observacoes,
                            dm.motivoRejeicao
                        FROM tbDocumentoMatricula dm
                        WHERE dm.tbTipoDocumento_idTipoDocumento = ?
                        AND (dm.tbPessoa_idPessoa = ? OR
                             (dm.tbFamilia_idtbFamilia IS NOT NULL AND ? = 'responsavel'))
                        ORDER BY dm.dataCriacao DESC
                        LIMIT 1
                    """;

            List<Map<String, Object>> documentosExistentes = jdbcTemplate.queryForList(
                    sqlDocumento,
                    tipo.get("idTipoDocumento"),
                    idPessoa,
                    parentesco);

            Map<String, Object> documento = new HashMap<>();
            documento.put("tipoDocumento", tipo);
            documento.put("obrigatorio", true); // Por padrão, todos são obrigatórios

            if (!documentosExistentes.isEmpty()) {
                Map<String, Object> docExistente = documentosExistentes.get(0);
                documento.put("id", docExistente.get("idDocumentoMatricula"));
                documento.put("idDocumentoMatricula", docExistente.get("idDocumentoMatricula"));
                documento.put("status", docExistente.get("status"));
                documento.put("nomeArquivo", docExistente.get("nomeArquivoOriginal"));
                documento.put("dataEnvio", docExistente.get("dataEnvio"));
                documento.put("dataAprovacao", docExistente.get("dataAprovacao"));
                documento.put("observacoes", docExistente.get("observacoes"));

                // Status descritivo
                String status = (String) docExistente.get("status");
                String statusDescricao = switch (status) {
                    case "pendente" -> "Aguardando envio";
                    case "enviado" -> "Documento enviado";
                    case "aprovado" -> "Documento aprovado";
                    case "rejeitado" -> "Documento rejeitado - " +
                            (docExistente.get("motivoRejeicao") != null ? docExistente.get("motivoRejeicao")
                                    : "motivo não informado");
                    default -> "Status desconhecido";
                };
                documento.put("statusDescricao", statusDescricao);
            } else {
                // Documento ainda não foi criado
                documento.put("id", null);
                documento.put("idDocumentoMatricula", null);
                documento.put("status", "pendente");
                documento.put("statusDescricao", "Aguardando envio");
                documento.put("nomeArquivo", null);
                documento.put("dataEnvio", null);
                documento.put("dataAprovacao", null);
                documento.put("observacoes", null);
            }

            documentos.add(documento);
        }

        return documentos;
    }

    /**
     * Calcula resumo dos documentos
     */
    private Map<String, Object> calcularResumo(List<Map<String, Object>> documentosPorPessoa) {
        int totalDocumentos = 0;
        int pendentes = 0;
        int anexados = 0;
        int aprovados = 0;
        int rejeitados = 0;

        for (Map<String, Object> pessoaDoc : documentosPorPessoa) {
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> documentos = (List<Map<String, Object>>) pessoaDoc.get("documentos");

            for (Map<String, Object> doc : documentos) {
                totalDocumentos++;
                String status = (String) doc.get("status");

                switch (status) {
                    case "pendente" -> pendentes++;
                    case "enviado" -> anexados++;
                    case "aprovado" -> aprovados++;
                    case "rejeitado" -> rejeitados++;
                }
            }
        }

        Map<String, Object> resumo = new HashMap<>();
        resumo.put("totalDocumentos", totalDocumentos);
        resumo.put("pendentes", pendentes);
        resumo.put("anexados", anexados);
        resumo.put("aprovados", aprovados);
        resumo.put("rejeitados", rejeitados);

        return resumo;
    }
}

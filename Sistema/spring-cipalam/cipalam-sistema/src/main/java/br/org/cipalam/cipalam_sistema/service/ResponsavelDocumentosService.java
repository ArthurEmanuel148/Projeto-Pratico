package br.org.cipalam.cipalam_sistema.service;

import br.org.cipalam.cipalam_sistema.dto.FamiliaDocumentosDTO;
import br.org.cipalam.cipalam_sistema.dto.FamiliaDocumentosDTO.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class ResponsavelDocumentosService {

    private static final Logger logger = LoggerFactory.getLogger(ResponsavelDocumentosService.class);

    @Autowired
    private JdbcTemplate jdbcTemplate;

    /**
     * Busca todos os documentos da família organizados por pessoa
     */
    public FamiliaDocumentosDTO buscarDocumentosPorFamilia(Long idResponsavel) {
        try {
            logger.info("🔍 Iniciando busca de documentos para responsável ID: {}", idResponsavel);

            // 1. Buscar informações do responsável
            FamiliaInfo familiaInfo = buscarInformacoesFamilia(idResponsavel);
            if (familiaInfo == null) {
                logger.warn("⚠️ Família não encontrada para responsável ID: {}", idResponsavel);
                return null;
            }

            // 2. Buscar todas as pessoas da família com matrículas
            List<DocumentoPorPessoa> documentosPorPessoa = buscarDocumentosPorPessoa(idResponsavel);

            // 3. Calcular resumo dos documentos
            ResumoDocumentos resumo = calcularResumoDocumentos(documentosPorPessoa);

            logger.info("✅ Documentos da família encontrados: {} pessoas, {} documentos totais",
                    documentosPorPessoa.size(), resumo.getTotalDocumentos());

            return new FamiliaDocumentosDTO(familiaInfo, documentosPorPessoa, resumo);

        } catch (Exception e) {
            logger.error("❌ Erro ao buscar documentos da família: {}", e.getMessage(), e);
            throw new RuntimeException("Erro ao buscar documentos da família", e);
        }
    }

    /**
     * Busca informações básicas da família
     */
    private FamiliaInfo buscarInformacoesFamilia(Long idResponsavel) {
        try {
            String sql = """
                    SELECT p.idPessoa, p.nmPessoa, p.email
                    FROM tbPessoa p
                    WHERE p.idPessoa = ?
                    """;

            return jdbcTemplate.queryForObject(sql, (rs, rowNum) -> {
                ResponsavelInfo responsavel = new ResponsavelInfo(
                        rs.getLong("idPessoa"),
                        rs.getString("nmPessoa"),
                        rs.getString("email"));
                return new FamiliaInfo(rs.getLong("idPessoa"), responsavel);
            }, idResponsavel);

        } catch (Exception e) {
            logger.warn("⚠️ Erro ao buscar informações da família: {}", e.getMessage());
            return null;
        }
    }

    /**
     * Busca documentos organizados por pessoa da família
     */
    private List<DocumentoPorPessoa> buscarDocumentosPorPessoa(Long idResponsavel) {
        try {
            // SQL para buscar todas as pessoas da família
            String sqlPessoas = """
                    SELECT DISTINCT
                        p.idPessoa,
                        p.nmPessoa,
                        CASE
                            WHEN r.tbPessoa_idPessoa = p.idPessoa THEN 'responsavel'
                            WHEN a.idPessoa = p.idPessoa THEN 'aluno'
                            ELSE 'integrante'
                        END as parentesco
                    FROM tbPessoa p
                    LEFT JOIN tbResponsavel r ON r.tbPessoa_idPessoa = p.idPessoa AND r.tbPessoa_idPessoa = ?
                    LEFT JOIN tbAluno a ON a.idPessoa = p.idPessoa
                    LEFT JOIN tbIntegranteFamilia if_fam ON if_fam.tbPessoa_idPessoa = p.idPessoa
                    WHERE (r.tbPessoa_idPessoa = ? OR
                           EXISTS(SELECT 1 FROM tbResponsavel r2 WHERE r2.tbPessoa_idPessoa = ? AND
                                  (a.tbFamilia_idtbFamilia = r2.tbFamilia_idtbFamilia OR
                                   if_fam.tbFamilia_idtbFamilia = r2.tbFamilia_idtbFamilia)))
                    ORDER BY
                        CASE
                            WHEN r.tbPessoa_idPessoa = p.idPessoa THEN 1
                            WHEN a.idPessoa = p.idPessoa THEN 2
                            ELSE 3
                        END,
                        p.nmPessoa
                    """;

            List<PessoaInfo> pessoas = jdbcTemplate.query(sqlPessoas,
                    (rs, rowNum) -> new PessoaInfo(
                            rs.getLong("idPessoa"),
                            rs.getString("nmPessoa"),
                            rs.getString("parentesco")),
                    idResponsavel, idResponsavel, idResponsavel);

            logger.info("📋 Encontradas {} pessoas na família", pessoas.size());

            // Para cada pessoa, buscar seus documentos
            List<DocumentoPorPessoa> documentosPorPessoa = new ArrayList<>();
            for (PessoaInfo pessoa : pessoas) {
                List<DocumentoIndividual> documentos = buscarDocumentosPessoa(pessoa.getId(), idResponsavel);
                documentosPorPessoa.add(new DocumentoPorPessoa(pessoa, documentos));
            }

            return documentosPorPessoa;

        } catch (Exception e) {
            logger.error("❌ Erro ao buscar documentos por pessoa: {}", e.getMessage(), e);
            return new ArrayList<>();
        }
    }

    /**
     * Busca documentos de uma pessoa específica
     */
    private List<DocumentoIndividual> buscarDocumentosPessoa(Long idPessoa, Long idResponsavel) {
        try {
            String sql = """
                    SELECT
                        dm.idDocumentoMatricula,
                        dm.nomeArquivoOriginal as nomeArquivo,
                        dm.dataEnvio,
                        dm.dataAprovacao,
                        dm.observacoes,
                        dm.status,
                        td.idTipoDocumento,
                        td.nome as nomeDocumento,
                        td.descricao as descricaoDocumento,
                        td.escopo as categoria,
                        CASE dm.status
                            WHEN 'pendente' THEN 'Aguardando envio'
                            WHEN 'enviado' THEN 'Documento enviado'
                            WHEN 'aprovado' THEN 'Documento aprovado'
                            WHEN 'rejeitado' THEN 'Documento rejeitado'
                            ELSE dm.status
                        END as statusDescricao
                    FROM tbDocumentoMatricula dm
                    INNER JOIN tbTipoDocumento td ON dm.tbTipoDocumento_idTipoDocumento = td.idTipoDocumento
                    WHERE (
                        (td.escopo = 'FAMILIA' AND dm.tbFamilia_idtbFamilia =
                            (SELECT r.tbFamilia_idtbFamilia FROM tbResponsavel r WHERE r.tbPessoa_idPessoa = ?)) OR
                        (td.escopo = 'ALUNO' AND dm.tbAluno_idPessoa = ?) OR
                        (td.escopo = 'TODOS_INTEGRANTES' AND dm.tbPessoa_idPessoa = ?)
                    )
                    AND td.ativo = 1
                    ORDER BY td.nome ASC
                    """;

            return jdbcTemplate.query(sql,
                    (rs, rowNum) -> {
                        DocumentoIndividual documento = new DocumentoIndividual();
                        documento.setId(rs.getLong("idDocumentoMatricula"));
                        documento.setIdDocumentoMatricula(rs.getLong("idDocumentoMatricula"));
                        documento.setStatus(rs.getString("status").toLowerCase());
                        documento.setStatusDescricao(rs.getString("statusDescricao"));
                        documento.setNomeArquivo(rs.getString("nomeArquivo"));
                        documento.setObservacoes(rs.getString("observacoes"));
                        documento.setObrigatorio(true); // Assumindo que todos são obrigatórios por agora

                        // Datas
                        if (rs.getTimestamp("dataEnvio") != null) {
                            documento.setDataEnvio(rs.getTimestamp("dataEnvio").toLocalDateTime());
                        }
                        if (rs.getTimestamp("dataAprovacao") != null) {
                            documento.setDataAprovacao(rs.getTimestamp("dataAprovacao").toLocalDateTime());
                        }

                        // Tipo de documento
                        TipoDocumento tipoDocumento = new TipoDocumento(
                                rs.getLong("idTipoDocumento"),
                                rs.getString("nomeDocumento"),
                                rs.getString("descricaoDocumento"),
                                rs.getString("categoria"));
                        documento.setTipoDocumento(tipoDocumento);

                        return documento;
                    }, idResponsavel, idPessoa, idPessoa);

        } catch (Exception e) {
            logger.error("❌ Erro ao buscar documentos da pessoa ID {}: {}", idPessoa, e.getMessage(), e);
            return new ArrayList<>();
        }
    }

    /**
     * Calcula resumo dos documentos
     */
    private ResumoDocumentos calcularResumoDocumentos(List<DocumentoPorPessoa> documentosPorPessoa) {
        int total = 0;
        int pendentes = 0;
        int anexados = 0;
        int aprovados = 0;
        int rejeitados = 0;

        for (DocumentoPorPessoa documentoPorPessoa : documentosPorPessoa) {
            for (DocumentoIndividual documento : documentoPorPessoa.getDocumentos()) {
                total++;
                switch (documento.getStatus().toLowerCase()) {
                    case "pendente":
                        pendentes++;
                        break;
                    case "anexado":
                        anexados++;
                        break;
                    case "aprovado":
                        aprovados++;
                        break;
                    case "rejeitado":
                        rejeitados++;
                        break;
                }
            }
        }

        return new ResumoDocumentos(total, pendentes, anexados, aprovados, rejeitados);
    }

    /**
     * Busca informações básicas do responsável
     */
    public Map<String, Object> buscarInformacoesResponsavel(Long idResponsavel) {
        try {
            String sql = """
                    SELECT
                        p.idPessoa,
                        p.nmPessoa,
                        p.email,
                        p.telefone,
                        p.cpfPessoa as cpf,
                        COUNT(DISTINCT f.idtbFamilia) as totalFamilias,
                        COUNT(DISTINCT r.idResponsavel) as responsavelAtivo
                    FROM tbPessoa p
                    LEFT JOIN tbResponsavel r ON r.tbPessoa_idPessoa = p.idPessoa
                    LEFT JOIN tbFamilia f ON f.idtbFamilia = r.tbFamilia_idtbFamilia
                    WHERE p.idPessoa = ?
                    GROUP BY p.idPessoa, p.nmPessoa, p.email, p.telefone, p.cpfPessoa
                    """;

            return jdbcTemplate.queryForObject(sql, (rs, rowNum) -> {
                Map<String, Object> info = new HashMap<>();
                info.put("id", rs.getLong("idPessoa"));
                info.put("nome", rs.getString("nmPessoa"));
                info.put("email", rs.getString("email"));
                info.put("telefone", rs.getString("telefone"));
                info.put("cpf", rs.getString("cpf"));
                info.put("totalFamilias", rs.getInt("totalFamilias"));
                info.put("responsavelAtivo", rs.getInt("responsavelAtivo"));
                return info;
            }, idResponsavel);

        } catch (Exception e) {
            logger.error("❌ Erro ao buscar informações do responsável ID {}: {}", idResponsavel, e.getMessage(), e);
            return new HashMap<>();
        }
    }

    /**
     * Busca estatísticas dos documentos
     */
    public Map<String, Object> buscarEstatisticasDocumentos(Long idResponsavel) {
        try {
            String sql = """
                    SELECT
                        COUNT(*) as totalDocumentos,
                        COUNT(CASE WHEN dm.status = 'pendente' THEN 1 END) as pendentes,
                        COUNT(CASE WHEN dm.status = 'enviado' THEN 1 END) as anexados,
                        COUNT(CASE WHEN dm.status = 'aprovado' THEN 1 END) as aprovados,
                        COUNT(CASE WHEN dm.status = 'rejeitado' THEN 1 END) as rejeitados,
                        ROUND(
                            (COUNT(CASE WHEN dm.status IN ('aprovado', 'enviado') THEN 1 END) * 100.0) / COUNT(*),
                            2
                        ) as percentualCompleto
                    FROM tbDocumentoMatricula dm
                    INNER JOIN tbResponsavel r ON (dm.tbFamilia_idtbFamilia = r.tbFamilia_idtbFamilia OR
                                                  EXISTS(SELECT 1 FROM tbAluno a WHERE a.idPessoa = dm.tbAluno_idPessoa AND a.tbFamilia_idtbFamilia = r.tbFamilia_idtbFamilia) OR
                                                  EXISTS(SELECT 1 FROM tbIntegranteFamilia if_fam WHERE if_fam.tbPessoa_idPessoa = dm.tbPessoa_idPessoa AND if_fam.tbFamilia_idtbFamilia = r.tbFamilia_idtbFamilia))
                    WHERE r.tbPessoa_idPessoa = ? AND r.ativo = 1
                    """;

            return jdbcTemplate.queryForObject(sql, (rs, rowNum) -> {
                Map<String, Object> estatisticas = new HashMap<>();
                estatisticas.put("totalDocumentos", rs.getInt("totalDocumentos"));
                estatisticas.put("pendentes", rs.getInt("pendentes"));
                estatisticas.put("anexados", rs.getInt("anexados"));
                estatisticas.put("aprovados", rs.getInt("aprovados"));
                estatisticas.put("rejeitados", rs.getInt("rejeitados"));
                estatisticas.put("percentualCompleto", rs.getDouble("percentualCompleto"));
                return estatisticas;
            }, idResponsavel);

        } catch (Exception e) {
            logger.error("❌ Erro ao buscar estatísticas para responsável ID {}: {}", idResponsavel, e.getMessage(), e);
            return new HashMap<>();
        }
    }
}

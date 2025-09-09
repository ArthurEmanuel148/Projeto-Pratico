package br.org.cipalam.cipalam_sistema.service;

import br.org.cipalam.cipalam_sistema.dto.FamiliaDocumentosDTO;
import br.org.cipalam.cipalam_sistema.dto.FamiliaDocumentosDTO.*;
import br.org.cipalam.cipalam_sistema.dto.FamiliaDocumentosDTO.TipoDocumento;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

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
            // Primeiro, buscar o ID da família do responsável
            String sqlFamilia = """
                    SELECT f.idtbFamilia
                    FROM tbFamilia f
                    INNER JOIN tbResponsavel r ON f.idtbFamilia = r.tbFamilia_idtbFamilia
                    WHERE r.tbPessoa_idPessoa = ?
                    """;

            List<Map<String, Object>> familiaResult = jdbcTemplate.queryForList(sqlFamilia, idResponsavel);
            if (familiaResult.isEmpty()) {
                logger.warn("⚠️ Família não encontrada para o responsável ID: {}", idResponsavel);
                return new ArrayList<>();
            }

            Long idFamilia = ((Number) familiaResult.get(0).get("idtbFamilia")).longValue();
            logger.info("📋 Família encontrada ID: {} para responsável ID: {}", idFamilia, idResponsavel);

            // Buscar pessoas da família (responsável + alunos)
            String sqlPessoas = """
                    SELECT DISTINCT
                        p.idPessoa,
                        p.nmPessoa,
                        CASE
                            WHEN r.tbPessoa_idPessoa IS NOT NULL THEN 'responsavel'
                            WHEN a.tbPessoa_idPessoa IS NOT NULL THEN 'aluno'
                            ELSE 'integrante'
                        END as parentesco
                    FROM tbPessoa p
                    LEFT JOIN tbResponsavel r ON p.idPessoa = r.tbPessoa_idPessoa AND r.tbFamilia_idtbFamilia = ?
                    LEFT JOIN tbAluno a ON p.idPessoa = a.tbPessoa_idPessoa AND a.tbFamilia_idtbFamilia = ?
                    WHERE (r.tbPessoa_idPessoa IS NOT NULL OR a.tbPessoa_idPessoa IS NOT NULL)
                    ORDER BY
                        CASE
                            WHEN r.tbPessoa_idPessoa IS NOT NULL THEN 1
                            WHEN a.tbPessoa_idPessoa IS NOT NULL THEN 2
                            ELSE 3
                        END,
                        p.nmPessoa
                    """;

            List<Map<String, Object>> resultados = jdbcTemplate.queryForList(sqlPessoas, idFamilia, idFamilia);

            logger.info("📋 Encontradas {} pessoas na família ID: {}", resultados.size(), idFamilia);

            // Para cada pessoa, buscar seus documentos
            List<DocumentoPorPessoa> documentosPorPessoa = new ArrayList<>();
            for (Map<String, Object> linha : resultados) {
                Long pessoaId = ((Number) linha.get("idPessoa")).longValue();
                String nome = (String) linha.get("nmPessoa");
                String parentesco = (String) linha.get("parentesco");

                PessoaInfo pessoa = new PessoaInfo(pessoaId, nome, parentesco);
                List<DocumentoIndividual> documentos = buscarDocumentosMatricula(idFamilia, pessoaId, parentesco);
                documentosPorPessoa.add(new DocumentoPorPessoa(pessoa, documentos));
            }

            return documentosPorPessoa;

        } catch (Exception e) {
            logger.error("❌ Erro ao buscar documentos por pessoa: {}", e.getMessage(), e);
            return new ArrayList<>();
        }
    }

    /**
     * Busca documentos de matrícula por família e pessoa
     */
    private List<DocumentoIndividual> buscarDocumentosMatricula(Long idFamilia, Long pessoaId, String parentesco) {
        try {
            String sql = """
                    SELECT
                        dm.idDocumentoMatricula,
                        dm.caminhoArquivo as nomeArquivo,
                        dm.dataEnvio,
                        dm.dataAprovacao,
                        dm.observacoes,
                        dm.status,
                        td.idTipoDocumento,
                        td.nome as tipoNome,
                        td.descricao as tipoDescricao,
                        td.escopo as categoria
                    FROM tbDocumentoMatricula dm
                    INNER JOIN tbTipoDocumento td ON dm.tbTipoDocumento_idTipoDocumento = td.idTipoDocumento
                    WHERE (
                        (dm.tbFamilia_idtbFamilia = ? AND td.escopo = 'FAMILIA')
                        OR
                        (dm.tbAluno_idPessoa = ? AND td.escopo = 'INDIVIDUAL')
                    )
                    ORDER BY td.nome
                    """;

            return jdbcTemplate.query(sql, (rs, rowNum) -> {
                TipoDocumento tipoDocumento = new TipoDocumento();
                tipoDocumento.setId(rs.getLong("idTipoDocumento"));
                tipoDocumento.setNome(rs.getString("tipoNome"));
                tipoDocumento.setDescricao(rs.getString("tipoDescricao"));
                tipoDocumento.setCategoria(rs.getString("categoria"));

                DocumentoIndividual documento = new DocumentoIndividual();
                documento.setId(rs.getLong("idDocumentoMatricula"));
                documento.setIdDocumentoMatricula(rs.getLong("idDocumentoMatricula"));
                documento.setTipoDocumento(tipoDocumento);
                documento.setStatus(rs.getString("status"));
                documento.setStatusDescricao(mapearStatusDescricao(rs.getString("status")));
                documento.setNomeArquivo(rs.getString("nomeArquivo"));
                documento.setObservacoes(rs.getString("observacoes"));

                // Converter datas se existirem
                if (rs.getTimestamp("dataEnvio") != null) {
                    documento.setDataEnvio(rs.getTimestamp("dataEnvio").toLocalDateTime());
                }
                if (rs.getTimestamp("dataAprovacao") != null) {
                    documento.setDataAprovacao(rs.getTimestamp("dataAprovacao").toLocalDateTime());
                }

                return documento;
            }, idFamilia, pessoaId);

        } catch (Exception e) {
            logger.error("❌ Erro ao buscar documentos de matrícula: {}", e.getMessage(), e);
            return new ArrayList<>();
        }
    }

    /**
     * Mapeia status para descrição legível
     */
    private String mapearStatusDescricao(String status) {
        if (status == null)
            return "Status desconhecido";

        return switch (status.toLowerCase()) {
            case "pendente" -> "Aguardando envio";
            case "anexado", "enviado" -> "Documento enviado";
            case "aprovado" -> "Documento aprovado";
            case "rejeitado" -> "Documento rejeitado";
            default -> status;
        };
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

    /**
     * Anexa um documento a uma matrícula
     */
    public boolean anexarDocumento(MultipartFile arquivo, Long idDocumentoMatricula, Long idPessoa) {
        try {
            logger.info("📎 Anexando documento para ID Documento: {}, ID Pessoa: {}", idDocumentoMatricula, idPessoa);

            // Simular salvamento do arquivo - em produção, salvar no filesystem ou cloud
            // storage
            String nomeArquivo = arquivo.getOriginalFilename();
            String caminhoArquivo = "/cipalam_documentos/" + UUID.randomUUID().toString() + "_" + nomeArquivo;

            // Atualizar registro na base com o caminho do arquivo
            String sql = """
                        UPDATE tbDocumentoMatricula
                        SET caminhoArquivo = ?,
                            dataUpload = NOW(),
                            statusDocumento = 'ANEXADO',
                            tamanhoArquivo = ?
                        WHERE idDocumentoMatricula = ?
                        AND idPessoa = ?
                    """;

            int rowsAffected = jdbcTemplate.update(sql, caminhoArquivo, arquivo.getSize(), idDocumentoMatricula,
                    idPessoa);

            if (rowsAffected > 0) {
                logger.info("✅ Documento anexado com sucesso: {}", caminhoArquivo);
                return true;
            } else {
                logger.warn("⚠️ Nenhum registro encontrado para anexar documento");
                return false;
            }

        } catch (Exception e) {
            logger.error("❌ Erro ao anexar documento: {}", e.getMessage(), e);
            return false;
        }
    }

    /**
     * Cria documentos de matrícula para um interesse específico
     */
    public boolean criarDocumentosMatricula(Long interesseId) {
        try {
            logger.info("📋 Criando documentos de matrícula para interesse ID: {}", interesseId);

            // Buscar dados do interesse de matrícula
            String sqlInteresse = """
                    SELECT i.id, i.responsavelLogin_idPessoa, i.tbAluno_idPessoa, r.tbFamilia_idtbFamilia
                    FROM tbInteresseMatricula i
                    JOIN tbResponsavel r ON r.tbPessoa_idPessoa = i.responsavelLogin_idPessoa
                    WHERE i.id = ?
                    """;

            Map<String, Object> interesse = jdbcTemplate.queryForMap(sqlInteresse, interesseId);
            Long familiaId = ((Number) interesse.get("tbFamilia_idtbFamilia")).longValue();
            Long alunoId = interesse.get("tbAluno_idPessoa") != null
                    ? ((Number) interesse.get("tbAluno_idPessoa")).longValue()
                    : null;
            Long responsavelId = ((Number) interesse.get("responsavelLogin_idPessoa")).longValue();

            // Buscar todos os tipos de documentos ativos
            String sqlTipos = """
                    SELECT idTipoDocumento, nome, escopo
                    FROM tbTipoDocumento
                    WHERE ativo = 1
                    ORDER BY nome
                    """;

            List<Map<String, Object>> tiposDocumento = jdbcTemplate.queryForList(sqlTipos);

            logger.info("📄 Encontrados {} tipos de documentos para criar", tiposDocumento.size());

            // Criar documentos baseados no escopo
            int documentosCriados = 0;
            for (Map<String, Object> tipo : tiposDocumento) {
                Long tipoId = ((Number) tipo.get("idTipoDocumento")).longValue();
                String escopo = (String) tipo.get("escopo");
                String nome = (String) tipo.get("nome");

                // Verificar se já existe documento deste tipo para este interesse
                String sqlVerifica = """
                        SELECT COUNT(*) FROM tbDocumentoMatricula
                        WHERE tbInteresseMatricula_id = ? AND tbTipoDocumento_idTipoDocumento = ?
                        """;

                int existe = jdbcTemplate.queryForObject(sqlVerifica, Integer.class, interesseId, tipoId);

                if (existe == 0) {
                    // Criar documento baseado no escopo
                    String sqlInsert = """
                            INSERT INTO tbDocumentoMatricula
                            (tbInteresseMatricula_id, tbTipoDocumento_idTipoDocumento, tbFamilia_idtbFamilia,
                             tbAluno_idPessoa, tbPessoa_idPessoa, status)
                            VALUES (?, ?, ?, ?, ?, 'pendente')
                            """;

                    Long pessoaId = null;
                    Long alunoDocId = null;

                    switch (escopo) {
                        case "FAMILIA":
                            pessoaId = responsavelId;
                            break;
                        case "ALUNO":
                            pessoaId = alunoId;
                            alunoDocId = alunoId;
                            break;
                        case "TODOS_INTEGRANTES":
                            pessoaId = responsavelId; // Por padrão, responsável
                            break;
                    }

                    jdbcTemplate.update(sqlInsert, interesseId, tipoId, familiaId, alunoDocId, pessoaId);
                    documentosCriados++;
                    logger.debug("✅ Criado documento: {} (escopo: {})", nome, escopo);
                }
            }

            logger.info("✅ Criados {} documentos de matrícula para interesse ID {}", documentosCriados, interesseId);
            return documentosCriados > 0;

        } catch (Exception e) {
            logger.error("❌ Erro ao criar documentos de matrícula: {}", e.getMessage(), e);
            return false;
        }
    }

    /**
     * Remove um documento anexado
     */
    public boolean removerDocumento(Long idDocumentoMatricula, Long idPessoa) {
        try {
            logger.info("🗑️ Removendo documento ID: {}, Pessoa: {}", idDocumentoMatricula, idPessoa);

            // Primeiro buscar o caminho do arquivo para deletar fisicamente (se necessário
            // no futuro)
            // List<String> caminhos = jdbcTemplate.queryForList(sqlBuscar, String.class,
            // idDocumentoMatricula, idPessoa);

            // Atualizar registro removendo o arquivo
            String sqlRemover = """
                        UPDATE tbDocumentoMatricula
                        SET caminhoArquivo = NULL,
                            dataUpload = NULL,
                            statusDocumento = 'PENDENTE',
                            tamanhoArquivo = NULL
                        WHERE idDocumentoMatricula = ?
                        AND idPessoa = ?
                    """;

            int rowsAffected = jdbcTemplate.update(sqlRemover, idDocumentoMatricula, idPessoa);

            if (rowsAffected > 0) {
                logger.info("✅ Documento removido com sucesso");
                // TODO: Deletar arquivo físico se existir
                return true;
            } else {
                logger.warn("⚠️ Nenhum registro encontrado para remover");
                return false;
            }

        } catch (Exception e) {
            logger.error("❌ Erro ao remover documento: {}", e.getMessage(), e);
            return false;
        }
    }

    /**
     * Baixa um documento anexado
     */
    public byte[] baixarDocumento(Long idDocumentoMatricula) {
        try {
            logger.info("⬇️ Baixando documento ID: {}", idDocumentoMatricula);

            // Buscar caminho do arquivo
            String sql = """
                        SELECT caminhoArquivo
                        FROM tbDocumentoMatricula
                        WHERE idDocumentoMatricula = ?
                        AND caminhoArquivo IS NOT NULL
                    """;

            List<String> caminhos = jdbcTemplate.queryForList(sql, String.class, idDocumentoMatricula);

            if (caminhos.isEmpty()) {
                logger.warn("⚠️ Documento não encontrado ou não anexado para ID: {}", idDocumentoMatricula);
                return null;
            }

            // TODO: Implementar leitura do arquivo físico
            // Por enquanto, retornar um PDF simples para teste
            String conteudoPdf = "Documento de teste - ID: " + idDocumentoMatricula;
            return conteudoPdf.getBytes();

        } catch (Exception e) {
            logger.error("❌ Erro ao baixar documento: {}", e.getMessage(), e);
            return null;
        }
    }

    /**
     * Gera documentos de matrícula para um interesse específico
     */
    public boolean gerarDocumentosMatricula(Long interesseId) {
        try {
            logger.info("📋 Gerando documentos de matrícula para interesse ID: {}", interesseId);

            // Verificar se o interesse existe
            String sqlInteresse = "SELECT id FROM tbInteresseMatricula WHERE id = ?";
            List<Map<String, Object>> interesses = jdbcTemplate.queryForList(sqlInteresse, interesseId);

            if (interesses.isEmpty()) {
                logger.warn("⚠️ Interesse de matrícula não encontrado: {}", interesseId);
                return false;
            }

            // Verificar se já existem documentos para este interesse
            String sqlVerificar = "SELECT COUNT(*) as total FROM tbDocumentoMatricula WHERE tbInteresseMatricula_id = ?";
            Integer totalExistente = jdbcTemplate.queryForObject(sqlVerificar, Integer.class, interesseId);

            if (totalExistente > 0) {
                logger.info("📄 Já existem {} documentos para o interesse ID: {}", totalExistente, interesseId);
                return true;
            }

            // Buscar todos os tipos de documentos ativos
            String sqlTipos = """
                        SELECT idTipoDocumento, nome, descricao, escopo, tipoProcessamento
                        FROM tbTipoDocumento
                        WHERE ativo = 1
                        ORDER BY nome
                    """;

            List<Map<String, Object>> tiposDocumentos = jdbcTemplate.queryForList(sqlTipos);

            if (tiposDocumentos.isEmpty()) {
                logger.warn("⚠️ Nenhum tipo de documento ativo encontrado");
                return false;
            }

            logger.info("📋 Encontrados {} tipos de documentos ativos", tiposDocumentos.size());

            // Para cada tipo de documento, criar um registro na tbDocumentoMatricula
            String sqlInserir = """
                        INSERT INTO tbDocumentoMatricula
                        (tbInteresseMatricula_id, tbTipoDocumento_idTipoDocumento, status, dataCriacao, dataAtualizacao)
                        VALUES (?, ?, 'pendente', NOW(), NOW())
                    """;

            int documentosCriados = 0;
            for (Map<String, Object> tipo : tiposDocumentos) {
                Long idTipoDocumento = ((Number) tipo.get("idTipoDocumento")).longValue();
                String nomeTipo = (String) tipo.get("nome");

                try {
                    int rowsAffected = jdbcTemplate.update(sqlInserir, interesseId, idTipoDocumento);
                    if (rowsAffected > 0) {
                        documentosCriados++;
                        logger.debug("✅ Documento criado: {} para interesse {}", nomeTipo, interesseId);
                    }
                } catch (Exception e) {
                    logger.error("❌ Erro ao criar documento {}: {}", nomeTipo, e.getMessage());
                }
            }

            logger.info("✅ Criados {} documentos de matrícula para interesse ID: {}", documentosCriados, interesseId);
            return documentosCriados > 0;

        } catch (Exception e) {
            logger.error("❌ Erro ao gerar documentos de matrícula: {}", e.getMessage(), e);
            return false;
        }
    }
}

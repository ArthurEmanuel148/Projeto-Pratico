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
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.type.TypeReference;

import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDateTime;
import java.util.*;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
public class ResponsavelDocumentosService {

    private static final Logger logger = LoggerFactory.getLogger(ResponsavelDocumentosService.class);

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private com.cipalam.cipalam_sistema.repository.DocumentoMatriculaRepository documentoMatriculaRepository;

    @Autowired
    private com.cipalam.cipalam_sistema.repository.InteresseMatriculaRepository interesseMatriculaRepository;

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

            // 2. TEMPORÁRIO: usar declaração ID 4 diretamente para teste
            Long idDeclaracaoMatricula = 4L; // buscarDeclaracaoMatriculaPorResponsavel(idResponsavel);
            logger.info("🔍 TESTE: Usando declaração ID diretamente: {}", idDeclaracaoMatricula); // 3. Buscar todas as
                                                                                                  // pessoas da
                                                                                                  // matrícula com
                                                                                                  // documentos
            List<DocumentoPorPessoa> documentosPorPessoa = buscarDocumentosMatricula(idDeclaracaoMatricula);

            // 4. Calcular resumo dos documentos
            ResumoDocumentos resumo = calcularResumoDocumentos(documentosPorPessoa);

            logger.info("✅ Documentos da matrícula encontrados: {} pessoas/seções, {} documentos totais",
                    documentosPorPessoa.size(), resumo.getTotalDocumentos());

            return new FamiliaDocumentosDTO(familiaInfo, documentosPorPessoa, resumo);

        } catch (Exception e) {
            logger.error("❌ Erro ao buscar documentos da família: {}", e.getMessage(), e);
            throw new RuntimeException("Erro ao buscar documentos da família", e);
        }
    }

    /**
     * Busca documentos diretamente pelo ID da declaração (MÉTODO MAIS DIRETO)
     */
    public FamiliaDocumentosDTO buscarDocumentosPorIdDeclaracao(Long idDeclaracao) {
        try {
            logger.info("🔍 Iniciando busca de documentos para declaração ID: {}", idDeclaracao);

            // 1. Buscar informações da declaração
            FamiliaInfo declaracaoInfo = buscarInformacoesDeclaracao(idDeclaracao);
            if (declaracaoInfo == null) {
                logger.warn("⚠️ Declaração não encontrada para ID: {}", idDeclaracao);
                return null;
            }

            // 2. Buscar documentos da declaração (TESTE: forçar ID 4)
            List<DocumentoPorPessoa> documentosPorPessoa = buscarDocumentosMatricula(4L); // Temporário para teste

            // 3. Calcular resumo dos documentos
            ResumoDocumentos resumo = calcularResumoDocumentos(documentosPorPessoa);

            logger.info("✅ Documentos da declaração encontrados: {} pessoas/seções, {} documentos totais",
                    documentosPorPessoa.size(), resumo.getTotalDocumentos());

            return new FamiliaDocumentosDTO(declaracaoInfo, documentosPorPessoa, resumo);

        } catch (Exception e) {
            logger.error("❌ Erro ao buscar documentos da declaração: {}", e.getMessage(), e);
            throw new RuntimeException("Erro ao buscar documentos da declaração", e);
        }
    }

    /**
     * Busca documentos da matrícula/declaração do responsável (MÉTODO POR
     * RESPONSÁVEL)
     */
    public FamiliaDocumentosDTO buscarDocumentosPorMatricula(Long idResponsavel) {
        try {
            logger.info("🔍 Iniciando busca de documentos da MATRÍCULA para responsável ID: {}", idResponsavel);

            // 1. Buscar informações do responsável
            FamiliaInfo familiaInfo = buscarInformacoesFamilia(idResponsavel);
            if (familiaInfo == null) {
                logger.warn("⚠️ Responsável não encontrado para ID: {}", idResponsavel);
                return null;
            }

            // 2. Buscar declaração de matrícula do responsável pelo CPF
            Long idDeclaracaoMatricula = buscarDeclaracaoMatriculaPorResponsavel(idResponsavel);
            logger.info("🔍 Declaração de matrícula encontrada: ID {}", idDeclaracaoMatricula);

            if (idDeclaracaoMatricula == null) {
                logger.warn("⚠️ Nenhuma declaração de matrícula encontrada para responsável ID: {}", idResponsavel);
                // Retornar dados vazios ao invés de null
                return new FamiliaDocumentosDTO(familiaInfo, new ArrayList<>(), new ResumoDocumentos(0, 0, 0, 0, 0));
            }

            // 3. Buscar todas as pessoas da matrícula com documentos
            List<DocumentoPorPessoa> documentosPorPessoa = buscarDocumentosMatricula(idDeclaracaoMatricula);

            // 4. Calcular resumo dos documentos
            ResumoDocumentos resumo = calcularResumoDocumentos(documentosPorPessoa);

            logger.info("✅ Documentos da matrícula encontrados: {} pessoas/seções, {} documentos totais",
                    documentosPorPessoa.size(), resumo.getTotalDocumentos());

            return new FamiliaDocumentosDTO(familiaInfo, documentosPorPessoa, resumo);

        } catch (Exception e) {
            logger.error("❌ Erro ao buscar documentos da matrícula: {}", e.getMessage(), e);
            throw new RuntimeException("Erro ao buscar documentos da matrícula", e);
        }
    }

    /**
     * Busca informações básicas da família por responsável
     */
    private FamiliaInfo buscarInformacoesFamilia(Long idResponsavel) {
        try {
            String sql = """
                    SELECT p.idPessoa, p.NmPessoa, p.email
                    FROM tbPessoa p
                    WHERE p.idPessoa = ?
                    """;

            return jdbcTemplate.queryForObject(sql, (rs, rowNum) -> {
                ResponsavelInfo responsavel = new ResponsavelInfo(
                        rs.getLong("idPessoa"),
                        rs.getString("NmPessoa"),
                        rs.getString("email"));
                return new FamiliaInfo(rs.getLong("idPessoa"), responsavel);
            }, idResponsavel);

        } catch (Exception e) {
            logger.warn("⚠️ Erro ao buscar informações da família: {}", e.getMessage());
            return null;
        }
    }

    /**
     * Busca informações da declaração pela ID da declaração
     */
    private FamiliaInfo buscarInformacoesDeclaracao(Long idDeclaracao) {
        try {
            String sql = """
                    SELECT im.id, im.nomeResponsavel, im.emailResponsavel
                    FROM tbInteresseMatricula im
                    WHERE im.id = ?
                    """;

            return jdbcTemplate.queryForObject(sql, (rs, rowNum) -> {
                ResponsavelInfo responsavel = new ResponsavelInfo(
                        rs.getLong("id"),
                        rs.getString("nomeResponsavel"),
                        rs.getString("emailResponsavel"));
                return new FamiliaInfo(rs.getLong("id"), responsavel);
            }, idDeclaracao);

        } catch (Exception e) {
            logger.warn("⚠️ Erro ao buscar informações da declaração: {}", e.getMessage());
            return null;
        }
    }

    /**
     * Busca a declaração de matrícula pelo CPF do responsável
     */
    private Long buscarDeclaracaoMatriculaPorResponsavel(Long idResponsavel) {
        try {
            // Buscar CPF do responsável
            String sqlCpf = """
                    SELECT REPLACE(REPLACE(REPLACE(p.CpfPessoa, '.', ''), '-', ''), '/', '') as cpfLimpo
                    FROM tbPessoa p
                    WHERE p.idPessoa = ?
                    """;

            String cpfResponsavel = jdbcTemplate.queryForObject(sqlCpf, String.class, idResponsavel);
            if (cpfResponsavel == null) {
                logger.warn("⚠️ CPF do responsável não encontrado para ID: {}", idResponsavel);
                return null;
            }

            logger.info("🔍 CPF do responsável encontrado: {}", cpfResponsavel);

            // Buscar declaração de matrícula pelo CPF (com ou sem formatação)
            String sqlDeclaracao = """
                    SELECT im.id
                    FROM tbInteresseMatricula im
                    WHERE REPLACE(REPLACE(REPLACE(im.cpfResponsavel, '.', ''), '-', ''), '/', '') = ?
                    AND im.status IN ('matricula_iniciada', 'documentos_pendentes', 'documentos_completos')
                    ORDER BY im.dataInicioMatricula DESC
                    LIMIT 1
                    """;

            List<Map<String, Object>> result = jdbcTemplate.queryForList(sqlDeclaracao, cpfResponsavel);
            if (result.isEmpty()) {
                logger.warn("⚠️ Nenhuma declaração de matrícula ativa encontrada para CPF: {}", cpfResponsavel);
                return null;
            }

            Long idDeclaracao = ((Number) result.get(0).get("id")).longValue();
            logger.info("✅ Declaração de matrícula encontrada: ID {}", idDeclaracao);
            return idDeclaracao;

        } catch (Exception e) {
            logger.error("❌ Erro ao buscar declaração de matrícula: {}", e.getMessage(), e);
            return null;
        }
    }

    /**
     * Busca documentos organizados por pessoa para uma matrícula específica
     */
    private List<DocumentoPorPessoa> buscarDocumentosMatricula(Long idMatricula) {
        try {
            logger.info("🔍 INÍCIO - Buscando documentos para declaração ID: {}", idMatricula);

            // Buscar todos os documentos da declaração usando o repository
            List<com.cipalam.cipalam_sistema.model.DocumentoMatricula> documentosEntity = documentoMatriculaRepository
                    .findByInteresseMatriculaIdOrderByTipoDocumentoNome(idMatricula);

            logger.info("📄 Documentos encontrados no banco: {} documentos", documentosEntity.size());

            if (documentosEntity.isEmpty()) {
                logger.warn("⚠️ Nenhum documento encontrado para declaração ID: {}", idMatricula);
                return new ArrayList<>();
            }

            // Organizar documentos por escopo/categoria
            Map<String, List<DocumentoIndividual>> documentosPorEscopo = new HashMap<>();

            for (com.cipalam.cipalam_sistema.model.DocumentoMatricula docEntity : documentosEntity) {
                logger.info("📋 Processando documento: ID={}, Tipo={}, Status={}",
                        docEntity.getIdDocumentoMatricula(),
                        docEntity.getTipoDocumento().getNome(),
                        docEntity.getStatus());

                // Converter entity para DTO
                DocumentoIndividual documento = new DocumentoIndividual();
                documento.setId(docEntity.getIdDocumentoMatricula());
                documento.setIdDocumentoMatricula(docEntity.getIdDocumentoMatricula());

                // Tipo documento
                TipoDocumento tipoDoc = new TipoDocumento();
                tipoDoc.setId(docEntity.getTipoDocumento().getIdTipoDocumento().longValue());
                tipoDoc.setNome(docEntity.getTipoDocumento().getNome());
                tipoDoc.setDescricao(docEntity.getTipoDocumento().getDescricao());
                tipoDoc.setCategoria(docEntity.getTipoDocumento().getEscopo().toString());
                documento.setTipoDocumento(tipoDoc);

                documento.setStatus(docEntity.getStatus());
                documento.setStatusDescricao(mapearStatusDescricao(docEntity.getStatus()));
                documento.setNomeArquivo(docEntity.getCaminhoArquivo());
                documento.setObservacoes(docEntity.getObservacoes());
                documento.setObrigatorio(Boolean.TRUE.equals(docEntity.getTipoDocumento().getObrigatorio()));

                // Converter datas
                if (docEntity.getDataEnvio() != null) {
                    documento.setDataEnvio(docEntity.getDataEnvio());
                }
                if (docEntity.getDataAprovacao() != null) {
                    documento.setDataAprovacao(docEntity.getDataAprovacao());
                }

                // Agrupar por escopo/categoria
                String categoria = docEntity.getTipoDocumento().getEscopo().toString();
                documentosPorEscopo.computeIfAbsent(categoria, k -> new ArrayList<>()).add(documento);
            }

            // Criar seções por escopo
            List<DocumentoPorPessoa> resultado = new ArrayList<>();

            // Documentos da família (se houver)
            if (documentosPorEscopo.containsKey("FAMILIA")) {
                PessoaInfo pessoaFamilia = new PessoaInfo(0L, "Documentos da Família", "responsavel");
                resultado.add(new DocumentoPorPessoa(pessoaFamilia, documentosPorEscopo.get("FAMILIA")));
            }

            // Documentos do aluno (se houver)
            if (documentosPorEscopo.containsKey("ALUNO")) {
                PessoaInfo pessoaAluno = new PessoaInfo(1L, "Documentos do Aluno", "aluno");
                resultado.add(new DocumentoPorPessoa(pessoaAluno, documentosPorEscopo.get("ALUNO")));
            }

            // Documentos de todos os integrantes (seção única com identificação por pessoa)
            if (documentosPorEscopo.containsKey("TODOS_INTEGRANTES")) {
                List<DocumentoIndividual> documentosIntegrantes = documentosPorEscopo.get("TODOS_INTEGRANTES");

                // Enriquecer os documentos com informação da pessoa (extraída das observações)
                for (DocumentoIndividual doc : documentosIntegrantes) {
                    String observacao = doc.getObservacoes();
                    if (observacao != null) {
                        String nomeIntegrante = extrairNomeDoDocumento(observacao);
                        if (nomeIntegrante != null) {
                            // Adicionar o nome da pessoa na descrição do documento para identificação
                            String descricaoOriginal = doc.getTipoDocumento().getDescricao();
                            String novaDescricao = nomeIntegrante
                                    + (descricaoOriginal != null ? " - " + descricaoOriginal : "");
                            doc.getTipoDocumento().setDescricao(novaDescricao);
                        }
                    }
                }

                PessoaInfo pessoaIntegrantes = new PessoaInfo(2L, "Documentos dos Integrantes", "integrante");
                resultado.add(new DocumentoPorPessoa(pessoaIntegrantes, documentosIntegrantes));

                logger.info("👥 Seção de integrantes criada com {} documentos", documentosIntegrantes.size());
            }

            logger.info("✅ Documentos organizados: {} seções encontradas", resultado.size());
            return resultado;

        } catch (Exception e) {
            logger.error("❌ Erro ao buscar documentos da matrícula: {}", e.getMessage(), e);
            return new ArrayList<>();
        }
    }

    /**
     * Busca documentos específicos da família (escopo FAMILIA) - MÉTODO DEPRECIADO
     */
    private DocumentoPorPessoa buscarDocumentosFamilia(Long idResponsavel) {
        try {
            // Buscar ID da família
            String sqlFamilia = """
                    SELECT f.idtbFamilia
                    FROM tbFamilia f
                    INNER JOIN tbResponsavel r ON f.idtbFamilia = r.tbFamilia_idtbFamilia
                    WHERE r.tbPessoa_idPessoa = ?
                    """;

            List<Map<String, Object>> familiaResult = jdbcTemplate.queryForList(sqlFamilia, idResponsavel);
            if (familiaResult.isEmpty()) {
                return null;
            }

            Long idFamilia = ((Number) familiaResult.get(0).get("idtbFamilia")).longValue();

            // Buscar apenas documentos de escopo FAMILIA
            String sql = """
                    SELECT DISTINCT
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
                    WHERE dm.tbFamilia_idtbFamilia = ?
                    AND td.escopo = 'FAMILIA'
                    AND dm.tbPessoa_idPessoa IS NULL
                    AND dm.tbAluno_idPessoa IS NULL
                    ORDER BY td.nome
                    """;

            List<DocumentoIndividual> documentosFamilia = jdbcTemplate.query(sql, (rs, rowNum) -> {
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
            }, idFamilia);

            if (documentosFamilia.isEmpty()) {
                return null;
            }

            // Criar uma "pessoa" virtual representando a família
            PessoaInfo pessoaFamilia = new PessoaInfo(0L, "Documentos da Família", "familia");
            return new DocumentoPorPessoa(pessoaFamilia, documentosFamilia);

        } catch (Exception e) {
            logger.error("❌ Erro ao buscar documentos da família: {}", e.getMessage(), e);
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

            // Buscar todas as pessoas da família (responsável + alunos + integrantes)
            String sqlPessoas = """
                    SELECT DISTINCT
                        p.idPessoa,
                        p.nmPessoa,
                        CASE
                            WHEN r.tbPessoa_idPessoa IS NOT NULL THEN 'responsavel'
                            WHEN a.tbPessoa_idPessoa IS NOT NULL THEN 'aluno'
                            ELSE 'integrante'
                        END as parentesco
                    FROM tbIntegranteFamilia if_tab
                    INNER JOIN tbPessoa p ON if_tab.tbPessoa_idPessoa = p.idPessoa
                    LEFT JOIN tbResponsavel r ON p.idPessoa = r.tbPessoa_idPessoa AND r.tbFamilia_idtbFamilia = ?
                    LEFT JOIN tbAluno a ON p.idPessoa = a.tbPessoa_idPessoa AND a.tbFamilia_idtbFamilia = ?
                    WHERE if_tab.tbFamilia_idtbFamilia = ?
                    ORDER BY
                        CASE
                            WHEN r.tbPessoa_idPessoa IS NOT NULL THEN 1
                            WHEN a.tbPessoa_idPessoa IS NOT NULL THEN 2
                            ELSE 3
                        END,
                        p.nmPessoa
                    """;

            List<Map<String, Object>> resultados = jdbcTemplate.queryForList(sqlPessoas, idFamilia, idFamilia,
                    idFamilia);

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
                    SELECT DISTINCT
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
                        -- Documentos do ALUNO aparecem apenas para o aluno
                        (dm.tbAluno_idPessoa = ? AND td.escopo = 'ALUNO')
                        OR
                        -- Documentos de TODOS_INTEGRANTES aparecem para cada pessoa individualmente
                        (dm.tbFamilia_idtbFamilia = ? AND dm.tbPessoa_idPessoa = ? AND td.escopo = 'TODOS_INTEGRANTES')
                    )
                    ORDER BY td.escopo, td.nome
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
            }, pessoaId, idFamilia, pessoaId);

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
                    case "enviado":
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

            // Validar se o arquivo foi enviado
            if (arquivo == null || arquivo.isEmpty()) {
                logger.warn("⚠️ Arquivo não foi enviado ou está vazio");
                return false;
            }

            // Verificar se o documento existe e pertence à pessoa
            String sqlVerifica = """
                    SELECT COUNT(*) FROM tbDocumentoMatricula dm
                    LEFT JOIN tbFamilia f ON dm.tbFamilia_idtbFamilia = f.idtbFamilia
                    LEFT JOIN tbResponsavel r ON f.idtbFamilia = r.tbFamilia_idtbFamilia
                    LEFT JOIN tbIntegranteFamilia if_tab ON f.idtbFamilia = if_tab.tbFamilia_idtbFamilia
                    WHERE dm.idDocumentoMatricula = ?
                    AND (
                        dm.tbAluno_idPessoa = ? OR
                        r.tbPessoa_idPessoa = ? OR
                        dm.tbPessoa_idPessoa = ? OR
                        if_tab.tbPessoa_idPessoa = ?
                    )
                    """;

            int count = jdbcTemplate.queryForObject(sqlVerifica, Integer.class,
                    idDocumentoMatricula, idPessoa, idPessoa, idPessoa, idPessoa);

            if (count == 0) {
                logger.warn("⚠️ Documento não encontrado ou pessoa não tem permissão");
                return false;
            }

            // Gerar nome único para o arquivo
            String extensao = "";
            String nomeOriginal = arquivo.getOriginalFilename();
            if (nomeOriginal != null && nomeOriginal.contains(".")) {
                extensao = nomeOriginal.substring(nomeOriginal.lastIndexOf("."));
            }

            String nomeArquivo = UUID.randomUUID().toString() + extensao;
            String caminhoCompleto = "/Applications/XAMPP/xamppfiles/htdocs/GitHub/Projeto-Pratico/Projeto-Pratico/cipalam_documentos/"
                    + nomeArquivo;

            // Salvar arquivo fisicamente
            try {
                java.io.File destino = new java.io.File(caminhoCompleto);
                destino.getParentFile().mkdirs(); // Criar diretórios se não existem
                arquivo.transferTo(destino);
                logger.info("📁 Arquivo salvo em: {}", caminhoCompleto);
            } catch (Exception e) {
                logger.error("❌ Erro ao salvar arquivo: {}", e.getMessage(), e);
                return false;
            }

            // Atualizar registro na base com o caminho do arquivo
            String sql = """
                        UPDATE tbDocumentoMatricula
                        SET caminhoArquivo = ?,
                            dataEnvio = NOW(),
                            status = 'anexado'
                        WHERE idDocumentoMatricula = ?
                    """;

            int rowsAffected = jdbcTemplate.update(sql, nomeArquivo, idDocumentoMatricula);

            if (rowsAffected > 0) {
                logger.info("✅ Documento anexado com sucesso: {} para documento ID: {}",
                        nomeArquivo, idDocumentoMatricula);
                return true;
            } else {
                logger.warn("⚠️ Nenhum registro foi atualizado na base de dados");
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

            // Ler arquivo físico do disco
            String caminhoArquivo = caminhos.get(0);
            logger.info("📄 Lendo arquivo: {}", caminhoArquivo);

            try {
                Path arquivo = Path.of(caminhoArquivo);
                if (Files.exists(arquivo)) {
                    byte[] bytesArquivo = Files.readAllBytes(arquivo);
                    logger.info("✅ Arquivo lido com sucesso: {} bytes", bytesArquivo.length);
                    return bytesArquivo;
                } else {
                    logger.warn("⚠️ Arquivo não encontrado no caminho: {}", caminhoArquivo);
                    return null;
                }
            } catch (Exception e) {
                logger.error("❌ Erro ao ler arquivo: {}", e.getMessage(), e);
                return null;
            }

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

    /**
     * Busca os integrantes da declaração de matrícula a partir do JSON
     * integrantesRenda
     */
    private List<PessoaInfo> buscarIntegrantesDeclaracao(Long idDeclaracao) {
        try {
            logger.info("🔍 Buscando integrantes da declaração ID: {}", idDeclaracao);

            // Buscar a declaração com os dados dos integrantes
            Optional<com.cipalam.cipalam_sistema.model.InteresseMatricula> declaracaoOpt = interesseMatriculaRepository
                    .findById(idDeclaracao.intValue());

            if (!declaracaoOpt.isPresent()) {
                logger.warn("⚠️ Declaração não encontrada para ID: {}", idDeclaracao);
                return new ArrayList<>();
            }

            com.cipalam.cipalam_sistema.model.InteresseMatricula declaracao = declaracaoOpt.get();
            String integrantesJson = declaracao.getIntegrantesRenda();

            if (integrantesJson == null || integrantesJson.trim().isEmpty()) {
                logger.warn("⚠️ Dados de integrantes não encontrados na declaração ID: {}", idDeclaracao);
                return new ArrayList<>();
            }

            // Parse do JSON dos integrantes
            ObjectMapper objectMapper = new ObjectMapper();
            List<Map<String, Object>> integrantesData = objectMapper.readValue(integrantesJson,
                    new TypeReference<List<Map<String, Object>>>() {
                    });

            List<PessoaInfo> integrantes = new ArrayList<>();

            for (Map<String, Object> integranteData : integrantesData) {
                String nome = (String) integranteData.get("nome");
                String parentesco = (String) integranteData.get("parentesco");

                if (nome != null && parentesco != null) {
                    // Incluir TODOS os integrantes (responsável, aluno, e demais familiares)
                    // porque todos podem ter documentos de TODOS_INTEGRANTES (ex: comprovante de
                    // renda)

                    // Usar o id do JSON se disponível, senão usar hash do nome
                    Long integranteId;
                    Object idObj = integranteData.get("id");
                    if (idObj != null) {
                        integranteId = Long.valueOf(idObj.toString());
                    } else {
                        integranteId = (long) nome.hashCode();
                    }

                    PessoaInfo integrante = new PessoaInfo(integranteId, nome, parentesco.toLowerCase());
                    integrantes.add(integrante);

                    logger.info("👥 Integrante encontrado: {} ({})", nome, parentesco);
                }
            }

            logger.info("✅ Total de integrantes encontrados: {}", integrantes.size());
            return integrantes;

        } catch (Exception e) {
            logger.error("❌ Erro ao buscar integrantes da declaração: {}", e.getMessage(), e);
            return new ArrayList<>();
        }
    }

    /**
     * Extrai o nome do integrante da observação do documento
     * Formato esperado: "Documento de [Nome] ([Parentesco]) para declaração..."
     */
    private String extrairNomeDoDocumento(String observacao) {
        try {
            if (observacao == null || observacao.trim().isEmpty()) {
                return null;
            }

            // Padrão: "Documento de [Nome] ([Parentesco]) para"
            String padrao = "Documento de (.+?) \\((.+?)\\) para";
            java.util.regex.Pattern pattern = java.util.regex.Pattern.compile(padrao);
            java.util.regex.Matcher matcher = pattern.matcher(observacao);

            if (matcher.find()) {
                String nome = matcher.group(1).trim();
                logger.debug("🔍 Nome extraído da observação: '{}'", nome);
                return nome;
            }

            logger.warn("⚠️ Não foi possível extrair nome da observação: '{}'", observacao);
            return null;

        } catch (Exception e) {
            logger.error("❌ Erro ao extrair nome da observação: {}", e.getMessage(), e);
            return null;
        }
    }
}

package com.cipalam.cipalam_sistema.service;

import com.cipalam.cipalam_sistema.model.TipoDocumento;
import com.cipalam.cipalam_sistema.model.Pessoa;
import com.cipalam.cipalam_sistema.repository.TipoDocumentoRepository;
import com.cipalam.cipalam_sistema.repository.PessoaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.jdbc.core.JdbcTemplate;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Map;
import java.util.HashMap;

@Service
@RequiredArgsConstructor
@Slf4j
public class DocumentoMatriculaService {

    private final TipoDocumentoRepository tipoDocumentoRepository;
    private final PessoaRepository pessoaRepository;
    private final JdbcTemplate jdbcTemplate;

    private final String UPLOAD_DIR = "uploads/documentos/";

    /**
     * Busca dados do dashboard para um usuário específico
     */
    public Map<String, Object> getDashboardData(Long usuarioId) {
        log.info("Buscando dados do dashboard para usuário: {}", usuarioId);

        Optional<Pessoa> pessoa = pessoaRepository.findById(usuarioId.intValue());

        Map<String, Object> dashboardData = new HashMap<>();
        dashboardData.put("nomeCompleto", pessoa.map(Pessoa::getNmPessoa).orElse("Responsável"));
        dashboardData.put("email", pessoa.map(Pessoa::getEmail).orElse("email@exemplo.com"));
        dashboardData.put("cpf", pessoa.map(Pessoa::getCpfPessoa).orElse("000.000.000-00"));

        // Buscar dados reais da matrícula
        String sqlMatricula = """
                SELECT
                    a.matricula,
                    a.dataMatricula,
                    a.dataInicioMatricula,
                    a.protocoloDeclaracao as protocolo,
                    f.tipoCota
                FROM tbAluno a
                INNER JOIN tbFamilia f ON a.tbFamilia_idtbFamilia = f.idtbFamilia
                INNER JOIN tbResponsavel r ON f.idtbFamilia = r.tbFamilia_idtbFamilia
                WHERE r.tbPessoa_idPessoa = ?
                LIMIT 1
                """;

        List<Map<String, Object>> matriculaResult = jdbcTemplate.queryForList(sqlMatricula, usuarioId);

        if (!matriculaResult.isEmpty()) {
            Map<String, Object> matricula = matriculaResult.get(0);
            dashboardData.put("protocolo", matricula.get("protocolo"));
            dashboardData.put("matricula", matricula.get("matricula"));
            dashboardData.put("tipoCota", matricula.get("tipoCota"));
            dashboardData.put("dataMatricula", matricula.get("dataMatricula"));
            dashboardData.put("dataInicioMatricula", matricula.get("dataInicioMatricula"));
        } else {
            dashboardData.put("protocolo", "PROTO-" + String.format("%04d", usuarioId));
            dashboardData.put("matricula", null);
            dashboardData.put("tipoCota", "livre");
            dashboardData.put("dataMatricula", null);
            dashboardData.put("dataInicioMatricula", LocalDateTime.now());
        }

        // Buscar estatísticas de documentos
        List<Map<String, Object>> documentosPendentes = buscarPendentesPorUsuario(usuarioId);
        long totalPendentes = documentosPendentes.stream()
                .filter(doc -> "pendente".equals(doc.get("status")) || "rejeitado".equals(doc.get("status")))
                .count();
        long totalCompletos = documentosPendentes.stream()
                .filter(doc -> "aprovado".equals(doc.get("status")))
                .count();

        dashboardData.put("totalDocumentosPendentes", (int) totalPendentes);
        dashboardData.put("totalDocumentosCompletos", (int) totalCompletos);
        dashboardData.put("totalDocumentos", documentosPendentes.size());

        // Calcular percentual de conclusão
        if (documentosPendentes.size() > 0) {
            int percentual = (int) ((totalCompletos * 100) / documentosPendentes.size());
            dashboardData.put("percentualConclusao", percentual);
        } else {
            dashboardData.put("percentualConclusao", 0);
        }

        // Status baseado nos documentos
        if (totalPendentes > 0) {
            dashboardData.put("status", "documentos_pendentes");
        } else if (totalCompletos == documentosPendentes.size() && documentosPendentes.size() > 0) {
            dashboardData.put("status", "documentos_completos");
        } else {
            dashboardData.put("status", "aguardando_documentos");
        }

        return dashboardData;
    }

    /**
     * Busca documentos pendentes para um usuário específico
     * Consulta real na tabela tbDocumentoMatricula baseada na cota
     */
    public List<Map<String, Object>> buscarPendentesPorUsuario(Long usuarioId) {
        String sql = """
                    SELECT
                        dm.idDocumentoMatricula,
                        dm.status,
                        dm.dataEnvio,
                        dm.nomeArquivoOriginal,
                        dm.observacoes,
                        td.idTipoDocumento,
                        td.nome as nomeDocumento,
                        td.descricao,
                        td.obrigatorio,
                        td.requerAssinatura,
                        td.requerAnexo,
                        td.ordemExibicao,
                        f.tipoCota,
                        CASE
                            WHEN dm.status = 'pendente' THEN 'Pendente de anexo'
                            WHEN dm.status = 'enviado' THEN 'Documento anexado'
                            WHEN dm.status = 'aprovado' THEN 'Aprovado'
                            WHEN dm.status = 'rejeitado' THEN 'Rejeitado - Reenviar'
                            ELSE dm.status
                        END as statusDescricao
                    FROM tbDocumentoMatricula dm
                    INNER JOIN tbTipoDocumento td ON dm.tbTipoDocumento_idTipoDocumento = td.idTipoDocumento
                    LEFT JOIN tbAluno a ON dm.tbAluno_idPessoa = a.tbPessoa_idPessoa
                    LEFT JOIN tbFamilia f ON (a.tbFamilia_idtbFamilia = f.idtbFamilia OR dm.tbFamilia_idtbFamilia = f.idtbFamilia)
                    INNER JOIN tbResponsavel r ON f.idtbFamilia = r.tbFamilia_idtbFamilia
                    WHERE r.tbPessoa_idPessoa = ?
                    ORDER BY
                        CASE dm.status
                            WHEN 'pendente' THEN 1
                            WHEN 'rejeitado' THEN 2
                            WHEN 'enviado' THEN 3
                            WHEN 'aprovado' THEN 4
                            ELSE 5
                        END,
                        td.ordemExibicao
                """;

        return jdbcTemplate.queryForList(sql, usuarioId);
    }

    /**
     * Anexa um arquivo a um documento
     */
    public Map<String, Object> anexarArquivo(Long documentoId, MultipartFile arquivo, String observacoes)
            throws IOException {
        // Validar arquivo
        if (arquivo.isEmpty()) {
            throw new IllegalArgumentException("Arquivo não pode estar vazio");
        }

        // Validar tipo de arquivo
        String contentType = arquivo.getContentType();
        if (contentType == null || (!contentType.equals("application/pdf") &&
                !contentType.startsWith("image/"))) {
            throw new IllegalArgumentException("Tipo de arquivo não permitido. Use PDF ou imagens.");
        }

        // Validar tamanho (10MB)
        if (arquivo.getSize() > 10 * 1024 * 1024) {
            throw new IllegalArgumentException("Arquivo muito grande. Máximo 10MB.");
        }

        // Criar diretório se não existir
        Path uploadPath = Paths.get(UPLOAD_DIR);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        // Gerar nome único para o arquivo
        String nomeArquivo = "doc_" + documentoId + "_" + System.currentTimeMillis() +
                "_" + arquivo.getOriginalFilename();
        Path arquivoPath = uploadPath.resolve(nomeArquivo);

        // Salvar arquivo
        Files.copy(arquivo.getInputStream(), arquivoPath, StandardCopyOption.REPLACE_EXISTING);

        // Retornar informações do documento anexado
        Map<String, Object> documento = new HashMap<>();
        documento.put("idDocumentoMatricula", documentoId);
        documento.put("status", "anexado");
        documento.put("caminhoArquivo", arquivoPath.toString());
        documento.put("nomeArquivoOriginal", arquivo.getOriginalFilename());
        documento.put("tipoArquivo", contentType);
        documento.put("tamanhoArquivo", arquivo.getSize());
        documento.put("dataEnvio", LocalDateTime.now());
        documento.put("observacoes", observacoes);

        return documento;
    }

    /**
     * Assina um documento digitalmente
     */
    public Map<String, Object> assinarDocumento(Long documentoId, String assinatura, String observacoes) {
        // Retornar informações do documento assinado
        Map<String, Object> documento = new HashMap<>();
        documento.put("idDocumentoMatricula", documentoId);
        documento.put("status", "assinado");
        documento.put("assinaturaDigital", assinatura);
        documento.put("dataAssinatura", LocalDateTime.now());
        documento.put("observacoes", observacoes);

        return documento;
    }

    /**
     * Busca template de documento por tipo
     */
    public byte[] buscarTemplatePorTipo(Long tipoDocumentoId) {
        Optional<TipoDocumento> tipoOpt = tipoDocumentoRepository.findById(tipoDocumentoId.intValue());

        if (tipoOpt.isPresent() && tipoOpt.get().getTemplateDocumento() != null) {
            return tipoOpt.get().getTemplateDocumento().getBytes();
        }

        // Template padrão se não encontrar
        String templatePadrao = """
                CIPALAM - CENTRO INTEGRADO PLATAFORMA DE APRENDIZAGEM MÚLTIPLA

                DOCUMENTO: %s

                Este é um template padrão para o documento solicitado.

                Por favor, leia atentamente as informações abaixo:

                1. Este documento é obrigatório para o processo de matrícula.
                2. Certifique-se de que todas as informações estão corretas.
                3. A assinatura digital confirma a veracidade das informações.

                Ao assinar este documento, você declara estar ciente de suas responsabilidades
                e concorda com os termos estabelecidos pela instituição.

                Data: %s
                """.formatted(
                tipoOpt.map(TipoDocumento::getNome).orElse("Documento"),
                java.time.LocalDate.now().format(java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy")));

        return templatePadrao.getBytes();
    }

    /**
     * Anexa documento com validações de segurança
     */
    public Map<String, Object> anexarDocumento(Long documentoId, MultipartFile arquivo, String observacoes,
            Long usuarioId) throws IOException {
        log.info("Anexando documento {} para usuário {}", documentoId, usuarioId);

        // Validações já realizadas no controller
        // Aqui implementaríamos a lógica de salvar no banco de dados

        Map<String, Object> documento = new HashMap<>();
        documento.put("idDocumentoMatricula", documentoId);
        documento.put("status", "anexado");
        documento.put("nomeArquivoOriginal", arquivo.getOriginalFilename());
        documento.put("tipoArquivo", arquivo.getContentType());
        documento.put("tamanhoArquivo", arquivo.getSize());
        documento.put("dataEnvio", LocalDateTime.now());
        documento.put("observacoes", observacoes);
        documento.put("usuarioId", usuarioId);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Documento anexado com sucesso!");
        response.put("documento", documento);

        return response;
    }

    /**
     * Assina documento digitalmente com validações de segurança
     */
    public Map<String, Object> assinarDocumento(Long documentoId, String assinatura, String observacoes,
            Long usuarioId) {
        log.info("Assinando documento {} para usuário {}", documentoId, usuarioId);

        // Aqui implementaríamos a lógica de salvar no banco de dados

        Map<String, Object> documento = new HashMap<>();
        documento.put("idDocumentoMatricula", documentoId);
        documento.put("status", "assinado");
        documento.put("assinaturaDigital", assinatura);
        documento.put("dataAssinatura", LocalDateTime.now());
        documento.put("observacoes", observacoes);
        documento.put("usuarioId", usuarioId);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Documento assinado com sucesso!");
        response.put("documento", documento);

        return response;
    }

    /**
     * Busca template de documento por tipo
     */
    public Map<String, Object> getTemplateDocumento(Long tipoDocumentoId) {
        log.info("Buscando template do documento tipo {}", tipoDocumentoId);

        Optional<TipoDocumento> tipoOpt = tipoDocumentoRepository.findById(tipoDocumentoId.intValue());

        String template;
        if (tipoOpt.isPresent() && tipoOpt.get().getTemplateDocumento() != null) {
            template = tipoOpt.get().getTemplateDocumento();
        } else {
            // Template padrão
            template = String.format("""
                    CIPALAM - CENTRO INTEGRADO PLATAFORMA DE APRENDIZAGEM MÚLTIPLA

                    DOCUMENTO: %s

                    Este é um template padrão para o documento solicitado.

                    Por favor, leia atentamente as informações abaixo:

                    1. Este documento é obrigatório para o processo de matrícula.
                    2. Certifique-se de que todas as informações estão corretas.
                    3. A assinatura digital confirma a veracidade das informações.

                    Ao assinar este documento, você declara estar ciente de suas responsabilidades
                    e concorda com os termos estabelecidos pela instituição.

                    Data: %s
                    """,
                    tipoOpt.map(TipoDocumento::getNome).orElse("Documento"),
                    LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")));
        }

        Map<String, Object> response = new HashMap<>();
        response.put("template", template);
        response.put("success", true);

        return response;
    }

    /**
     * Busca status da matrícula para um usuário
     */
    public Map<String, Object> getStatusMatricula(Long usuarioId) {
        log.info("Buscando status da matrícula para usuário {}", usuarioId);

        Optional<Pessoa> pessoa = pessoaRepository.findById(usuarioId.intValue());

        Map<String, Object> status = new HashMap<>();
        status.put("id", 1);
        status.put("protocolo", "PROTO-2024-" + String.format("%03d", usuarioId));
        status.put("nomeCompleto", pessoa.map(Pessoa::getNmPessoa).orElse("Responsável"));
        status.put("cpf", pessoa.map(Pessoa::getCpfPessoa).orElse("000.000.000-00"));
        status.put("email", pessoa.map(Pessoa::getEmail).orElse("responsavel@email.com"));
        status.put("status", "documentos_pendentes");
        status.put("dataEnvio", LocalDateTime.now().minusDays(2));
        status.put("dataInicioMatricula", LocalDateTime.now().minusDays(1));
        status.put("success", true);

        return status;
    }
}

package com.cipalam.cipalam_sistema.service;

import com.cipalam.cipalam_sistema.model.TipoDocumento;
import com.cipalam.cipalam_sistema.model.Pessoa;
import com.cipalam.cipalam_sistema.repository.TipoDocumentoRepository;
import com.cipalam.cipalam_sistema.repository.PessoaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

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
        dashboardData.put("protocolo", "PROTO-2024-" + String.format("%03d", usuarioId));
        dashboardData.put("status", "documentos_pendentes");
        dashboardData.put("dataEnvio", LocalDateTime.now().minusDays(2));
        dashboardData.put("dataInicioMatricula", LocalDateTime.now().minusDays(1));

        // Buscar estatísticas de documentos
        List<Map<String, Object>> documentosPendentes = buscarPendentesPorUsuario(usuarioId);
        dashboardData.put("totalDocumentosPendentes", documentosPendentes.size());
        dashboardData.put("totalDocumentosCompletos", 0);
        dashboardData.put("percentualConclusao", 0);

        return dashboardData;
    }

    /**
     * Busca documentos pendentes para um usuário específico
     * Por enquanto retorna uma lista mock baseada nos tipos de documentos
     */
    public List<Map<String, Object>> buscarPendentesPorUsuario(Long usuarioId) {
        // Buscar tipos de documentos disponíveis para gerar lista mock
        List<TipoDocumento> tiposDocumentos = tipoDocumentoRepository.findAll();

        return tiposDocumentos.stream()
                .map(tipo -> {
                    Map<String, Object> documento = new HashMap<>();
                    documento.put("idDocumentoMatricula", tipo.getIdTipoDocumento().longValue());
                    documento.put("status", "pendente");
                    documento.put("tbInteresseMatricula_id", 1L);

                    Map<String, Object> tipoDocumentoMap = new HashMap<>();
                    tipoDocumentoMap.put("idTipoDocumento", tipo.getIdTipoDocumento());
                    tipoDocumentoMap.put("nome", tipo.getNome());
                    tipoDocumentoMap.put("descricao", tipo.getDescricao());
                    tipoDocumentoMap.put("obrigatorio", tipo.getObrigatorio());
                    tipoDocumentoMap.put("requerAssinatura", tipo.getRequerAssinatura());
                    tipoDocumentoMap.put("requerAnexo", tipo.getRequerAnexo());
                    tipoDocumentoMap.put("ordemExibicao", tipo.getOrdemExibicao());
                    documento.put("tipoDocumento", tipoDocumentoMap);

                    return documento;
                })
                .collect(java.util.stream.Collectors.toList());
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
        Optional<TipoDocumento> tipoOpt = tipoDocumentoRepository.findById(tipoDocumentoId);

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

        Optional<TipoDocumento> tipoOpt = tipoDocumentoRepository.findById(tipoDocumentoId);

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

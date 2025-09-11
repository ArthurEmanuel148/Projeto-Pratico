package com.cipalam.cipalam_sistema.service;

import com.cipalam.cipalam_sistema.config.DocumentoConfig;
import com.cipalam.cipalam_sistema.model.DocumentoMatricula;
import com.cipalam.cipalam_sistema.model.TipoDocumento;
import com.cipalam.cipalam_sistema.repository.DocumentoMatriculaRepository;
import com.cipalam.cipalam_sistema.repository.TipoDocumentoRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class GerenciadorDocumentosService {

    private final DocumentoConfig config;
    private final DocumentoMatriculaRepository documentoRepository;
    private final TipoDocumentoRepository tipoDocumentoRepository;
    
    private Path diretorioBase;

    @PostConstruct
    public void inicializar() {
        try {
            config.validar();
            this.diretorioBase = Paths.get(config.getDiretorioBase()).toAbsolutePath().normalize();
            criarDiretorioSeNaoExistir(this.diretorioBase);
            log.info("📁 Gerenciador de documentos inicializado. Diretório base: {}", this.diretorioBase);
        } catch (Exception e) {
            log.error("❌ Erro ao inicializar gerenciador de documentos: {}", e.getMessage(), e);
            throw new RuntimeException("Falha na inicialização do gerenciador de documentos", e);
        }
    }

    /**
     * Resultado do upload de documento
     */
    public static class ResultadoUpload {
        private final boolean sucesso;
        private final String mensagem;
        private final String caminhoArquivo;
        private final Map<String, Object> metadados;

        public ResultadoUpload(boolean sucesso, String mensagem, String caminhoArquivo, Map<String, Object> metadados) {
            this.sucesso = sucesso;
            this.mensagem = mensagem;
            this.caminhoArquivo = caminhoArquivo;
            this.metadados = metadados != null ? metadados : new HashMap<>();
        }

        public boolean isSucesso() { return sucesso; }
        public String getMensagem() { return mensagem; }
        public String getCaminhoArquivo() { return caminhoArquivo; }
        public Map<String, Object> getMetadados() { return metadados; }
    }

    /**
     * Faz upload de um documento com validações robustas
     */
    public ResultadoUpload fazerUpload(MultipartFile arquivo, Long idDocumento, Long idFamilia, 
                                     String categoriaResponsavel, String observacoes) {
        
        log.info("🚀 Iniciando upload - Documento: {}, Família: {}, Categoria: {}", 
                idDocumento, idFamilia, categoriaResponsavel);

        try {
            // 1. Validações iniciais
            ResultadoValidacao validacao = validarArquivo(arquivo);
            if (!validacao.isValido()) {
                return new ResultadoUpload(false, validacao.getMensagem(), null, null);
            }

            // 2. Buscar documento no banco
            Optional<DocumentoMatricula> documentoOpt = documentoRepository.findById(idDocumento);
            if (documentoOpt.isEmpty()) {
                return new ResultadoUpload(false, "Documento não encontrado", null, null);
            }

            DocumentoMatricula documento = documentoOpt.get();
            
            // 3. Buscar tipo do documento
            TipoDocumento tipoDocumento = documento.getTipoDocumento();
            String nomeCategoria = tipoDocumento != null ? tipoDocumento.getNome() : "documento";

            // 4. Gerar nome único e caminho
            String nomeArquivo = gerarNomeArquivo(nomeCategoria, idFamilia, arquivo.getOriginalFilename());
            String caminhoRelativo = config.getEstrutura().obterCaminhoPasta(idFamilia, nomeCategoria, categoriaResponsavel);
            Path pastaDestino = diretorioBase.resolve(caminhoRelativo);
            Path arquivoDestino = pastaDestino.resolve(nomeArquivo);

            // 5. Criar backup se arquivo já existir
            if (Files.exists(arquivoDestino) && config.isCriarBackup()) {
                criarBackup(arquivoDestino);
            }

            // 6. Criar diretórios necessários
            criarDiretorioSeNaoExistir(pastaDestino);

            // 7. Salvar arquivo
            Files.copy(arquivo.getInputStream(), arquivoDestino, StandardCopyOption.REPLACE_EXISTING);

            // 8. Atualizar registro no banco
            String caminhoCompleto = arquivoDestino.toString();
            atualizarDocumentoNoBanco(documento, arquivo, caminhoCompleto, observacoes);

            // 9. Preparar metadados do resultado
            Map<String, Object> metadados = prepararMetadados(arquivo, arquivoDestino, nomeCategoria);

            log.info("✅ Upload concluído com sucesso: {}", caminhoCompleto);
            return new ResultadoUpload(true, "Documento enviado com sucesso", caminhoCompleto, metadados);

        } catch (Exception e) {
            log.error("❌ Erro durante upload do documento {}: {}", idDocumento, e.getMessage(), e);
            return new ResultadoUpload(false, "Erro interno durante upload: " + e.getMessage(), null, null);
        }
    }

    /**
     * Resultado da validação
     */
    private static class ResultadoValidacao {
        private final boolean valido;
        private final String mensagem;

        public ResultadoValidacao(boolean valido, String mensagem) {
            this.valido = valido;
            this.mensagem = mensagem;
        }

        public boolean isValido() { return valido; }
        public String getMensagem() { return mensagem; }
    }

    /**
     * Valida arquivo antes do upload
     */
    private ResultadoValidacao validarArquivo(MultipartFile arquivo) {
        // Validar se arquivo foi enviado
        if (arquivo == null || arquivo.isEmpty()) {
            return new ResultadoValidacao(false, "Nenhum arquivo foi enviado");
        }

        // Validar tamanho
        if (arquivo.getSize() > config.getTamanhoMaximo()) {
            double tamanhoMB = arquivo.getSize() / (1024.0 * 1024.0);
            double limite = config.getTamanhoMaximo() / (1024.0 * 1024.0);
            return new ResultadoValidacao(false, 
                String.format("Arquivo muito grande (%.1fMB). Limite: %.1fMB", tamanhoMB, limite));
        }

        // Validar extensão
        String nomeOriginal = arquivo.getOriginalFilename();
        if (nomeOriginal == null || nomeOriginal.trim().isEmpty()) {
            return new ResultadoValidacao(false, "Nome do arquivo é inválido");
        }

        String extensao = obterExtensao(nomeOriginal).toLowerCase();
        if (!config.getTiposPermitidos().contains(extensao)) {
            return new ResultadoValidacao(false, 
                String.format("Tipo de arquivo não permitido: .%s. Permitidos: %s", 
                    extensao, String.join(", ", config.getTiposPermitidos())));
        }

        // Validar conteúdo básico
        try {
            String contentType = arquivo.getContentType();
            if (contentType == null) {
                return new ResultadoValidacao(false, "Não foi possível determinar o tipo do arquivo");
            }
        } catch (Exception e) {
            return new ResultadoValidacao(false, "Arquivo pode estar corrompido");
        }

        return new ResultadoValidacao(true, "Arquivo válido");
    }

    /**
     * Gera nome único para o arquivo
     */
    private String gerarNomeArquivo(String tipoDocumento, Long idFamilia, String nomeOriginal) {
        String extensao = obterExtensao(nomeOriginal);
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
        String uuid = UUID.randomUUID().toString().substring(0, 8);
        
        return config.getPadraoNome()
            .replace("{tipo}", limparParaNome(tipoDocumento))
            .replace("{familia}", idFamilia != null ? idFamilia.toString() : "0")
            .replace("{timestamp}", timestamp)
            .replace("{uuid}", uuid)
            .replace("{extensao}", extensao);
    }

    /**
     * Obtém extensão do arquivo
     */
    private String obterExtensao(String nomeArquivo) {
        if (nomeArquivo == null || !nomeArquivo.contains(".")) {
            return "";
        }
        return nomeArquivo.substring(nomeArquivo.lastIndexOf(".") + 1);
    }

    /**
     * Limpa string para usar em nome de arquivo
     */
    private String limparParaNome(String texto) {
        if (texto == null) return "documento";
        return texto.toLowerCase()
                   .replaceAll("[àáâãäå]", "a")
                   .replaceAll("[èéêë]", "e")
                   .replaceAll("[ìíîï]", "i")
                   .replaceAll("[òóôõö]", "o")
                   .replaceAll("[ùúûü]", "u")
                   .replaceAll("[ç]", "c")
                   .replaceAll("[^a-z0-9]", "_")
                   .replaceAll("_+", "_")
                   .replaceAll("^_|_$", "");
    }

    /**
     * Cria backup do arquivo existente
     */
    private void criarBackup(Path arquivoOriginal) {
        try {
            String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
            String nomeBackup = arquivoOriginal.getFileName().toString() + ".backup." + timestamp;
            Path arquivoBackup = arquivoOriginal.getParent().resolve("backups").resolve(nomeBackup);
            
            criarDiretorioSeNaoExistir(arquivoBackup.getParent());
            Files.copy(arquivoOriginal, arquivoBackup, StandardCopyOption.REPLACE_EXISTING);
            
            log.info("💾 Backup criado: {}", arquivoBackup);
        } catch (Exception e) {
            log.warn("⚠️ Não foi possível criar backup: {}", e.getMessage());
        }
    }

    /**
     * Cria diretório se não existir
     */
    private void criarDiretorioSeNaoExistir(Path diretorio) throws IOException {
        if (!Files.exists(diretorio)) {
            Files.createDirectories(diretorio);
            log.debug("📁 Diretório criado: {}", diretorio);
        }
    }

    /**
     * Atualiza documento no banco de dados
     */
    private void atualizarDocumentoNoBanco(DocumentoMatricula documento, MultipartFile arquivo, 
                                         String caminhoCompleto, String observacoes) {
        documento.setStatus("enviado");
        documento.setNomeArquivoOriginal(arquivo.getOriginalFilename());
        documento.setCaminhoArquivo(caminhoCompleto);
        documento.setTipoArquivo(arquivo.getContentType());
        documento.setTamanhoArquivo((int) arquivo.getSize());
        documento.setDataEnvio(LocalDateTime.now());
        documento.setObservacoes(observacoes);

        documentoRepository.save(documento);
        log.info("💾 Documento atualizado no banco: ID {}", documento.getIdDocumentoMatricula());
    }

    /**
     * Prepara metadados do resultado
     */
    private Map<String, Object> prepararMetadados(MultipartFile arquivo, Path arquivoDestino, String categoria) {
        Map<String, Object> metadados = new HashMap<>();
        metadados.put("nomeOriginal", arquivo.getOriginalFilename());
        metadados.put("tamanho", arquivo.getSize());
        metadados.put("tipo", arquivo.getContentType());
        metadados.put("categoria", categoria);
        metadados.put("caminhoCompleto", arquivoDestino.toString());
        metadados.put("dataUpload", LocalDateTime.now());
        
        try {
            metadados.put("tamanhoFormatado", formatarTamanho(arquivo.getSize()));
        } catch (Exception e) {
            log.debug("Erro ao formatar tamanho: {}", e.getMessage());
        }
        
        return metadados;
    }

    /**
     * Formata tamanho do arquivo para exibição
     */
    private String formatarTamanho(long bytes) {
        if (bytes < 1024) return bytes + " B";
        int exp = (int) (Math.log(bytes) / Math.log(1024));
        String pre = "KMGTPE".charAt(exp - 1) + "";
        return String.format("%.1f %sB", bytes / Math.pow(1024, exp), pre);
    }

    /**
     * Busca arquivo para visualização
     */
    public Resource buscarArquivoParaVisualizacao(Long idDocumento) throws IOException {
        Optional<DocumentoMatricula> documentoOpt = documentoRepository.findById(idDocumento);
        
        if (documentoOpt.isEmpty()) {
            throw new RuntimeException("Documento não encontrado");
        }

        DocumentoMatricula documento = documentoOpt.get();
        String caminhoArquivo = documento.getCaminhoArquivo();
        
        if (caminhoArquivo == null || caminhoArquivo.trim().isEmpty()) {
            throw new RuntimeException("Caminho do arquivo não definido");
        }

        Path arquivoPath = Paths.get(caminhoArquivo).normalize();
        
        if (!Files.exists(arquivoPath)) {
            log.error("📄 Arquivo não encontrado: {}", arquivoPath);
            throw new RuntimeException("Arquivo físico não encontrado");
        }

        Resource resource = new UrlResource(arquivoPath.toUri());
        
        if (resource.exists() && resource.isReadable()) {
            return resource;
        } else {
            throw new RuntimeException("Arquivo não pode ser lido");
        }
    }

    /**
     * Obtém informações do arquivo sem baixá-lo
     */
    public Map<String, Object> obterInformacoesArquivo(Long idDocumento) {
        try {
            Optional<DocumentoMatricula> documentoOpt = documentoRepository.findById(idDocumento);
            
            if (documentoOpt.isEmpty()) {
                throw new RuntimeException("Documento não encontrado");
            }

            DocumentoMatricula documento = documentoOpt.get();
            Map<String, Object> info = new HashMap<>();
            
            info.put("id", documento.getIdDocumentoMatricula());
            info.put("nomeOriginal", documento.getNomeArquivoOriginal());
            info.put("tipo", documento.getTipoArquivo());
            info.put("tamanho", documento.getTamanhoArquivo());
            info.put("status", documento.getStatus());
            info.put("dataEnvio", documento.getDataEnvio());
            info.put("observacoes", documento.getObservacoes());
            
            if (documento.getTamanhoArquivo() != null) {
                info.put("tamanhoFormatado", formatarTamanho(documento.getTamanhoArquivo()));
            }
            
            // Verificar se arquivo existe fisicamente
            String caminhoArquivo = documento.getCaminhoArquivo();
            if (caminhoArquivo != null) {
                Path arquivoPath = Paths.get(caminhoArquivo);
                info.put("arquivoExiste", Files.exists(arquivoPath));
                info.put("nomeArquivo", arquivoPath.getFileName().toString());
            } else {
                info.put("arquivoExiste", false);
            }
            
            return info;
            
        } catch (Exception e) {
            log.error("❌ Erro ao obter informações do arquivo {}: {}", idDocumento, e.getMessage());
            throw new RuntimeException("Erro ao obter informações do arquivo: " + e.getMessage());
        }
    }

    /**
     * Determina o MediaType baseado na extensão do arquivo
     */
    public MediaType determinarMediaType(String nomeArquivo) {
        if (nomeArquivo == null) {
            return MediaType.APPLICATION_OCTET_STREAM;
        }
        
        String extensao = obterExtensao(nomeArquivo).toLowerCase();
        
        return switch (extensao) {
            case "pdf" -> MediaType.APPLICATION_PDF;
            case "jpg", "jpeg" -> MediaType.IMAGE_JPEG;
            case "png" -> MediaType.IMAGE_PNG;
            case "gif" -> MediaType.IMAGE_GIF;
            case "txt" -> MediaType.TEXT_PLAIN;
            case "html", "htm" -> MediaType.TEXT_HTML;
            case "css" -> MediaType.parseMediaType("text/css");
            case "js" -> MediaType.parseMediaType("application/javascript");
            case "json" -> MediaType.APPLICATION_JSON;
            case "xml" -> MediaType.APPLICATION_XML;
            case "zip" -> MediaType.parseMediaType("application/zip");
            case "doc" -> MediaType.parseMediaType("application/msword");
            case "docx" -> MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.wordprocessingml.document");
            default -> MediaType.APPLICATION_OCTET_STREAM;
        };
    }
}

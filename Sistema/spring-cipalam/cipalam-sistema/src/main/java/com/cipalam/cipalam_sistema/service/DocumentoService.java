package com.cipalam.cipalam_sistema.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class DocumentoService {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    // Diretório para armazenar documentos (pode ser configurado via properties)
    private final String DIRETORIO_DOCUMENTOS = System.getProperty("user.home") + "/cipalam_documentos/";

    /**
     * Listar documentos pendentes para um responsável
     */
    public List<Map<String, Object>> listarDocumentosPendentes(Long idResponsavel) {
        String sql = """
                    SELECT
                        dm.idDocumentoMatricula as idDocumento,
                        dm.status,
                        dm.dataEnvio as dataAnexo,
                        dm.nomeArquivoOriginal,
                        dm.observacoes,
                        td.nome as nomeDocumento,
                        td.categoria,
                        td.obrigatorio,
                        td.descricao,
                        im.tipoCota,
                        CASE
                            WHEN dm.status = 'pendente' THEN 'Pendente de anexo'
                            WHEN dm.status = 'enviado' THEN 'Documento anexado'
                            WHEN dm.status = 'aprovado' THEN 'Aprovado'
                            WHEN dm.status = 'rejeitado' THEN 'Rejeitado - Reenviar'
                            ELSE dm.status
                        END as statusDescricao
                    FROM tbDocumentoMatricula dm
                    INNER JOIN tbTipoDocumento td ON dm.tbTipoDocumento_idTipoDocumento = td.idTipoDocumento
                    INNER JOIN tbInteresseMatricula im ON dm.tbInteresseMatricula_id = im.id
                    WHERE im.responsavelLogin_idPessoa = ?
                    ORDER BY
                        CASE dm.status
                            WHEN 'pendente' THEN 1
                            WHEN 'rejeitado' THEN 2
                            WHEN 'enviado' THEN 3
                            WHEN 'aprovado' THEN 4
                        END,
                        td.categoria, td.nome
                """;

        return jdbcTemplate.queryForList(sql, idResponsavel);
    }

    /**
     * Anexar documento
     */
    public Map<String, Object> anexarDocumento(MultipartFile arquivo, Long idDocumento, Long idResponsavel)
            throws IOException {
        // Verificar se o documento pertence ao responsável
        String verificarSql = """
                    SELECT COUNT(*)
                    FROM tbDocumentoMatricula dm
                    INNER JOIN tbInteresseMatricula im ON dm.tbInteresseMatricula_id = im.id
                    WHERE dm.idDocumentoMatricula = ? AND im.responsavelLogin_idPessoa = ?
                """;

        Integer count = jdbcTemplate.queryForObject(verificarSql, Integer.class, idDocumento, idResponsavel);
        if (count == null || count == 0) {
            throw new RuntimeException("Documento não encontrado ou sem permissão");
        }

        // Criar diretório se não existir
        Path diretorio = Paths.get(DIRETORIO_DOCUMENTOS);
        if (!Files.exists(diretorio)) {
            Files.createDirectories(diretorio);
        }

        // Gerar nome único para o arquivo
        String extensao = obterExtensaoArquivo(arquivo.getOriginalFilename());
        String nomeArquivo = UUID.randomUUID().toString() + "." + extensao;
        Path caminhoArquivo = diretorio.resolve(nomeArquivo);

        // Salvar arquivo no sistema de arquivos
        Files.write(caminhoArquivo, arquivo.getBytes());

        // Atualizar banco de dados
        String updateSql = """
                    UPDATE tbDocumentoMatricula
                    SET
                        caminhoArquivo = ?,
                        nomeArquivoOriginal = ?,
                        tipoMime = ?,
                        tamanhoArquivo = ?,
                        dataAnexo = ?,
                        status = 'anexado',
                        observacoes = 'Documento anexado pelo responsável'
                    WHERE idDocumentoMatricula = ?
                """;

        jdbcTemplate.update(updateSql,
                caminhoArquivo.toString(),
                arquivo.getOriginalFilename(),
                arquivo.getContentType(),
                arquivo.getSize(),
                Timestamp.valueOf(LocalDateTime.now()),
                idDocumento);

        // Log da ação
        String logSql = """
                    INSERT INTO tbLogDocumento (
                        tbDocumentoMatricula_id,
                        acao,
                        descricao,
                        usuario_idPessoa,
                        dataLog
                    ) VALUES (?, ?, ?, ?, ?)
                """;

        jdbcTemplate.update(logSql,
                idDocumento,
                "ANEXO_DOCUMENTO",
                "Documento anexado: " + arquivo.getOriginalFilename(),
                idResponsavel,
                Timestamp.valueOf(LocalDateTime.now()));

        Map<String, Object> resultado = new HashMap<>();
        resultado.put("sucesso", true);
        resultado.put("mensagem", "Documento anexado com sucesso");
        resultado.put("nomeArquivo", arquivo.getOriginalFilename());
        resultado.put("tamanho", arquivo.getSize());

        return resultado;
    }

    /**
     * Obter documento para download
     */
    public Map<String, Object> obterDocumento(Long idDocumento) throws IOException {
        String sql = """
                    SELECT
                        caminhoArquivo,
                        nomeArquivoOriginal,
                        tipoMime
                    FROM tbDocumentoMatricula
                    WHERE idDocumentoMatricula = ? AND status != 'pendente'
                """;

        List<Map<String, Object>> resultados = jdbcTemplate.queryForList(sql, idDocumento);

        if (resultados.isEmpty()) {
            return null;
        }

        Map<String, Object> documento = resultados.get(0);
        String caminhoArquivo = (String) documento.get("caminhoArquivo");

        if (caminhoArquivo == null) {
            return null;
        }

        Path caminho = Paths.get(caminhoArquivo);
        if (!Files.exists(caminho)) {
            throw new RuntimeException("Arquivo não encontrado no sistema");
        }

        byte[] conteudo = Files.readAllBytes(caminho);

        Map<String, Object> resultado = new HashMap<>();
        resultado.put("conteudo", conteudo);
        resultado.put("nomeArquivo", documento.get("nomeArquivoOriginal"));
        resultado.put("tipoMime", documento.get("tipoMime"));

        return resultado;
    }

    /**
     * Remover documento anexado
     */
    public Map<String, Object> removerDocumento(Long idDocumento, Long idResponsavel) throws IOException {
        // Verificar permissão
        String verificarSql = """
                    SELECT caminhoArquivo
                    FROM tbDocumentoMatricula dm
                    INNER JOIN tbAluno a ON dm.tbAluno_idPessoa = a.tbPessoa_idPessoa
                    INNER JOIN tbFamilia f ON a.tbFamilia_idtbFamilia = f.idtbFamilia
                    INNER JOIN tbResponsavel r ON f.idtbFamilia = r.tbFamilia_idtbFamilia
                    WHERE dm.idDocumentoMatricula = ? AND r.tbPessoa_idPessoa = ?
                """;

        List<Map<String, Object>> resultados = jdbcTemplate.queryForList(verificarSql, idDocumento, idResponsavel);

        if (resultados.isEmpty()) {
            throw new RuntimeException("Documento não encontrado ou sem permissão");
        }

        String caminhoArquivo = (String) resultados.get(0).get("caminhoArquivo");

        // Remover arquivo do sistema de arquivos
        if (caminhoArquivo != null) {
            Path caminho = Paths.get(caminhoArquivo);
            if (Files.exists(caminho)) {
                Files.delete(caminho);
            }
        }

        // Atualizar banco de dados
        String updateSql = """
                    UPDATE tbDocumentoMatricula
                    SET
                        caminhoArquivo = NULL,
                        nomeArquivoOriginal = NULL,
                        tipoMime = NULL,
                        tamanhoArquivo = NULL,
                        dataAnexo = NULL,
                        status = 'pendente',
                        observacoes = 'Documento removido pelo responsável'
                    WHERE idDocumentoMatricula = ?
                """;

        jdbcTemplate.update(updateSql, idDocumento);

        // Log da ação
        String logSql = """
                    INSERT INTO tbLogDocumento (
                        tbDocumentoMatricula_id,
                        acao,
                        descricao,
                        usuario_idPessoa,
                        dataLog
                    ) VALUES (?, ?, ?, ?, ?)
                """;

        jdbcTemplate.update(logSql,
                idDocumento,
                "REMOCAO_DOCUMENTO",
                "Documento removido pelo responsável",
                idResponsavel,
                Timestamp.valueOf(LocalDateTime.now()));

        Map<String, Object> resultado = new HashMap<>();
        resultado.put("sucesso", true);
        resultado.put("mensagem", "Documento removido com sucesso");

        return resultado;
    }

    /**
     * Obter configuração de documentos por cota
     */
    public List<Map<String, Object>> obterConfiguracaoDocumentos(String tipoCota) {
        String sql = """
                    SELECT DISTINCT
                        td.idTipoDocumento as id,
                        td.nome,
                        td.categoria,
                        td.obrigatorio,
                        td.descricao,
                        td.formatosAceitos,
                        td.tamanhoMaximo
                    FROM tbTipoDocumento td
                    INNER JOIN tbConfiguracaoDocumentosCota cdc ON td.idTipoDocumento = cdc.tbTipoDocumento_idTipoDocumento
                    WHERE cdc.tipoCota = ?
                    ORDER BY td.categoria, td.nome
                """;

        return jdbcTemplate.queryForList(sql, tipoCota);
    }

    /**
     * Obter extensão do arquivo
     */
    private String obterExtensaoArquivo(String nomeArquivo) {
        if (nomeArquivo == null || !nomeArquivo.contains(".")) {
            return "";
        }
        return nomeArquivo.substring(nomeArquivo.lastIndexOf(".") + 1).toLowerCase();
    }
}

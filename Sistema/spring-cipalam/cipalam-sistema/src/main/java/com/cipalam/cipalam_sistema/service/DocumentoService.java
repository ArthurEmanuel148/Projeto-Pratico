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
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class DocumentoService {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    // Diretório para armazenar documentos dentro do projeto
    private final String DIRETORIO_DOCUMENTOS = "/Applications/XAMPP/xamppfiles/htdocs/GitHub/Projeto-Pratico/Projeto-Pratico/cipalam_documentos/";

    /**
     * Listar documentos pendentes para um responsável
     */
    public List<Map<String, Object>> listarDocumentosPendentes(Long idResponsavel) {
        // Query que retorna documentos no formato esperado pelo frontend
        String sql = "SELECT " +
                "idTipoDocumento as idDocumento, " +
                "'pendente' as status, " +
                "NULL as dataAnexo, " +
                "NULL as nomeArquivoOriginal, " +
                "NULL as observacoes, " +
                "nome as nomeDocumento, " +
                "tipoCota, " +
                "obrigatorio, " +
                "descricao, " +
                "'Pendente de anexo' as statusDescricao " +
                "FROM tbTipoDocumento " +
                "WHERE ativo = 1 " +
                "ORDER BY obrigatorio DESC, nome";

        return jdbcTemplate.queryForList(sql);
    }

    /**
     * Anexar documento
     */
    public Map<String, Object> anexarDocumento(MultipartFile arquivo, Long idDocumento, Long idResponsavel)
            throws IOException {

        // Validações robustas
        if (arquivo == null || arquivo.isEmpty()) {
            throw new RuntimeException("Arquivo não pode estar vazio");
        }

        // Validar extensão de arquivo
        String extensao = obterExtensaoArquivo(arquivo.getOriginalFilename());
        if (!isValidExtension(extensao)) {
            throw new RuntimeException("Tipo de arquivo não permitido. Use PDF, JPG, JPEG ou PNG");
        }

        // Validar tamanho (5MB máximo)
        if (arquivo.getSize() > 5 * 1024 * 1024) {
            throw new RuntimeException("Arquivo muito grande. Máximo 5MB");
        }

        // Criar diretório se não existir
        Path diretorio = Paths.get(DIRETORIO_DOCUMENTOS);
        if (!Files.exists(diretorio)) {
            Files.createDirectories(diretorio);
        }

        // Gerar nome único para o arquivo
        String nomeArquivo = UUID.randomUUID().toString() + "." + extensao;
        Path caminhoArquivo = diretorio.resolve(nomeArquivo);

        // Salvar arquivo no sistema de arquivos
        Files.write(caminhoArquivo, arquivo.getBytes());

        // Retornar sucesso para demonstração
        Map<String, Object> resultado = new HashMap<>();
        resultado.put("sucesso", true);
        resultado.put("mensagem", "Documento anexado com sucesso");
        resultado.put("nomeArquivo", nomeArquivo);
        resultado.put("caminhoCompleto", caminhoArquivo.toString());
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
                    SELECT
                        td.idTipoDocumento as id,
                        td.nome,
                        td.descricao,
                        td.obrigatorio,
                        td.tipoCota,
                        td.escopo,
                        td.ordemExibicao
                    FROM tbTipoDocumento td
                    WHERE td.tipoCota = ? AND td.ativo = 1
                    ORDER BY td.ordemExibicao, td.nome
                """;

        return jdbcTemplate.queryForList(sql, tipoCota);
    }

    /**
     * Listar documentos para aprovação (funcionários)
     */
    public List<Map<String, Object>> listarDocumentosParaAprovacao() {
        // Retornar dados simulados por enquanto, já que não temos documentos reais
        // anexados
        List<Map<String, Object>> documentosSimulados = new ArrayList<>();

        // Documento 1
        Map<String, Object> doc1 = new HashMap<>();
        doc1.put("idDocumento", 1);
        doc1.put("status", "pendente");
        doc1.put("dataEnvio", "2025-08-31 14:30:00");
        doc1.put("nomeArquivoOriginal", "rg_responsavel.pdf");
        doc1.put("observacoes", null);
        doc1.put("idFamilia", 1);
        doc1.put("nomeDocumento", "RG do Responsável");
        doc1.put("categoria", "responsavel");
        doc1.put("obrigatorio", true);
        doc1.put("descricao", "Documento de identidade do responsável");
        doc1.put("protocolo", "MAT-2025-001");
        doc1.put("tipoCota", "livre");
        doc1.put("nomeResponsavel", "Ana Silva Santos");
        doc1.put("cpfResponsavel", "444.444.444-44");
        documentosSimulados.add(doc1);

        // Documento 2
        Map<String, Object> doc2 = new HashMap<>();
        doc2.put("idDocumento", 2);
        doc2.put("status", "enviado");
        doc2.put("dataEnvio", "2025-08-31 15:00:00");
        doc2.put("nomeArquivoOriginal", "comprovante_renda.pdf");
        doc2.put("observacoes", null);
        doc2.put("idFamilia", 2);
        doc2.put("nomeDocumento", "Comprovante de Renda");
        doc2.put("categoria", "familia");
        doc2.put("obrigatorio", true);
        doc2.put("descricao", "Comprovante de renda familiar");
        doc2.put("protocolo", "MAT-2025-002");
        doc2.put("tipoCota", "economica");
        doc2.put("nomeResponsavel", "Carlos Oliveira");
        doc2.put("cpfResponsavel", "555.555.555-55");
        documentosSimulados.add(doc2);

        return documentosSimulados;
    }

    /**
     * Aprovar documento (funcionários)
     */
    public Map<String, Object> aprovarDocumento(Long idDocumento, Long idFuncionario, String observacoes) {
        String sql = """
                    UPDATE tbDocumentoMatricula
                    SET status = 'aprovado',
                        dataAprovacao = NOW(),
                        funcionarioAprovador_idPessoa = ?,
                        observacoes = CONCAT(COALESCE(observacoes, ''),
                                           CASE WHEN observacoes IS NOT NULL THEN '\n--- APROVAÇÃO ---\n' ELSE '--- APROVAÇÃO ---\n' END,
                                           ?)
                    WHERE idDocumentoMatricula = ?
                """;

        int rowsAffected = jdbcTemplate.update(sql, idFuncionario,
                observacoes != null ? observacoes : "Documento aprovado", idDocumento);

        Map<String, Object> resultado = new HashMap<>();
        if (rowsAffected > 0) {
            resultado.put("sucesso", true);
            resultado.put("mensagem", "Documento aprovado com sucesso");
        } else {
            resultado.put("sucesso", false);
            resultado.put("mensagem", "Documento não encontrado");
        }

        return resultado;
    }

    /**
     * Rejeitar documento (funcionários)
     */
    public Map<String, Object> rejeitarDocumento(Long idDocumento, Long idFuncionario,
            String motivoRejeicao, String observacoes) {
        String sql = """
                    UPDATE tbDocumentoMatricula
                    SET status = 'rejeitado',
                        dataAprovacao = NOW(),
                        funcionarioAprovador_idPessoa = ?,
                        motivoRejeicao = ?,
                        observacoes = CONCAT(COALESCE(observacoes, ''),
                                           CASE WHEN observacoes IS NOT NULL THEN '\n--- REJEIÇÃO ---\n' ELSE '--- REJEIÇÃO ---\n' END,
                                           'Motivo: ', ?,
                                           CASE WHEN ? IS NOT NULL THEN CONCAT('\nObservações: ', ?) ELSE '' END)
                    WHERE idDocumentoMatricula = ?
                """;

        int rowsAffected = jdbcTemplate.update(sql, idFuncionario, motivoRejeicao, motivoRejeicao,
                observacoes, observacoes, idDocumento);

        Map<String, Object> resultado = new HashMap<>();
        if (rowsAffected > 0) {
            resultado.put("sucesso", true);
            resultado.put("mensagem", "Documento rejeitado com sucesso");
        } else {
            resultado.put("sucesso", false);
            resultado.put("mensagem", "Documento não encontrado");
        }

        return resultado;
    }

    /**
     * Listar documentos de uma família específica (funcionários)
     */
    public List<Map<String, Object>> listarDocumentosFamilia(Long idFamilia) {
        String sql = """
                    SELECT
                        dm.idDocumentoMatricula as idDocumento,
                        dm.status,
                        dm.dataEnvio,
                        dm.dataAprovacao,
                        dm.nomeArquivoOriginal,
                        dm.observacoes,
                        dm.motivoRejeicao,
                        td.nome as nomeDocumento,
                        td.categoria,
                        td.obrigatorio,
                        td.descricao,
                        pf.NmPessoa as funcionarioAprovador,
                        CASE
                            WHEN dm.status = 'pendente' THEN 'Pendente de anexo'
                            WHEN dm.status = 'enviado' THEN 'Aguardando aprovação'
                            WHEN dm.status = 'aprovado' THEN 'Aprovado'
                            WHEN dm.status = 'rejeitado' THEN 'Rejeitado'
                            ELSE dm.status
                        END as statusDescricao
                    FROM tbDocumentoMatricula dm
                    INNER JOIN tbTipoDocumento td ON dm.tbTipoDocumento_idTipoDocumento = td.idTipoDocumento
                    LEFT JOIN tbPessoa pf ON dm.funcionarioAprovador_idPessoa = pf.idPessoa
                    WHERE dm.tbFamilia_idtbFamilia = ?
                    ORDER BY td.categoria, td.nome
                """;

        return jdbcTemplate.queryForList(sql, idFamilia);
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

    /**
     * Validar extensão de arquivo permitida
     */
    private boolean isValidExtension(String extensao) {
        return extensao != null &&
                (extensao.equals("pdf") ||
                        extensao.equals("jpg") ||
                        extensao.equals("jpeg") ||
                        extensao.equals("png"));
    }
}

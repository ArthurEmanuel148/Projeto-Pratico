package com.cipalam.cipalam_sistema.controller;

import com.cipalam.cipalam_sistema.service.DocumentoService;
import com.cipalam.cipalam_sistema.service.DocumentoMatriculaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/documentos")
@CrossOrigin(origins = "*")
public class DocumentoController {

    @Autowired
    private DocumentoService documentoService;

    @Autowired
    private DocumentoMatriculaService documentoMatriculaService;

    /**
     * Listar documentos pendentes para um responsável
     */
    @GetMapping("/pendentes/{idResponsavel}")
    public ResponseEntity<?> listarDocumentosPendentes(@PathVariable Long idResponsavel) {
        try {
            List<Map<String, Object>> documentos = documentoService.listarDocumentosPendentes(idResponsavel);
            return ResponseEntity.ok(documentos);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("erro", "Erro ao buscar documentos pendentes");
            error.put("detalhes", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Anexar documento
     */
    @PostMapping("/anexar")
    public ResponseEntity<?> anexarDocumento(
            @RequestParam("arquivo") MultipartFile arquivo,
            @RequestParam("idDocumento") Long idDocumento,
            @RequestParam("idResponsavel") Long idResponsavel) {

        try {
            // Validações básicas
            if (arquivo.isEmpty()) {
                Map<String, Object> error = new HashMap<>();
                error.put("erro", "Arquivo não pode estar vazio");
                return ResponseEntity.badRequest().body(error);
            }

            // Validar tipo de arquivo
            String tipoArquivo = arquivo.getContentType();
            if (!isValidFileType(tipoArquivo)) {
                Map<String, Object> error = new HashMap<>();
                error.put("erro", "Tipo de arquivo não permitido. Use PDF, JPG, JPEG ou PNG");
                return ResponseEntity.badRequest().body(error);
            }

            // Validar tamanho (5MB máximo)
            if (arquivo.getSize() > 5 * 1024 * 1024) {
                Map<String, Object> error = new HashMap<>();
                error.put("erro", "Arquivo muito grande. Máximo 5MB");
                return ResponseEntity.badRequest().body(error);
            }

            Map<String, Object> resultado = documentoService.anexarDocumento(
                    arquivo, idDocumento, idResponsavel);

            return ResponseEntity.ok(resultado);

        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("erro", "Erro ao anexar documento");
            error.put("detalhes", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Baixar documento anexado
     */
    @GetMapping("/download/{idDocumento}")
    public ResponseEntity<?> baixarDocumento(@PathVariable Long idDocumento) {
        try {
            Map<String, Object> documento = documentoService.obterDocumento(idDocumento);

            if (documento == null) {
                return ResponseEntity.notFound().build();
            }

            byte[] conteudo = (byte[]) documento.get("conteudo");
            String nomeArquivo = (String) documento.get("nomeArquivo");
            String tipoMime = (String) documento.get("tipoMime");

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType(tipoMime));
            headers.setContentDispositionFormData("attachment", nomeArquivo);

            return ResponseEntity.ok()
                    .headers(headers)
                    .body(conteudo);

        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("erro", "Erro ao baixar documento");
            error.put("detalhes", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Remover documento anexado
     */
    @DeleteMapping("/remover/{idDocumento}")
    public ResponseEntity<?> removerDocumento(
            @PathVariable Long idDocumento,
            @RequestParam Long idResponsavel) {

        try {
            Map<String, Object> resultado = documentoService.removerDocumento(idDocumento, idResponsavel);
            return ResponseEntity.ok(resultado);

        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("erro", "Erro ao remover documento");
            error.put("detalhes", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Obter configuração de documentos por cota
     */
    @GetMapping("/configuracao/{tipoCota}")
    public ResponseEntity<?> obterConfiguracaoDocumentos(@PathVariable String tipoCota) {
        try {
            List<Map<String, Object>> configuracao = documentoService.obterConfiguracaoDocumentos(tipoCota);
            return ResponseEntity.ok(configuracao);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("erro", "Erro ao obter configuração de documentos");
            error.put("detalhes", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Listar documentos para aprovação (funcionários)
     */
    @GetMapping("/para-aprovacao")
    public ResponseEntity<?> listarDocumentosParaAprovacao() {
        try {
            List<Map<String, Object>> documentos = documentoService.listarDocumentosParaAprovacao();
            return ResponseEntity.ok(documentos);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("erro", "Erro ao buscar documentos para aprovação");
            error.put("detalhes", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Aprovar documento (funcionários)
     */
    @PostMapping("/aprovar/{idDocumento}")
    public ResponseEntity<?> aprovarDocumento(
            @PathVariable Long idDocumento,
            @RequestParam Long idFuncionario,
            @RequestParam(required = false) String observacoes) {

        try {
            Map<String, Object> resultado = documentoService.aprovarDocumento(
                    idDocumento, idFuncionario, observacoes);
            return ResponseEntity.ok(resultado);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("erro", "Erro ao aprovar documento");
            error.put("detalhes", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Rejeitar documento (funcionários)
     */
    @PostMapping("/rejeitar/{idDocumento}")
    public ResponseEntity<?> rejeitarDocumento(
            @PathVariable Long idDocumento,
            @RequestParam Long idFuncionario,
            @RequestParam String motivoRejeicao,
            @RequestParam(required = false) String observacoes) {

        try {
            Map<String, Object> resultado = documentoService.rejeitarDocumento(
                    idDocumento, idFuncionario, motivoRejeicao, observacoes);
            return ResponseEntity.ok(resultado);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("erro", "Erro ao rejeitar documento");
            error.put("detalhes", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Listar documentos de uma família específica (funcionários)
     */
    @GetMapping("/familia/{idFamilia}")
    public ResponseEntity<?> listarDocumentosFamilia(@PathVariable Long idFamilia) {
        try {
            List<Map<String, Object>> documentos = documentoService.listarDocumentosFamilia(idFamilia);
            return ResponseEntity.ok(documentos);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("erro", "Erro ao buscar documentos da família");
            error.put("detalhes", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Visualizar documento de matrícula
     */
    @GetMapping("/matricula/visualizar/{idDocumento}")
    public ResponseEntity<?> visualizarDocumentoMatricula(@PathVariable Long idDocumento) {
        try {
            Map<String, Object> documento = documentoMatriculaService.obterDocumentoParaVisualizacao(idDocumento);

            if (documento == null) {
                return ResponseEntity.notFound().build();
            }

            byte[] conteudo = (byte[]) documento.get("conteudo");
            String nomeArquivo = (String) documento.get("nomeArquivo");
            String tipoMime = (String) documento.get("tipoMime");

            HttpHeaders headers = new HttpHeaders();

            // Para visualização inline (não download)
            if (tipoMime.equals("application/pdf")) {
                headers.setContentType(MediaType.APPLICATION_PDF);
                headers.setContentDispositionFormData("inline", nomeArquivo);
            } else if (tipoMime.startsWith("image/")) {
                headers.setContentType(MediaType.parseMediaType(tipoMime));
                headers.setContentDispositionFormData("inline", nomeArquivo);
            } else {
                headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
                headers.setContentDispositionFormData("attachment", nomeArquivo);
            }

            return ResponseEntity.ok()
                    .headers(headers)
                    .body(conteudo);

        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("erro", "Erro ao visualizar documento");
            error.put("detalhes", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Validar tipos de arquivo permitidos
     */
    private boolean isValidFileType(String tipoMime) {
        return tipoMime != null && (tipoMime.equals("application/pdf") ||
                tipoMime.equals("image/jpeg") ||
                tipoMime.equals("image/jpg") ||
                tipoMime.equals("image/png"));
    }
}

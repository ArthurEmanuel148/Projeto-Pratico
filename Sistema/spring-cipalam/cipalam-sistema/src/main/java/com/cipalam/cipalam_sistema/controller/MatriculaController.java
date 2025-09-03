package com.cipalam.cipalam_sistema.controller;

import com.cipalam.cipalam_sistema.model.TipoDocumento;
import com.cipalam.cipalam_sistema.model.Pessoa;
import com.cipalam.cipalam_sistema.model.Login;
import com.cipalam.cipalam_sistema.model.Responsavel;
import com.cipalam.cipalam_sistema.service.TipoDocumentoService;
import com.cipalam.cipalam_sistema.service.InteresseMatriculaService;
import com.cipalam.cipalam_sistema.service.DocumentoMatriculaService;
import com.cipalam.cipalam_sistema.service.MatriculaService;
import com.cipalam.cipalam_sistema.repository.PessoaRepository;
import com.cipalam.cipalam_sistema.repository.LoginRepository;
import com.cipalam.cipalam_sistema.repository.ResponsavelRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.sql.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/matricula")
@CrossOrigin(origins = { "http://localhost:8100", "http://localhost:4200" })
public class MatriculaController {

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @Autowired
    private TipoDocumentoService tipoDocumentoService;

    @Autowired
    private InteresseMatriculaService interesseMatriculaService;

    @Autowired
    private PessoaRepository pessoaRepository;

    @Autowired
    private LoginRepository loginRepository;

    @Autowired
    private ResponsavelRepository responsavelRepository;

    @Autowired
    private DocumentoMatriculaService documentoMatriculaService;

    @PostMapping("/iniciar")
    public ResponseEntity<?> iniciarMatricula(@RequestBody Map<String, Object> dadosMatricula) {
        try {
            // Extrair dados do request
            @SuppressWarnings("unchecked")
            Map<String, Object> dadosResponsavel = (Map<String, Object>) dadosMatricula.get("dadosResponsavel");

            // Criar credenciais para o responsável
            String email = dadosResponsavel != null ? (String) dadosResponsavel.get("emailResponsavel")
                    : "responsavel@temp.com";

            String nomeResponsavel = dadosResponsavel != null ? (String) dadosResponsavel.get("nomeResponsavel")
                    : "Responsável";

            String cpfResponsavel = dadosResponsavel != null ? (String) dadosResponsavel.get("cpfResponsavel")
                    : "000.000.000-00";

            String dataNascimento = dadosResponsavel != null
                    ? (String) dadosResponsavel.get("dataNascimentoResponsavel")
                    : "1990-01-01";

            String tipoCota = (String) dadosMatricula.get("tipoCota");
            if (tipoCota == null) {
                @SuppressWarnings("unchecked")
                Map<String, Object> tipoVaga = (Map<String, Object>) dadosMatricula.get("tipoVaga");
                tipoCota = tipoVaga != null ? (String) tipoVaga.get("tipoCota") : "livre";
            }

            // Verificar se já existe login para este email
            Optional<Login> loginExistente = loginRepository.findByUsuario(email);

            // Extrair os últimos 4 dígitos do CPF para ser a senha do responsável
            String cpfNumeros = cpfResponsavel.replaceAll("[^0-9]", ""); // Remove pontos e traços
            String senha = cpfNumeros.substring(cpfNumeros.length() - 4); // Últimos 4 dígitos
            String usuario = email;

            if (loginExistente.isEmpty()) {
                // Verificar se já existe pessoa com esse CPF
                Optional<Pessoa> pessoaExistente = pessoaRepository.findByCpfPessoa(cpfResponsavel);

                Pessoa pessoaSalva;
                if (pessoaExistente.isPresent()) {
                    // Pessoa já existe, usar a existente
                    pessoaSalva = pessoaExistente.get();
                } else {
                    // Criar nova pessoa
                    Pessoa novaPessoa = new Pessoa();
                    novaPessoa.setNmPessoa(nomeResponsavel);
                    novaPessoa.setCpfPessoa(cpfResponsavel);

                    // Converter string para LocalDate e depois para java.sql.Date
                    LocalDate dataNasc = LocalDate.parse(dataNascimento);
                    novaPessoa.setDtNascPessoa(Date.valueOf(dataNasc));
                    novaPessoa.setEmail(email);

                    // Salvar pessoa
                    pessoaSalva = pessoaRepository.save(novaPessoa);
                }

                // Criar login
                Login novoLogin = new Login();
                novoLogin.setUsuario(usuario);
                // Criptografar a senha (últimos 4 dígitos do CPF) usando BCrypt
                String senhaCriptografada = passwordEncoder.encode(senha);
                novoLogin.setSenha(senhaCriptografada);
                novoLogin.setPessoa(pessoaSalva);

                loginRepository.save(novoLogin);

                // Criar responsável se não existir
                if (!responsavelRepository.existsById(pessoaSalva.getIdPessoa())) {
                    Responsavel novoResponsavel = new Responsavel(pessoaSalva.getIdPessoa());
                    responsavelRepository.save(novoResponsavel);
                }
            } else {
                // Login já existe, atualizar a senha para a nova senha padrão
                Login loginExist = loginExistente.get();
                loginExist.setSenha(senha);
                loginRepository.save(loginExist);

                // Garantir que existe responsável para esta pessoa
                Pessoa pessoa = loginExist.getPessoa();
                if (!responsavelRepository.existsById(pessoa.getIdPessoa())) {
                    Responsavel novoResponsavel = new Responsavel(pessoa.getIdPessoa());
                    responsavelRepository.save(novoResponsavel);
                }
            }

            // Buscar documentos necessários para esta cota
            List<TipoDocumento> documentosNecessarios = tipoDocumentoService.listarPorCota(tipoCota);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Matrícula iniciada com sucesso!");

            Map<String, String> credenciais = new HashMap<>();
            credenciais.put("usuario", usuario);
            credenciais.put("senha", senha);
            response.put("credenciaisResponsavel", credenciais);

            response.put("documentosNecessarios", documentosNecessarios);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Erro ao iniciar matrícula: " + e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @GetMapping("/tipos-documentos")
    public ResponseEntity<List<TipoDocumento>> buscarTiposDocumentos(
            @RequestParam(required = false) String tipoCota) {

        if (tipoCota != null && !tipoCota.isEmpty()) {
            List<TipoDocumento> tipos = tipoDocumentoService.listarPorCota(tipoCota);
            return ResponseEntity.ok(tipos);
        } else {
            List<TipoDocumento> tipos = tipoDocumentoService.listarTodos();
            return ResponseEntity.ok(tipos);
        }
    }

    @GetMapping("/status/{interesseId}")
    public ResponseEntity<?> buscarStatusMatricula(@PathVariable Integer interesseId) {
        try {
            // Buscar interesse de matrícula
            var interesse = interesseMatriculaService.buscarPorId(interesseId);

            if (interesse.isPresent()) {
                Map<String, Object> response = new HashMap<>();
                response.put("id", interesse.get().getId());
                response.put("protocolo", interesse.get().getProtocolo());
                response.put("status", interesse.get().getStatus());
                response.put("dataEnvio", interesse.get().getDataEnvio());

                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Erro ao buscar status: " + e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @GetMapping("/documentos/{interesseId}")
    public ResponseEntity<List<Map<String, Object>>> listarDocumentosMatricula(@PathVariable Integer interesseId) {
        try {
            // Por enquanto, retornar lista vazia
            // Futuramente implementar busca de documentos anexados
            List<Map<String, Object>> documentos = List.of();
            return ResponseEntity.ok(documentos);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // ==========================================
    // ENDPOINTS PARA PAINEL DO RESPONSÁVEL
    // ==========================================

    /**
     * Busca documentos pendentes para o responsável logado
     */
    @GetMapping("/responsavel/documentos-pendentes")
    public ResponseEntity<?> buscarDocumentosPendentes(@RequestParam Long usuarioId) {
        try {
            List<Map<String, Object>> documentosPendentes = documentoMatriculaService
                    .buscarPendentesPorUsuario(usuarioId);

            Map<String, Object> response = new HashMap<>();
            response.put("documentos", documentosPendentes);
            response.put("totalPendentes", documentosPendentes.size());
            response.put("totalCompletos", 0);
            response.put("percentualConclusao", 0);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Erro ao buscar documentos pendentes: " + e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    /**
     * Busca status da matrícula para o responsável
     */
    @GetMapping("/responsavel/status")
    public ResponseEntity<?> buscarStatusMatriculaResponsavel(@RequestParam Long usuarioId) {
        try {
            // Buscar pessoa pelo ID do usuário
            Optional<Pessoa> pessoa = pessoaRepository.findById(usuarioId.intValue());

            Map<String, Object> status = new HashMap<>();
            status.put("id", 1);
            status.put("protocolo", "PROTO-2024-001");
            status.put("nomeCompleto", pessoa.map(Pessoa::getNmPessoa).orElse("Responsável"));
            status.put("cpf", pessoa.map(Pessoa::getCpfPessoa).orElse("000.000.000-00"));
            status.put("email", pessoa.map(Pessoa::getEmail).orElse("responsavel@email.com"));
            status.put("status", "documentos_pendentes");
            status.put("dataEnvio", LocalDateTime.now().minusDays(2));
            status.put("dataInicioMatricula", LocalDateTime.now().minusDays(1));

            return ResponseEntity.ok(status);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Erro ao buscar status: " + e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    /**
     * Anexa arquivo a um documento
     */
    @PostMapping("/responsavel/anexar-documento")
    public ResponseEntity<?> anexarDocumento(
            @RequestParam("documentoId") Long documentoId,
            @RequestParam("arquivo") MultipartFile arquivo,
            @RequestParam(value = "observacoes", required = false) String observacoes) {

        try {
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

            // Mock de documento anexado
            Map<String, Object> documento = new HashMap<>();
            documento.put("idDocumentoMatricula", documentoId);
            documento.put("status", "anexado");
            documento.put("nomeArquivoOriginal", arquivo.getOriginalFilename());
            documento.put("tipoArquivo", contentType);
            documento.put("tamanhoArquivo", arquivo.getSize());
            documento.put("dataEnvio", LocalDateTime.now());
            documento.put("observacoes", observacoes);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Documento anexado com sucesso!");
            response.put("documento", documento);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Erro ao anexar documento: " + e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    /**
     * Assina documento digitalmente
     */
    @PostMapping("/responsavel/assinar-documento")
    public ResponseEntity<?> assinarDocumento(@RequestBody Map<String, Object> request) {
        try {
            Long documentoId = ((Number) request.get("documentoId")).longValue();
            String assinatura = (String) request.get("assinatura");
            String observacoes = (String) request.get("observacoes");

            // Mock de documento assinado
            Map<String, Object> documento = new HashMap<>();
            documento.put("idDocumentoMatricula", documentoId);
            documento.put("status", "assinado");
            documento.put("assinaturaDigital", assinatura);
            documento.put("dataAssinatura", LocalDateTime.now());
            documento.put("observacoes", observacoes);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Documento assinado com sucesso!");
            response.put("documento", documento);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Erro ao assinar documento: " + e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    /**
     * Busca template de um documento
     */
    @GetMapping("/responsavel/template-documento/{tipoDocumentoId}")
    public ResponseEntity<?> buscarTemplateDocumento(@PathVariable Long tipoDocumentoId) {
        try {
            Optional<TipoDocumento> tipoOpt = tipoDocumentoService.buscarPorId(tipoDocumentoId);

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
                        LocalDate.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")));
            }

            Map<String, Object> response = new HashMap<>();
            response.put("template", template);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Erro ao buscar template: " + e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    // ===================================================================
    // NOVOS ENDPOINTS PARA FLUXO DE INICIAR MATRÍCULA
    // ===================================================================

    @Autowired
    private MatriculaService matriculaService;

    /**
     * GET /api/matricula/turmas-disponiveis
     * Lista turmas com vagas disponíveis
     */
    @GetMapping("/turmas-disponiveis")
    public ResponseEntity<?> listarTurmasDisponiveis() {
        try {
            List<com.cipalam.cipalam_sistema.model.Turma> turmas = matriculaService.listarTurmasDisponiveis();
            return ResponseEntity.ok(turmas);
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Erro ao buscar turmas: " + e.getMessage());
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    /**
     * GET /api/matricula/turmas
     * Lista todas as turmas ativas
     */
    @GetMapping("/turmas")
    public ResponseEntity<?> listarTodasTurmas() {
        try {
            List<com.cipalam.cipalam_sistema.model.Turma> turmas = matriculaService.listarTodasTurmas();
            return ResponseEntity.ok(turmas);
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Erro ao buscar turmas: " + e.getMessage());
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    /**
     * GET /api/matricula/turma/{id}
     * Busca turma por ID
     */
    @GetMapping("/turma/{id}")
    public ResponseEntity<?> buscarTurmaPorId(@PathVariable Long id) {
        try {
            com.cipalam.cipalam_sistema.model.Turma turma = matriculaService.buscarTurmaPorId(id);
            if (turma != null) {
                return ResponseEntity.ok(turma);
            }

            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Turma não encontrada");
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Erro ao buscar turma: " + e.getMessage());
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    /**
     * POST /api/matricula/iniciar-procedural
     * Executa o processo de iniciar matrícula usando a procedure
     */
    @PostMapping("/iniciar-procedural")
    public ResponseEntity<?> iniciarMatriculaProcedural(
            @RequestBody com.cipalam.cipalam_sistema.DTO.IniciarMatriculaRequest request) {
        try {
            // Validar dados obrigatórios
            if (request.getIdDeclaracao() == null || request.getIdTurma() == null
                    || request.getIdFuncionario() == null) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("message", "Dados obrigatórios não informados");
                return ResponseEntity.badRequest().body(errorResponse);
            }

            com.cipalam.cipalam_sistema.DTO.IniciarMatriculaResponse response = matriculaService
                    .iniciarMatricula(request);

            Map<String, Object> responseMap = new HashMap<>();
            responseMap.put("success", response.getSucesso());
            responseMap.put("message", response.getMensagem());
            responseMap.put("data", response);

            if (response.getSucesso()) {
                return ResponseEntity.ok(responseMap);
            } else {
                return ResponseEntity.badRequest().body(responseMap);
            }

        } catch (Exception e) {
            e.printStackTrace();
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Erro interno do servidor: " + e.getMessage());
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }
}

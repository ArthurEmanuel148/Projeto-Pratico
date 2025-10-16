package com.cipalam.cipalam_sistema.controller;

import com.cipalam.cipalam_sistema.service.TurmaService;
import com.cipalam.cipalam_sistema.service.AlunoService;
import com.cipalam.cipalam_sistema.service.InteresseMatriculaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/turmas-alunos")
@CrossOrigin(origins = { "http://localhost:8100", "http://localhost:4200" })
public class TurmasAlunosController {

    @Autowired
    private TurmaService turmaService;

    @Autowired
    private AlunoService alunoService;

    @Autowired
    private InteresseMatriculaService interesseMatriculaService;

    /**
     * Lista todas as turmas com informações dos alunos matriculados
     */
    @GetMapping("/turmas")
    public ResponseEntity<?> listarTurmasComAlunos() {
        try {
            List<Map<String, Object>> turmas = turmaService.listarTurmasComContadorAlunos();

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", turmas);
            response.put("message", "Turmas listadas com sucesso");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Erro ao listar turmas: " + e.getMessage());
            errorResponse.put("error", e.getClass().getSimpleName());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * Lista alunos de uma turma específica
     */
    @GetMapping("/turmas/{idTurma}/alunos")
    public ResponseEntity<?> listarAlunosDaTurma(@PathVariable Integer idTurma) {
        try {
            List<Map<String, Object>> alunos = alunoService.listarAlunosPorTurma(idTurma);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", alunos);
            response.put("turmaId", idTurma);
            response.put("totalAlunos", alunos.size());
            response.put("message", "Alunos da turma listados com sucesso");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Erro ao listar alunos da turma: " + e.getMessage());
            errorResponse.put("error", e.getClass().getSimpleName());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * Obtém detalhes completos de um aluno específico
     */
    @GetMapping("/alunos/{idAluno}/detalhes")
    public ResponseEntity<?> obterDetalhesAluno(@PathVariable Integer idAluno) {
        try {
            Map<String, Object> detalhes = alunoService.obterDetalhesCompletos(idAluno);

            if (detalhes == null) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("message", "Aluno não encontrado");
                return ResponseEntity.notFound().build();
            }

            // Buscar integrantes da família da tabela
            List<Map<String, Object>> integrantes = alunoService.listarIntegrantesFamilia(idAluno);
            detalhes.put("integrantesFamiliaTabela", integrantes);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", detalhes);
            response.put("message", "Detalhes do aluno obtidos com sucesso");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Erro ao obter detalhes do aluno: " + e.getMessage());
            errorResponse.put("error", e.getClass().getSimpleName());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * Obtém integrantes da família do aluno
     */
    @GetMapping("/alunos/{idAluno}/familia")
    public ResponseEntity<?> obterIntegrantesFamilia(@PathVariable Integer idAluno) {
        try {
            List<Map<String, Object>> integrantes = alunoService.listarIntegrantesFamilia(idAluno);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", integrantes);
            response.put("totalIntegrantes", integrantes.size());
            response.put("message", "Integrantes da família listados com sucesso");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Erro ao listar integrantes da família: " + e.getMessage());
            errorResponse.put("error", e.getClass().getSimpleName());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * Alterar turma do aluno
     */
    @PutMapping("/alunos/{idAluno}/turma")
    public ResponseEntity<?> alterarTurmaAluno(
            @PathVariable Integer idAluno,
            @RequestBody Map<String, Object> request) {
        try {
            Integer novaTurmaId = (Integer) request.get("novaTurmaId");
            String observacoes = (String) request.get("observacoes");

            if (novaTurmaId == null) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("message", "ID da nova turma é obrigatório");
                return ResponseEntity.badRequest().body(errorResponse);
            }

            boolean sucesso = alunoService.alterarTurma(idAluno, novaTurmaId, observacoes);

            if (sucesso) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("message", "Turma do aluno alterada com sucesso");
                response.put("alunoId", idAluno);
                response.put("novaTurmaId", novaTurmaId);

                return ResponseEntity.ok(response);
            } else {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("message", "Não foi possível alterar a turma do aluno");
                return ResponseEntity.badRequest().body(errorResponse);
            }

        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Erro ao alterar turma do aluno: " + e.getMessage());
            errorResponse.put("error", e.getClass().getSimpleName());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * Matricular aluno (atualizar status da declaração para 'matriculado')
     */
    @PostMapping("/declaracoes/{idDeclaracao}/matricular")
    public ResponseEntity<?> matricularAluno(
            @PathVariable Integer idDeclaracao,
            @RequestBody Map<String, Object> request) {
        try {
            Integer idTurma = (Integer) request.get("idTurma");
            String observacoes = (String) request.get("observacoes");

            if (idTurma == null) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("message", "ID da turma é obrigatório");
                return ResponseEntity.badRequest().body(errorResponse);
            }

            // Executar procedure de matrícula que já existe
            boolean sucesso = interesseMatriculaService.processarMatricula(idDeclaracao, idTurma);

            if (sucesso) {
                // Atualizar status para 'matriculado' para ocultar da listagem
                interesseMatriculaService.atualizarStatus(idDeclaracao, "matriculado");

                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("message", "Aluno matriculado com sucesso");
                response.put("declaracaoId", idDeclaracao);
                response.put("turmaId", idTurma);

                return ResponseEntity.ok(response);
            } else {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("message", "Não foi possível matricular o aluno");
                return ResponseEntity.badRequest().body(errorResponse);
            }

        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Erro ao matricular aluno: " + e.getMessage());
            errorResponse.put("error", e.getClass().getSimpleName());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * Finalizar matrícula (atualizar status da declaração para 'matriculado')
     */
    @PutMapping("/declaracoes/{idDeclaracao}/finalizar")
    public ResponseEntity<?> finalizarMatricula(@PathVariable Integer idDeclaracao) {
        try {
            // Atualizar status para 'matriculado' para ocultar da listagem
            interesseMatriculaService.atualizarStatus(idDeclaracao, "matriculado");

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Matrícula finalizada com sucesso");
            response.put("declaracaoId", idDeclaracao);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Erro ao finalizar matrícula: " + e.getMessage());
            errorResponse.put("error", e.getClass().getSimpleName());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * Obter documentos do aluno
     */
    @GetMapping("/alunos/{idAluno}/documentos")
    public ResponseEntity<?> obterDocumentosAluno(@PathVariable Integer idAluno) {
        try {
            System.out.println("CONTROLLER: Buscando documentos para aluno ID: " + idAluno);
            List<Map<String, Object>> documentos = alunoService.listarDocumentosAluno(idAluno);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", documentos);
            response.put("totalDocumentos", documentos.size());
            response.put("message", "Documentos do aluno listados com sucesso");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Erro ao listar documentos do aluno: " + e.getMessage());
            errorResponse.put("error", e.getClass().getSimpleName());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * Obter documentos do aluno pelo ID do responsável
     * Busca o aluno vinculado ao responsável e retorna seus documentos
     */
    @GetMapping("/responsavel/{idResponsavel}/documentos")
    public ResponseEntity<?> obterDocumentosPorResponsavel(@PathVariable Integer idResponsavel) {
        try {
            System.out.println("CONTROLLER: Buscando documentos para responsável ID: " + idResponsavel);

            // Buscar ID do aluno vinculado ao responsável
            Integer idAluno = alunoService.buscarAlunoPorResponsavel(idResponsavel);

            if (idAluno == null) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("message", "Nenhum aluno encontrado para este responsável");
                return ResponseEntity.notFound().build();
            }

            System.out.println("CONTROLLER: Aluno encontrado - ID: " + idAluno);

            // Buscar documentos do aluno usando o método que retorna formato organizado
            Map<String, Object> documentosOrganizados = alunoService.listarDocumentosAlunoParaResponsavel(idAluno,
                    idResponsavel);

            return ResponseEntity.ok(documentosOrganizados);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Erro ao listar documentos por responsável: " + e.getMessage());
            errorResponse.put("error", e.getClass().getSimpleName());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * Anexar documento pelo responsável em matrícula finalizada
     * Recebe arquivo e salva em tbDocumentoMatricula vinculado às tabelas corretas
     */
    @PostMapping("/responsavel/anexar-documento")
    public ResponseEntity<?> anexarDocumentoPorResponsavel(
            @RequestParam("arquivo") MultipartFile arquivo,
            @RequestParam("documentoId") Integer documentoId,
            @RequestParam("responsavelId") Integer responsavelId) {
        try {
            System.out.println("========================================");
            System.out.println("CONTROLLER: Anexando documento para responsável ID: " + responsavelId);
            System.out.println("CONTROLLER: Documento ID: " + documentoId);
            System.out.println("CONTROLLER: Arquivo: " + arquivo.getOriginalFilename());
            System.out.println("CONTROLLER: Tamanho: " + arquivo.getSize() + " bytes");
            System.out.println("========================================");

            // Anexar documento usando o serviço
            boolean sucesso = alunoService.anexarDocumentoPorResponsavel(arquivo, documentoId, responsavelId);

            Map<String, Object> response = new HashMap<>();
            response.put("success", sucesso);
            response.put("message", sucesso ? "Documento anexado com sucesso" : "Erro ao anexar documento");
            response.put("documentoId", documentoId);

            System.out.println("CONTROLLER: Resposta - sucesso: " + sucesso);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("========================================");
            System.err.println("❌ CONTROLLER: ERRO ao anexar documento");
            System.err.println("Mensagem: " + e.getMessage());
            System.err.println("Tipo: " + e.getClass().getSimpleName());
            e.printStackTrace();
            System.err.println("========================================");

            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Erro ao anexar documento: " + e.getMessage());
            errorResponse.put("error", e.getClass().getSimpleName());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * Visualizar documento específico (metadados)
     */
    @GetMapping("/documentos/{idDocumento}/visualizar")
    public ResponseEntity<?> visualizarDocumento(@PathVariable Integer idDocumento) {
        try {
            Map<String, Object> documento = alunoService.obterDocumento(idDocumento);

            if (documento == null) {
                return ResponseEntity.notFound().build();
            }

            return ResponseEntity.ok(documento);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Erro ao visualizar documento: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * Baixar arquivo do documento (retorna o arquivo físico)
     */
    @GetMapping("/documentos/{idDocumento}/arquivo")
    public ResponseEntity<?> baixarArquivoDocumento(@PathVariable Integer idDocumento) {
        try {
            System.out.println("========================================");
            System.out.println("📥 CONTROLLER: Baixando arquivo do documento ID: " + idDocumento);

            byte[] arquivoBytes = alunoService.obterArquivoDocumento(idDocumento);

            if (arquivoBytes == null || arquivoBytes.length == 0) {
                System.out.println("❌ Arquivo não encontrado ou vazio");
                return ResponseEntity.notFound().build();
            }

            System.out.println("✅ Arquivo carregado: " + arquivoBytes.length + " bytes");
            System.out.println("========================================");

            // Retornar o arquivo como PDF (você pode detectar o tipo dinamicamente depois)
            return ResponseEntity.ok()
                    .header("Content-Type", "application/pdf")
                    .header("Content-Disposition", "inline; filename=documento.pdf")
                    .body(arquivoBytes);

        } catch (Exception e) {
            System.err.println("========================================");
            System.err.println("❌ CONTROLLER: ERRO ao baixar arquivo");
            System.err.println("Mensagem: " + e.getMessage());
            e.printStackTrace();
            System.err.println("========================================");

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Aprovar um documento
     */
    @PostMapping("/documentos/{idDocumento}/aprovar")
    public ResponseEntity<?> aprovarDocumento(@PathVariable Integer idDocumento,
            @RequestBody Map<String, Object> request) {
        try {
            String observacoes = (String) request.get("observacoes");
            boolean sucesso = alunoService.aprovarDocumento(idDocumento, observacoes);

            Map<String, Object> response = new HashMap<>();
            response.put("success", sucesso);
            response.put("message", sucesso ? "Documento aprovado com sucesso" : "Erro ao aprovar documento");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Erro ao aprovar documento: " + e.getMessage());
            errorResponse.put("error", e.getClass().getSimpleName());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * Rejeitar um documento
     */
    @PostMapping("/documentos/{idDocumento}/rejeitar")
    public ResponseEntity<?> rejeitarDocumento(@PathVariable Integer idDocumento,
            @RequestBody Map<String, Object> request) {
        try {
            String motivoRejeicao = (String) request.get("motivo");
            boolean sucesso = alunoService.rejeitarDocumento(idDocumento, motivoRejeicao);

            Map<String, Object> response = new HashMap<>();
            response.put("success", sucesso);
            response.put("message", sucesso ? "Documento rejeitado com sucesso" : "Erro ao rejeitar documento");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Erro ao rejeitar documento: " + e.getMessage());
            errorResponse.put("error", e.getClass().getSimpleName());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
}
package com.cipalam.cipalam_sistema.service;

import com.cipalam.cipalam_sistema.DTO.IniciarMatriculaRequest;
import com.cipalam.cipalam_sistema.DTO.IniciarMatriculaResponse;
import com.cipalam.cipalam_sistema.model.Turma;
import com.cipalam.cipalam_sistema.model.Login;
import com.cipalam.cipalam_sistema.repository.TurmaRepository;
import com.cipalam.cipalam_sistema.repository.LoginRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class MatriculaService {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private TurmaRepository turmaRepository;

    @Autowired
    private LoginRepository loginRepository;

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    /**
     * Lista todas as turmas com vagas disponíveis
     */
    public List<Turma> listarTurmasDisponiveis() {
        return turmaRepository.findTurmasComVagas();
    }

    /**
     * Executa a procedure sp_IniciarMatricula
     */
    @Transactional
    public IniciarMatriculaResponse iniciarMatricula(IniciarMatriculaRequest request) {
        try {
            // Teste simples sem validações para isolar problema
            System.out.println("=== INICIANDO MATRICULA ===");
            System.out.println("ID Declaracao: " + request.getIdDeclaracao());
            System.out.println("ID Turma: " + request.getIdTurma());
            System.out.println("ID Funcionario: " + request.getIdFuncionario());

            // Executar a procedure sp_IniciarMatricula
            String sql = "CALL sp_IniciarMatricula(?, ?, ?)";

            List<Map<String, Object>> resultados = jdbcTemplate.queryForList(sql,
                    request.getIdDeclaracao(),
                    request.getIdTurma(),
                    request.getIdFuncionario());

            // Verificar se houve retorno da procedure
            if (resultados.isEmpty()) {
                return new IniciarMatriculaResponse("Erro ao executar procedure - nenhum resultado retornado");
            }

            Map<String, Object> resultado = resultados.get(0);

            // Extrair dados do resultado
            Long idFamilia = ((Number) resultado.get("idFamilia")).longValue();
            Long idResponsavel = ((Number) resultado.get("idResponsavel")).longValue();
            Long idAluno = ((Number) resultado.get("idAluno")).longValue();
            String matricula = (String) resultado.get("matricula");
            String loginResponsavel = (String) resultado.get("loginResponsavel");
            String senhaTemporaria = (String) resultado.get("senhaTemporaria");

            // Criptografar senha se necessário
            this.criptografarSenhaSeNecessario(loginResponsavel, senhaTemporaria);

            return new IniciarMatriculaResponse(
                    idFamilia, idResponsavel, idAluno,
                    matricula, loginResponsavel, senhaTemporaria);

        } catch (Exception e) {
            e.printStackTrace();
            return new IniciarMatriculaResponse("Erro ao iniciar matrícula: " + e.getMessage());
        }
    }

    /**
     * Busca turma por ID
     */
    public Turma buscarTurmaPorId(Long id) {
        return turmaRepository.findById(id).orElse(null);
    }

    /**
     * Lista todas as turmas ativas
     */
    public List<Turma> listarTodasTurmas() {
        return turmaRepository.findTurmasAtivas();
    }

    /**
     * Criptografa a senha de um login se ela estiver em texto claro
     */
    private void criptografarSenhaSeNecessario(String usuario, String senhaTextoClaro) {
        // Execute em uma nova transação separada
        Optional<Login> loginOptional = loginRepository.findByUsuario(usuario);

        if (loginOptional.isPresent()) {
            Login login = loginOptional.get();

            // Verificar se a senha está em texto claro (não é um hash BCrypt)
            if (!login.getSenha().startsWith("$2") && login.getSenha().length() <= 10) {
                // Criptografar a senha
                String senhaCriptografada = passwordEncoder.encode(senhaTextoClaro);
                login.setSenha(senhaCriptografada);
                loginRepository.save(login);
            }
        }
    }
}
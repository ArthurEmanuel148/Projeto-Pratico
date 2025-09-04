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
    private TurmaRepository turmaRepository;

    @Autowired
    private LoginRepository loginRepository;

    @Autowired
    private JdbcTemplate jdbcTemplate;

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

            System.out.println("=== DADOS DA PROCEDURE ===");
            System.out.println("Login Responsavel: " + loginResponsavel);
            System.out.println("Senha Temporaria (raw): " + senhaTemporaria);
            System.out.println("Resultado completo: " + resultado);

            // Criptografar senha se necessário
            this.criptografarSenhaImediatamente(loginResponsavel, senhaTemporaria);

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
     * Criptografa a senha imediatamente após a criação
     */
    @Transactional
    private void criptografarSenhaImediatamente(String usuario, String senhaTextoClaro) {
        try {
            Optional<Login> loginOptional = loginRepository.findByUsuario(usuario);

            if (loginOptional.isPresent()) {
                Login login = loginOptional.get();

                // Verificar se a senha precisa ser criptografada
                if (!login.getSenha().startsWith("$2")) {
                    System.out.println("Criptografando senha para usuário: " + usuario);

                    String senhaCriptografada = passwordEncoder.encode(senhaTextoClaro);
                    login.setSenha(senhaCriptografada);
                    loginRepository.save(login);

                    System.out.println("Senha criptografada com sucesso para: " + usuario);
                } else {
                    System.out.println("Senha já criptografada para usuário: " + usuario);
                }
            } else {
                System.out.println("Login não encontrado para usuário: " + usuario);
            }
        } catch (Exception e) {
            System.err.println("Erro ao criptografar senha para usuário " + usuario + ": " + e.getMessage());
            e.printStackTrace();
        }
    }

    /**
     * Endpoint para criptografar senha de usuário específico
     */
    @Transactional
    public String criptografarSenhaUsuario(String usuario) {
        try {
            Optional<Login> loginOptional = loginRepository.findByUsuario(usuario);

            if (loginOptional.isPresent()) {
                Login login = loginOptional.get();

                if (!login.getSenha().startsWith("$2")) {
                    String senhaTextoClaro = login.getSenha();
                    String senhaCriptografada = passwordEncoder.encode(senhaTextoClaro);
                    login.setSenha(senhaCriptografada);
                    loginRepository.save(login);

                    return "Senha criptografada com sucesso para usuário: " + usuario;
                } else {
                    return "Senha já estava criptografada para usuário: " + usuario;
                }
            } else {
                return "Usuário não encontrado: " + usuario;
            }
        } catch (Exception e) {
            return "Erro ao criptografar senha: " + e.getMessage();
        }
    }
}

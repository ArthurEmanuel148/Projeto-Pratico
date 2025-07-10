package com.cipalam.cipalam_sistema.service.auth;

import com.cipalam.cipalam_sistema.DTO.auth.AuthLoginRequestDTO;
import com.cipalam.cipalam_sistema.DTO.auth.AuthLoginResponseDTO;
import com.cipalam.cipalam_sistema.DTO.auth.RegisterRequestDTO;
import com.cipalam.cipalam_sistema.DTO.auth.RegisterResponseDTO;
import com.cipalam.cipalam_sistema.enums.TipoUsuario;
import com.cipalam.cipalam_sistema.model.Login;
import com.cipalam.cipalam_sistema.model.Pessoa;
import com.cipalam.cipalam_sistema.model.Responsavel;
import com.cipalam.cipalam_sistema.repository.LoginRepository;
import com.cipalam.cipalam_sistema.repository.PessoaRepository;
import com.cipalam.cipalam_sistema.repository.ResponsavelRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Date;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenService jwtTokenService;
    private final PasswordEncoder passwordEncoder;
    private final LoginRepository loginRepository;
    private final PessoaRepository pessoaRepository;
    private final ResponsavelRepository responsavelRepository;

    @Transactional
    public AuthLoginResponseDTO authenticate(AuthLoginRequestDTO request) {
        try {
            // Autenticar usuário
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getUsuario(), request.getSenha()));

            // Gerar tokens
            String accessToken = jwtTokenService.generateToken(authentication);
            String refreshToken = jwtTokenService.generateRefreshToken(authentication);

            // Obter detalhes do usuário
            UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();

            return AuthLoginResponseDTO.builder()
                    .accessToken(accessToken)
                    .refreshToken(refreshToken)
                    .expiresIn(24 * 60 * 60L) // 24 horas em segundos
                    .usuarioId(userPrincipal.getId())
                    .nomePessoa(userPrincipal.getPessoa().getNmPessoa())
                    .email(userPrincipal.getPessoa().getEmail())
                    .success(true)
                    .message("Login realizado com sucesso")
                    .build();

        } catch (AuthenticationException e) {
            log.error("Erro na autenticação para usuário: {}", request.getUsuario(), e);
            return AuthLoginResponseDTO.builder()
                    .success(false)
                    .message("Credenciais inválidas")
                    .build();
        }
    }

    @Transactional
    public RegisterResponseDTO registerResponsavel(RegisterRequestDTO request) {
        try {
            // Verificar se usuário já existe
            Optional<Login> existingLogin = loginRepository.findByUsuario(request.getEmail());
            if (existingLogin.isPresent()) {
                return RegisterResponseDTO.builder()
                        .success(false)
                        .message("Usuário já existe com este email")
                        .build();
            }

            // Verificar se CPF já existe
            Optional<Pessoa> existingPessoa = pessoaRepository.findByCpfPessoa(request.getCpf());
            if (existingPessoa.isPresent()) {
                return RegisterResponseDTO.builder()
                        .success(false)
                        .message("CPF já cadastrado no sistema")
                        .build();
            }

            // Criar pessoa
            Pessoa pessoa = new Pessoa();
            pessoa.setNmPessoa(request.getNome());
            pessoa.setCpfPessoa(request.getCpf());
            pessoa.setEmail(request.getEmail());
            pessoa.setTelefone(request.getTelefone());

            if (request.getDataNascimento() != null) {
                pessoa.setDtNascPessoa(Date.valueOf(request.getDataNascimento()));
            }

            pessoa = pessoaRepository.save(pessoa);

            // Criar login com senha criptografada
            Login login = new Login();
            login.setUsuario(request.getEmail());
            login.setSenha(passwordEncoder.encode(request.getSenha()));
            login.setPessoa(pessoa);

            loginRepository.save(login);

            // Criar responsável
            Responsavel responsavel = new Responsavel();
            responsavel.setPessoaId(pessoa.getIdPessoa());
            responsavelRepository.save(responsavel);

            log.info("Responsável cadastrado com sucesso: {}", request.getEmail());

            return RegisterResponseDTO.builder()
                    .id(pessoa.getIdPessoa().longValue())
                    .nome(pessoa.getNmPessoa())
                    .email(pessoa.getEmail())
                    .cpf(pessoa.getCpfPessoa())
                    .tipoUsuario(TipoUsuario.RESPONSAVEL)
                    .success(true)
                    .message("Responsável cadastrado com sucesso")
                    .build();

        } catch (Exception e) {
            log.error("Erro ao cadastrar responsável: {}", request.getEmail(), e);
            return RegisterResponseDTO.builder()
                    .success(false)
                    .message("Erro interno do servidor")
                    .build();
        }
    }

    public AuthLoginResponseDTO refreshToken(String refreshToken) {
        try {
            if (!jwtTokenService.validateToken(refreshToken)) {
                return AuthLoginResponseDTO.builder()
                        .success(false)
                        .message("Refresh token inválido")
                        .build();
            }

            String username = jwtTokenService.getUsernameFromToken(refreshToken);
            Login login = loginRepository.findByUsuario(username)
                    .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

            // Criar nova autenticação
            UserPrincipal userPrincipal = UserPrincipal.builder()
                    .id(login.getId())
                    .username(login.getUsuario())
                    .password(login.getSenha())
                    .pessoa(login.getPessoa())
                    .tipoUsuario(determineTipoUsuario(login.getPessoa()))
                    .enabled(true)
                    .accountNonExpired(true)
                    .accountNonLocked(true)
                    .credentialsNonExpired(true)
                    .build();

            Authentication authentication = new UsernamePasswordAuthenticationToken(
                    userPrincipal, null, userPrincipal.getAuthorities());

            // Gerar novos tokens
            String newAccessToken = jwtTokenService.generateToken(authentication);
            String newRefreshToken = jwtTokenService.generateRefreshToken(authentication);

            return AuthLoginResponseDTO.builder()
                    .accessToken(newAccessToken)
                    .refreshToken(newRefreshToken)
                    .expiresIn(24 * 60 * 60L)
                    .usuarioId(userPrincipal.getId())
                    .nomePessoa(userPrincipal.getPessoa().getNmPessoa())
                    .email(userPrincipal.getPessoa().getEmail())
                    .success(true)
                    .message("Token renovado com sucesso")
                    .build();

        } catch (Exception e) {
            log.error("Erro ao renovar token", e);
            return AuthLoginResponseDTO.builder()
                    .success(false)
                    .message("Erro ao renovar token")
                    .build();
        }
    }

    private TipoUsuario determineTipoUsuario(Pessoa pessoa) {
        // Verifica se é responsável
        Optional<Responsavel> responsavel = responsavelRepository.findByPessoaId(pessoa.getIdPessoa());
        if (responsavel.isPresent()) {
            return TipoUsuario.RESPONSAVEL;
        }

        // Por padrão, considera como funcionário
        return TipoUsuario.FUNCIONARIO;
    }
}

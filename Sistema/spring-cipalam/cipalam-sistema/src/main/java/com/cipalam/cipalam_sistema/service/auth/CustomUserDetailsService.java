package com.cipalam.cipalam_sistema.service.auth;

import com.cipalam.cipalam_sistema.model.Login;
import com.cipalam.cipalam_sistema.model.Pessoa;
import com.cipalam.cipalam_sistema.repository.LoginRepository;
import com.cipalam.cipalam_sistema.repository.ResponsavelRepository;
import com.cipalam.cipalam_sistema.enums.TipoUsuario;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import jakarta.persistence.EntityManager;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final LoginRepository loginRepository;
    private final ResponsavelRepository responsavelRepository;
    private final EntityManager entityManager;

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Login login = loginRepository.findByUsuario(username)
                .orElseThrow(() -> new UsernameNotFoundException("Usuário não encontrado: " + username));

        Pessoa pessoa = login.getPessoa();
        if (pessoa == null) {
            throw new UsernameNotFoundException("Pessoa não encontrada para o usuário: " + username);
        }

        TipoUsuario tipoUsuario = determineTipoUsuario(pessoa);

        return UserPrincipal.builder()
                .id(login.getId())
                .username(login.getUsuario())
                .password(login.getSenha())
                .pessoa(pessoa)
                .tipoUsuario(tipoUsuario)
                .enabled(true)
                .accountNonExpired(true)
                .accountNonLocked(true)
                .credentialsNonExpired(true)
                .build();
    }

    private TipoUsuario determineTipoUsuario(Pessoa pessoa) {
        // Primeiro, verifica se é funcionário (tem prioridade)
        boolean isFuncionario = entityManager.createNativeQuery(
                "SELECT COUNT(*) FROM tbFuncionario f WHERE f.tbPessoa_idPessoa = ? AND f.ativo = 1")
                .setParameter(1, pessoa.getIdPessoa())
                .getSingleResult() instanceof Number count && count.intValue() > 0;

        if (isFuncionario) {
            return TipoUsuario.FUNCIONARIO;
        }

        // Depois verifica se é responsável
        boolean isResponsavel = entityManager.createNativeQuery(
                "SELECT COUNT(*) FROM tbResponsavel r WHERE r.tbPessoa_idPessoa = ? AND r.ativo = 1")
                .setParameter(1, pessoa.getIdPessoa())
                .getSingleResult() instanceof Number count && count.intValue() > 0;

        if (isResponsavel) {
            return TipoUsuario.RESPONSAVEL;
        }

        // Se não está em nenhuma tabela, assumir que é responsável (caso de login
        // criado na matrícula)
        return TipoUsuario.RESPONSAVEL;
    }
}

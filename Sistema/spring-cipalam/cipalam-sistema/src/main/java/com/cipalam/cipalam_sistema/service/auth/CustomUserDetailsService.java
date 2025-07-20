package com.cipalam.cipalam_sistema.service.auth;

import com.cipalam.cipalam_sistema.model.Login;
import com.cipalam.cipalam_sistema.model.Pessoa;
import com.cipalam.cipalam_sistema.model.Responsavel;
import com.cipalam.cipalam_sistema.repository.LoginRepository;
import com.cipalam.cipalam_sistema.repository.ResponsavelRepository;
import com.cipalam.cipalam_sistema.enums.TipoUsuario;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final LoginRepository loginRepository;
    private final ResponsavelRepository responsavelRepository;

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
        // Verifica se é responsável
        Optional<Responsavel> responsavel = responsavelRepository.findByPessoaId(pessoa.getIdPessoa());
        if (responsavel.isPresent()) {
            return TipoUsuario.RESPONSAVEL;
        }

        // Por padrão, considera como funcionário
        return TipoUsuario.FUNCIONARIO;
    }
}

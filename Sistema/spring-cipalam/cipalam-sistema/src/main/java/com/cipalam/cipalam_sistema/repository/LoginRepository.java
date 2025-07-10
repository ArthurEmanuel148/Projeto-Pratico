package com.cipalam.cipalam_sistema.repository;

import com.cipalam.cipalam_sistema.model.Login;
import com.cipalam.cipalam_sistema.model.Pessoa;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface LoginRepository extends JpaRepository<Login, Integer> {
    Optional<Login> findByUsuario(String usuario);

    Optional<Login> findByUsuarioAndSenha(String usuario, String senha);

    Optional<Login> findByPessoa(Pessoa pessoa);

    boolean existsByUsuario(String usuario);
}
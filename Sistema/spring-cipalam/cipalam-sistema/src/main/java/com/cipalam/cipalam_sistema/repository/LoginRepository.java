package com.cipalam.cipalam_sistema.repository;

import com.cipalam.cipalam_sistema.model.Login;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface LoginRepository extends JpaRepository<Login, Integer> {
    Optional<Login> findByUsuarioAndSenha(String usuario, String senha);
}
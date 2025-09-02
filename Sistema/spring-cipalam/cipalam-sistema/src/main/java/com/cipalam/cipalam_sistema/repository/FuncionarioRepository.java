package com.cipalam.cipalam_sistema.repository;

import com.cipalam.cipalam_sistema.model.Funcionario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FuncionarioRepository extends JpaRepository<Funcionario, Integer> {
    boolean existsByTbPessoaIdPessoa(Integer pessoaId);

    Optional<Funcionario> findByTbPessoaIdPessoa(Integer pessoaId);
}
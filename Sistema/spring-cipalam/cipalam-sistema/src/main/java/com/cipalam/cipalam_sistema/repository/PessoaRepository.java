package com.cipalam.cipalam_sistema.repository;

import com.cipalam.cipalam_sistema.model.Pessoa;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PessoaRepository extends JpaRepository<Pessoa, Integer> {
    Optional<Pessoa> findByCpfPessoa(String cpfPessoa);
}
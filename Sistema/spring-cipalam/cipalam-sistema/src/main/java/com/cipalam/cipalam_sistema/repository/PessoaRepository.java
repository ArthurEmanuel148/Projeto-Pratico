package com.cipalam.cipalam_sistema.repository;

import com.cipalam.cipalam_sistema.model.Pessoa;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PessoaRepository extends JpaRepository<Pessoa, Integer> {
}
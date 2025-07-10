package com.cipalam.cipalam_sistema.repository;

import com.cipalam.cipalam_sistema.model.Responsavel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ResponsavelRepository extends JpaRepository<Responsavel, Integer> {
    Optional<Responsavel> findByPessoaId(Integer pessoaId);
}

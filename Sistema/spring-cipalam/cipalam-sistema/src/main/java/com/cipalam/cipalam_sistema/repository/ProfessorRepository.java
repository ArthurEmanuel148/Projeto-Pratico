package com.cipalam.cipalam_sistema.repository;

import com.cipalam.cipalam_sistema.model.Professor;
import com.cipalam.cipalam_sistema.model.Pessoa;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ProfessorRepository extends JpaRepository<Professor, Integer> {
    boolean existsByPessoa_IdPessoa(Integer idPessoa);

    Optional<Professor> findByPessoa(Pessoa pessoa);
}

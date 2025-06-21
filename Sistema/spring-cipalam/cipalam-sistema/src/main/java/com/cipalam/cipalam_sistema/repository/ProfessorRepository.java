package com.cipalam.cipalam_sistema.repository;

import com.cipalam.cipalam_sistema.model.Professor;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProfessorRepository extends JpaRepository<Professor, Integer> {
    boolean existsByPessoa_IdPessoa(Integer idPessoa);
}

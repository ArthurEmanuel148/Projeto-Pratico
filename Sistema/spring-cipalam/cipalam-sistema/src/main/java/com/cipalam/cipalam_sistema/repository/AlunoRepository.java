package com.cipalam.cipalam_sistema.repository;

import com.cipalam.cipalam_sistema.model.Aluno;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AlunoRepository extends JpaRepository<Aluno, Integer> {
    boolean existsByPessoa_IdPessoa(Integer idPessoa);
}
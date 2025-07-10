package com.cipalam.cipalam_sistema.repository;

import com.cipalam.cipalam_sistema.model.InteresseMatricula;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InteresseMatriculaRepository extends JpaRepository<InteresseMatricula, Integer> {
    Optional<InteresseMatricula> findByProtocolo(String protocolo);

    List<InteresseMatricula> findByResponsavelLogin_IdPessoa(Integer responsavelId);
}

package com.cipalam.cipalam_sistema.repository;

import com.cipalam.cipalam_sistema.model.Funcionalidade;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FuncionalidadeRepository extends JpaRepository<Funcionalidade, Integer> {
    Optional<Funcionalidade> findByChave(String chave);

    List<Funcionalidade> findByAtivoTrue();
}

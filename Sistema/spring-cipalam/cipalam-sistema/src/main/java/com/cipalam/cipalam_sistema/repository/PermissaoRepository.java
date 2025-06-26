package com.cipalam.cipalam_sistema.repository;

import com.cipalam.cipalam_sistema.model.Permissao;
import com.cipalam.cipalam_sistema.model.Pessoa;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PermissaoRepository extends JpaRepository<Permissao, Integer> {

    @Query("SELECT p FROM Permissao p WHERE p.pessoa.idPessoa = :pessoaId AND p.temPermissao = true")
    List<Permissao> findByPessoaIdAndTemPermissaoTrue(@Param("pessoaId") Integer pessoaId);

    @Query("SELECT p FROM Permissao p WHERE p.pessoa.idPessoa = :pessoaId")
    List<Permissao> findByPessoaId(@Param("pessoaId") Integer pessoaId);

    void deleteByPessoa(Pessoa pessoa);
}

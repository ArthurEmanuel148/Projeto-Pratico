package com.cipalam.cipalam_sistema.repository;

import com.cipalam.cipalam_sistema.model.IntegranteFamilia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IntegranteFamiliaRepository extends JpaRepository<IntegranteFamilia, Long> {

    /**
     * Busca todos os integrantes de uma família pelo ID da família
     */
    List<IntegranteFamilia> findByFamiliaId(Long familiaId);

    /**
     * Busca integrantes da família pelo ID do responsável
     */
    @Query("SELECT i FROM IntegranteFamilia i WHERE i.familiaId = " +
            "(SELECT f.familiaId FROM IntegranteFamilia f WHERE f.pessoa.idPessoa = :idResponsavel AND f.responsavel = true)")
    List<IntegranteFamilia> findByResponsavelId(@Param("idResponsavel") Long idResponsavel);

    /**
     * Busca o responsável de uma família pelo ID de qualquer integrante
     */
    @Query("SELECT i FROM IntegranteFamilia i WHERE i.familiaId = " +
            "(SELECT f.familiaId FROM IntegranteFamilia f WHERE f.pessoa.idPessoa = :idPessoa) " +
            "AND i.responsavel = true")
    IntegranteFamilia findResponsavelByIntegranteId(@Param("idPessoa") Long idPessoa);

    /**
     * Busca todos os integrantes da família de uma pessoa específica
     */
    @Query("SELECT i FROM IntegranteFamilia i WHERE i.familiaId = " +
            "(SELECT f.familiaId FROM IntegranteFamilia f WHERE f.pessoa.idPessoa = :idPessoa)")
    List<IntegranteFamilia> findFamiliaByPessoaId(@Param("idPessoa") Long idPessoa);

    /**
     * Verifica se uma pessoa é responsável
     */
    @Query("SELECT i FROM IntegranteFamilia i WHERE i.pessoa.idPessoa = :idPessoa AND i.responsavel = true")
    IntegranteFamilia findResponsavelByPessoaId(@Param("idPessoa") Long idPessoa);
}

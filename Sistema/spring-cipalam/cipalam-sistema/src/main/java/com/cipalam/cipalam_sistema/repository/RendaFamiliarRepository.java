package com.cipalam.cipalam_sistema.repository;

import com.cipalam.cipalam_sistema.model.RendaFamiliar;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface RendaFamiliarRepository extends JpaRepository<RendaFamiliar, Integer> {

    // Buscar rendas por família
    List<RendaFamiliar> findByIdtbFamiliaAndAtivoTrue(Integer idtbFamilia);

    // Buscar rendas por família ordenadas por valor
    List<RendaFamiliar> findByIdtbFamiliaAndAtivoTrueOrderByValorRendaDesc(Integer idtbFamilia);

    // Buscar por parentesco
    List<RendaFamiliar> findByParentescoAndIdtbFamiliaAndAtivoTrue(RendaFamiliar.Parentesco parentesco,
            Integer idtbFamilia);

    // Buscar por tipo de renda
    List<RendaFamiliar> findByTipoRendaAndIdtbFamiliaAndAtivoTrue(RendaFamiliar.TipoRenda tipoRenda,
            Integer idtbFamilia);

    // Buscar rendas comprovadas
    List<RendaFamiliar> findByComprovadoTrueAndIdtbFamiliaAndAtivoTrue(Integer idtbFamilia);

    // Buscar rendas não comprovadas
    List<RendaFamiliar> findByComprovadoFalseAndIdtbFamiliaAndAtivoTrue(Integer idtbFamilia);

    // Somar total de rendas por família
    @Query("SELECT SUM(r.valorRenda) FROM RendaFamiliar r WHERE r.idtbFamilia = :idFamilia AND r.ativo = true")
    BigDecimal calcularRendaTotalFamilia(@Param("idFamilia") Integer idFamilia);

    // Somar rendas comprovadas por família
    @Query("SELECT SUM(r.valorRenda) FROM RendaFamiliar r WHERE r.idtbFamilia = :idFamilia AND r.comprovado = true AND r.ativo = true")
    BigDecimal calcularRendaComprovadaFamilia(@Param("idFamilia") Integer idFamilia);

    // Contar membros com renda na família
    @Query("SELECT COUNT(r) FROM RendaFamiliar r WHERE r.idtbFamilia = :idFamilia AND r.valorRenda > 0 AND r.ativo = true")
    Long contarMembrosComRenda(@Param("idFamilia") Integer idFamilia);

    // Buscar por nome do membro
    List<RendaFamiliar> findByNomeMembroFamiliaContainingIgnoreCaseAndIdtbFamiliaAndAtivoTrue(String nomeMembroFamilia,
            Integer idtbFamilia);

    // Buscar por faixa etária
    @Query("SELECT r FROM RendaFamiliar r WHERE r.idtbFamilia = :idFamilia AND r.idade BETWEEN :idadeMin AND :idadeMax AND r.ativo = true")
    List<RendaFamiliar> findByFaixaEtaria(@Param("idFamilia") Integer idFamilia,
            @Param("idadeMin") Integer idadeMin,
            @Param("idadeMax") Integer idadeMax);

    // Buscar por valor mínimo de renda
    @Query("SELECT r FROM RendaFamiliar r WHERE r.idtbFamilia = :idFamilia AND r.valorRenda >= :valorMinimo AND r.ativo = true")
    List<RendaFamiliar> findByValorRendaMinimo(@Param("idFamilia") Integer idFamilia,
            @Param("valorMinimo") BigDecimal valorMinimo);
}

package com.cipalam.cipalam_sistema.repository;

import com.cipalam.cipalam_sistema.model.Familia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FamiliaRepository extends JpaRepository<Familia, Integer> {

    // Buscar por ID
    Optional<Familia> findByIdtbFamiliaAndAtivoTrue(Integer idtbFamilia);

    // Buscar famílias ativas
    List<Familia> findByAtivoTrue();

    // Buscar por CEP
    List<Familia> findByCepAndAtivoTrue(String cep);

    // Buscar por bairro
    List<Familia> findByBairroContainingIgnoreCaseAndAtivoTrue(String bairro);

    // Buscar por cidade
    List<Familia> findByCidadeContainingIgnoreCaseAndAtivoTrue(String cidade);

    // Buscar por UF
    List<Familia> findByUfAndAtivoTrue(String uf);

    // Buscar famílias com benefícios sociais
    List<Familia> findByBeneficiarioProgSocialTrueAndAtivoTrue();

    // Buscar por tipo de moradia
    List<Familia> findByTipoMoradiaAndAtivoTrue(Familia.TipoMoradia tipoMoradia);

    // Buscar famílias com renda até determinado valor
    @Query("SELECT f FROM Familia f WHERE f.rendaFamiliarTotal <= :valorMaximo AND f.ativo = true")
    List<Familia> findByRendaFamiliarTotalLessThanEqual(@Param("valorMaximo") java.math.BigDecimal valorMaximo);

    // Buscar famílias com renda per capita até determinado valor
    @Query("SELECT f FROM Familia f WHERE f.rendaPerCapita <= :valorMaximo AND f.ativo = true")
    List<Familia> findByRendaPerCapitaLessThanEqual(@Param("valorMaximo") java.math.BigDecimal valorMaximo);

    // Buscar por número de integrantes (calculado dinamicamente)
    @Query("SELECT f FROM Familia f WHERE " +
            "(SELECT COUNT(p) FROM Pessoa p WHERE p.tbFamiliaIdtbFamilia = f.idtbFamilia AND p.ativo = true) = :numeroIntegrantes "
            +
            "AND f.ativo = true")
    List<Familia> findByNumeroIntegrantesCalculado(@Param("numeroIntegrantes") Integer numeroIntegrantes);

    // Buscar famílias por endereço completo
    @Query("SELECT f FROM Familia f WHERE " +
            "(:logradouro IS NULL OR LOWER(f.logradouro) LIKE LOWER(CONCAT('%', :logradouro, '%'))) AND " +
            "(:bairro IS NULL OR LOWER(f.bairro) LIKE LOWER(CONCAT('%', :bairro, '%'))) AND " +
            "(:cidade IS NULL OR LOWER(f.cidade) LIKE LOWER(CONCAT('%', :cidade, '%'))) AND " +
            "(:uf IS NULL OR f.uf = :uf) AND " +
            "f.ativo = true")
    List<Familia> findByEnderecoCustom(@Param("logradouro") String logradouro,
            @Param("bairro") String bairro,
            @Param("cidade") String cidade,
            @Param("uf") String uf);
}
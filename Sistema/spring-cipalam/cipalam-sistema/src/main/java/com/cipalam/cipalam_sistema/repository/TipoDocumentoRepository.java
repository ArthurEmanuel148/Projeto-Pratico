package com.cipalam.cipalam_sistema.repository;

import com.cipalam.cipalam_sistema.model.TipoDocumento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TipoDocumentoRepository extends JpaRepository<TipoDocumento, Integer> {

    @Query("SELECT td FROM TipoDocumento td WHERE td.ativo = true AND (td.tipoCota = :tipoCota OR td.tipoCota IS NULL) ORDER BY td.ordemExibicao")
    List<TipoDocumento> findTiposDocumentosPorCota(@Param("tipoCota") String tipoCota);

    @Query("SELECT td FROM TipoDocumento td WHERE td.ativo = true ORDER BY td.ordemExibicao")
    List<TipoDocumento> findAllAtivos();

    @Query("SELECT td FROM TipoDocumento td WHERE td.obrigatorio = true AND td.ativo = true AND (td.tipoCota IN :tiposCota) ORDER BY td.ordemExibicao")
    List<TipoDocumento> findByObrigatorioTrueAndAtivoTrueAndTipoCotaInOrderByOrdemExibicao(
            @Param("tiposCota") List<String> tiposCota);
}

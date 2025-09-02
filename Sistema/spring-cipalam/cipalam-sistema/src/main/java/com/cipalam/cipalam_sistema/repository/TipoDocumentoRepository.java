package com.cipalam.cipalam_sistema.repository;

import com.cipalam.cipalam_sistema.model.TipoDocumento;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TipoDocumentoRepository extends JpaRepository<TipoDocumento, Long> {

    // Buscar todos os tipos ativos
    List<TipoDocumento> findByAtivoTrueOrderByOrdemExibicaoAsc();
    
    // Buscar por tipo de cota
    List<TipoDocumento> findByTipoCotaAndAtivoTrueOrderByOrdemExibicaoAsc(TipoDocumento.TipoCota tipoCota);
    
    // Buscar documentos que se aplicam a todas as cotas (tipoCota = null) ou cota específica
    @Query("SELECT td FROM TipoDocumento td WHERE td.ativo = true AND (td.tipoCota IS NULL OR td.tipoCota = :tipoCota) ORDER BY td.ordemExibicao ASC")
    List<TipoDocumento> findDocumentosParaCota(@Param("tipoCota") TipoDocumento.TipoCota tipoCota);
    
    // Buscar por escopo
    List<TipoDocumento> findByEscopoAndAtivoTrueOrderByOrdemExibicaoAsc(TipoDocumento.EscopoDocumento escopo);
    
    // Buscar por escopo ou 'ambos'
    @Query("SELECT td FROM TipoDocumento td WHERE td.ativo = true AND (td.escopo = :escopo OR td.escopo = 'ambos') ORDER BY td.ordemExibicao ASC")
    List<TipoDocumento> findDocumentosParaEscopo(@Param("escopo") TipoDocumento.EscopoDocumento escopo);
    
    // Buscar por nome (case insensitive)
    List<TipoDocumento> findByNomeContainingIgnoreCaseOrderByOrdemExibicaoAsc(String nome);
    
    // Buscar com filtros múltiplos
    @Query("SELECT td FROM TipoDocumento td WHERE " +
           "(:nome IS NULL OR LOWER(td.nome) LIKE LOWER(CONCAT('%', :nome, '%'))) AND " +
           "(:tipoCota IS NULL OR td.tipoCota = :tipoCota OR (td.tipoCota IS NULL AND :tipoCota IS NOT NULL)) AND " +
           "(:escopo IS NULL OR td.escopo = :escopo OR td.escopo = 'ambos') AND " +
           "(:ativo IS NULL OR td.ativo = :ativo) " +
           "ORDER BY td.ordemExibicao ASC")
    Page<TipoDocumento> findWithFilters(
        @Param("nome") String nome,
        @Param("tipoCota") TipoDocumento.TipoCota tipoCota,
        @Param("escopo") TipoDocumento.EscopoDocumento escopo,
        @Param("ativo") Boolean ativo,
        Pageable pageable
    );
    
    // Verificar se existe outro documento com a mesma ordem de exibição
    boolean existsByOrdemExibicaoAndIdTipoDocumentoNot(Integer ordemExibicao, Long idTipoDocumento);
    
    // Buscar documentos obrigatórios para uma cota específica
    @Query("SELECT td FROM TipoDocumento td WHERE td.ativo = true AND td.obrigatorio = true AND " +
           "(td.tipoCota IS NULL OR td.tipoCota = :tipoCota) ORDER BY td.ordemExibicao ASC")
    List<TipoDocumento> findDocumentosObrigatoriosParaCota(@Param("tipoCota") TipoDocumento.TipoCota tipoCota);
    
    // Buscar documentos que requerem assinatura
    List<TipoDocumento> findByRequerAssinaturaAndAtivoTrueOrderByOrdemExibicaoAsc(Boolean requerAssinatura);
    
    // Buscar documentos que requerem anexo
    List<TipoDocumento> findByRequerAnexoAndAtivoTrueOrderByOrdemExibicaoAsc(Boolean requerAnexo);
    
    // Verificar se um tipo de documento pode ser removido (não está sendo usado em documentos)
    @Query("SELECT CASE WHEN COUNT(dm) > 0 THEN false ELSE true END FROM DocumentoMatricula dm WHERE dm.tipoDocumento.idTipoDocumento = :idTipoDocumento")
    boolean podeRemoverTipoDocumento(@Param("idTipoDocumento") Long idTipoDocumento);
    
    // Buscar próxima ordem de exibição disponível
    @Query("SELECT COALESCE(MAX(td.ordemExibicao), 0) + 1 FROM TipoDocumento td")
    Integer findProximaOrdemExibicao();

    // Métodos legados para compatibilidade
    @Query("SELECT td FROM TipoDocumento td WHERE td.ativo = true AND (td.tipoCota = :tipoCota OR td.tipoCota IS NULL) ORDER BY td.ordemExibicao")
    List<TipoDocumento> findTiposDocumentosPorCota(@Param("tipoCota") String tipoCota);

    @Query("SELECT td FROM TipoDocumento td WHERE td.ativo = true ORDER BY td.ordemExibicao")
    List<TipoDocumento> findAllAtivos();

    @Query("SELECT td FROM TipoDocumento td WHERE td.obrigatorio = true AND td.ativo = true AND (td.tipoCota IN :tiposCota) ORDER BY td.ordemExibicao")
    List<TipoDocumento> findByObrigatorioTrueAndAtivoTrueAndTipoCotaInOrderByOrdemExibicao(
            @Param("tiposCota") List<String> tiposCota);
}

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

       // Buscar todos os tipos ativos ordenados por nome
       List<TipoDocumento> findByAtivoTrueOrderByNomeAsc();

       // Buscar por modalidade de entrega
       List<TipoDocumento> findByModalidadeEntregaAndAtivoTrueOrderByNomeAsc(
                     TipoDocumento.ModalidadeEntrega modalidadeEntrega);

       // Buscar por quem deve fornecer
       List<TipoDocumento> findByQuemDeveFornencerAndAtivoTrueOrderByNomeAsc(
                     TipoDocumento.QuemDeveFornencer quemDeveFornencer);

       // Buscar documentos para FAMILIA e TODOS_INTEGRANTES
       @Query("SELECT td FROM TipoDocumento td WHERE td.ativo = true AND td.quemDeveFornencer IN ('FAMILIA', 'TODOS_INTEGRANTES') ORDER BY td.nome ASC")
       List<TipoDocumento> findDocumentosParaFamilia();

       // Buscar documentos para ALUNO
       @Query("SELECT td FROM TipoDocumento td WHERE td.ativo = true AND td.quemDeveFornencer = 'ALUNO' ORDER BY td.nome ASC")
       List<TipoDocumento> findDocumentosParaAluno();

       // Buscar documentos de TODOS_INTEGRANTES
       @Query("SELECT td FROM TipoDocumento td WHERE td.ativo = true AND td.quemDeveFornencer = 'TODOS_INTEGRANTES' ORDER BY td.nome ASC")
       List<TipoDocumento> findDocumentosParaTodosIntegrantes();

       // Buscar por nome (case insensitive)
       List<TipoDocumento> findByNomeContainingIgnoreCaseAndAtivoTrueOrderByNomeAsc(String nome);

       // Buscar com filtros múltiplos
       @Query("SELECT td FROM TipoDocumento td WHERE " +
                     "(:nome IS NULL OR LOWER(td.nome) LIKE LOWER(CONCAT('%', :nome, '%'))) AND " +
                     "(:modalidadeEntrega IS NULL OR td.modalidadeEntrega = :modalidadeEntrega) AND " +
                     "(:quemDeveFornencer IS NULL OR td.quemDeveFornencer = :quemDeveFornencer) AND " +
                     "(:ativo IS NULL OR td.ativo = :ativo) " +
                     "ORDER BY td.nome ASC")
       Page<TipoDocumento> findWithFilters(
                     @Param("nome") String nome,
                     @Param("modalidadeEntrega") TipoDocumento.ModalidadeEntrega modalidadeEntrega,
                     @Param("quemDeveFornencer") TipoDocumento.QuemDeveFornencer quemDeveFornencer,
                     @Param("ativo") Boolean ativo,
                     Pageable pageable);

       // Verificar se um tipo pode ser removido (não está sendo usado)
       @Query("SELECT CASE WHEN COUNT(dm) > 0 THEN false ELSE true END FROM DocumentoMatricula dm WHERE dm.tipoDocumento.idTipoDocumento = :idTipoDocumento")
       boolean podeRemoverTipoDocumento(@Param("idTipoDocumento") Long idTipoDocumento);

       // Buscar documentos por quem deve fornecer organizados
       @Query("SELECT td FROM TipoDocumento td WHERE td.ativo = true AND td.quemDeveFornencer = :quemDeveFornencer ORDER BY td.modalidadeEntrega ASC, td.nome ASC")
       List<TipoDocumento> findByQuemDeveFornencerOrganizado(
                     @Param("quemDeveFornencer") TipoDocumento.QuemDeveFornencer quemDeveFornencer);
}

package com.cipalam.cipalam_sistema.repository;

import com.cipalam.cipalam_sistema.model.DocumentoMatricula;
import com.cipalam.cipalam_sistema.model.InteresseMatricula;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DocumentoMatriculaRepository extends JpaRepository<DocumentoMatricula, Long> {

    List<DocumentoMatricula> findByInteresseMatricula(InteresseMatricula interesseMatricula);

    List<DocumentoMatricula> findByInteresseMatriculaOrderByTipoDocumentoOrdemExibicao(
            InteresseMatricula interesseMatricula);

    @Query("SELECT dm FROM DocumentoMatricula dm WHERE dm.interesseMatricula.id = :interesseId ORDER BY dm.tipoDocumento.ordemExibicao")
    List<DocumentoMatricula> findByInteresseMatriculaIdOrderByTipoDocumentoOrdemExibicao(
            @Param("interesseId") Long interesseId);

    @Query("SELECT dm FROM DocumentoMatricula dm WHERE dm.interesseMatricula.id = :interesseId AND dm.tipoDocumento.id = :tipoDocumentoId")
    Optional<DocumentoMatricula> findByInteresseMatriculaIdAndTipoDocumentoId(
            @Param("interesseId") Long interesseId,
            @Param("tipoDocumentoId") Long tipoDocumentoId);

    @Query("SELECT dm FROM DocumentoMatricula dm WHERE dm.interesseMatricula.id = :interesseId AND dm.status = :status ORDER BY dm.tipoDocumento.ordemExibicao")
    List<DocumentoMatricula> findByInteresseMatriculaIdAndStatusOrderByTipoDocumentoOrdemExibicao(
            @Param("interesseId") Long interesseId,
            @Param("status") String status);

    /**
     * Busca documentos por status
     */
    List<DocumentoMatricula> findByStatus(String status);
}

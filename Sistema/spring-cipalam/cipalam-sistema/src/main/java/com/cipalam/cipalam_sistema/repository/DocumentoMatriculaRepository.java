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

        List<DocumentoMatricula> findByInteresseMatriculaOrderByTipoDocumentoNome(
                        InteresseMatricula interesseMatricula);

        @Query("SELECT dm FROM DocumentoMatricula dm WHERE dm.interesseMatricula.id = :interesseId ORDER BY dm.tipoDocumento.nome")
        List<DocumentoMatricula> findByInteresseMatriculaIdOrderByTipoDocumentoNome(
                        @Param("interesseId") Long interesseId);

        @Query("SELECT dm FROM DocumentoMatricula dm WHERE dm.interesseMatricula.id = :interesseId AND dm.tipoDocumento.id = :tipoDocumentoId")
        Optional<DocumentoMatricula> findByInteresseMatriculaIdAndTipoDocumentoId(
                        @Param("interesseId") Long interesseId,
                        @Param("tipoDocumentoId") Long tipoDocumentoId);

        @Query("SELECT dm FROM DocumentoMatricula dm WHERE dm.interesseMatricula.id = :interesseId AND dm.status = :status ORDER BY dm.tipoDocumento.nome")
        List<DocumentoMatricula> findByInteresseMatriculaIdAndStatusOrderByTipoDocumentoNome(
                        @Param("interesseId") Long interesseId,
                        @Param("status") String status);

        /**
         * Busca documentos por status
         */
        List<DocumentoMatricula> findByStatus(String status);

        /**
         * Busca documentos de uma família específica baseado no ID do responsável
         */
        @Query("SELECT dm FROM DocumentoMatricula dm " +
                        "JOIN dm.interesseMatricula im " +
                        "WHERE im.responsavelLogin.idPessoa = :idResponsavel " +
                        "ORDER BY dm.tipoDocumento.nome")
        List<DocumentoMatricula> findDocumentosByResponsavelId(@Param("idResponsavel") Long idResponsavel);

        /**
         * Busca documentos específicos de uma pessoa
         */
        @Query("SELECT dm FROM DocumentoMatricula dm WHERE dm.tbPessoaIdPessoa = :idPessoa ORDER BY dm.tipoDocumento.nome")
        List<DocumentoMatricula> findByPessoaId(@Param("idPessoa") Long idPessoa);

        /**
         * Busca documentos da família que são aplicáveis a uma pessoa específica
         */
        @Query("SELECT dm FROM DocumentoMatricula dm " +
                        "JOIN dm.interesseMatricula im " +
                        "WHERE (dm.tbPessoaIdPessoa = :idPessoa OR dm.tbPessoaIdPessoa IS NULL) " +
                        "AND im.responsavelLogin.idPessoa IN (" +
                        "  SELECT if1.pessoa.idPessoa FROM IntegranteFamilia if1 " +
                        "  WHERE if1.familiaId = (" +
                        "    SELECT if2.familiaId FROM IntegranteFamilia if2 " +
                        "    WHERE if2.pessoa.idPessoa = :idPessoa" +
                        "  )" +
                        ") " +
                        "ORDER BY dm.tipoDocumento.nome")
        List<DocumentoMatricula> findDocumentosAplicaveisPorPessoa(@Param("idPessoa") Long idPessoa);
}

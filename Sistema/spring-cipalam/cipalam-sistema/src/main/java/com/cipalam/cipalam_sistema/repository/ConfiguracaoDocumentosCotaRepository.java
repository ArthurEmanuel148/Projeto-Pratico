package com.cipalam.cipalam_sistema.repository;

import com.cipalam.cipalam_sistema.model.ConfiguracaoDocumentosCota;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ConfiguracaoDocumentosCotaRepository extends JpaRepository<ConfiguracaoDocumentosCota, Integer> {
    Optional<ConfiguracaoDocumentosCota> findByTipoCota(ConfiguracaoDocumentosCota.TipoCota tipoCota);
}

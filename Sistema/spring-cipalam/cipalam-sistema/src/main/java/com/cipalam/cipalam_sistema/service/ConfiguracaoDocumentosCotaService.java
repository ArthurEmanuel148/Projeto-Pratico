package com.cipalam.cipalam_sistema.service;

import com.cipalam.cipalam_sistema.model.ConfiguracaoDocumentosCota;
import com.cipalam.cipalam_sistema.model.Pessoa;
import com.cipalam.cipalam_sistema.repository.ConfiguracaoDocumentosCotaRepository;
import com.cipalam.cipalam_sistema.repository.PessoaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.Optional;

@Service
public class ConfiguracaoDocumentosCotaService {

    @Autowired
    private ConfiguracaoDocumentosCotaRepository configuracaoRepository;

    @Autowired
    private PessoaRepository pessoaRepository;

    public List<ConfiguracaoDocumentosCota> listarTodas() {
        return configuracaoRepository.findAll();
    }

    public Optional<ConfiguracaoDocumentosCota> buscarPorTipoCota(String tipoCota) {
        ConfiguracaoDocumentosCota.TipoCota tipo = ConfiguracaoDocumentosCota.TipoCota.valueOf(tipoCota);
        return configuracaoRepository.findByTipoCota(tipo);
    }

    public Map<String, Object> salvarConfiguracao(String tipoCota, List<Integer> documentosObrigatorios,
            Integer funcionarioId) {
        try {
            ConfiguracaoDocumentosCota.TipoCota tipo = ConfiguracaoDocumentosCota.TipoCota.valueOf(tipoCota);

            // Buscar ou criar configuração
            ConfiguracaoDocumentosCota config = configuracaoRepository.findByTipoCota(tipo)
                    .orElse(new ConfiguracaoDocumentosCota());

            config.setTipoCota(tipo);
            config.setDocumentosObrigatorios(documentosObrigatorios.toString());

            if (funcionarioId != null) {
                Pessoa funcionario = pessoaRepository.findById(funcionarioId)
                        .orElseThrow(() -> new RuntimeException("Funcionário não encontrado"));
                config.setFuncionarioResponsavel(funcionario);
            }

            ConfiguracaoDocumentosCota configSalva = configuracaoRepository.save(config);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Configuração salva com sucesso!");
            response.put("configuracao", configSalva);

            return response;
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Erro ao salvar configuração: " + e.getMessage());
            return errorResponse;
        }
    }

    public ConfiguracaoDocumentosCota atualizar(Integer id, ConfiguracaoDocumentosCota configuracaoAtualizada) {
        ConfiguracaoDocumentosCota config = configuracaoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Configuração não encontrada"));

        config.setTipoCota(configuracaoAtualizada.getTipoCota());
        config.setDocumentosObrigatorios(configuracaoAtualizada.getDocumentosObrigatorios());
        config.setFuncionarioResponsavel(configuracaoAtualizada.getFuncionarioResponsavel());

        return configuracaoRepository.save(config);
    }

    public void deletar(Integer id) {
        if (!configuracaoRepository.existsById(id)) {
            throw new RuntimeException("Configuração não encontrada");
        }
        configuracaoRepository.deleteById(id);
    }
}

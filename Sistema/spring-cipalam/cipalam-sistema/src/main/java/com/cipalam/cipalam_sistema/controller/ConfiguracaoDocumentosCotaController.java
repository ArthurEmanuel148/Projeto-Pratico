package com.cipalam.cipalam_sistema.controller;

import com.cipalam.cipalam_sistema.model.ConfiguracaoDocumentosCota;
import com.cipalam.cipalam_sistema.service.ConfiguracaoDocumentosCotaService;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.type.TypeReference;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/configuracao-documentos")
@CrossOrigin(origins = { "http://localhost:8100", "http://localhost:4200" })
public class ConfiguracaoDocumentosCotaController {

    @Autowired
    private ConfiguracaoDocumentosCotaService configuracaoService;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @GetMapping
    public ResponseEntity<?> listarTodas(@RequestParam(required = false) String format) {
        if ("frontend".equals(format)) {
            // Retornar no formato esperado pelo frontend: Record<string, number[]>
            List<ConfiguracaoDocumentosCota> configuracoes = configuracaoService.listarTodas();
            Map<String, List<Integer>> result = new HashMap<>();

            for (ConfiguracaoDocumentosCota config : configuracoes) {
                try {
                    List<Integer> documentos = objectMapper.readValue(
                        config.getDocumentosObrigatorios(), 
                        new TypeReference<List<Integer>>() {}
                    );
                    result.put(config.getTipoCota().toString(), documentos);
                } catch (Exception e) {
                    result.put(config.getTipoCota().toString(), new ArrayList<>());
                }
            }

            return ResponseEntity.ok(result);
        } else {
            List<ConfiguracaoDocumentosCota> configuracoes = configuracaoService.listarTodas();
            return ResponseEntity.ok(configuracoes);
        }
    }

    @GetMapping("/{tipoCota}")
    public ResponseEntity<ConfiguracaoDocumentosCota> buscarPorTipoCota(@PathVariable String tipoCota) {
        Optional<ConfiguracaoDocumentosCota> config = configuracaoService.buscarPorTipoCota(tipoCota);
        return config.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> salvarConfiguracao(@RequestBody Map<String, Object> request) {
        try {
            String tipoCota = (String) request.get("tipoCota");
            @SuppressWarnings("unchecked")
            List<Integer> documentos = (List<Integer>) request.get("documentosObrigatorios");
            Integer funcionarioId = (Integer) request.get("funcionarioId");

            Map<String, Object> response = configuracaoService.salvarConfiguracao(tipoCota, documentos, funcionarioId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Erro ao processar requisição: " + e.getMessage()));
        }
    }

    @PostMapping("/batch")
    public ResponseEntity<Map<String, Object>> salvarConfiguracaoCompleta(@RequestBody Map<String, List<Integer>> configuracoes) {
        try {
            Map<String, Object> response = new HashMap<>();
            List<String> sucessos = new ArrayList<>();
            List<String> erros = new ArrayList<>();

            for (Map.Entry<String, List<Integer>> entry : configuracoes.entrySet()) {
                String tipoCota = entry.getKey();
                List<Integer> documentos = entry.getValue();

                try {
                    Map<String, Object> resultado = configuracaoService.salvarConfiguracao(tipoCota, documentos, null);
                    if ((Boolean) resultado.get("success")) {
                        sucessos.add(tipoCota);
                    } else {
                        erros.add(tipoCota + ": " + resultado.get("message"));
                    }
                } catch (Exception e) {
                    erros.add(tipoCota + ": " + e.getMessage());
                }
            }

            response.put("success", erros.isEmpty());
            response.put("sucessos", sucessos);
            response.put("erros", erros);
            response.put("message", erros.isEmpty() ? 
                "Todas as configurações foram salvas com sucesso!" : 
                "Algumas configurações falharam: " + String.join(", ", erros));

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Erro ao processar requisição: " + e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<ConfiguracaoDocumentosCota> atualizar(@PathVariable Integer id,
            @RequestBody ConfiguracaoDocumentosCota configuracao) {
        try {
            ConfiguracaoDocumentosCota configAtualizada = configuracaoService.atualizar(id, configuracao);
            return ResponseEntity.ok(configAtualizada);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Integer id) {
        try {
            configuracaoService.deletar(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}

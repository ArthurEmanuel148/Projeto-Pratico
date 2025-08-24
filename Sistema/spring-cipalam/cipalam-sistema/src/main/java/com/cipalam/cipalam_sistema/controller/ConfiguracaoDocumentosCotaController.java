package com.cipalam.cipalam_sistema.controller;

import com.cipalam.cipalam_sistema.model.ConfiguracaoDocumentosCota;
import com.cipalam.cipalam_sistema.service.ConfiguracaoDocumentosCotaService;
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

    @GetMapping
    public ResponseEntity<?> listarTodas(@RequestParam(required = false) String format) {
        if ("frontend".equals(format)) {
            // Retornar no formato esperado pelo frontend: Record<string, number[]>
            List<ConfiguracaoDocumentosCota> configuracoes = configuracaoService.listarTodas();
            Map<String, List<Integer>> result = new HashMap<>();

            for (ConfiguracaoDocumentosCota config : configuracoes) {
                List<Integer> documentos = new ArrayList<>();
                if (config.getDocumentosObrigatorios() != null) {
                    try {
                        // Parse do JSON array para extrair os IDs
                        String jsonArray = config.getDocumentosObrigatorios().trim();
                        if (jsonArray.startsWith("[") && jsonArray.endsWith("]")) {
                            // Remove os colchetes e divide por vírgula
                            String content = jsonArray.substring(1, jsonArray.length() - 1);
                            if (!content.trim().isEmpty()) {
                                String[] ids = content.split(",");
                                for (String id : ids) {
                                    try {
                                        documentos.add(Integer.parseInt(id.trim()));
                                    } catch (NumberFormatException e) {
                                        System.err.println("ID inválido encontrado: " + id);
                                    }
                                }
                            }
                        }
                    } catch (Exception e) {
                        System.err.println(
                                "Erro ao processar documentos da cota " + config.getTipoCota() + ": " + e.getMessage());
                    }
                }
                result.put(config.getTipoCota().toString(), documentos);
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
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Configurações salvas com sucesso!");

            // Verificar se é o formato antigo (single cota) ou novo (múltiplas cotas)
            if (request.containsKey("tipoCota")) {
                // Formato antigo - uma configuração por vez
                String tipoCota = (String) request.get("tipoCota");
                @SuppressWarnings("unchecked")
                List<Integer> documentos = (List<Integer>) request.get("documentosObrigatorios");
                Integer funcionarioId = (Integer) request.get("funcionarioId");

                Map<String, Object> resultado = configuracaoService.salvarConfiguracao(tipoCota, documentos,
                        funcionarioId);
                return ResponseEntity.ok(resultado);
            } else {
                // Formato novo - múltiplas configurações (Record<string, number[]>)
                for (Map.Entry<String, Object> entry : request.entrySet()) {
                    String tipoCota = entry.getKey();
                    @SuppressWarnings("unchecked")
                    List<Object> documentosIds = (List<Object>) entry.getValue();

                    // Converter para integers
                    List<Integer> documentosObrigatorios = new ArrayList<>();
                    for (Object docId : documentosIds) {
                        try {
                            if (docId instanceof Integer) {
                                documentosObrigatorios.add((Integer) docId);
                            } else if (docId instanceof String) {
                                documentosObrigatorios.add(Integer.parseInt((String) docId));
                            } else if (docId instanceof Number) {
                                documentosObrigatorios.add(((Number) docId).intValue());
                            }
                        } catch (NumberFormatException e) {
                            System.out.println("Documento com ID inválido encontrado: " + docId);
                        }
                    }

                    Map<String, Object> resultado = configuracaoService.salvarConfiguracao(tipoCota,
                            documentosObrigatorios, null);
                    if (!(Boolean) resultado.get("success")) {
                        return ResponseEntity.badRequest().body(resultado);
                    }
                }
            }

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

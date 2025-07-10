package com.cipalam.cipalam_sistema.controller;

import com.cipalam.cipalam_sistema.model.Funcionalidade;
import com.cipalam.cipalam_sistema.service.FuncionalidadeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/funcionalidades")
public class FuncionalidadeController {

    @Autowired
    private FuncionalidadeService funcionalidadeService;

    @GetMapping
    public ResponseEntity<List<Funcionalidade>> listarTodasFuncionalidades() {
        List<Funcionalidade> funcionalidades = funcionalidadeService.listarTodasFuncionalidades();
        return ResponseEntity.ok(funcionalidades);
    }

    @GetMapping("/ativas")
    public ResponseEntity<List<Funcionalidade>> listarFuncionalidadesAtivas() {
        List<Funcionalidade> funcionalidades = funcionalidadeService.listarFuncionalidadesAtivas();
        return ResponseEntity.ok(funcionalidades);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Funcionalidade> buscarPorId(@PathVariable Integer id) {
        return funcionalidadeService.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/chave/{chave}")
    public ResponseEntity<Funcionalidade> buscarPorChave(@PathVariable String chave) {
        return funcionalidadeService.buscarPorChave(chave)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}

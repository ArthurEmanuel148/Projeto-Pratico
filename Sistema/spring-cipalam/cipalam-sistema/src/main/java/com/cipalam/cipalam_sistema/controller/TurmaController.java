package com.cipalam.cipalam_sistema.controller;

import java.util.ArrayList;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.cipalam.cipalam_sistema.model.Turma;

@RestController
@RequestMapping("/api/turma")
public class TurmaController {

    private List<Turma> turmas;
    private long nextId = 1L;

    public TurmaController() {
        turmas = new ArrayList<>();

        Turma pet1 = new Turma();
        pet1.setId(nextId++);
        turmas.add(pet1);

        Turma pet2 = new Turma();
        pet2.setId(nextId++);
        turmas.add(pet2);

        Turma pet3 = new Turma();
        pet3.setId(nextId++);
        turmas.add(pet3);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Turma> getById(@PathVariable Long id) {
        Turma turma = findById(id);
        if (turma != null) {
            return ResponseEntity.ok().body(turma);
        }

        return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
    }

    @GetMapping({ "", "/" })
    public ResponseEntity<List<Turma>> getAll() {
        return ResponseEntity.ok().body(turmas);
    }

    @PostMapping({ "", "/" })
    public ResponseEntity<Turma> create(@RequestBody Turma turma) {
        turma.setId(nextId++);
        turmas.add(turma);
        return ResponseEntity.ok().body(turma);
    }

    @PutMapping({ "", "/" })
    public ResponseEntity<Turma> update(@RequestBody Turma turma) {
        if (turma.getId() == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Turma not found");
        }

        boolean isFind = false;
        for (int i = 0; i < turmas.size(); i++) {
            Turma petAux = turmas.get(i);
            if (petAux.getId().equals(turma.getId())) {
                turmas.remove(i);
                turmas.add(i, turma);
                isFind = true;
            }
        }

        if (!isFind) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "turma not found");
        }

        return ResponseEntity.ok().body(turma);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Turma> delete(@PathVariable Long id) {

        Turma turmaAux = null;

        for (int i = 0; i < turmas.size(); i++) {
            turmaAux = turmas.get(i);
            if (turmaAux.getId().equals(id)) {
                turmas.remove(i);
                break;
            }
        }

        return ResponseEntity.ok().body(turmaAux);
    }

    private Turma findById(Long id) {
        for (Turma turma : turmas) {
            if (turma.getId() == id) {
                return turma;
            }
        }
        return null;
    }
}

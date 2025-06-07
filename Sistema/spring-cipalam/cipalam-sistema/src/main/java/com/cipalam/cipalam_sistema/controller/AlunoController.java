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

import com.cipalam.cipalam_sistema.model.Aluno;

@RestController
@RequestMapping("/api/aluno")
public class AlunoController {

    private List<Aluno> alunos;
    private long nextId = 1L;

    public AlunoController() {
            alunos = new ArrayList<>();
    
            Aluno pet1 = new Aluno();
            pet1.setId(nextId++);
            alunos.add(pet1);
    
            Aluno pet2 = new Aluno();
            pet2.setId(nextId++);
            alunos.add(pet2);
    
            Aluno pet3 = new Aluno();
            pet3.setId(nextId++);
            alunos.add(pet3);
        }

    @GetMapping("/{id}")
    public ResponseEntity<Aluno> getById(@PathVariable Long id) {
        Aluno aluno = findById(id);
        if (aluno != null) {
            return ResponseEntity.ok().body(aluno);
        }

        return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
    }

    @GetMapping({ "", "/" })
    public ResponseEntity<List<Aluno>> getAll() {
        return ResponseEntity.ok().body(alunos);
    }

    @PostMapping({ "", "/" })
    public ResponseEntity<Aluno> create(@RequestBody Aluno aluno) {
        aluno.setId(nextId++);
        alunos.add(aluno);
        return ResponseEntity.ok().body(aluno);
    }

    @PutMapping({ "", "/" })
    public ResponseEntity<Aluno> update(@RequestBody Aluno aluno) {
        if (aluno.getId() == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "aluno not found");
        }

        boolean isFind = false;
        for (int i = 0; i < alunos.size(); i++) {
            Aluno petAux = alunos.get(i);
            if (petAux.getId().equals(aluno.getId())) {
                alunos.remove(i);
                alunos.add(i, aluno);
                isFind = true;
            }
        }

        if (!isFind) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "aluno not found");
        }

        return ResponseEntity.ok().body(aluno);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Aluno> delete(@PathVariable Long id) {
        if (id == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Id do aluno nao encontrado");
        }

        Aluno alunoAux = null;

        boolean isFind = false;
        for (int i = 0; i < alunos.size(); i++) {
            alunoAux = alunos.get(i);
            if (alunoAux.getId().equals(id)) {
                alunos.remove(i);
                isFind = true;
                break;
            }
        }

        if (!isFind) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "aluno nao encontrado");
        }

        return ResponseEntity.ok().body(alunoAux);
    }

    private Aluno findById(Long id) {
        for (Aluno aluno : alunos) {
            if (aluno.getId() == id) {
                return aluno;
            }
        }
        return null;
    }
}

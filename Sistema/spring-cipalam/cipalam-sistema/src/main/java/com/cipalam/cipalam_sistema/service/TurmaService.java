package com.cipalam.cipalam_sistema.service;

import com.cipalam.cipalam_sistema.model.Turma;
import com.cipalam.cipalam_sistema.repository.TurmaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class TurmaService {

    @Autowired
    private TurmaRepository turmaRepository;

    /**
     * Lista todas as turmas
     */
    public List<Turma> listarTodas() {
        return turmaRepository.findAll();
    }

    /**
     * Lista turmas ativas
     */
    public List<Turma> listarAtivas() {
        return turmaRepository.findByAtivoTrueOrderByHorarioInicioAscNomeTurmaAsc();
    }

    /**
     * Lista turmas com vagas disponíveis
     */
    public List<Turma> listarComVagas() {
        return turmaRepository.findTurmasComVagas();
    }

    /**
     * Lista turmas ativas ordenadas por horário
     */
    public List<Turma> listarTurmasAtivas() {
        return turmaRepository.findTurmasAtivas();
    }

    /**
     * Busca turma por ID
     */
    public Optional<Turma> buscarPorId(Integer id) {
        return turmaRepository.findById(Long.valueOf(id));
    }

    /**
     * Salva uma nova turma
     */
    public Turma salvar(Turma turma) {
        // Validações básicas
        if (turma.getNomeTurma() == null || turma.getNomeTurma().trim().isEmpty()) {
            throw new RuntimeException("Nome da turma é obrigatório");
        }

        if (turma.getCapacidadeMaxima() == null || turma.getCapacidadeMaxima() <= 0) {
            throw new RuntimeException("Capacidade máxima deve ser maior que zero");
        }

        if (turma.getCapacidadeAtual() == null) {
            turma.setCapacidadeAtual(0);
        }

        if (turma.getAtivo() == null) {
            turma.setAtivo(true);
        }

        if (turma.getDataCriacao() == null) {
            turma.setDataCriacao(LocalDateTime.now());
        }

        return turmaRepository.save(turma);
    }

    /**
     * Atualiza uma turma existente
     */
    public Turma atualizar(Integer id, Turma turmaAtualizada) {
        Optional<Turma> turmaExistente = turmaRepository.findById(Long.valueOf(id));

        if (turmaExistente.isEmpty()) {
            throw new RuntimeException("Turma não encontrada com ID: " + id);
        }

        Turma turma = turmaExistente.get();

        // Validações básicas
        if (turmaAtualizada.getNomeTurma() == null || turmaAtualizada.getNomeTurma().trim().isEmpty()) {
            throw new RuntimeException("Nome da turma é obrigatório");
        }

        if (turmaAtualizada.getCapacidadeMaxima() == null || turmaAtualizada.getCapacidadeMaxima() <= 0) {
            throw new RuntimeException("Capacidade máxima deve ser maior que zero");
        }

        // Verificar se nova capacidade não é menor que a atual ocupação
        if (turmaAtualizada.getCapacidadeMaxima() < turma.getCapacidadeAtual()) {
            throw new RuntimeException("Capacidade máxima não pode ser menor que a ocupação atual (" +
                    turma.getCapacidadeAtual() + ")");
        }

        // Atualizar campos
        turma.setNomeTurma(turmaAtualizada.getNomeTurma());
        turma.setCapacidadeMaxima(turmaAtualizada.getCapacidadeMaxima());
        turma.setHorarioInicio(turmaAtualizada.getHorarioInicio());
        turma.setHorarioFim(turmaAtualizada.getHorarioFim());
        turma.setObservacoes(turmaAtualizada.getObservacoes());

        if (turmaAtualizada.getAtivo() != null) {
            turma.setAtivo(turmaAtualizada.getAtivo());
        }

        return turmaRepository.save(turma);
    }

    /**
     * Deleta uma turma (soft delete - marca como inativa)
     */
    public void deletar(Integer id) {
        Optional<Turma> turmaExistente = turmaRepository.findById(Long.valueOf(id));

        if (turmaExistente.isEmpty()) {
            throw new RuntimeException("Turma não encontrada com ID: " + id);
        }

        Turma turma = turmaExistente.get();

        // Verificar se a turma tem alunos matriculados
        if (turma.getCapacidadeAtual() > 0) {
            throw new RuntimeException("Não é possível excluir turma com alunos matriculados. " +
                    "Capacidade atual: " + turma.getCapacidadeAtual());
        }

        // Soft delete - marca como inativa
        turma.setAtivo(false);
        turmaRepository.save(turma);
    }

    /**
     * Deleta fisicamente uma turma (apenas para casos especiais)
     */
    public void deletarFisicamente(Integer id) {
        Optional<Turma> turmaExistente = turmaRepository.findById(Long.valueOf(id));

        if (turmaExistente.isEmpty()) {
            throw new RuntimeException("Turma não encontrada com ID: " + id);
        }

        Turma turma = turmaExistente.get();

        // Verificar se a turma tem alunos matriculados
        if (turma.getCapacidadeAtual() > 0) {
            throw new RuntimeException("Não é possível excluir turma com alunos matriculados");
        }

        turmaRepository.deleteById(Long.valueOf(id));
    }
}

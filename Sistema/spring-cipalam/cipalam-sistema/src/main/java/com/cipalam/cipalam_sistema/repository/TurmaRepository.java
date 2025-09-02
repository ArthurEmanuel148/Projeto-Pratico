package com.cipalam.cipalam_sistema.repository;

import com.cipalam.cipalam_sistema.model.Turma;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TurmaRepository extends JpaRepository<Turma, Long> {

    // Buscar turmas ativas ordenadas por horário
    List<Turma> findByAtivoTrueOrderByHorarioInicioAscNomeTurmaAsc();

    // Buscar turmas com vagas disponíveis
    @Query("SELECT t FROM Turma t WHERE t.ativo = true AND (t.capacidadeMaxima - t.capacidadeAtual) > 0 ORDER BY t.horarioInicio ASC, t.nomeTurma ASC")
    List<Turma> findTurmasComVagas();

    // Buscar turmas ativas ordenadas por horário
    @Query("SELECT t FROM Turma t WHERE t.ativo = true ORDER BY t.horarioInicio ASC, t.nomeTurma ASC")
    List<Turma> findTurmasAtivas();
}

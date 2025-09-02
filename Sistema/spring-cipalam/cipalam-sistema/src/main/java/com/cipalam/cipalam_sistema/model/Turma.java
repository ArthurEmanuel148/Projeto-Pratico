package com.cipalam.cipalam_sistema.model;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "tbTurma")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Turma {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "idtbTurma")
    private Integer id;

    @Column(name = "nomeTurma", nullable = false, length = 50)
    private String nomeTurma;

    @Column(name = "capacidadeMaxima")
    private Integer capacidadeMaxima = 20;

    @Column(name = "capacidadeAtual")
    private Integer capacidadeAtual = 0;

    @Column(name = "horarioInicio")
    private LocalTime horarioInicio;

    @Column(name = "horarioFim")
    private LocalTime horarioFim;

    @Column(name = "ativo")
    private Boolean ativo = true;

    @Column(name = "observacoes", columnDefinition = "TEXT")
    private String observacoes;

    @Column(name = "dataCriacao")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime dataCriacao;

    // Getter computado para vagas disponíveis
    public Integer getVagasDisponiveis() {
        if (capacidadeMaxima == null || capacidadeAtual == null) {
            return 0;
        }
        return capacidadeMaxima - capacidadeAtual;
    }

    // Getter computado para verificar se tem vagas
    public Boolean getTemVagas() {
        return getVagasDisponiveis() > 0;
    }

    // Getter para período formatado baseado no horário
    public String getPeriodoFormatado() {
        if (horarioInicio == null)
            return "Não definido";

        int hora = horarioInicio.getHour();

        if (hora >= 6 && hora < 12) {
            return "Manhã";
        } else if (hora >= 12 && hora < 18) {
            return "Tarde";
        } else if (hora >= 18 || hora < 6) {
            return "Noite";
        } else if (hora >= 6 && horarioFim != null && horarioFim.getHour() >= 17) {
            return "Integral";
        }

        return "Não definido";
    }

    @PrePersist
    protected void onCreate() {
        if (dataCriacao == null) {
            dataCriacao = LocalDateTime.now();
        }
    }
}

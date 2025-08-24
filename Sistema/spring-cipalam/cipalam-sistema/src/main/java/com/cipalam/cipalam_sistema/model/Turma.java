package com.cipalam.cipalam_sistema.model;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

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

    @Column(name = "anoLetivo", nullable = false)
    private Integer anoLetivo;

    @Column(name = "periodo", nullable = false)
    @Convert(converter = com.cipalam.cipalam_sistema.converter.PeriodoEnumConverter.class)
    private PeriodoEnum periodo;

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

    // Getter para período formatado
    public String getPeriodoFormatado() {
        if (periodo == null)
            return "";

        return switch (periodo) {
            case MANHA -> "Manhã";
            case TARDE -> "Tarde";
            case INTEGRAL -> "Integral";
            case NOITE -> "Noite";
        };
    }

    @PrePersist
    protected void onCreate() {
        if (dataCriacao == null) {
            dataCriacao = LocalDateTime.now();
        }
        if (anoLetivo == null) {
            anoLetivo = LocalDateTime.now().getYear();
        }
    }

    public enum PeriodoEnum {
        MANHA("manha"),
        TARDE("tarde"),
        INTEGRAL("integral"),
        NOITE("noite");

        private final String valor;

        PeriodoEnum(String valor) {
            this.valor = valor;
        }

        public String getValor() {
            return valor;
        }

        // Método para buscar enum pelo valor do banco
        public static PeriodoEnum fromValor(String valor) {
            for (PeriodoEnum periodo : values()) {
                if (periodo.valor.equals(valor)) {
                    return periodo;
                }
            }
            throw new IllegalArgumentException("Período inválido: " + valor);
        }
    }
}

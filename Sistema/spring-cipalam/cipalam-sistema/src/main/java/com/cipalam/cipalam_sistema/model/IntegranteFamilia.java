package com.cipalam.cipalam_sistema.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;

@Entity
@Data
@Table(name = "tbIntegranteFamilia")
public class IntegranteFamilia {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "idIntegrante")
    private Long idIntegrante;

    @Column(name = "tbFamilia_idtbFamilia", nullable = false)
    private Long familiaId;

    @ManyToOne
    @JoinColumn(name = "tbPessoa_idPessoa")
    private Pessoa pessoa;

    @Column(name = "nomeIntegrante", nullable = false, length = 100)
    private String nomeIntegrante;

    @Column(name = "cpfIntegrante", length = 14)
    private String cpfIntegrante;

    @Column(name = "dataNascimento")
    private LocalDate dataNascimento;

    @Column(name = "parentesco")
    @Enumerated(EnumType.STRING)
    private ParentescoEnum parentesco;

    @Column(name = "responsavel")
    private Boolean responsavel = false;

    @Column(name = "aluno")
    private Boolean aluno = false;

    public enum ParentescoEnum {
        pai, mae, conjuge, filho, filha, irmao, irma, avo, ava, tio, tia, 
        sobrinho, sobrinha, primo, prima, cunhado, cunhada, genro, nora, 
        sogro, sogra, padrasto, madrasta, enteado, enteada, outro
    }

    /**
     * Retorna o tipo de parentesco simplificado para o frontend
     */
    public String getTipoParentesco() {
        if (Boolean.TRUE.equals(responsavel)) {
            return "responsavel";
        }
        if (Boolean.TRUE.equals(aluno)) {
            return "aluno";
        }
        return "integrante";
    }
}

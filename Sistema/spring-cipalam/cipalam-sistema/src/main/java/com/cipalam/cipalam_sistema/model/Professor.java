package com.cipalam.cipalam_sistema.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "tbProfessor")
@Data
public class Professor {
    @Id
    @Column(name = "tbPessoa_idPessoa")
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "tbPessoa_idPessoa", referencedColumnName = "idPessoa")
    @MapsId
    private Pessoa pessoa;
}

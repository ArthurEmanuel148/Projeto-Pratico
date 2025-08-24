package com.cipalam.cipalam_sistema.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class IniciarMatriculaRequest {
    private Long idDeclaracao;
    private Long idTurma;
    private Long idFuncionario;
}

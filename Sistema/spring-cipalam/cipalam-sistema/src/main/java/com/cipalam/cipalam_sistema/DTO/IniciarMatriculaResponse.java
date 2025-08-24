package com.cipalam.cipalam_sistema.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class IniciarMatriculaResponse {
    private Long idFamilia;
    private Long idResponsavel;
    private Long idAluno;
    private String matricula;
    private String loginResponsavel;
    private String senhaTemporaria;
    private String mensagem;
    private Boolean sucesso;

    // Constructor para sucesso
    public IniciarMatriculaResponse(Long idFamilia, Long idResponsavel, Long idAluno,
            String matricula, String loginResponsavel, String senhaTemporaria) {
        this.idFamilia = idFamilia;
        this.idResponsavel = idResponsavel;
        this.idAluno = idAluno;
        this.matricula = matricula;
        this.loginResponsavel = loginResponsavel;
        this.senhaTemporaria = senhaTemporaria;
        this.sucesso = true;
        this.mensagem = "Matrícula iniciada com sucesso!";
    }

    // Constructor para erro
    public IniciarMatriculaResponse(String mensagem) {
        this.mensagem = mensagem;
        this.sucesso = false;
    }
}

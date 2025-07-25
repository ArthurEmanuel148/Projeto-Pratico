package com.cipalam.cipalam_sistema.DTO;

import com.cipalam.cipalam_sistema.model.Pessoa;
import lombok.Data;
import java.util.List;

// isso é um DTO (Data Transfer Object) para cadastro de pessoas no sistema, pega os dados necessários para criar uma nova pessoa, seja ela um aluno, professor ou outro tipo de usuário do frontend e junta com o serviço de cadastro de pessoas.
@Data
public class PessoaCadastroDTO {
    private Pessoa pessoa;
    private String tipo; // "aluno", "professor", "funcionario", etc.
    private String usuario; // só para não-aluno
    private String senha; // só para não-aluno
    private List<String> permissoes; // chaves das funcionalidades que o usuário terá acesso
    // getters e setters
}
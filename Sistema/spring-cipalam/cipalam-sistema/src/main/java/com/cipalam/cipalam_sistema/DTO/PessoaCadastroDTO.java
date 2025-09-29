package com.cipalam.cipalam_sistema.DTO;

import com.cipalam.cipalam_sistema.model.Pessoa;
import lombok.Data;
import java.util.List;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

// isso é um DTO (Data Transfer Object) para cadastro de pessoas no sistema, pega os dados necessários para criar uma nova pessoa, seja ela um aluno, professor ou outro tipo de usuário do frontend e junta com o serviço de cadastro de pessoas.
@Data
public class PessoaCadastroDTO {
    private Pessoa pessoa;
    private String tipo; // "aluno", "professor", "funcionario", etc.
    private String email;
    private String telefone;
    private String usuario; // só para não-aluno
    private String senha; // só para não-aluno
    private String dataInicio; // data de entrada no instituto como string (para funcionários)
    private List<String> permissoes; // chaves das funcionalidades que o usuário terá acesso

    // Campos adicionais para edição direta (sem objeto pessoa aninhado)
    private String nmPessoa;
    private String cpfPessoa;
    private String dtNascPessoa;
    private Boolean ativo;

    // Método para converter a string da data em LocalDate
    public LocalDate getDataInicioAsLocalDate() {
        System.out.println("=== CONVERSÃO DATA INICIO ===");
        System.out.println("dataInicio original: '" + dataInicio + "'");

        if (dataInicio == null) {
            System.out.println("dataInicio é null - retornando null");
            return null;
        }

        if (dataInicio.trim().isEmpty()) {
            System.out.println("dataInicio está vazia após trim - retornando null");
            return null;
        }

        try {
            // Formato esperado: YYYY-MM-DD
            LocalDate resultado = LocalDate.parse(dataInicio, DateTimeFormatter.ISO_LOCAL_DATE);
            System.out.println("Conversão bem-sucedida: " + resultado);
            return resultado;
        } catch (Exception e) {
            System.err.println("ERRO na conversão da data de início: '" + dataInicio + "' - " + e.getMessage());
            e.printStackTrace();
            return null;
        }
    }
}
package com.cipalam.cipalam_sistema.model;

import lombok.*;

@Data // @Data é uma anotação do Lombok que gera automaticamente os métodos getters, setters, toString, equals e hashCode para a classe. Isso reduz a quantidade de código boilerplate necessário para criar classes de modelo.
@NoArgsConstructor // @NoArgsConstructor é uma anotação do Lombok que gera um construtor sem argumentos para a classe. Isso é útil quando você precisa criar uma instância da classe sem passar nenhum parâmetro.
@AllArgsConstructor // @AllArgsConstructor é uma anotação do Lombok que gera um construtor com todos os argumentos para a classe. Isso é útil quando você precisa criar uma instância da classe passando todos os parâmetros.
public class Turma {
    private Long id;
    private String dia1;
    private String dia2;
    private String turno;
}

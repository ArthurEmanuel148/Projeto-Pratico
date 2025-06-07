package com.cipalam.cipalam_sistema.service;

import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.GetMapping;

@Service // @Service é uma anotação que indica que a classe é um serviço. Um serviço é uma camada de lógica de negócios que pode ser usada por controladores ou outros serviços. Ele pode conter métodos que realizam operações específicas, como acessar o banco de dados ou processar dados.
public class HelloWordService {


    @GetMapping
    public String helloWord(String name) {
        return "Hello Word "+ name + "!";
    }

}

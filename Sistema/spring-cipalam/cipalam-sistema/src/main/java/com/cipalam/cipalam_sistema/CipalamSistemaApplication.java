package com.cipalam.cipalam_sistema;


import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication // @SpringBootApplication é uma anotação que combina três anotações:
// @configuration pode ter meetodos bean
// @EnableAutoConfiguration ativa autoconfuguracao
// @ComponentScan permite scanear os pacotes para encontrar componentes, configurações e serviços
public class CipalamSistemaApplication {

	public static void main(String[] args) {
		SpringApplication.run(CipalamSistemaApplication.class, args);
	}

}

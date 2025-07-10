package com.cipalam.cipalam_sistema.configuration;

import com.cipalam.cipalam_sistema.model.Login;
import com.cipalam.cipalam_sistema.model.Pessoa;
import com.cipalam.cipalam_sistema.repository.LoginRepository;
import com.cipalam.cipalam_sistema.repository.PessoaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.sql.Date;
import java.util.Optional;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private PessoaRepository pessoaRepository;
    
    @Autowired
    private LoginRepository loginRepository;

    @Override
    public void run(String... args) throws Exception {
        // Verificar se já existe usuário admin
        Optional<Login> adminLogin = loginRepository.findByUsuario("admin");
        
        if (adminLogin.isEmpty()) {
            System.out.println("=== Criando usuário admin para teste ===");
            
            // Criar pessoa admin
            Pessoa adminPessoa = new Pessoa();
            adminPessoa.setNmPessoa("Administrador do Sistema");
            adminPessoa.setCpfPessoa("00000000000");
            adminPessoa.setDtNascPessoa(Date.valueOf("1980-01-01"));
            
            adminPessoa = pessoaRepository.save(adminPessoa);
            
            // Criar login admin
            Login login = new Login();
            login.setUsuario("admin");
            login.setSenha("123456");
            login.setPessoa(adminPessoa);
            
            loginRepository.save(login);
            
            System.out.println("Usuário admin criado:");
            System.out.println("Usuário: admin");
            System.out.println("Senha: 123456");
            System.out.println("=====================================");
        }
        
        // Verificar se já existe usuário funcionário
        Optional<Login> funcLogin = loginRepository.findByUsuario("funcionario");
        
        if (funcLogin.isEmpty()) {
            System.out.println("=== Criando usuário funcionário para teste ===");
            
            // Criar pessoa funcionário
            Pessoa funcPessoa = new Pessoa();
            funcPessoa.setNmPessoa("Funcionário de Teste");
            funcPessoa.setCpfPessoa("11111111111");
            funcPessoa.setDtNascPessoa(Date.valueOf("1985-05-15"));
            
            funcPessoa = pessoaRepository.save(funcPessoa);
            
            // Criar login funcionário
            Login login = new Login();
            login.setUsuario("funcionario");
            login.setSenha("123456");
            login.setPessoa(funcPessoa);
            
            loginRepository.save(login);
            
            System.out.println("Usuário funcionário criado:");
            System.out.println("Usuário: funcionario");
            System.out.println("Senha: 123456");
            System.out.println("========================================");
        }
    }
}

package com.cipalam.cipalam_sistema.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.cipalam.cipalam_sistema.model.user;
import com.cipalam.cipalam_sistema.service.HelloWordService;


@RestController // @RestController é uma anotação que combina @Controller: retorna ate pagina(nao usado) e @ResponseBody: // retorna o corpo da resposta diretamente, sem precisar de uma view.

//Stateless: significa que o controlador não mantém estado entre as requisições. Cada requisição é tratada de forma independente, sem armazenar informações sobre requisições anteriores.
//Stateful: significa que o controlador pode manter estado entre as requisições. Isso pode ser útil em casos onde é necessário armazenar informações sobre o usuário ou a sessão.

//endpoint
@RequestMapping("/hello-word") // @RequestMapping é uma anotação que mapeia requisições HTTP para métodos específicos do controlador. Neste caso, o caminho "/hello" será mapeado para os métodos deste controlador.
public class HelloWordController {

    @Autowired // @Autowired é uma anotação que permite a injeção de dependência. Ela indica que o Spring deve injetar uma instância do HelloWordService no controlador.
    private final HelloWordService helloWordService;

    public HelloWordController(HelloWordService helloWordService) {
        this.helloWordService = helloWordService;
        
    }

    // get, post, put, delete, patch, head, options, trace
    @GetMapping // @GetMapping é uma anotação que mapeia requisições HTTP GET para o método helloWord(). Neste caso, quando uma requisição GET for feita para o caminho "/hello-word", o método helloWord() será chamado.
    public String helloWord() {
        return helloWordService.helloWord("Cipalam");
    }

    @PostMapping("/{id}")
    public String helloWordPost(@PathVariable("id") String id, @RequestParam(value = "filter", defaultValue = "nenhum") String filter, @RequestBody user body) {
        // @RequestBody é uma anotação que indica que o corpo da requisição deve ser mapeado para o parâmetro do método. Neste caso, o corpo da requisição será passado como uma String para o método helloWordPost().


        //return "Hello Word " + body.getName();
        // return "Hello Word " + body.getName() + id; 
        return "Hello Word " + filter;
    }
}

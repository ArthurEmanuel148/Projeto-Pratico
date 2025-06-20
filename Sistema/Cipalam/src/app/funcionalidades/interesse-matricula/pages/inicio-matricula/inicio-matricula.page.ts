import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MatriculaService } from '../../services/matricula.service';

@Component({
  selector: 'app-inicio-matricula',
  templateUrl: './inicio-matricula.page.html',
  styleUrls: ['./inicio-matricula.page.scss'],
  standalone: false
})
export class InicioMatriculaPage {
  dadosResponsavel = {
    nome: 'Maria da Silva',
    email: 'maria@email.com',
    cpf: '123.456.789-00'
  };
  tipoCotaSelecionada = 'funcionario'; // Exemplo, normalmente viria do formulário

  constructor(
    private matriculaService: MatriculaService,
    private router: Router
  ) {}

  iniciarMatricula() {
    // 1. Criar login do responsável
    const login = this.matriculaService.criarLoginResponsavel(this.dadosResponsavel);

    // 2. Buscar documentos da cota
    const documentosPendentes = this.matriculaService.getDocumentosPorCota(this.tipoCotaSelecionada);

    // 3. Salvar responsável no vetor único de usuários (mock)
    const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
    // Verifica se já existe responsável com esse email (ou outro identificador único)
    let responsavel = usuarios.find((u: any) => u.usuarioSistema === login.usuario && u.tipo === 'responsavel');
    if (!responsavel) {
      responsavel = {
        nomeCompleto: this.dadosResponsavel.nome,
        usuarioSistema: login.usuario,
        senhaSistema: login.senha,
        tipo: 'responsavel'
        // Adicione outros campos necessários
      };
      usuarios.push(responsavel);
      localStorage.setItem('usuarios', JSON.stringify(usuarios));
    }

    // 4. Salvar documentos pendentes (se necessário)
    localStorage.setItem('documentosPendentes', JSON.stringify(documentosPendentes));

    // 5. Salvar usuário logado (opcional, se for logar automaticamente)
    localStorage.setItem('usuarioLogado', JSON.stringify(responsavel));

    // 6. Redirecionar para painel do responsável
    this.router.navigate(['/responsaveis/dashboard-responsavel']);
  }
}

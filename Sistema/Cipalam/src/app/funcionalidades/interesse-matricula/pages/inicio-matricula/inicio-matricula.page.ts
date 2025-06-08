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

    // 3. Salvar dados em localStorage/sessionStorage ou serviço global (até ter backend)
    localStorage.setItem('usuarioResponsavel', JSON.stringify(login));
    localStorage.setItem('documentosPendentes', JSON.stringify(documentosPendentes));

    // 4. Redirecionar para painel do responsável
    this.router.navigate(['/responsaveis/dashboard-responsavel']);
  }
}

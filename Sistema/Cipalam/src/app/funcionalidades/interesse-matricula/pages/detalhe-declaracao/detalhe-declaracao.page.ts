import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { InteresseMatriculaService } from '../../services/interesse-matricula.service';
import { InteresseMatricula } from '../../models/interesse-matricula.interface';
import { MatriculaService } from '../../services/matricula.service';

@Component({
  selector: 'app-detalhe-declaracao',
  templateUrl: './detalhe-declaracao.page.html',
  styleUrls: ['./detalhe-declaracao.page.scss'],
  standalone: false
})
export class DetalheDeclaracaoPage implements OnInit {
  declaracao?: InteresseMatricula;
  carregando = true;
  loginGerado?: { usuario: string, senha: string };
  matriculaIniciada = false;

  constructor(
    private route: ActivatedRoute,
    private interesseService: InteresseMatriculaService,
    private matriculaService: MatriculaService,
    private router: Router
  ) {}

  ngOnInit() {
    const protocolo = this.route.snapshot.paramMap.get('protocolo');
    // MOCK: Busca pelo id no array mockado
    if (protocolo) {
      this.interesseService.getDeclaracaoPorProtocolo(protocolo).subscribe(declaracao => {
        this.declaracao = declaracao;
        this.carregando = false;
      });
    }
    // Quando tiver backend, troque por um método getDeclaracaoPorId(id)
  }

  iniciarMatricula() {
    if (!this.declaracao) return;

    // 1. Gerar login do responsável (simulado, pronto para backend)
    const login = this.matriculaService.criarLoginResponsavel(this.declaracao.dadosResponsavel);

    // 2. Buscar documentos da cota
    const tipoCota = this.declaracao.tipoVaga?.tipoCota ?? 'livre';
    const documentosPendentes = this.matriculaService.getDocumentosPorCota(tipoCota);

    // 3. Salvar login e documentos no localStorage (futuro: backend)
    localStorage.setItem('usuarioResponsavel', JSON.stringify(login));
    localStorage.setItem('documentosPendentes', JSON.stringify(documentosPendentes));

    // 4. Exibir dados na tela
    this.loginGerado = login;
    this.matriculaIniciada = true;
  }
}

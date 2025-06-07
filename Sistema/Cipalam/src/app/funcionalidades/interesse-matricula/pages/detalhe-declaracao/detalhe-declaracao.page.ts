import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { InteresseMatriculaService } from '../../services/interesse-matricula.service';
import { InteresseMatricula } from '../../models/interesse-matricula.interface';

@Component({
  selector: 'app-detalhe-declaracao',
  templateUrl: './detalhe-declaracao.page.html',
  styleUrls: ['./detalhe-declaracao.page.scss'],
  standalone: false
})
export class DetalheDeclaracaoPage implements OnInit {
  declaracao?: InteresseMatricula;
  carregando = true;

  constructor(
    private route: ActivatedRoute,
    private interesseService: InteresseMatriculaService,
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
    if (this.declaracao?.protocolo) {
      this.router.navigate(['/paineis/interesse-matricula/documentos-matricula', this.declaracao.protocolo]);
    }
  }
}

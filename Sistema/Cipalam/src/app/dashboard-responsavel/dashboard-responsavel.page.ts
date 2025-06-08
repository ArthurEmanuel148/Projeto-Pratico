import { Component, OnInit } from '@angular/core';
import { DocumentoMatricula } from '../funcionalidades/interesse-matricula/models/documento-matricula.interface';

@Component({
  selector: 'app-dashboard-responsavel',
  templateUrl: './dashboard-responsavel.page.html',
  styleUrls: ['./dashboard-responsavel.page.scss'],
  standalone: false
})
export class DashboardResponsavelPage implements OnInit {
  documentosPendentes: DocumentoMatricula[] = [];

  constructor() { }

  ngOnInit() {
    // No futuro: buscar do backend pelo usuário logado
    const docs = localStorage.getItem('documentosPendentes');
    this.documentosPendentes = docs ? JSON.parse(docs) : [];
  }

  anexarDocumento(documento: DocumentoMatricula) {
    // Aqui você implementará a lógica de upload ou assinatura digital
    // Exemplo futuro:
    // this.http.post('/api/anexar-documento', { documentoId: documento.id, arquivo: ... })
    alert(`Anexar ou assinar: ${documento.nome}`);
  }
}

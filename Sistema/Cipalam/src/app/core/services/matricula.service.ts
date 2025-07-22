// src/app/core/services/matricula.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';

// Interfaces simplificadas para o serviço
export interface InteresseMatricula {
  id: number;
  protocolo: string;
  nomeResponsavel: string;
  cpfResponsavel: string;
  telefoneResponsavel: string;
  emailResponsavel: string;
  nomeAluno: string;
  dataNascimentoAluno: string;
  tipoCota: 'livre' | 'economica' | 'funcionario';
  status: 'interesse_declarado' | 'matricula_iniciada' | 'documentos_pendentes' | 'documentos_completos' | 'matricula_aprovada' | 'matricula_cancelada';
  dataEnvio: string;
  dataInicioMatricula?: string;
  funcionarioResponsavel?: string;
  observacoes?: string;
}

@Injectable({
  providedIn: 'root'
})
export class MatriculaService {
  private readonly apiUrl = 'http://localhost:8080/api/matricula';

  constructor(private http: HttpClient) { }

  // Método básico para buscar matrículas
  getInteressesMatricula(): Observable<InteresseMatricula[]> {
    // Mock data for now
    return of([]);
  }

  getInteressePorId(id: number): Observable<InteresseMatricula | null> {
    return of(null);
  }
}
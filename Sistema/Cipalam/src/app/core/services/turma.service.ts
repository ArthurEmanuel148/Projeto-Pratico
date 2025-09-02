import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Turma {
    id?: number;
    nomeTurma: string;
    capacidadeMaxima: number;
    capacidadeAtual: number;
    horarioInicio: string;
    horarioFim: string;
    ativo: boolean;
    observacoes?: string;
    dataCriacao?: Date;
    vagasDisponiveis?: number;
    temVagas?: boolean;
}

export interface TurmaCadastroDTO {
    nomeTurma: string;
    capacidadeMaxima: number;
    horarioInicio: string;
    horarioFim: string;
    observacoes?: string;
    ativo?: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class TurmaService {
    private readonly API_BASE_URL = `${environment.apiUrl}/turmas`;

    private httpOptions = {
        headers: new HttpHeaders({
            'Content-Type': 'application/json'
        })
    };

    constructor(private http: HttpClient) { }

    /**
     * Lista todas as turmas
     */
    listarTodas(): Observable<Turma[]> {
        return this.http.get<Turma[]>(this.API_BASE_URL, this.httpOptions);
    }

    /**
     * Lista apenas turmas ativas
     */
    listarAtivas(): Observable<Turma[]> {
        return this.http.get<Turma[]>(`${this.API_BASE_URL}/ativas`, this.httpOptions);
    }

    /**
     * Lista turmas com vagas disponíveis
     */
    listarComVagas(): Observable<Turma[]> {
        return this.http.get<Turma[]>(`${this.API_BASE_URL}/com-vagas`, this.httpOptions);
    }

    /**
     * Lista turmas por período
     */
    listarPorPeriodo(periodo: string): Observable<Turma[]> {
        return this.http.get<Turma[]>(`${this.API_BASE_URL}/periodo/${periodo}`, this.httpOptions);
    }

    /**
     * Busca turma por ID
     */
    buscarPorId(id: number): Observable<Turma> {
        return this.http.get<Turma>(`${this.API_BASE_URL}/${id}`, this.httpOptions);
    }

    /**
     * Cria uma nova turma
     */
    criarTurma(turma: TurmaCadastroDTO): Observable<any> {
        return this.http.post<any>(this.API_BASE_URL, turma, this.httpOptions);
    }

    /**
     * Atualiza uma turma existente
     */
    atualizarTurma(id: number, turma: TurmaCadastroDTO): Observable<any> {
        return this.http.put<any>(`${this.API_BASE_URL}/${id}`, turma, this.httpOptions);
    }

    /**
     * Exclui uma turma (soft delete)
     */
    excluirTurma(id: number): Observable<any> {
        return this.http.delete<any>(`${this.API_BASE_URL}/${id}`, this.httpOptions);
    }

    /**
     * Formatar horários para exibição
     */
    formatarHorario(horario: string): string {
        if (!horario) return 'Não definido';

        // Se já está no formato HH:mm, retorna como está
        if (horario.match(/^\d{2}:\d{2}$/)) {
            return horario;
        }

        // Caso contrário, tenta formatar
        return horario.substring(0, 5); // Pega apenas HH:mm
    }

    /**
     * Obter período do dia baseado no horário
     */
    getPeriodoDoDia(horarioInicio: string): string {
        if (!horarioInicio) return 'Não definido';

        const hora = parseInt(horarioInicio.split(':')[0]);

        if (hora >= 6 && hora < 12) {
            return 'Manhã';
        } else if (hora >= 12 && hora < 18) {
            return 'Tarde';
        } else if (hora >= 18 && hora < 24) {
            return 'Noite';
        } else {
            return 'Madrugada';
        }
    }

    /**
     * Obter cor baseada no período do dia
     */
    getCorPorHorario(horarioInicio: string): string {
        const periodo = this.getPeriodoDoDia(horarioInicio);

        switch (periodo) {
            case 'Manhã':
                return 'warning';
            case 'Tarde':
                return 'primary';
            case 'Noite':
                return 'dark';
            default:
                return 'medium';
        }
    }
}

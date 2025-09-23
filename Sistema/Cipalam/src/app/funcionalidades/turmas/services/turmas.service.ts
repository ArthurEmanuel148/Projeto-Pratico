import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

export interface Turma {
    id: number;
    nome: string;
    totalAlunos?: number;
}

export interface AlunoTurma {
    id: number;
    nome: string;
    cpf: string;
    email: string;
    telefone: string;
    protocolo: string;
    tipoCota: string;
    status: string;
    dataNascimento?: string;
    nomePai?: string;
    nomeMae?: string;
    endereco?: string;
    numeroEndereco?: string;
    complemento?: string;
    bairro?: string;
    cidade?: string;
    estado?: string;
    cep?: string;
}

export interface DetalhesAluno {
    id: number;
    nome: string;
    cpf: string;
    email: string;
    telefone: string;
    protocolo: string;
    tipoCota: string;
    status: string;
    dataNascimento?: string;
    nomePai?: string;
    nomeMae?: string;
    endereco?: string;
    numeroEndereco?: string;
    complemento?: string;
    bairro?: string;
    cidade?: string;
    estado?: string;
    cep?: string;
    documentos?: DocumentoAluno[];
}

export interface DocumentoAluno {
    id: number;
    tipoDocumento: string;
    nomeArquivo: string;
    dataUpload: string;
    status: string;
}

@Injectable({
    providedIn: 'root'
})
export class TurmasService {
    private apiUrl = `${environment.apiUrl}/turmas-alunos`;

    constructor(private http: HttpClient) { }

    // Listar todas as turmas
    listarTurmas(): Observable<Turma[]> {
        return this.http.get<any>(`${this.apiUrl}/turmas`).pipe(
            map(response => response.data || [])
        );
    }

    // Listar alunos de uma turma específica
    listarAlunosDaTurma(turmaId: number): Observable<AlunoTurma[]> {
        return this.http.get<any>(`${this.apiUrl}/turmas/${turmaId}/alunos`).pipe(
            map(response => {
                if (response.data && Array.isArray(response.data)) {
                    return response.data.map((aluno: any) => ({
                        id: aluno.idAluno,
                        nome: aluno.nomeAluno,
                        cpf: aluno.cpfAluno,
                        email: aluno.emailResponsavel,
                        telefone: aluno.telefoneResponsavel,
                        protocolo: aluno.protocoloDeclaracao,
                        tipoCota: aluno.tipoCota,
                        status: aluno.statusAluno,
                        dataNascimento: aluno.dataNascimentoAluno,
                        endereco: aluno.cep,
                        cidade: aluno.cidade,
                        estado: aluno.uf
                    }));
                }
                return [];
            })
        );
    }

    // Obter detalhes completos de um aluno
    obterDetalhesAluno(alunoId: number): Observable<DetalhesAluno> {
        return this.http.get<any>(`${this.apiUrl}/alunos/${alunoId}/detalhes`).pipe(
            map(response => response.data || {})
        );
    }

    // Obter documentos de um aluno
    obterDocumentosAluno(alunoId: number): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/alunos/${alunoId}/documentos`);
    }

    // Aprovar documento
    aprovarDocumento(documentoId: number, observacoes?: string): Observable<any> {
        const body = { observacoes: observacoes || '' };
        return this.http.post<any>(`${this.apiUrl}/documentos/${documentoId}/aprovar`, body);
    }

    // Rejeitar documento
    rejeitarDocumento(documentoId: number, motivo: string): Observable<any> {
        return this.http.post(`${this.apiUrl}/turmas-alunos/documentos/${documentoId}/rejeitar`, {
            motivo: motivo
        });
    }

    visualizarDocumento(documentoId: number): Observable<any> {
        return this.http.get(`${this.apiUrl}/turmas-alunos/documentos/${documentoId}/visualizar`);
    }

    // Transferir aluno para outra turma
    transferirAluno(alunoId: number, novaTurmaId: number): Observable<any> {
        return this.http.put(`${this.apiUrl}/alunos/${alunoId}/turma`, { turmaId: novaTurmaId });
    }
}
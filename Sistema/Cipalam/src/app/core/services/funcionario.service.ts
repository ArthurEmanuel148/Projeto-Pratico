import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiConfigService } from './api-config.service';

export interface FuncionarioCadastroDTO {
  pessoa: {
    nmPessoa: string;
    cpfPessoa?: string; // Opcional para funcionários
    email: string;
    telefone: string;
    dtNascPessoa: string;
    caminhoImagem?: string;
    caminhoIdentidadePessoa?: string;
  };
  tipo: string;
  usuario: string;
  senha: string;
  permissoes: string[];
}

@Injectable({
  providedIn: 'root'
})
export class FuncionarioService {

  constructor(
    private http: HttpClient,
    private apiConfig: ApiConfigService
  ) { }

  cadastrarFuncionario(funcionarioData: any): Observable<any> {
    console.log('🚀 FuncionarioService: Recebidos dados para cadastro:', funcionarioData);
    console.log('🔄 FuncionarioService: Enviando dados DIRETAMENTE para o backend sem transformação');
    
    // Enviar os dados exatamente como recebidos, já que o componente principal 
    // já formatou tudo corretamente com validações e estrutura dupla
    return this.http.post(this.apiConfig.getCadastroFuncionarioUrl(), funcionarioData);
  }

  listarFuncionarios(): Observable<any[]> {
    return this.http.get<any[]>(this.apiConfig.getListarFuncionariosUrl());
  }

  buscarFuncionarioPorId(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiConfig.getListarFuncionariosUrl()}/${id}`);
  }

  atualizarFuncionario(id: number, funcionarioData: any): Observable<any> {
    console.log('=== FUNCIONARIO SERVICE - ATUALIZAR ===');
    console.log('Dados recebidos da página:', funcionarioData);
    console.log('URL do endpoint:', `${this.apiConfig.getListarFuncionariosUrl()}/${id}`);

    // ENVIAR DIRETAMENTE os dados como chegaram da página
    // A página já está enviando no formato correto (campos diretos)
    console.log('Enviando diretamente para o backend (sem conversão):', funcionarioData);

    return this.http.put(`${this.apiConfig.getListarFuncionariosUrl()}/${id}`, funcionarioData);
  }

  private convertPermissoesToArray(permissoes: Record<string, boolean>): string[] {
    if (!permissoes) return [];

    return Object.keys(permissoes).filter(chave => permissoes[chave] === true);
  }

}
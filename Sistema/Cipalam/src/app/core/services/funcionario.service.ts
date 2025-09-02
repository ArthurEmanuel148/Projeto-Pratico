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
    // Transformar os dados do formulário para o formato esperado pelo backend
    const dto: FuncionarioCadastroDTO = {
      pessoa: {
        nmPessoa: funcionarioData.nomeCompleto,
        email: funcionarioData.email,
        telefone: funcionarioData.telefone, // Já deve vir limpo (sem máscara)
        cpfPessoa: funcionarioData.cpf || '', // Já deve vir limpo (sem máscara)
        dtNascPessoa: funcionarioData.dataNascimento, // Já deve vir no formato YYYY-MM-DD
        caminhoImagem: undefined,
        caminhoIdentidadePessoa: undefined
      },
      tipo: 'funcionario',
      usuario: funcionarioData.usuarioSistema,
      senha: funcionarioData.senhaSistema,
      permissoes: this.convertPermissoesToArray(funcionarioData.permissoes)
    };
    
    console.log('DTO enviado para o backend:', dto);
    return this.http.post(this.apiConfig.getCadastroFuncionarioUrl(), dto);
  }

  listarFuncionarios(): Observable<any[]> {
    return this.http.get<any[]>(this.apiConfig.getListarFuncionariosUrl());
  }

  buscarFuncionarioPorId(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiConfig.getListarFuncionariosUrl()}/${id}`);
  }

  atualizarFuncionario(id: number, funcionarioData: any): Observable<any> {
    console.log('Enviando dados para atualização:', funcionarioData);
    console.log('URL do endpoint:', `${this.apiConfig.getListarFuncionariosUrl()}/${id}`);

    // Transformar os dados do formulário para o formato esperado pelo backend
    const dto: FuncionarioCadastroDTO = {
      pessoa: {
        nmPessoa: funcionarioData.nomeCompleto,
        email: funcionarioData.email,
        telefone: funcionarioData.telefone, // Já deve vir limpo (sem máscara)
        cpfPessoa: funcionarioData.cpf || '', // Já deve vir limpo (sem máscara)
        dtNascPessoa: funcionarioData.dataNascimento, // Já deve vir no formato YYYY-MM-DD
        caminhoImagem: undefined,
        caminhoIdentidadePessoa: undefined
      },
      tipo: 'funcionario',
      usuario: funcionarioData.usuarioSistema,
      senha: funcionarioData.senhaSistema || '', // Senha pode estar vazia em edição
      permissoes: this.convertPermissoesToArray(funcionarioData.permissoes)
    };

    console.log('DTO formatado para backend:', dto);
    return this.http.put(`${this.apiConfig.getListarFuncionariosUrl()}/${id}`, dto);
  }

  private convertPermissoesToArray(permissoes: Record<string, boolean>): string[] {
    if (!permissoes) return [];

    return Object.keys(permissoes).filter(chave => permissoes[chave] === true);
  }

}
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiConfigService } from './api-config.service';

export interface FuncionarioCadastroDTO {
  pessoa: {
    nmPessoa: string;
    cpfPessoa: string;
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
        cpfPessoa: funcionarioData.cpf || this.generateTempCpf(),
        dtNascPessoa: funcionarioData.dataNascimento,
        caminhoImagem: undefined,
        caminhoIdentidadePessoa: undefined
      },
      tipo: 'funcionario',
      usuario: funcionarioData.usuarioSistema,
      senha: funcionarioData.senhaSistema,
      permissoes: this.convertPermissoesToArray(funcionarioData.permissoes)
    };

    return this.http.post(this.apiConfig.getCadastroFuncionarioUrl(), dto);
  }

  private convertPermissoesToArray(permissoes: Record<string, boolean>): string[] {
    if (!permissoes) return [];

    return Object.keys(permissoes).filter(chave => permissoes[chave] === true);
  }

  private generateTempCpf(): string {
    // Gera um CPF temporário para teste (não validar)
    return `${Math.floor(Math.random() * 900 + 100)}.${Math.floor(Math.random() * 900 + 100)}.${Math.floor(Math.random() * 900 + 100)}-${Math.floor(Math.random() * 90 + 10)}`;
  }
}

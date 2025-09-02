// src/app/funcionalidades/interesse-matricula/pages/declaracao-interesse/declaracao-interesse.page.ts
import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { IonContent, LoadingController, ToastController, AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { InteresseMatriculaService } from '../../services/interesse-matricula.service';
import { InteresseMatricula } from '../../models/interesse-matricula.interface';
import { EnderecoService, Endereco } from '../../../../core/services/endereco.service';
import { CustomValidators } from '../../../../core/validators/custom-validators';

export type EtapaFormulario =
  | 'dadosResponsavel'
  | 'verificacaoResponsavel'
  | 'dadosAluno'
  | 'dadosFamiliares'
  | 'enderecoFamilia'
  | 'observacoes'
  | 'revisao'
  | 'concluido';

@Component({
  selector: 'app-declaracao-interesse',
  templateUrl: './declaracao-interesse.page.html',
  styleUrls: ['./declaracao-interesse.page.scss'],
  standalone: false,
})
export class DeclaracaoInteressePage implements OnInit {
  @ViewChild(IonContent, { static: false }) content!: IonContent;

  etapaAtual: EtapaFormulario = 'dadosResponsavel';
  progresso: number = 0;
  declaracaoForm: FormGroup;
  dadosDeclaracaoCompleta: InteresseMatricula | null = null;
  isSubmitting: boolean = false;
  etapasVisitadas: EtapaFormulario[] = ['dadosResponsavel'];

  // Dados do processo
  responsavelExiste: boolean = false;
  dadosResponsavel: any = null;
  enderecoSelecionado: Endereco | null = null;
  horariosDisponiveis: any[] = [];

  // Propriedades para dados familiares
  responsavelOcupacao: string = '';
  responsavelRenda: number = 0;
  alunoOcupacao: string = '';
  alunoRenda: number = 0;
  integrantesFamilia: any[] = [];

  readonly ETAPAS = {
    DADOS_RESPONSAVEL: 'dadosResponsavel' as EtapaFormulario,
    VERIFICACAO_RESPONSAVEL: 'verificacaoResponsavel' as EtapaFormulario,
    DADOS_ALUNO: 'dadosAluno' as EtapaFormulario,
    DADOS_FAMILIARES: 'dadosFamiliares' as EtapaFormulario,
    ENDERECO_FAMILIA: 'enderecoFamilia' as EtapaFormulario,
    OBSERVACOES: 'observacoes' as EtapaFormulario,
    REVISAO: 'revisao' as EtapaFormulario,
    CONCLUIDO: 'concluido' as EtapaFormulario,
  };

  constructor(
    private fb: FormBuilder,
    private interesseService: InteresseMatriculaService,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private enderecoService: EnderecoService
  ) {
    this.declaracaoForm = this.criarFormularioCompleto();
  }

  ngOnInit() {
    this.calcularProgresso();
  }

  criarFormularioCompleto(): FormGroup {
    return this.fb.group({
      dadosResponsavel: this.fb.group({
        nome: ['', [Validators.required, Validators.minLength(2)]],
        cpf: ['', [Validators.required, CustomValidators.cpfValidator()]],
        dataNascimento: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        telefone: ['', [Validators.required, CustomValidators.phoneValidator()]],
      }),
      verificacaoResponsavel: this.fb.group({
        senha: ['', Validators.required]
      }),
      dadosAluno: this.fb.group({
        nome: ['', [Validators.required, Validators.minLength(2)]],
        cpf: ['', [Validators.required, CustomValidators.cpfValidator()]],
        dataNascimento: ['', Validators.required],
        escola: ['', Validators.required],
        codigoInep: ['']
      }),
      tipoCota: ['', Validators.required],
      horarios: this.fb.array([], Validators.required),
      dadosFamiliares: this.fb.group({
        integrantesRenda: this.fb.array([])
      }),
      endereco: this.fb.group({
        cep: ['', [Validators.required, CustomValidators.cepValidator()]],
        logradouro: ['', Validators.required],
        numero: ['', Validators.required],
        complemento: [''],
        bairro: ['', Validators.required],
        cidade: ['', Validators.required],
        uf: ['', Validators.required],
        pontoReferencia: ['']
      }),
      observacoes: ['']
    });
  }

  get dadosResponsavelForm(): FormGroup {
    return this.declaracaoForm.get('dadosResponsavel') as FormGroup;
  }

  get verificacaoResponsavelForm(): FormGroup {
    return this.declaracaoForm.get('verificacaoResponsavel') as FormGroup;
  }

  get dadosAlunoForm(): FormGroup {
    return this.declaracaoForm.get('dadosAluno') as FormGroup;
  }

  get dadosFamiliaresForm(): FormGroup {
    return this.declaracaoForm.get('dadosFamiliares') as FormGroup;
  }

  get enderecoForm(): FormGroup {
    return this.declaracaoForm.get('endereco') as FormGroup;
  }

  get horariosArray(): FormArray {
    return this.declaracaoForm.get('horarios') as FormArray;
  }

  // NAVEGAÇÃO ENTRE ETAPAS
  proximaEtapa() {
    this.scrollToTop();
    let proxima: EtapaFormulario | null = null;
    let etapaValida = false;

    switch (this.etapaAtual) {
      case this.ETAPAS.DADOS_RESPONSAVEL:
        etapaValida = this.dadosResponsavelForm.valid;
        if (etapaValida) {
          this.verificarResponsavelExistente();
          return; // A navegação será feita após verificação
        }
        break;
      case this.ETAPAS.VERIFICACAO_RESPONSAVEL:
        etapaValida = this.verificacaoResponsavelForm.valid;
        if (etapaValida) {
          this.autenticarResponsavel();
          return; // A navegação será feita após autenticação
        }
        break;
      case this.ETAPAS.DADOS_ALUNO:
        const tipoCota = this.declaracaoForm.get('tipoCota')?.value;
        etapaValida = this.dadosAlunoForm.valid && this.horariosArray.length > 0 && tipoCota;
        if (etapaValida) {
          // Só vai para dados familiares se for cota econômica E o responsável não existir
          if (tipoCota === 'economica' && !this.responsavelExiste) {
            proxima = this.ETAPAS.DADOS_FAMILIARES;
          } else {
            // Para vaga livre, funcionário, ou responsável já cadastrado, vai direto para endereço
            proxima = this.ETAPAS.ENDERECO_FAMILIA;
          }
        }
        break;
      case this.ETAPAS.DADOS_FAMILIARES:
        // Só valida dados familiares se estiver realmente nesta etapa (cota econômica)
        etapaValida = this.validarDadosFamiliares();
        if (etapaValida) proxima = this.ETAPAS.ENDERECO_FAMILIA;
        break;
      case this.ETAPAS.ENDERECO_FAMILIA:
        etapaValida = this.enderecoForm.valid;
        if (etapaValida) proxima = this.ETAPAS.OBSERVACOES;
        break;
      case this.ETAPAS.OBSERVACOES:
        etapaValida = true; // Observações são opcionais
        proxima = this.ETAPAS.REVISAO;
        break;
      case this.ETAPAS.REVISAO:
        this.enviarDeclaracaoFinal();
        return;
    }

    if (etapaValida && proxima) {
      this.navegarParaEtapa(proxima);
    } else {
      this.mostrarErrosFormulario();
    }
  }

  etapaAnterior() {
    const etapas = this.getSequenciaEtapas();
    const indiceAtual = etapas.indexOf(this.etapaAtual);

    if (indiceAtual > 0) {
      this.navegarParaEtapa(etapas[indiceAtual - 1]);
    }
  }

  navegarParaEtapa(etapa: EtapaFormulario) {
    this.etapaAtual = etapa;
    if (!this.etapasVisitadas.includes(etapa)) {
      this.etapasVisitadas.push(etapa);
    }
    this.calcularProgresso();
    this.scrollToTop();
  }

  // VERIFICAÇÃO DO RESPONSÁVEL
  async verificarResponsavelExistente() {
    const loading = await this.loadingCtrl.create({
      message: 'Verificando responsável...'
    });
    await loading.present();

    try {
      const cpf = this.dadosResponsavelForm.get('cpf')?.value;

      // Chamada real para a API
      this.interesseService.verificarResponsavelExiste(cpf).subscribe({
        next: (response) => {
          if (response && response.existe) {
            // Responsável existe no banco
            this.responsavelExiste = true;
            this.dadosResponsavel = response.dadosResponsavel;
            this.preencherDadosResponsavelExistente(response.dadosResponsavel);
            this.navegarParaEtapa(this.ETAPAS.VERIFICACAO_RESPONSAVEL);
            this.mostrarToast(`Bem-vindo de volta, ${response.dadosResponsavel.nome}! Digite sua senha para continuar.`, 'success');
          } else {
            // Responsável não existe, criar novo
            this.responsavelExiste = false;
            this.navegarParaEtapa(this.ETAPAS.DADOS_ALUNO);
            this.mostrarToast('Novo responsável! Prosseguindo com o cadastro.', 'primary');
          }
          loading.dismiss();
        },
        error: (error) => {
          console.warn('Sistema de verificação indisponível, prosseguindo com cadastro novo');
          // Em caso de erro, assumir que é novo responsável
          this.responsavelExiste = false;
          this.navegarParaEtapa(this.ETAPAS.DADOS_ALUNO);
          this.mostrarToast('Prosseguindo com o cadastro...', 'primary');
          loading.dismiss();
        }
      });
    } catch (error) {
      console.warn('Erro na verificação do responsável:', error);
      this.mostrarToast('Prosseguindo com o cadastro...', 'primary');
      loading.dismiss();
    }
  }

  async autenticarResponsavel() {
    const loading = await this.loadingCtrl.create({
      message: 'Autenticando...'
    });
    await loading.present();

    try {
      const cpf = this.dadosResponsavelForm.get('cpf')?.value;
      const senha = this.verificacaoResponsavelForm.get('senha')?.value;

      // Chamada real para autenticação
      this.interesseService.autenticarResponsavel(cpf, senha).subscribe({
        next: (response) => {
          if (response && response.autenticado) {
            // Autenticação bem-sucedida
            this.dadosResponsavel = response.dadosResponsavel;
            this.navegarParaEtapa(this.ETAPAS.DADOS_ALUNO);
            this.mostrarToast('Autenticado com sucesso!', 'success');
          } else {
            this.mostrarToast('Senha incorreta. Tente novamente.', 'danger');
          }
          loading.dismiss();
        },
        error: (error) => {
          console.error('Erro na autenticação:', error);
          this.mostrarToast('Erro na autenticação. Verifique sua senha.', 'danger');
          loading.dismiss();
        }
      });
    } catch (error) {
      console.error('Erro na autenticação:', error);
      this.mostrarToast('Erro na autenticação', 'danger');
      loading.dismiss();
    }
  }

  // BUSCA DE ENDEREÇO (IBGE)
  async buscarEnderecoPorCep(cep: string) {
    if (!cep || cep.length < 8) return;

    const loading = await this.loadingCtrl.create({
      message: 'Buscando endereço...',
      duration: 5000
    });
    await loading.present();

    try {
      this.enderecoService.buscarEnderecoPorCep(cep).subscribe({
        next: (endereco) => {
          if (endereco) {
            this.enderecoForm.patchValue({
              logradouro: endereco.logradouro,
              bairro: endereco.bairro,
              cidade: endereco.cidade,
              uf: endereco.uf
            });
            this.enderecoSelecionado = endereco;
          } else {
            this.mostrarToast('CEP não encontrado', 'warning');
          }
          loading.dismiss();
        },
        error: (error) => {
          console.error('Erro ao buscar endereço:', error);
          this.mostrarToast('Erro ao buscar endereço', 'danger');
          loading.dismiss();
        }
      });
    } catch (error) {
      console.error('Erro ao buscar endereço:', error);
      this.mostrarToast('Erro ao buscar endereço', 'danger');
      loading.dismiss();
    }
  }

  // VALIDAÇÕES
  validarDadosFamiliares(): boolean {
    // Se não é cota econômica, não precisa validar dados familiares
    const tipoCota = this.declaracaoForm.get('tipoCota')?.value;
    if (tipoCota !== 'economica') {
      return true;
    }

    // Para cota econômica, valida se tem dados de renda
    return this.responsavelRenda > 0 || this.alunoRenda > 0 || this.integrantesFamilia.length > 0;
  }

  // MANIPULAÇÃO DE HORÁRIOS
  toggleHorario(horario: string, event: any) {
    const horariosControl = this.horariosArray;

    if (event.target.checked) {
      // Adiciona o horário se não estiver presente
      if (!horariosControl.value.includes(horario)) {
        horariosControl.push(this.fb.control(horario));
      }
    } else {
      // Remove o horário
      const index = horariosControl.value.indexOf(horario);
      if (index > -1) {
        horariosControl.removeAt(index);
      }
    }
  }

  // CÁLCULO DE PROGRESSO
  calcularProgresso() {
    const etapas = this.getSequenciaEtapas();
    const indiceAtual = etapas.indexOf(this.etapaAtual);
    this.progresso = ((indiceAtual + 1) / etapas.length) * 100;
  }

  getSequenciaEtapas(): EtapaFormulario[] {
    const etapasBase = [this.ETAPAS.DADOS_RESPONSAVEL];

    if (this.responsavelExiste) {
      etapasBase.push(this.ETAPAS.VERIFICACAO_RESPONSAVEL);
    }

    etapasBase.push(this.ETAPAS.DADOS_ALUNO);

    const tipoCota = this.declaracaoForm.get('tipoCota')?.value;
    if (tipoCota === 'economica' && !this.responsavelExiste) {
      etapasBase.push(this.ETAPAS.DADOS_FAMILIARES);
    }

    etapasBase.push(
      this.ETAPAS.ENDERECO_FAMILIA,
      this.ETAPAS.OBSERVACOES,
      this.ETAPAS.REVISAO,
      this.ETAPAS.CONCLUIDO
    );

    return etapasBase;
  }

  // UTILIDADES
  getTituloEtapa(): string {
    switch (this.etapaAtual) {
      case this.ETAPAS.DADOS_RESPONSAVEL:
        return 'Dados do Responsável';
      case this.ETAPAS.VERIFICACAO_RESPONSAVEL:
        return 'Verificação de Senha';
      case this.ETAPAS.DADOS_ALUNO:
        return 'Dados do Aluno';
      case this.ETAPAS.DADOS_FAMILIARES:
        return 'Dados Familiares';
      case this.ETAPAS.ENDERECO_FAMILIA:
        return 'Endereço da Família';
      case this.ETAPAS.OBSERVACOES:
        return 'Observações';
      case this.ETAPAS.REVISAO:
        return 'Revisão Final';
      default:
        return 'Declaração de Interesse';
    }
  }

  getEtapaAtual(): number {
    return this.getSequenciaEtapas().indexOf(this.etapaAtual) + 1;
  }

  getTotalEtapas(): number {
    return this.getSequenciaEtapas().length - 1; // Exclui 'concluido'
  }

  scrollToTop() {
    setTimeout(() => {
      this.content?.scrollToTop(300);
    }, 100);
  }

  async mostrarToast(message: string, color: string = 'primary') {
    const toast = await this.toastCtrl.create({
      message,
      duration: 3000,
      color,
      position: 'top'
    });
    toast.present();
  }

  mostrarErrosFormulario() {
    let erros: string[] = [];

    switch (this.etapaAtual) {
      case this.ETAPAS.DADOS_RESPONSAVEL:
        if (this.dadosResponsavelForm.invalid) {
          if (this.dadosResponsavelForm.get('nome')?.invalid) erros.push('Nome do responsável');
          if (this.dadosResponsavelForm.get('cpf')?.invalid) erros.push('CPF do responsável');
          if (this.dadosResponsavelForm.get('dataNascimento')?.invalid) erros.push('Data de nascimento');
          if (this.dadosResponsavelForm.get('email')?.invalid) erros.push('E-mail');
          if (this.dadosResponsavelForm.get('telefone')?.invalid) erros.push('Telefone');
        }
        break;
      case this.ETAPAS.VERIFICACAO_RESPONSAVEL:
        if (this.verificacaoResponsavelForm.invalid) {
          if (this.verificacaoResponsavelForm.get('senha')?.invalid) erros.push('Senha');
        }
        break;
      case this.ETAPAS.DADOS_ALUNO:
        if (this.dadosAlunoForm.invalid) {
          if (this.dadosAlunoForm.get('nome')?.invalid) erros.push('Nome do aluno');
          if (this.dadosAlunoForm.get('cpf')?.invalid) erros.push('CPF do aluno');
          if (this.dadosAlunoForm.get('dataNascimento')?.invalid) erros.push('Data de nascimento do aluno');
          if (this.dadosAlunoForm.get('escola')?.invalid) erros.push('Escola do aluno');
        }
        if (!this.declaracaoForm.get('tipoCota')?.value) erros.push('Tipo de vaga');
        if (this.horariosArray.length === 0) erros.push('Pelo menos um horário');
        break;
      case this.ETAPAS.DADOS_FAMILIARES:
        const tipoCota = this.declaracaoForm.get('tipoCota')?.value;
        if (tipoCota === 'economica') {
          if (!this.responsavelRenda && !this.alunoRenda && this.integrantesFamilia.length === 0) {
            erros.push('Informações de renda familiar (responsável, aluno ou outros integrantes)');
          }
        }
        break;
      case this.ETAPAS.ENDERECO_FAMILIA:
        if (this.enderecoForm.invalid) {
          if (this.enderecoForm.get('cep')?.invalid) erros.push('CEP');
          if (this.enderecoForm.get('logradouro')?.invalid) erros.push('Logradouro');
          if (this.enderecoForm.get('numero')?.invalid) erros.push('Número');
          if (this.enderecoForm.get('bairro')?.invalid) erros.push('Bairro');
          if (this.enderecoForm.get('cidade')?.invalid) erros.push('Cidade');
          if (this.enderecoForm.get('uf')?.invalid) erros.push('UF');
        }
        break;
    }

    if (erros.length > 0) {
      this.mostrarToast(`Preencha os campos obrigatórios: ${erros.join(', ')}`, 'warning');
    } else {
      // Debug - mostrar informações para investigar
      console.log('Etapa atual:', this.etapaAtual);
      console.log('Tipo de cota:', this.declaracaoForm.get('tipoCota')?.value);
      console.log('Formulário aluno válido:', this.dadosAlunoForm.valid);
      console.log('Horários selecionados:', this.horariosArray.length);
      this.mostrarToast('Verifique se todos os campos estão preenchidos corretamente', 'warning');
    }
  }

  async enviarDeclaracaoFinal() {
    this.isSubmitting = true;
    const loading = await this.loadingCtrl.create({
      message: 'Enviando declaração para o sistema...'
    });
    await loading.present();

    try {
      // Verificar o tipo de cota
      const tipoCota = this.declaracaoForm.get('tipoCota')?.value;

      // Compilar integrantes da renda apenas se for cota econômica
      const integrantesRenda = [];

      if (tipoCota === 'economica') {
        // Adicionar responsável
        integrantesRenda.push({
          nome: this.getResponsavelNome(),
          parentesco: "responsavel",
          idade: this.calcularIdade(this.dadosResponsavelForm.get('dataNascimento')?.value),
          renda: this.responsavelRenda || 0,
          tipoRenda: this.responsavelRenda > 0 ? "salario" : "nenhuma",
          observacoes: this.responsavelOcupacao || ""
        });

        // Adicionar aluno
        integrantesRenda.push({
          nome: this.dadosAlunoForm.get('nome')?.value,
          parentesco: "filho",
          idade: this.calcularIdade(this.dadosAlunoForm.get('dataNascimento')?.value),
          renda: this.alunoRenda || 0,
          tipoRenda: this.alunoRenda > 0 ? "autonomo" : "nenhuma",
          observacoes: this.alunoOcupacao || "Estudante a ser matriculado"
        });

        // Adicionar outros integrantes
        this.integrantesFamilia.forEach(integrante => {
          integrantesRenda.push({
            nome: integrante.nome,
            parentesco: integrante.parentesco || "outro",
            idade: integrante.idade || 0,
            renda: integrante.renda || 0,
            tipoRenda: integrante.renda > 0 ? "salario" : "nenhuma",
            observacoes: integrante.ocupacao || ""
          });
        });
      }

      // Compilar dados conforme formato esperado pelo backend
      const dadosCompletos = {
        dataDeclaracao: new Date().toISOString().split('T')[0],
        observacoes: this.declaracaoForm.get('observacoes')?.value || '',
        status: 'AGUARDANDO_ANALISE',
        dadosResponsavel: {
          nome: this.getResponsavelNome(),
          cpf: this.dadosResponsavelForm.get('cpf')?.value,
          telefone: this.dadosResponsavelForm.get('telefone')?.value,
          email: this.dadosResponsavelForm.get('email')?.value,
          endereco: {
            cep: this.enderecoForm.get('cep')?.value,
            logradouro: this.enderecoForm.get('logradouro')?.value,
            numero: this.enderecoForm.get('numero')?.value,
            complemento: this.enderecoForm.get('complemento')?.value || '',
            bairro: this.enderecoForm.get('bairro')?.value,
            cidade: this.enderecoForm.get('cidade')?.value,
            estado: this.enderecoForm.get('estado')?.value
          },
          dataNascimento: this.dadosResponsavelForm.get('dataNascimento')?.value
        },
        dadosAluno: {
          nome: this.dadosAlunoForm.get('nome')?.value,
          cpf: this.dadosAlunoForm.get('cpf')?.value,
          dataNascimento: this.dadosAlunoForm.get('dataNascimento')?.value,
          escola: this.dadosAlunoForm.get('escola')?.value,
          necessidadeEspecial: this.dadosAlunoForm.get('necessidadeEspecial')?.value || '',
          curso: this.declaracaoForm.get('curso')?.value
        },
        infoRenda: tipoCota === 'economica' ? {
          rendaFamiliarTotal: this.getRendaFamiliarTotal(),
          membrosComRenda: integrantesRenda.filter(m => m.renda > 0).length,
          integrantesRenda: integrantesRenda,
          documentosComprobatorios: ['rg', 'cpf', 'comprovante_renda', 'comprovante_residencia']
        } : null,
        horariosVaga: {
          turno: this.declaracaoForm.get('turno')?.value,
          horariosSelecionados: this.horariosArray.value
        },
        tipoCota: tipoCota
      };

      console.log('Dados compilados para envio:', dadosCompletos);

      // Chamada real para o backend
      this.interesseService.enviarDeclaracaoCompleta(dadosCompletos).subscribe({
        next: (response) => {
          console.log('Declaração enviada com sucesso:', response);
          this.navegarParaEtapa(this.ETAPAS.CONCLUIDO);
          this.mostrarToast(`Declaração enviada com sucesso! Protocolo: ${response.protocolo || 'Gerado'}`, 'success');
          loading.dismiss();
          this.isSubmitting = false;
        },
        error: (error) => {
          console.error('Erro ao enviar declaração:', error);
          let mensagem = 'Erro ao enviar declaração para o sistema.';
          if (error.error && error.error.message) {
            mensagem += ` Detalhes: ${error.error.message}`;
          }
          this.mostrarToast(mensagem, 'danger');
          loading.dismiss();
          this.isSubmitting = false;
        }
      });

    } catch (error) {
      console.error('Erro ao compilar dados:', error);
      this.mostrarToast('Erro ao preparar dados da declaração', 'danger');
      loading.dismiss();
      this.isSubmitting = false;
    }
  }

  // Método auxiliar para calcular idade
  calcularIdade(dataNascimento: string): number {
    if (!dataNascimento) return 0;
    const hoje = new Date();
    const nascimento = new Date(dataNascimento);
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const mes = hoje.getMonth() - nascimento.getMonth();
    if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
      idade--;
    }
    return idade;
  }

  // MÉTODOS PARA FORMATAÇÃO E MANIPULAÇÃO DE DADOS

  formatarCpf(event: any, tipo: 'responsavel' | 'aluno') {
    let valor = event.target.value;
    valor = valor.replace(/\D/g, '');
    valor = valor.replace(/(\d{3})(\d)/, '$1.$2');
    valor = valor.replace(/(\d{3})(\d)/, '$1.$2');
    valor = valor.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    event.target.value = valor;

    // Atualizar o FormControl
    if (tipo === 'responsavel') {
      this.dadosResponsavelForm.get('cpf')?.setValue(valor);
    } else {
      this.dadosAlunoForm.get('cpf')?.setValue(valor);
    }
  }

  formatarCpfIntegrante(event: any, integrante: any) {
    let valor = event.target.value;
    valor = valor.replace(/\D/g, '');
    valor = valor.replace(/(\d{3})(\d)/, '$1.$2');
    valor = valor.replace(/(\d{3})(\d)/, '$1.$2');
    valor = valor.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    event.target.value = valor;
    integrante.cpf = valor;
  }

  formatarTelefone(event: any) {
    let valor = event.target.value;
    valor = valor.replace(/\D/g, '');
    valor = valor.replace(/(\d{2})(\d)/, '($1) $2');
    valor = valor.replace(/(\d{4,5})(\d{4})$/, '$1-$2');
    event.target.value = valor;

    // Atualizar o FormControl
    this.dadosResponsavelForm.get('telefone')?.setValue(valor);
  }

  formatarCep(event: any) {
    let valor = event.target.value;
    valor = valor.replace(/\D/g, '');
    valor = valor.replace(/(\d{5})(\d)/, '$1-$2');
    event.target.value = valor;

    // Atualizar o FormControl
    this.enderecoForm.get('cep')?.setValue(valor);
  }

  getResponsavelNome(): string {
    if (this.responsavelExiste && this.dadosResponsavel) {
      return this.dadosResponsavel.nome;
    }
    return this.dadosResponsavelForm.get('nome')?.value || '';
  }

  getResponsavelCpf(): string {
    if (this.responsavelExiste && this.dadosResponsavel) {
      return this.dadosResponsavel.cpf;
    }
    return this.dadosResponsavelForm.get('cpf')?.value || '';
  }

  adicionarIntegrante() {
    const novoIntegrante = {
      nome: '',
      cpf: '',
      parentesco: '',
      ocupacao: '',
      renda: 0
    };
    this.integrantesFamilia.push(novoIntegrante);
  }

  removerIntegrante(index: number) {
    this.integrantesFamilia.splice(index, 1);
  }

  getTotalIntegrantes(): number {
    // Responsável + Aluno + Outros integrantes
    return 2 + this.integrantesFamilia.length;
  }

  getRendaFamiliarTotal(): number {
    let total = 0;

    // Renda do responsável
    total += this.responsavelRenda || 0;

    // Renda do aluno
    total += this.alunoRenda || 0;

    // Renda dos outros integrantes
    this.integrantesFamilia.forEach(integrante => {
      total += integrante.renda || 0;
    });

    return total;
  }

  getRendaPerCapita(): number {
    const total = this.getRendaFamiliarTotal();
    const integrantes = this.getTotalIntegrantes();
    return integrantes > 0 ? total / integrantes : 0;
  }

  formatarMoeda(valor: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  }

  getRendaFamiliarTotalFormatada(): string {
    return this.formatarMoeda(this.getRendaFamiliarTotal());
  }

  getRendaPerCapitaFormatada(): string {
    return this.formatarMoeda(this.getRendaPerCapita());
  }

  preencherDadosResponsavelExistente(dadosResponsavel: any) {
    // Preencher formulário com dados do responsável existente
    this.dadosResponsavelForm.patchValue({
      nome: dadosResponsavel.nome,
      cpf: dadosResponsavel.cpf,
      dataNascimento: dadosResponsavel.dataNascimento,
      telefone: dadosResponsavel.telefone,
      email: dadosResponsavel.email
    });

    // Se houver dados de endereço, preencher também
    if (dadosResponsavel.endereco && typeof dadosResponsavel.endereco === 'string') {
      try {
        const enderecoObj = JSON.parse(dadosResponsavel.endereco);
        this.enderecoForm.patchValue(enderecoObj);
      } catch (e) {
        console.warn('Erro ao parsear endereço:', e);
      }
    } else if (dadosResponsavel.endereco && typeof dadosResponsavel.endereco === 'object') {
      this.enderecoForm.patchValue(dadosResponsavel.endereco);
    }

    // Marcar campos como tocados para mostrar validação
    this.dadosResponsavelForm.markAllAsTouched();
    this.enderecoForm.markAllAsTouched();

    console.log('Dados do responsável existente preenchidos:', dadosResponsavel);
  }

  voltarParaInicio() {
    this.router.navigate(['/entrada-publica']);
  }
}

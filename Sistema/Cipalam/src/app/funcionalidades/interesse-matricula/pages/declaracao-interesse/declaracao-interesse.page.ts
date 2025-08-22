// src/app/funcionalidades/interesse-matricula/pages/declaracao-interesse/declaracao-interesse.page.ts
import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { IonContent, LoadingController, ToastController, AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { InteresseMatriculaService } from '../../services/interesse-matricula.service';
import { InteresseMatricula } from '../../models/interesse-matricula.interface';
import { EnderecoService, Endereco } from '../../../../core/services/endereco.service';

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
        cpf: ['', [Validators.required, Validators.pattern(/^\d{11}$/)]],
        dataNascimento: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        telefone: ['', [Validators.required, Validators.pattern(/^\(\d{2}\)\s\d{4,5}-\d{4}$/)]],
      }),
      verificacaoResponsavel: this.fb.group({
        senha: ['', Validators.required]
      }),
      dadosAluno: this.fb.group({
        nome: ['', [Validators.required, Validators.minLength(2)]],
        cpf: ['', [Validators.required, Validators.pattern(/^\d{11}$/)]],
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
        cep: ['', [Validators.required, Validators.pattern(/^\d{5}-?\d{3}$/)]],
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
        etapaValida = this.dadosAlunoForm.valid && this.horariosArray.length > 0;
        if (etapaValida) {
          const tipoCota = this.declaracaoForm.get('tipoCota')?.value;
          if (tipoCota === 'economica' && !this.responsavelExiste) {
            proxima = this.ETAPAS.DADOS_FAMILIARES;
          } else {
            proxima = this.ETAPAS.ENDERECO_FAMILIA;
          }
        }
        break;
      case this.ETAPAS.DADOS_FAMILIARES:
        etapaValida = this.validarDadosFamiliares();
        if (etapaValida) proxima = this.ETAPAS.ENDERECO_FAMILIA;
        break;
      case this.ETAPAS.ENDERECO_FAMILIA:
        etapaValida = this.enderecoForm.valid;
        if (etapaValida) proxima = this.ETAPAS.OBSERVACOES;
        break;
      case this.ETAPAS.OBSERVACOES:
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
      // Aqui você faria a chamada para a API para verificar se o responsável existe
      // const responsavel = await this.interesseService.verificarResponsavel(cpf);

      // Simulando resposta da API
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Se responsável existe, pedir senha
      if (Math.random() > 0.7) { // 30% chance de existir (simulação)
        this.responsavelExiste = true;
        this.navegarParaEtapa(this.ETAPAS.VERIFICACAO_RESPONSAVEL);
      } else {
        // Se não existe, ir direto para dados do aluno
        this.responsavelExiste = false;
        this.navegarParaEtapa(this.ETAPAS.DADOS_ALUNO);
      }
    } catch (error) {
      console.error('Erro ao verificar responsável:', error);
      this.mostrarToast('Erro ao verificar dados do responsável', 'danger');
    } finally {
      loading.dismiss();
    }
  }

  async autenticarResponsavel() {
    const loading = await this.loadingCtrl.create({
      message: 'Autenticando...'
    });
    await loading.present();

    try {
      const senha = this.verificacaoResponsavelForm.get('senha')?.value;
      // Aqui você faria a autenticação
      // const resultado = await this.interesseService.autenticarResponsavel(cpf, senha);

      // Simulando autenticação
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (Math.random() > 0.3) { // 70% chance de sucesso (simulação)
        this.navegarParaEtapa(this.ETAPAS.DADOS_ALUNO);
      } else {
        this.mostrarToast('Senha incorreta', 'danger');
      }
    } catch (error) {
      console.error('Erro na autenticação:', error);
      this.mostrarToast('Erro na autenticação', 'danger');
    } finally {
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
    const integrantesArray = this.dadosFamiliaresForm.get('integrantesRenda') as FormArray;
    return integrantesArray.length > 0 && integrantesArray.valid;
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
    this.mostrarToast('Por favor, preencha todos os campos obrigatórios', 'warning');
  }

  async enviarDeclaracaoFinal() {
    const loading = await this.loadingCtrl.create({
      message: 'Enviando declaração...'
    });
    await loading.present();

    try {
      const dadosCompletos = this.declaracaoForm.getRawValue();

      // Aqui você enviaria os dados para o backend
      // await this.interesseService.enviarDeclaracao(dadosCompletos);

      // Simulando envio
      await new Promise(resolve => setTimeout(resolve, 2000));

      this.navegarParaEtapa(this.ETAPAS.CONCLUIDO);
      this.mostrarToast('Declaração enviada com sucesso!', 'success');

    } catch (error) {
      console.error('Erro ao enviar declaração:', error);
      this.mostrarToast('Erro ao enviar declaração', 'danger');
    } finally {
      loading.dismiss();
    }
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

  voltarParaInicio() {
    this.router.navigate(['/entrada-publica']);
  }
}

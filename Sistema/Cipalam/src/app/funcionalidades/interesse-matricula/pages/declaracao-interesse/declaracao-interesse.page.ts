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

  // Dados familiares
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
        cpf: ['', [Validators.required, Validators.pattern(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/)]],
        dataNascimento: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        telefone: ['', [Validators.required, Validators.pattern(/^\(\d{2}\)\s\d{4,5}-\d{4}$/)]],
      }),
      verificacaoResponsavel: this.fb.group({
        senha: ['', Validators.required]
      }),
      dadosAluno: this.fb.group({
        nome: ['', [Validators.required, Validators.minLength(2)]],
        cpf: ['', [Validators.required, this.validadorCpf]],
        dataNascimento: ['', Validators.required],
        escola: ['', Validators.required]
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
        const tipoCotaValido = !!this.declaracaoForm.get('tipoCota')?.value;
        const horariosValidos = this.horariosArray.length > 0;
        etapaValida = this.dadosAlunoForm.valid && tipoCotaValido && horariosValidos;
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
        etapaValida = true; // Observações é opcional
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
      const cpfFormulario = this.dadosResponsavelForm.get('cpf')?.value;
      const cpfLimpo = this.limparCpf(cpfFormulario); // Remove formatação antes de enviar

      // Chamada real para a API
      this.interesseService.verificarResponsavel(cpfLimpo).subscribe({
        next: (response) => {
          loading.dismiss();

          if (response.existe) {
            // Responsável existe no banco
            this.responsavelExiste = true;
            this.dadosResponsavel = response.dados;

            // Pré-preencher dados de renda se houver histórico
            if (this.dadosResponsavel.ocupacaoAnterior) {
              this.responsavelOcupacao = this.dadosResponsavel.ocupacaoAnterior;
            }
            if (this.dadosResponsavel.rendaAnterior) {
              this.responsavelRenda = this.dadosResponsavel.rendaAnterior;
            }

            this.navegarParaEtapa(this.ETAPAS.VERIFICACAO_RESPONSAVEL);
          } else {
            // Responsável não existe, ir direto para dados do aluno
            this.responsavelExiste = false;
            this.dadosResponsavel = null;
            this.navegarParaEtapa(this.ETAPAS.DADOS_ALUNO);
          }
        },
        error: (error) => {
          loading.dismiss();
          console.error('Erro ao verificar responsável:', error);
          this.mostrarToast('Erro ao verificar responsável', 'danger');
        }
      });
    } catch (error) {
      loading.dismiss();
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
      const cpfFormulario = this.getResponsavelCpf();
      const cpfLimpo = this.limparCpf(cpfFormulario); // Remove formatação antes de enviar

      // Chamada real para a API de autenticação
      this.interesseService.autenticarResponsavel(cpfLimpo, senha).subscribe({
        next: (resultado) => {
          loading.dismiss();

          if (resultado) {
            // Autenticação bem-sucedida
            this.navegarParaEtapa(this.ETAPAS.DADOS_ALUNO);
            this.mostrarToast('Autenticação realizada com sucesso', 'success');
          } else {
            this.mostrarToast('Senha incorreta', 'danger');
          }
        },
        error: (error) => {
          loading.dismiss();
          console.error('Erro na autenticação:', error);

          // Verificar se é erro de credenciais inválidas ou erro do servidor
          if (error.status === 401) {
            this.mostrarToast('Senha incorreta', 'danger');
          } else {
            this.mostrarToast('Erro na autenticação', 'danger');
          }
        }
      });
    } catch (error) {
      loading.dismiss();
      console.error('Erro na autenticação:', error);
      this.mostrarToast('Erro na autenticação', 'danger');
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
    // Valida se pelo menos o responsável e aluno têm ocupação informada
    const responsavelValido = !!(this.responsavelOcupacao && this.responsavelOcupacao.trim().length > 0);
    const alunoValido = !!(this.alunoOcupacao && this.alunoOcupacao.trim().length > 0);

    // Valida se todos os integrantes adicionados têm dados completos
    const integrantesValidos = this.integrantesFamilia.every(integrante =>
      !!(integrante.nome && integrante.nome.trim().length > 0 &&
        integrante.cpf && integrante.cpf.trim().length > 0 &&
        integrante.parentesco && integrante.parentesco.trim().length > 0 &&
        integrante.ocupacao && integrante.ocupacao.trim().length > 0)
    );

    return responsavelValido && alunoValido && integrantesValidos;
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

  // MANIPULAÇÃO DE DADOS FAMILIARES
  adicionarIntegrante() {
    this.integrantesFamilia.push({
      nome: '',
      cpf: '',
      parentesco: '',
      ocupacao: '',
      renda: 0
    });
  }

  removerIntegrante(index: number) {
    this.integrantesFamilia.splice(index, 1);
  }

  getTotalIntegrantes(): number {
    // Retorna o total de integrantes da família
    if (!this.integrantesFamilia || this.integrantesFamilia.length === 0) {
      return 0;
    }
    return this.integrantesFamilia.length;
  }

  getRendaFamiliarTotal(): number {
    if (!this.integrantesFamilia || this.integrantesFamilia.length === 0) {
      return 0;
    }

    let total = 0;

    // Renda dos integrantes da família
    this.integrantesFamilia.forEach(integrante => {
      const renda = integrante.renda || 0;
      total += typeof renda === 'number' ? renda : parseFloat(renda.toString()) || 0;
    });

    return total;
  }

  getRendaPerCapita(): number {
    const total = this.getRendaFamiliarTotal();
    const integrantes = this.getTotalIntegrantes();
    if (integrantes === 0 || total === 0) {
      return 0;
    }
    return total / integrantes;
  }

  // MÉTODOS PARA OBTER DADOS DO RESPONSÁVEL
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
    let mensagem = 'Por favor, preencha todos os campos obrigatórios';

    if (this.etapaAtual === this.ETAPAS.DADOS_ALUNO) {
      const tipoCotaValido = !!this.declaracaoForm.get('tipoCota')?.value;
      const horariosValidos = this.horariosArray.length > 0;

      if (!tipoCotaValido && !horariosValidos) {
        mensagem = 'Por favor, selecione o tipo de vaga e pelo menos um horário';
      } else if (!tipoCotaValido) {
        mensagem = 'Por favor, selecione o tipo de vaga';
      } else if (!horariosValidos) {
        mensagem = 'Por favor, selecione pelo menos um horário';
      }
    }

    this.mostrarToast(mensagem, 'warning');
  }

  async enviarDeclaracaoFinal() {
    const loading = await this.loadingCtrl.create({
      message: 'Enviando declaração...'
    });
    await loading.present();

    try {
      const dadosCompletos = this.declaracaoForm.getRawValue();

      // Limpar CPFs antes do envio (remove formatação)
      if (dadosCompletos.dadosResponsavel?.cpf) {
        dadosCompletos.dadosResponsavel.cpf = this.limparCpf(dadosCompletos.dadosResponsavel.cpf);
      }

      if (dadosCompletos.dadosAluno?.cpf) {
        dadosCompletos.dadosAluno.cpf = this.limparCpf(dadosCompletos.dadosAluno.cpf);
      }

      // Limpar CPFs dos integrantes da família
      if (this.integrantesFamilia && this.integrantesFamilia.length > 0) {
        this.integrantesFamilia.forEach(integrante => {
          if (integrante.cpf) {
            integrante.cpf = this.limparCpf(integrante.cpf);
          }
        });
        dadosCompletos.integrantesFamilia = this.integrantesFamilia;
      }

      // Enviar dados para o backend
      this.interesseService.enviarDeclaracao(dadosCompletos).subscribe({
        next: (response) => {
          loading.dismiss();
          this.navegarParaEtapa(this.ETAPAS.CONCLUIDO);
          this.mostrarToast('Declaração enviada com sucesso!', 'success');
        },
        error: (error) => {
          loading.dismiss();
          console.error('Erro ao enviar declaração:', error);
          this.mostrarToast('Erro ao enviar declaração. Tente novamente.', 'danger');
        }
      });

    } catch (error) {
      console.error('Erro ao enviar declaração:', error);
      this.mostrarToast('Erro ao enviar declaração', 'danger');
    } finally {
      loading.dismiss();
    }
  }

  // === FORMATAÇÃO E VALIDAÇÃO DE CPF ===

  /**
   * Validador customizado para CPF
   */
  validadorCpf(control: any): { [key: string]: any } | null {
    if (!control.value) {
      return null; // Se estiver vazio, deixa o required validar
    }

    const cpfLimpo = control.value.replace(/\D/g, '');

    // Se não tem 11 dígitos, não está completo ainda
    if (cpfLimpo.length !== 11) {
      return null; // Não mostra erro enquanto está digitando
    }

    // Valida se o CPF é válido
    if (!this.validarCpfCompleto(cpfLimpo)) {
      return { cpfInvalido: true };
    }

    return null;
  }

  /**
   * Formatar CPF automaticamente enquanto o usuário digita
   */
  formatarCpf(event: any, tipo: 'responsavel' | 'aluno') {
    let valor = event.target.value;

    // Remove tudo que não é número
    valor = valor.replace(/\D/g, '');

    // Limita a 11 dígitos
    if (valor.length > 11) {
      valor = valor.substring(0, 11);
    }

    // Aplica a máscara
    if (valor.length >= 4) {
      valor = valor.replace(/(\d{3})(\d)/, '$1.$2');
    }
    if (valor.length >= 7) {
      valor = valor.replace(/(\d{3})\.(\d{3})(\d)/, '$1.$2.$3');
    }
    if (valor.length >= 10) {
      valor = valor.replace(/(\d{3})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3-$4');
    }

    // Atualiza o valor no input e no formulário
    event.target.value = valor;

    if (tipo === 'responsavel') {
      this.dadosResponsavelForm.patchValue({ cpf: valor });
    } else if (tipo === 'aluno') {
      this.dadosAlunoForm.patchValue({ cpf: valor });
    }

    // Se o CPF estiver completo (11 dígitos), força a validação
    const cpfLimpo = valor.replace(/\D/g, '');
    if (cpfLimpo.length === 11) {
      if (tipo === 'responsavel') {
        this.dadosResponsavelForm.get('cpf')?.updateValueAndValidity();
      } else if (tipo === 'aluno') {
        this.dadosAlunoForm.get('cpf')?.updateValueAndValidity();
      }
    }
  }

  /**
   * Formatar CPF para integrantes da família
   */
  formatarCpfIntegrante(event: any, integrante: any) {
    let valor = event.target.value;

    // Remove tudo que não é número
    valor = valor.replace(/\D/g, '');

    // Limita a 11 dígitos
    if (valor.length > 11) {
      valor = valor.substring(0, 11);
    }

    // Aplica a máscara
    if (valor.length >= 4) {
      valor = valor.replace(/(\d{3})(\d)/, '$1.$2');
    }
    if (valor.length >= 7) {
      valor = valor.replace(/(\d{3})\.(\d{3})(\d)/, '$1.$2.$3');
    }
    if (valor.length >= 10) {
      valor = valor.replace(/(\d{3})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3-$4');
    }

    // Atualiza o valor no input e no modelo
    event.target.value = valor;
    integrante.cpf = valor;
  }

  /**
   * Remove formatação do CPF para envio ao backend
   */
  private limparCpf(cpf: string): string {
    return cpf ? cpf.replace(/\D/g, '') : '';
  }

  /**
   * Função para validar CPF completo
   */
  private validarCpfCompleto(cpf: string): boolean {
    // Remove caracteres não numéricos
    cpf = cpf.replace(/\D/g, '');

    // Verifica se tem 11 dígitos
    if (cpf.length !== 11) {
      return false;
    }

    // Verifica se todos os dígitos são iguais
    if (/^(\d)\1{10}$/.test(cpf)) {
      return false;
    }

    // Validação do primeiro dígito verificador
    let soma = 0;
    for (let i = 0; i < 9; i++) {
      soma += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let digito1 = 11 - (soma % 11);
    if (digito1 === 10 || digito1 === 11) {
      digito1 = 0;
    }

    if (digito1 !== parseInt(cpf.charAt(9))) {
      return false;
    }

    // Validação do segundo dígito verificador
    soma = 0;
    for (let i = 0; i < 10; i++) {
      soma += parseInt(cpf.charAt(i)) * (11 - i);
    }
    let digito2 = 11 - (soma % 11);
    if (digito2 === 10 || digito2 === 11) {
      digito2 = 0;
    }

    return digito2 === parseInt(cpf.charAt(10));
  }

  voltarParaInicio() {
    this.router.navigate(['/entrada-publica']);
  }
}

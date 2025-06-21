// src/app/funcionalidades/interesse-matricula/pages/declaracao-interesse/declaracao-interesse.page.ts
import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { IonContent, LoadingController, ToastController, AlertController } from '@ionic/angular';
import { Router } from '@angular/router'; // Usaremos Router para navegação se necessário
import { InteresseMatriculaService } from '../../services/interesse-matricula.service';
import { InteresseMatricula } from '../../models/interesse-matricula.interface';
// DadosIntegranteRenda não é usado diretamente aqui, mas pelos subcomponentes.

export type EtapaFormulario =
  | 'dadosResponsavel'
  | 'tipoVaga'
  | 'infoRenda'
  | 'dadosAluno'
  | 'horariosVaga'
  | 'revisao'
  | 'concluido';

@Component({
  selector: 'app-declaracao-interesse',
  templateUrl: './declaracao-interesse.page.html',
  styleUrls: ['./declaracao-interesse.page.scss'],
  standalone: false, // Se você gerou com --standalone=false, esta linha não é necessária
})
export class DeclaracaoInteressePage implements OnInit {
  @ViewChild(IonContent, { static: false }) content!: IonContent;

  etapaAtual: EtapaFormulario = 'dadosResponsavel';
  progresso: number = 0;
  declaracaoForm: FormGroup;
  dadosDeclaracaoCompleta: InteresseMatricula | null = null;
  isSubmitting: boolean = false;
  etapasVisitadas: EtapaFormulario[] = ['dadosResponsavel'];

  readonly ETAPAS = {
    DADOS_RESPONSAVEL: 'dadosResponsavel' as EtapaFormulario,
    TIPO_VAGA: 'tipoVaga' as EtapaFormulario,
    INFO_RENDA: 'infoRenda' as EtapaFormulario,
    DADOS_ALUNO: 'dadosAluno' as EtapaFormulario,
    HORARIOS_VAGA: 'horariosVaga' as EtapaFormulario,
    REVISAO: 'revisao' as EtapaFormulario,
    CONCLUIDO: 'concluido' as EtapaFormulario,
  };

  constructor(
    private fb: FormBuilder,
    private interesseService: InteresseMatriculaService,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController,
    private cdRef: ChangeDetectorRef,
    private router: Router // Adicionado para navegação programática se necessário
  ) {
    this.declaracaoForm = this.fb.group({
      dadosResponsavel: this.fb.group({
        nomeResponsavel: ['', Validators.required],
        cpfResponsavel: ['', [Validators.required /*, ValidadorCPF */]],
        dataNascimentoResponsavel: ['', Validators.required],
        emailResponsavel: ['', [Validators.required, Validators.email]],
        telefoneResponsavel: ['', Validators.required],
      }),
      tipoVaga: this.fb.group({ // Objeto aninhado
        tipoCota: [null, Validators.required],
      }),
      // infoRenda será adicionado/removido dinamicamente
      dadosAluno: this.fb.group({ // Objeto aninhado
        nomeAluno: ['', Validators.required],
        dataNascimentoAluno: ['', Validators.required],
        cpfAluno: ['' /*, ValidadorCPF */],
      }),
      horariosVaga: this.fb.group({ // Objeto aninhado
        horariosSelecionados: this.fb.array( // FormArray dentro do objeto
          [],
          [Validators.required, Validators.minLength(1), Validators.maxLength(2)]
        )
      }),
      mensagemAdicional: ['']
    });
  }

  ngOnInit() {
    this.atualizarProgresso();
    this.setupAlunoIdadeValidation();
  }

  // Getters para facilitar o acesso aos FormGroups/FormArrays
  get dadosResponsavelForm(): FormGroup { return this.declaracaoForm.get('dadosResponsavel') as FormGroup; }
  get tipoVagaForm(): FormGroup { return this.declaracaoForm.get('tipoVaga') as FormGroup; }
  get infoRendaForm(): FormGroup | null { return this.declaracaoForm.get('infoRenda') as FormGroup | null; }
  get dadosAlunoForm(): FormGroup { return this.declaracaoForm.get('dadosAluno') as FormGroup; }
  get horariosVagaForm(): FormGroup { return this.declaracaoForm.get('horariosVaga') as FormGroup; }
  get horariosSelecionadosFormArray(): FormArray { return this.horariosVagaForm.get('horariosSelecionados') as FormArray; }


  scrollToTop() { this.content?.scrollToTop(300); }

  setupAlunoIdadeValidation() {
    const dataNascCtrl = this.dadosAlunoForm.get('dataNascimentoAluno');
    if (dataNascCtrl) {
      dataNascCtrl.valueChanges.subscribe(value => {
        if (this.etapaAtual === this.ETAPAS.DADOS_ALUNO) {
          this.validarIdadeAluno(value, false); // Valida silenciosamente
        }
      });
    }
  }

  proximaEtapa() {
    this.scrollToTop();
    let formOuArrayDaEtapaAtual: FormGroup | FormArray | null = null;
    let proxima: EtapaFormulario | null = null;
    let etapaValida = false;

    switch (this.etapaAtual) {
      case this.ETAPAS.DADOS_RESPONSAVEL:
        formOuArrayDaEtapaAtual = this.dadosResponsavelForm;
        etapaValida = formOuArrayDaEtapaAtual.valid;
        if (etapaValida) proxima = this.ETAPAS.TIPO_VAGA;
        break;
      case this.ETAPAS.TIPO_VAGA:
        formOuArrayDaEtapaAtual = this.tipoVagaForm;
        etapaValida = formOuArrayDaEtapaAtual.valid;
        if (etapaValida) {
          const tipoCota = formOuArrayDaEtapaAtual.get('tipoCota')?.value;
          if (tipoCota === 'economica') {
            proxima = this.ETAPAS.INFO_RENDA;
            if (!this.declaracaoForm.get('infoRenda')) {
              this.declaracaoForm.addControl('infoRenda', this.fb.group({
                integrantesRenda: this.fb.array([this.criarFormIntegranteRenda()], Validators.compose([Validators.required, Validators.minLength(1)])),
                enderecoCompleto: ['', Validators.required],
              }));
            }
            this.declaracaoForm.get('infoRenda')?.enable();
          } else {
            proxima = this.ETAPAS.DADOS_ALUNO;
            this.declaracaoForm.get('infoRenda')?.disable(); // Garante que esteja desabilitado
            if (this.declaracaoForm.get('infoRenda')) { // Remove se existir e não for usar
              this.declaracaoForm.removeControl('infoRenda');
            }
          }
        }
        break;
      case this.ETAPAS.INFO_RENDA:
        formOuArrayDaEtapaAtual = this.infoRendaForm;
        etapaValida = formOuArrayDaEtapaAtual?.valid || false;
        if (etapaValida) proxima = this.ETAPAS.DADOS_ALUNO;
        break;
      case this.ETAPAS.DADOS_ALUNO:
        formOuArrayDaEtapaAtual = this.dadosAlunoForm;
        etapaValida = formOuArrayDaEtapaAtual.valid && this.validarIdadeAluno(formOuArrayDaEtapaAtual.get('dataNascimentoAluno')?.value, true);
        if (etapaValida) proxima = this.ETAPAS.HORARIOS_VAGA;
        break;
      case this.ETAPAS.HORARIOS_VAGA:
        formOuArrayDaEtapaAtual = this.horariosVagaForm;
        etapaValida = formOuArrayDaEtapaAtual.valid;
        if (etapaValida) {
          proxima = this.ETAPAS.REVISAO;
          this.dadosDeclaracaoCompleta = this.declaracaoForm.getRawValue() as InteresseMatricula;
        }
        break;
      case this.ETAPAS.REVISAO:
        this.enviarDeclaracaoFinal();
        return;
    }

    if (proxima && etapaValida) {
      this.etapaAtual = proxima;
      if (!this.etapasVisitadas.includes(proxima)) {
        this.etapasVisitadas.push(proxima);
      }
    } else if (formOuArrayDaEtapaAtual && !etapaValida) {
      this.marcarCamposComoTocados(formOuArrayDaEtapaAtual);
      // A validação de idade já mostra um alerta
      if (!(this.etapaAtual === this.ETAPAS.DADOS_ALUNO && this.dadosAlunoForm.get('dataNascimentoAluno')?.invalid)) {
        this.presentToast('Por favor, preencha todos os campos obrigatórios corretamente.', 'warning');
      }
    }
    this.atualizarProgresso();
    this.cdRef.detectChanges();
  }

  etapaAnterior() {
    this.scrollToTop();
    const indiceEtapaAtualNaOrdemDeVisita = this.etapasVisitadas.lastIndexOf(this.etapaAtual);

    if (indiceEtapaAtualNaOrdemDeVisita > 0) {
      // Remove a etapa atual da lista de visitadas para "realmente" voltar na sequência visitada
      this.etapasVisitadas.splice(indiceEtapaAtualNaOrdemDeVisita, 1);
      this.etapaAtual = this.etapasVisitadas[this.etapasVisitadas.length - 1];
    } else { // Se for a primeira etapa ou algo deu errado no rastreio
      this.etapaAtual = this.ETAPAS.DADOS_RESPONSAVEL;
      this.etapasVisitadas = [this.ETAPAS.DADOS_RESPONSAVEL]; // Reseta para o início
    }
    this.atualizarProgresso();
    this.cdRef.detectChanges();
  }

  editarEtapa(etapaAlvo: EtapaFormulario) {
    this.scrollToTop();
    const indiceAlvo = this.etapasVisitadas.indexOf(etapaAlvo);
    if (indiceAlvo !== -1) { // Só permite editar etapas já visitadas
      this.etapasVisitadas.splice(indiceAlvo + 1); // Remove as etapas futuras da navegação
      this.etapaAtual = etapaAlvo;
      this.atualizarProgresso();
    } else {
      this.presentToast('Complete os passos anteriores para editar esta seção.', 'light');
    }
  }

  criarFormIntegranteRenda(): FormGroup {
    return this.fb.group({
      nome: ['', Validators.required],
      parentesco: ['', Validators.required],
      rendaMensal: [null, [Validators.required, Validators.min(0)]],
    });
  }

  private atualizarProgresso() {
    const cotaEconomicaSelecionada = this.tipoVagaForm.get('tipoCota')?.value === 'economica';
    // Define a sequência de etapas para cálculo do progresso
    const sequenciaFluxo: EtapaFormulario[] = [
      this.ETAPAS.DADOS_RESPONSAVEL,
      this.ETAPAS.TIPO_VAGA,
      ...(cotaEconomicaSelecionada ? [this.ETAPAS.INFO_RENDA] : []),
      this.ETAPAS.DADOS_ALUNO,
      this.ETAPAS.HORARIOS_VAGA,
      this.ETAPAS.REVISAO
    ];
    const totalEtapasNoFluxo = sequenciaFluxo.length;
    let indiceEtapaAtualNoFluxo = sequenciaFluxo.indexOf(this.etapaAtual);

    // O progresso é quantos passos da sequência foram completados
    // Se estou na etapa X (índice Y), completei Y passos (0-indexado)
    let passosCompletos = indiceEtapaAtualNoFluxo;
    if (this.etapaAtual === this.ETAPAS.CONCLUIDO) {
      passosCompletos = totalEtapasNoFluxo; // Se concluído, todos os passos do fluxo foram feitos
    }


    this.progresso = totalEtapasNoFluxo > 0 ? (passosCompletos / totalEtapasNoFluxo) * 100 : 0;
    if (this.etapaAtual === this.ETAPAS.CONCLUIDO) this.progresso = 100;

    console.log(`Progresso: Etapa ${this.etapaAtual} (Passos ${passosCompletos}/${totalEtapasNoFluxo}) = ${this.progresso.toFixed(0)}%`);
    this.cdRef.detectChanges();
  }

  // ...existing code...
  async enviarDeclaracaoFinal() {
    if (this.declaracaoForm.invalid) {
      this.presentToast('Existem campos inválidos. Por favor, revise todas as etapas.', 'warning');
      this.marcarCamposComoTocados(this.declaracaoForm);
      return;
    }
    this.isSubmitting = true;
    const loading = await this.loadingCtrl.create({ message: 'Enviando sua declaração...' });
    await loading.present();

    const dadosParaEnvio: InteresseMatricula = this.declaracaoForm.getRawValue();

    // Remove infoRenda se não for cota econômica
    if (dadosParaEnvio.tipoVaga?.tipoCota !== 'economica' && dadosParaEnvio.hasOwnProperty('infoRenda')) {
      delete dadosParaEnvio.infoRenda;
    }

    this.interesseService.enviarDeclaracao(dadosParaEnvio).subscribe({
      next: (response: any) => {
        loading.dismiss();
        this.isSubmitting = false;
        this.dadosDeclaracaoCompleta = { ...dadosParaEnvio, protocolo: response.protocolo };
        this.etapaAtual = this.ETAPAS.CONCLUIDO;
        this.atualizarProgresso();
        this.presentToast(response.message || 'Declaração enviada com sucesso!', 'success');
      },
      error: (err: any) => {
        loading.dismiss();
        this.isSubmitting = false;
        this.presentToast(err.message || 'Ocorreu um erro ao enviar sua declaração.', 'danger');
        console.error('Erro ao enviar declaração:', err);
      }
    });
  }

  resetGeral() {
    this.scrollToTop();
    this.declaracaoForm.reset({
      dadosResponsavel: { nomeResponsavel: '', cpfResponsavel: '', dataNascimentoResponsavel: '', emailResponsavel: '', telefoneResponsavel: '' },
      tipoVaga: { tipoCota: null },
      dadosAluno: { nomeAluno: '', dataNascimentoAluno: '', cpfAluno: '' },
      horariosVaga: { horariosSelecionados: [] }, // Reset o subgrupo e o array dentro
      mensagemAdicional: ''
    });

    // Limpa explicitamente o FormArray dentro do subgrupo
    const horariosArray = this.horariosVagaForm.get('horariosSelecionados') as FormArray;
    horariosArray.clear();
    // Re-seta validadores se 'clear()' os remove (geralmente não remove os do FormArray)
    horariosArray.setValidators([Validators.required, Validators.minLength(1), Validators.maxLength(2)]);
    horariosArray.updateValueAndValidity();


    if (this.declaracaoForm.get('infoRenda')) {
      this.declaracaoForm.removeControl('infoRenda');
    }

    this.etapaAtual = this.ETAPAS.DADOS_RESPONSAVEL;
    this.etapasVisitadas = [this.ETAPAS.DADOS_RESPONSAVEL];
    this.dadosDeclaracaoCompleta = null;
    this.isSubmitting = false;
    this.progresso = 0; // Reset progresso visualmente
    this.atualizarProgresso(); // Recalcula para o estado inicial
    this.cdRef.detectChanges();
  }

  async presentToast(message: string, color: 'success' | 'warning' | 'danger' | 'light' | 'medium' = 'medium') {
    if (!this.toastCtrl) { console.error('ToastController não injetado'); return; }
    try {
      const toast = await this.toastCtrl.create({ message, duration: 3500, position: 'bottom', color });
      await toast.present();
    } catch (e) { console.error('Erro no toast:', e); }
  }

  marcarCamposComoTocados(formGroupOrArray: FormGroup | FormArray) {
    Object.values(formGroupOrArray.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup || control instanceof FormArray) {
        this.marcarCamposComoTocados(control);
      }
    });
    if (formGroupOrArray instanceof FormArray && formGroupOrArray.controls.length === 0 && formGroupOrArray.hasError('required')) {
      // Se o FormArray é obrigatório e está vazio, marca como tocado para a validação de required aparecer
      formGroupOrArray.markAsTouched();
    }
  }

  validarIdadeAluno(dataNascimentoStr: string | null | undefined, mostrarAlerta: boolean): boolean {
    const dataNascAlunoCtrl = this.dadosAlunoForm.get('dataNascimentoAluno');
    if (!dataNascAlunoCtrl) { return true; } // Se o controle não existe, não há o que validar aqui

    // Limpar erros customizados de idade antes de revalidar para não acumular
    let currentErrors = { ...dataNascAlunoCtrl.errors };
    delete currentErrors['idadeInvalida'];
    delete currentErrors['dataFutura'];
    delete currentErrors['dataInvalida'];

    if (!dataNascimentoStr) { // Se o valor é nulo, undefined ou string vazia
      // Se o campo é 'required', o validador do Angular Forms pegará isso.
      // Se não for 'required' e estiver vazio, então não há erro de idade a ser verificado.
      dataNascAlunoCtrl.setErrors(Object.keys(currentErrors).length > 0 ? currentErrors : null);
      return !dataNascAlunoCtrl.hasError('required'); // Retorna true se não for obrigatório ou se for e estiver preenchido
    }

    const dataNascimento = new Date(dataNascimentoStr);
    const dataNascimentoLocal = new Date(dataNascimento.getUTCFullYear(), dataNascimento.getUTCMonth(), dataNascimento.getUTCDate());
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    if (isNaN(dataNascimentoLocal.getTime())) {
      if (mostrarAlerta) this.mostrarAlertaIdadeInvalida("Data de nascimento inválida.");
      currentErrors['dataInvalida'] = true;
      dataNascAlunoCtrl.setErrors(currentErrors);
      return false;
    }

    if (dataNascimentoLocal > hoje) {
      if (mostrarAlerta) this.mostrarAlertaIdadeInvalida("Data de nascimento não pode ser uma data futura.");
      currentErrors['dataFutura'] = true;
      dataNascAlunoCtrl.setErrors(currentErrors);
      return false;
    }

    let idade = hoje.getFullYear() - dataNascimentoLocal.getFullYear();
    const mes = hoje.getMonth() - dataNascimentoLocal.getMonth();
    if (mes < 0 || (mes === 0 && hoje.getDate() < dataNascimentoLocal.getDate())) {
      idade--;
    }

    const idadeValida = idade >= 6 && idade <= 10;
    if (!idadeValida) {
      if (mostrarAlerta) this.mostrarAlertaIdadeInvalida();
      currentErrors['idadeInvalida'] = true;
      dataNascAlunoCtrl.setErrors(currentErrors);
      return false;
    }

    dataNascAlunoCtrl.setErrors(Object.keys(currentErrors).length > 0 ? currentErrors : null);
    return true;
  }

  async mostrarAlertaIdadeInvalida(customMessage?: string) {
    const alert = await this.alertCtrl.create({
      header: 'Atenção',
      message: customMessage || 'A idade do aluno(a) deve estar entre 6 e 10 anos completos para esta modalidade de matrícula. Por favor, verifique a data de nascimento.',
      buttons: ['OK']
    });
    await alert.present();
  }
}
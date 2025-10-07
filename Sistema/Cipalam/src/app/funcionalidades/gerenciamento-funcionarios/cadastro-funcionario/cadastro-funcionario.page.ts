import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastController, NavController, ModalController } from '@ionic/angular';
import { Funcionario } from '../models/funcionario.interface';
import { PermissoesFuncionarioComponent } from '../components/permissoes-funcionario/permissoes-funcionario.component';
import { FuncionarioService } from '../../../core/services/funcionario.service';
import { MaskService } from '../../../core/services/mask.service';
import { CustomValidators } from '../../../core/validators/custom-validators';

@Component({
  selector: 'app-cadastro-funcionario',
  templateUrl: './cadastro-funcionario.page.html',
  styleUrls: ['./cadastro-funcionario.page.scss'],
  standalone: false
})
export class CadastroFuncionarioPage implements OnInit {
  cadastroForm: FormGroup;
  isEditMode: boolean = false;
  funcionarioId: number | null = null;
  funcionarioData: any = null;
  permissoesOriginais: Record<string, boolean> = {};
  funcionarioAtivo: boolean = true; // Propriedade para controlar o toggle diretamente
  statusAlterado: boolean = false; // Controla se o status foi alterado

  // Controle manual de campos que perderam o foco (para validação não agressiva)
  manuallyTouchedFields: Set<string> = new Set();

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private toastCtrl: ToastController,
    private navCtrl: NavController,
    private modalController: ModalController,
    private funcionarioService: FuncionarioService,
    private maskService: MaskService
  ) {
    this.cadastroForm = this.fb.group({
      nomeCompleto: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      cpf: ['', [CustomValidators.cpfValidator()]], // CPF opcional mas se preenchido deve ser válido
      telefone: ['', [Validators.required, CustomValidators.phoneValidator()]],
      dataNascimento: ['', [Validators.required, CustomValidators.birthDateValidator()]],
      dataInicio: ['', [Validators.required, CustomValidators.startDateValidator('dataNascimento')]],
      usuarioSistema: ['', Validators.required],
      senhaSistema: ['', [Validators.required, Validators.minLength(6)]],
      ativo: [true] // Campo para controlar status ativo/inativo do funcionário
    });
  }

  ngOnInit() {
    // Verificar se está em modo de edição
    this.route.queryParams.subscribe(params => {
      if (params['id']) {
        this.funcionarioId = parseInt(params['id']);
        this.isEditMode = true;
        this.ajustarValidacaoFormulario();
        this.carregarDadosFuncionario();
      } else {
        this.ajustarValidacaoFormulario();
      }
    });

    // Monitorar mudanças no campo ativo para debug
    this.cadastroForm.get('ativo')?.valueChanges.subscribe(valor => {
      console.log('Toggle ativo mudou para:', valor);
    });
    
    // Garantir que o toggle de status funcione corretamente
    setTimeout(() => {
      const ativoControl = this.cadastroForm.get('ativo');
      if (ativoControl) {
        ativoControl.markAsUntouched();
        ativoControl.updateValueAndValidity();
      }
    }, 200);
  }

  private ajustarValidacaoFormulario() {
    // Ajustar validação da senha baseado no modo
    const senhaControl = this.cadastroForm.get('senhaSistema');
    
    if (this.isEditMode) {
      // Em modo de edição, senha não é obrigatória
      senhaControl?.setValidators([Validators.minLength(6)]);
      console.log('✅ Modo edição: Senha não é mais obrigatória');
    } else {
      // Em modo cadastro, senha é obrigatória
      senhaControl?.setValidators([Validators.required, Validators.minLength(6)]);
      console.log('✅ Modo cadastro: Senha obrigatória');
    }
    
    senhaControl?.updateValueAndValidity();
  }

  async carregarDadosFuncionario() {
    if (!this.funcionarioId) return;

    try {
      this.funcionarioData = await this.funcionarioService.buscarFuncionarioPorId(this.funcionarioId).toPromise();

      if (this.funcionarioData) {
        console.log('Dados do funcionário carregados:', this.funcionarioData);

        // Aplicar máscaras aos dados antes de preencher o formulário
        const cpfComMascara = this.funcionarioData.cpf || this.funcionarioData.cpfPessoa ?
          this.maskService.applyCpfMask(this.funcionarioData.cpf || this.funcionarioData.cpfPessoa) : '';
        const telefoneComMascara = this.funcionarioData.telefone ?
          this.maskService.applyPhoneMask(this.funcionarioData.telefone) : '';

        // Debug das datas recebidas
        console.log('Data de nascimento raw:', this.funcionarioData.dataNascimento || this.funcionarioData.dtNascPessoa);
        console.log('Data de entrada raw:', this.funcionarioData.dataEntradaInstituto || this.funcionarioData.dataInicio);

        // Converter datas para formato DD/MM/AAAA
        const dataNascimentoFormatada = this.formatarDataParaExibicao(this.funcionarioData.dataNascimento || this.funcionarioData.dtNascPessoa);
        const dataEntradaFormatada = this.formatarDataParaExibicao(this.funcionarioData.dataEntradaInstituto || this.funcionarioData.dataInicio);

        console.log('Data de nascimento formatada:', dataNascimentoFormatada);
        console.log('Data de entrada formatada:', dataEntradaFormatada);

        // Limpar campos tocados manualmente (para não mostrar validação em campos preenchidos)
        this.manuallyTouchedFields.clear();

        // Preencher o formulário com os dados existentes (com máscaras aplicadas)
        this.cadastroForm.patchValue({
          nomeCompleto: this.funcionarioData.nome || this.funcionarioData.nmPessoa || '',
          email: this.funcionarioData.email || '',
          cpf: cpfComMascara,
          telefone: telefoneComMascara,
          dataNascimento: dataNascimentoFormatada,
          dataInicio: dataEntradaFormatada,
          cargo: this.funcionarioData.cargo || '',
          salario: this.funcionarioData.salario || '',
          usuarioSistema: this.funcionarioData.usuario || '',
          senhaSistema: '', // Senha sempre vazia para segurança
          ativo: this.funcionarioData.ativo !== undefined ? this.funcionarioData.ativo : true // Status ativo do funcionário
        });

        // Forçar a atualização visual dos campos com valores
        setTimeout(() => {
          this.forcarAtualizacaoVisualdosCampos();
          
          // Garantir que o toggle de status esteja funcionando
          const valorAtivo = this.funcionarioData.ativo !== undefined ? this.funcionarioData.ativo : true;
          this.funcionarioAtivo = valorAtivo; // Definir propriedade local
          this.statusAlterado = false; // Resetar flag de alteração após carregar dados
          
          const ativoControl = this.cadastroForm.get('ativo');
          if (ativoControl) {
            ativoControl.setValue(valorAtivo);
            ativoControl.markAsUntouched();
            ativoControl.updateValueAndValidity();
            console.log('Status ativo carregado:', valorAtivo);
          }
        }, 100);

        // Armazenar permissões originais
        this.permissoesOriginais = this.funcionarioData.permissoes || {};

        // Tornar senha opcional em modo de edição
        this.cadastroForm.get('senhaSistema')?.setValidators([]);
        this.cadastroForm.get('senhaSistema')?.updateValueAndValidity();
      }
    } catch (error) {
      console.error('Erro ao carregar dados do funcionário:', error);
      this.presentToast('Erro ao carregar dados do funcionário');
    }
  }

  /**
   * Remove máscara do CPF deixando apenas números
   */
  private limparCpf(cpf: string): string {
    return cpf ? cpf.replace(/\D/g, '') : '';
  }

  /**
   * Remove máscara do telefone deixando apenas números
   */
  private limparTelefone(telefone: string): string {
    return telefone ? telefone.replace(/\D/g, '') : '';
  }

  /**
   * Converte data do formato DD/MM/AAAA para AAAA-MM-DD
   */
  private formatarDataParaBackend(data: string): string {
    console.log('=== formatarDataParaBackend ===');
    console.log('Entrada:', data);
    console.log('Tipo da entrada:', typeof data);
    console.log('É null?', data === null);
    console.log('É undefined?', data === undefined);
    console.log('É string vazia?', data === '');

    if (!data) {
      console.log('❌ ERRO: Data vazia/null/undefined - NÃO DEVERIA CHEGAR AQUI!');
      throw new Error('Data não pode ser vazia ou nula');
    }

    const dataString = String(data).trim();
    console.log('Data após trim:', dataString);

    if (!dataString) {
      console.log('❌ ERRO: Data vazia após trim - NÃO DEVERIA CHEGAR AQUI!');
      throw new Error('Data não pode ser vazia');
    }

    // Se já está no formato YYYY-MM-DD, retorna como está
    if (dataString.match(/^\d{4}-\d{2}-\d{2}$/)) {
      console.log('✅ Já no formato YYYY-MM-DD:', dataString);
      return dataString;
    }

    // Se está no formato DD/MM/AAAA, converte
    if (dataString.match(/^\d{1,2}\/\d{1,2}\/\d{4}$/)) {
      const partes = dataString.split('/');
      const dia = partes[0].padStart(2, '0');
      const mes = partes[1].padStart(2, '0');
      const ano = partes[2];
      
      // Validar se são números válidos
      const diaNum = parseInt(dia);
      const mesNum = parseInt(mes);
      const anoNum = parseInt(ano);
      
      if (diaNum < 1 || diaNum > 31 || mesNum < 1 || mesNum > 12 || anoNum < 1900) {
        console.log('❌ ERRO: Data com valores inválidos:', { dia: diaNum, mes: mesNum, ano: anoNum });
        throw new Error('Data contém valores inválidos');
      }
      
      const resultado = `${ano}-${mes}-${dia}`;
      console.log('✅ Convertendo DD/MM/AAAA para YYYY-MM-DD:');
      console.log('  Original:', dataString);
      console.log('  Partes:', partes);
      console.log('  Dia:', dia, 'Mês:', mes, 'Ano:', ano);
      console.log('  Resultado:', resultado);
      return resultado;
    }

    console.log('❌ ERRO: Formato não reconhecido:', dataString);
    throw new Error(`Formato de data não reconhecido: ${dataString}`);
  }

  formatarDataParaInput(data: any): string {
    if (!data) return '';

    // Se for string, converter para Date
    let dataObj: Date;
    if (typeof data === 'string') {
      // Se já está no formato YYYY-MM-DD, usar diretamente
      if (data.match(/^\d{4}-\d{2}-\d{2}$/)) {
        return data;
      }
      dataObj = new Date(data);
    } else if (data instanceof Date) {
      dataObj = data;
    } else if (Array.isArray(data) && data.length >= 3) {
      // Se for array [ano, mês, dia]
      dataObj = new Date(data[0], data[1] - 1, data[2]);
    } else {
      return '';
    }

    // Verificar se a data é válida
    if (isNaN(dataObj.getTime())) {
      return '';
    }

    // Formatar para YYYY-MM-DD (formato esperado pelo input date)
    const ano = dataObj.getFullYear();
    const mes = String(dataObj.getMonth() + 1).padStart(2, '0');
    const dia = String(dataObj.getDate()).padStart(2, '0');

    return `${ano}-${mes}-${dia}`;
  }

  /**
   * Formata data para exibição DD/MM/AAAA
   */
  formatarDataParaExibicao(data: any): string {
    if (!data) return '';

    console.log('formatarDataParaExibicao - entrada:', data, 'tipo:', typeof data);

    let dataObj: Date;

    if (typeof data === 'string') {
      // Se já está no formato DD/MM/AAAA, manter
      if (data.match(/^\d{1,2}\/\d{1,2}\/\d{4}$/)) {
        return data;
      }

      // Se está no formato YYYY-MM-DD (ISO date)
      if (data.match(/^\d{4}-\d{2}-\d{2}/)) {
        const partes = data.split('T')[0].split('-'); // Remove time se existir
        dataObj = new Date(parseInt(partes[0]), parseInt(partes[1]) - 1, parseInt(partes[2]));
      }
      // Se está no formato DD/MM/AAAA
      else if (data.match(/^\d{1,2}\/\d{1,2}\/\d{4}$/)) {
        const [dia, mes, ano] = data.split('/');
        dataObj = new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia));
      }
      // Outros formatos de string
      else {
        dataObj = new Date(data);
      }
    } else if (data instanceof Date) {
      dataObj = data;
    } else if (Array.isArray(data) && data.length >= 3) {
      // Se for array [ano, mês, dia] (formato LocalDate do Java)
      dataObj = new Date(data[0], data[1] - 1, data[2]);
    } else if (typeof data === 'number') {
      // Se for timestamp
      dataObj = new Date(data);
    } else {
      console.warn('Formato de data não reconhecido:', data);
      return '';
    }

    // Verificar se a data é válida
    if (isNaN(dataObj.getTime())) {
      console.warn('Data inválida após conversão:', dataObj);
      return '';
    }

    // Formatar para DD/MM/AAAA
    const dia = String(dataObj.getDate()).padStart(2, '0');
    const mes = String(dataObj.getMonth() + 1).padStart(2, '0');
    const ano = dataObj.getFullYear();

    const resultado = `${dia}/${mes}/${ano}`;
    console.log('formatarDataParaExibicao - resultado:', resultado);
    return resultado;
  }

  async prosseguirParaPermissoes() {
    if (this.cadastroForm.invalid) {
      this.presentToast('Por favor, preencha todos os campos básicos corretamente.');
      Object.values(this.cadastroForm.controls).forEach(control => {
        control.markAsTouched();
      });
      return;
    }

    // Validação adicional específica para datas
    const formValues = this.cadastroForm.value;
    
    // Verificar se datas estão preenchidas
    if (!formValues.dataNascimento || formValues.dataNascimento.trim() === '') {
      this.presentToast('Data de nascimento é obrigatória');
      return;
    }
    
    if (!formValues.dataInicio || formValues.dataInicio.trim() === '') {
      this.presentToast('Data de entrada é obrigatória');
      return;
    }

    // Verificar formato das datas
    const dateRegex = /^\d{1,2}\/\d{1,2}\/\d{4}$/;
    if (!dateRegex.test(formValues.dataNascimento.trim())) {
      this.presentToast('Data de nascimento deve estar no formato DD/MM/AAAA');
      return;
    }
    
    if (!dateRegex.test(formValues.dataInicio.trim())) {
      this.presentToast('Data de entrada deve estar no formato DD/MM/AAAA');
      return;
    }

    console.log('✅ VALIDAÇÃO DE DATAS PASSOU - Dados válidos para prosseguir');

    console.log('=== VALORES DO FORMULÁRIO ===');
    console.log('Form controls individuais:');
    Object.keys(this.cadastroForm.controls).forEach(key => {
      const control = this.cadastroForm.get(key);
      console.log(`${key}:`, control?.value);
    });

    const dadosBasicosFuncionario = this.cadastroForm.value;
    console.log('cadastroForm.value completo:', dadosBasicosFuncionario);

    const modal = await this.modalController.create({
      component: PermissoesFuncionarioComponent,
      componentProps: {
        'nomeFuncionario': dadosBasicosFuncionario.nomeCompleto,
        'permissoesOriginais': this.isEditMode ? this.permissoesOriginais : null,
        'isEditMode': this.isEditMode
      },
      cssClass: 'permissoes-modal-css'
    });

    await modal.present();

    const { data, role } = await modal.onWillDismiss();

    if (role === 'confirmar' && data) {
      const permissoesSelecionadas = data;
      if (this.isEditMode) {
        this.finalizarEdicaoCompleta(dadosBasicosFuncionario, permissoesSelecionadas);
      } else {
        this.finalizarCadastroCompleto(dadosBasicosFuncionario, permissoesSelecionadas);
      }
    } else {
      console.log('Configuração de permissões cancelada.');
    }
  }

  async finalizarCadastroCompleto(dadosBasicos: any, permissoes: Record<string, boolean>) {
    console.log('=== INÍCIO DO CADASTRO ===');
    console.log('Dados básicos recebidos:', dadosBasicos);
    console.log('Data de início original:', dadosBasicos.dataInicio);
    console.log('Data de nascimento original:', dadosBasicos.dataNascimento);

    // Validar se as datas estão preenchidas e válidas antes de continuar
    if (!dadosBasicos.dataNascimento) {
      this.presentToast('Data de nascimento é obrigatória');
      return;
    }

    if (!dadosBasicos.dataInicio) {
      this.presentToast('Data de entrada é obrigatória');
      return;
    }

    // Limpar e formatar dados antes de enviar
    let dataInicioFormatada: string;
    let dataNascimentoFormatada: string;
    
    try {
      dataInicioFormatada = this.formatarDataParaBackend(dadosBasicos.dataInicio);
      dataNascimentoFormatada = this.formatarDataParaBackend(dadosBasicos.dataNascimento);
    } catch (error) {
      console.error('❌ Erro ao formatar datas:', error);
      this.presentToast('Erro ao formatar as datas. Verifique se estão no formato DD/MM/AAAA');
      return;
    }

    console.log('✅ Data de início após formatação:', dataInicioFormatada);
    console.log('✅ Data de nascimento após formatação:', dataNascimentoFormatada);

    // Validação final rigorosa antes de construir o objeto
    const camposObrigatorios: any = {
      nomeCompleto: dadosBasicos.nomeCompleto,
      email: dadosBasicos.email,
      telefone: dadosBasicos.telefone,
      dtNascPessoa: dataNascimentoFormatada,
      dataInicio: dataInicioFormatada,
      usuario: dadosBasicos.usuarioSistema
    };

    // Em modo cadastro, senha é obrigatória. Em modo edição, senha é opcional
    if (!this.isEditMode) {
      camposObrigatorios['senha'] = dadosBasicos.senhaSistema;
      console.log('🔒 Modo cadastro: Validando senha como obrigatória');
    } else {
      console.log('✏️ Modo edição: Senha não é obrigatória');
    }

    for (const [campo, valor] of Object.entries(camposObrigatorios)) {
      if (!valor || valor.toString().trim() === '') {
        console.error(`❌ ERRO: Campo obrigatório vazio: ${campo} = '${valor}'`);
        this.presentToast(`Campo ${campo} é obrigatório e não pode estar vazio`);
        return;
      }
    }

    console.log('✅ Todas as validações finais passaram!');

    const funcionarioParaSalvar = {
      // Campos diretos para o DTO (prioridade)
      nmPessoa: dadosBasicos.nomeCompleto,
      email: dadosBasicos.email,
      cpfPessoa: this.limparCpf(dadosBasicos.cpf || ''),
      telefone: this.limparTelefone(dadosBasicos.telefone),
      dtNascPessoa: dataNascimentoFormatada,
      ativo: this.funcionarioAtivo, // Status ativo/inativo usando propriedade direta
      
      // Objeto pessoa para compatibilidade (caso o backend ainda precise)
      pessoa: {
        nmPessoa: dadosBasicos.nomeCompleto,
        email: dadosBasicos.email,
        cpfPessoa: this.limparCpf(dadosBasicos.cpf || ''),
        telefone: this.limparTelefone(dadosBasicos.telefone),
        dtNascPessoa: dataNascimentoFormatada,
        ativo: this.funcionarioAtivo
      },
      
      // Dados do funcionário
      usuario: dadosBasicos.usuarioSistema,
      senha: dadosBasicos.senhaSistema,
      dataInicio: dataInicioFormatada,
      permissoes: Object.keys(permissoes).filter(key => permissoes[key]),
      tipo: 'funcionario'
    };

    console.log('=== DADOS FINAIS PARA O BACKEND ===');
    console.log('📊 Objeto completo:', funcionarioParaSalvar);
    console.log('👤 Nome:', funcionarioParaSalvar.nmPessoa);
    console.log('📧 Email:', funcionarioParaSalvar.email);
    console.log('📱 Telefone:', funcionarioParaSalvar.telefone);
    console.log('🆔 CPF:', funcionarioParaSalvar.cpfPessoa);
    console.log('📅 Data nascimento:', funcionarioParaSalvar.dtNascPessoa);
    console.log('📅 Data início:', funcionarioParaSalvar.dataInicio);
    console.log('🔐 Usuário:', funcionarioParaSalvar.usuario);
    console.log('🎭 Tipo:', funcionarioParaSalvar.tipo);
    console.log('⚙️ Permissões:', funcionarioParaSalvar.permissoes);

    try {
      console.log('🚀 Iniciando requisição para o backend...');
      const resultado = await this.funcionarioService.cadastrarFuncionario(funcionarioParaSalvar).toPromise();
      console.log('✅ SUCESSO! Funcionário cadastrado:', resultado);
      this.presentToast('Funcionário cadastrado com sucesso!');
      this.cadastroForm.reset();
      this.manuallyTouchedFields.clear();
      this.statusAlterado = false; // Resetar flag após sucesso
      this.navCtrl.navigateBack('/sistema/funcionarios/lista');
    } catch (error: any) {
      console.error('Erro ao cadastrar funcionário:', error);

      let mensagemErro = 'Erro ao cadastrar funcionário. Tente novamente.';

      // Verificar se é erro de usuário duplicado
      if (error?.error && typeof error.error === 'string' && error.error.includes('Duplicate entry')) {
        if (error.error.includes('for key \'usuario\'')) {
          mensagemErro = 'Este nome de usuário já existe. Escolha outro nome de usuário.';
        } else if (error.error.includes('for key \'email\'')) {
          mensagemErro = 'Este e-mail já está cadastrado no sistema.';
        } else {
          mensagemErro = 'Já existe um funcionário com essas informações.';
        }
      }

      this.presentToast(mensagemErro);
    }
  }

  async finalizarEdicaoCompleta(dadosBasicos: any, permissoes: Record<string, boolean>) {
    console.log('=== INÍCIO DA EDIÇÃO ===');
    console.log('Dados básicos recebidos:', dadosBasicos);
    console.log('Data de início original:', dadosBasicos.dataInicio);
    console.log('Data de nascimento original:', dadosBasicos.dataNascimento);

    // Validar se as datas estão preenchidas e válidas antes de continuar
    if (!dadosBasicos.dataNascimento) {
      this.presentToast('Data de nascimento é obrigatória');
      return;
    }

    if (!dadosBasicos.dataInicio) {
      this.presentToast('Data de entrada é obrigatória');
      return;
    }

    // Limpar e formatar dados antes de enviar
    let dataInicioFormatada: string;
    let dataNascimentoFormatada: string;
    
    try {
      dataInicioFormatada = this.formatarDataParaBackend(dadosBasicos.dataInicio);
      dataNascimentoFormatada = this.formatarDataParaBackend(dadosBasicos.dataNascimento);
    } catch (error) {
      console.error('❌ Erro ao formatar datas:', error);
      this.presentToast('Erro ao formatar as datas. Verifique se estão no formato DD/MM/AAAA');
      return;
    }

    console.log('✅ Data de início após formatação:', dataInicioFormatada);
    console.log('✅ Data de nascimento após formatação:', dataNascimentoFormatada);

    // Validação final rigorosa antes de construir o objeto (edição)
    const camposObrigatoriosEdicao: any = {
      nomeCompleto: dadosBasicos.nomeCompleto,
      email: dadosBasicos.email,
      telefone: dadosBasicos.telefone,
      dtNascPessoa: dataNascimentoFormatada,
      dataInicio: dataInicioFormatada,
      usuario: dadosBasicos.usuarioSistema
      // Senha não é obrigatória em modo de edição
    };

    console.log('✏️ Validação de edição: Senha não é obrigatória');

    for (const [campo, valor] of Object.entries(camposObrigatoriosEdicao)) {
      if (!valor || valor.toString().trim() === '') {
        console.error(`❌ ERRO: Campo obrigatório vazio na edição: ${campo} = '${valor}'`);
        this.presentToast(`Campo ${campo} é obrigatório e não pode estar vazio`);
        return;
      }
    }

    console.log('✅ Todas as validações de edição passaram!');

    // Para edição, usar formato direto sem objeto pessoa aninhado
    const funcionarioParaAtualizar = {
      // Campos da pessoa diretamente no DTO
      nmPessoa: dadosBasicos.nomeCompleto, // Nome correto do campo no banco
      email: dadosBasicos.email, // Campo correto
      cpfPessoa: this.limparCpf(dadosBasicos.cpf || ''),
      telefone: this.limparTelefone(dadosBasicos.telefone), // Campo correto
      dtNascPessoa: dataNascimentoFormatada,
      ativo: this.funcionarioAtivo, // Status ativo/inativo usando propriedade direta
      // Campos do funcionário
      usuario: dadosBasicos.usuarioSistema,
      senha: dadosBasicos.senhaSistema,
      dataInicio: dataInicioFormatada,
      permissoes: Object.keys(permissoes).filter(key => permissoes[key]),
      tipo: 'funcionario'
    };

    console.log('=== DEBUG ESPECÍFICO DATA ENTRADA ===');
    console.log('dadosBasicos.dataInicio (do form):', dadosBasicos.dataInicio);
    console.log('dataInicioFormatada (após formatação):', dataInicioFormatada);
    console.log('funcionarioParaAtualizar.dataInicio (enviado):', funcionarioParaAtualizar.dataInicio);
    console.log('Tipo do dadosBasicos.dataInicio:', typeof dadosBasicos.dataInicio);
    console.log('Valor exato (JSON):', JSON.stringify(dadosBasicos.dataInicio));

    console.log('=== DADOS COMPLETOS ENVIADOS ===');
    console.log('funcionarioParaAtualizar (completo):', JSON.stringify(funcionarioParaAtualizar, null, 2));
    console.log('ID do funcionário:', this.funcionarioId);
    console.log('URL da requisição: /api/pessoa/funcionarios/' + this.funcionarioId);

    try {
      const resultado = await this.funcionarioService.atualizarFuncionario(this.funcionarioId!, funcionarioParaAtualizar).toPromise();
      console.log('Resultado da atualização:', resultado);
      this.presentToast('Funcionário atualizado com sucesso!');
      this.statusAlterado = false; // Resetar flag após sucesso
      this.navCtrl.navigateBack('/sistema/funcionarios/lista');
    } catch (error: any) {
      console.error('Erro completo ao atualizar funcionário:', error);
      console.error('Status do erro:', error.status);
      console.error('Mensagem do erro:', error.message);
      console.error('Error body:', error.error);

      let mensagemErro = 'Erro ao atualizar funcionário. Tente novamente.';

      if (error?.error) {
        if (typeof error.error === 'string') {
          mensagemErro = error.error;
        } else if (error.error.message) {
          mensagemErro = error.error.message;
        }
      } else if (error.message) {
        mensagemErro = error.message;
      }

      this.presentToast(mensagemErro);
    }
  }

  async presentToast(message: string) {
    const toast = await this.toastCtrl.create({
      message: message,
      duration: 3000,
      position: 'bottom'
    });
    toast.present();
  }

  /**
   * Aplica máscara de CPF no campo
   */
  onCpfInput(event: any) {
    const value = event.target.value;
    const maskedValue = this.maskService.applyCpfMask(value);
    this.cadastroForm.get('cpf')?.setValue(maskedValue, { emitEvent: false });

    // NÃO marca como tocado durante a digitação - apenas aplica a máscara
    // A validação só aparece quando o usuário sair do campo (onBlur)
  }

  /**
   * Aplica máscara de telefone no campo
   */
  onPhoneInput(event: any) {
    const value = event.target.value;
    const maskedValue = this.maskService.applyPhoneMask(value);
    this.cadastroForm.get('telefone')?.setValue(maskedValue, { emitEvent: false });

    // NÃO marca como tocado durante a digitação - apenas aplica a máscara
    // A validação só aparece quando o usuário sair do campo (onBlur)
  }

  /**
   * Controle de placeholder para CPF
   */
  onCpfFocus(event: any) {
    event.target.placeholder = '000.000.000-00';
    // Força o label a subir imediatamente
    const ionItem = event.target.closest('ion-item');
    if (ionItem) {
      ionItem.classList.add('item-has-focus');
    }
  }

  onCpfBlur(event: any) {
    const target = event.target;
    const ionItem = target.closest('ion-item');

    // Marca CPF como tocado manualmente
    this.manuallyTouchedFields.add('cpf');

    if (!target.value) {
      target.placeholder = '';
      if (ionItem) {
        ionItem.classList.remove('item-has-focus', 'item-has-value');
      }
    } else {
      if (ionItem) {
        ionItem.classList.add('item-has-value');
        ionItem.classList.remove('item-has-focus');
      }
    }
  }

  /**
   * Controle de placeholder para Telefone
   */
  onPhoneFocus(event: any) {
    event.target.placeholder = '(00) 00000-0000';
    // Força o label a subir imediatamente
    const ionItem = event.target.closest('ion-item');
    if (ionItem) {
      ionItem.classList.add('item-has-focus');
    }
  }

  onPhoneBlur(event: any) {
    const target = event.target;
    const ionItem = target.closest('ion-item');

    // Marca telefone como tocado manualmente
    this.manuallyTouchedFields.add('telefone');

    if (!target.value) {
      target.placeholder = '';
      if (ionItem) {
        ionItem.classList.remove('item-has-focus', 'item-has-value');
      }
    } else {
      if (ionItem) {
        ionItem.classList.add('item-has-value');
        ionItem.classList.remove('item-has-focus');
      }
    }
  }

  /**
   * Controle de foco para campos de data com máscara inteligente
   */
  onDateInput(event: any) {
    const input = event.target;
    const maskedValue = this.maskService.applySmartDateMask(input.value);

    // Encontra o control do formulário
    const controlName = input.getAttribute('formControlName');
    if (controlName && this.cadastroForm.get(controlName)) {
      this.cadastroForm.get(controlName)?.setValue(maskedValue, { emitEvent: false });
    }

    // Força atualização visual
    this.forcarAtualizacaoVisualCampoData(input, maskedValue);
  }

  onDateFocus(event: any) {
    const target = event.target;
    // Adiciona placeholder explicativo
    target.placeholder = 'DD/MM/AAAA';

    // Força o label a subir imediatamente
    const ionItem = event.target.closest('ion-item');
    if (ionItem) {
      ionItem.classList.add('item-has-focus');
      ionItem.classList.add('item-has-placeholder');
    }
  }

  onDateBlur(event: any) {
    const target = event.target;
    const ionItem = target.closest('ion-item');

    // Determina qual campo de data foi tocado e marca como tocado manualmente
    const ionInput = target.closest('ion-input');
    let fieldName = '';
    
    if (ionInput) {
      const formControlName = ionInput.getAttribute('formControlName');
      if (formControlName) {
        fieldName = formControlName;
        this.manuallyTouchedFields.add(formControlName);
        
        // Força a validação imediata do campo de data
        const formControl = this.cadastroForm.get(formControlName);
        if (formControl) {
          formControl.markAsTouched();
          formControl.markAsDirty();
          formControl.updateValueAndValidity();
          
          // Se mudou a data de nascimento, revalida a data de início também
          if (formControlName === 'dataNascimento') {
            const dataInicioControl = this.cadastroForm.get('dataInicio');
            if (dataInicioControl && dataInicioControl.value && this.manuallyTouchedFields.has('dataInicio')) {
              dataInicioControl.updateValueAndValidity();
              console.log(`🔄 Revalidando data de início após mudança na data de nascimento`);
            }
          }
          
          // Log para debug da validação
          console.log(`🔍 Validação de ${formControlName}:`, {
            valor: formControl.value,
            valido: formControl.valid,
            erros: formControl.errors,
            tocado: formControl.touched
          });
        }
      }
    }

    if (!target.value) {
      target.placeholder = '';
      if (ionItem) {
        ionItem.classList.remove('item-has-focus', 'item-has-value', 'item-has-placeholder');
      }
    } else {
      if (ionItem) {
        ionItem.classList.add('item-has-value');
        ionItem.classList.remove('item-has-focus', 'item-has-placeholder');
      }
    }
  }

  /**
   * Força atualização visual específica para campos de data
   */
  private forcarAtualizacaoVisualCampoData(input: any, valor: string) {
    const ionItem = input.closest('ion-item');
    if (ionItem && valor) {
      ionItem.classList.add('item-has-value');
    }
  }

  /**
   * Foca no input específico quando clica em qualquer área do ion-item
   */
  focusInput(fieldName: string) {
    // Previne que o evento seja disparado quando já está focado
    if (document.activeElement?.closest('ion-input')?.getAttribute('formControlName') === fieldName) {
      return;
    }

    setTimeout(() => {
      const ionInput = document.querySelector(`ion-input[formControlName="${fieldName}"]`) as any;
      if (ionInput) {
        // Primeiro força o foco visual
        const ionItem = ionInput.closest('ion-item');
        if (ionItem) {
          ionItem.classList.add('item-has-focus');
        }

        // Depois foca no input nativo
        const nativeInput = ionInput.querySelector('input');
        if (nativeInput) {
          nativeInput.focus();
        } else {
          // Fallback: usar o método setFocus do ion-input
          if (ionInput.setFocus) {
            ionInput.setFocus();
          }
        }
      }
    }, 50);
  }

  /**
   * Abre o seletor de data nativo - versão simplificada que realmente funciona
   */
  openDatePicker(fieldName: string, event?: Event) {
    console.log('Clicou para abrir calendário:', fieldName);

    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    try {
      // Cria um input date temporário de forma mais agressiva
      const tempInput = document.createElement('input');
      tempInput.type = 'date';
      tempInput.style.cssText = `
        position: absolute !important;
        top: -9999px !important;
        left: -9999px !important;
        opacity: 0 !important;
        pointer-events: none !important;
        width: 1px !important;
        height: 1px !important;
      `;

      // Define valor atual se existir
      const currentValue = this.cadastroForm.get(fieldName)?.value;
      if (currentValue && currentValue.includes('/')) {
        const [day, month, year] = currentValue.split('/');
        if (day && month && year) {
          tempInput.value = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        }
      }

      // Adiciona ao body
      document.body.appendChild(tempInput);

      // Event listener para capturar a data selecionada
      const handleDateChange = (e: Event) => {
        const target = e.target as HTMLInputElement;
        const selectedDate = target.value;
        console.log('Data selecionada:', selectedDate);

        if (selectedDate) {
          const [year, month, day] = selectedDate.split('-');
          const brazilianDate = `${day}/${month}/${year}`;

          // Atualiza o campo do formulário
          const field = this.cadastroForm.get(fieldName);
          if (field) {
            field.setValue(brazilianDate);
            field.markAsTouched();
            console.log(`Campo ${fieldName} atualizado para:`, brazilianDate);
          }
        }

        // Cleanup
        if (document.body.contains(tempInput)) {
          document.body.removeChild(tempInput);
        }
      };

      // Adiciona listener
      tempInput.addEventListener('change', handleDateChange);

      // Força abertura do date picker
      setTimeout(() => {
        tempInput.focus();
        tempInput.click();

        // Força showPicker se disponível
        if ('showPicker' in tempInput) {
          try {
            (tempInput as any).showPicker();
            console.log('showPicker executado com sucesso');
          } catch (err) {
            console.log('showPicker falhou, usando click');
          }
        }
      }, 100);

      // Cleanup de segurança após 10 segundos
      setTimeout(() => {
        if (document.body.contains(tempInput)) {
          document.body.removeChild(tempInput);
        }
      }, 10000);

    } catch (error) {
      console.error('Erro ao abrir calendário:', error);
      // Fallback - solicita entrada manual
      const manualDate = prompt(`Digite a data para ${fieldName} (DD/MM/AAAA):`);
      if (manualDate && manualDate.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
        this.cadastroForm.get(fieldName)?.setValue(manualDate);
        this.cadastroForm.get(fieldName)?.markAsTouched();
      }
    }
  }

  /**
   * Força atualização visual dos campos com valores para que os labels flutuem corretamente
   */
  private forcarAtualizacaoVisualdosCampos() {
    const camposComValor = ['nomeCompleto', 'email', 'cpf', 'telefone', 'dataNascimento', 'dataInicio', 'cargo', 'salario', 'usuarioSistema'];

    camposComValor.forEach(campo => {
      const valor = this.cadastroForm.get(campo)?.value;
      if (valor) {
        const ionInput = document.querySelector(`ion-input[formControlName="${campo}"]`);
        if (ionInput) {
          const ionItem = ionInput.closest('ion-item');
          if (ionItem) {
            ionItem.classList.add('item-has-value');
          }
        }
      }
    });
  }

  /**
   * Força o label a flutuar quando o campo recebe foco
   */
  onInputFocus(event: any) {
    const ionItem = event.target.closest('ion-item');
    if (ionItem) {
      ionItem.classList.add('item-has-focus');
    }
  }

  /**
   * Remove a classe de foco quando o campo perde foco
   */
  onInputBlur(event: any) {
    const ionItem = event.target.closest('ion-item');
    if (ionItem) {
      if (event.target.value) {
        ionItem.classList.add('item-has-value');
        ionItem.classList.remove('item-has-focus');
      } else {
        ionItem.classList.remove('item-has-focus', 'item-has-value');
      }
    }

    // Marca o campo como tocado manualmente (só agora pode mostrar validação)
    const ionInput = event.target.closest('ion-input');
    if (ionInput) {
      const formControlName = ionInput.getAttribute('formControlName');
      if (formControlName) {
        // Adiciona ao conjunto de campos tocados manualmente
        this.manuallyTouchedFields.add(formControlName);

        const field = this.cadastroForm.get(formControlName);
        if (field) {
          field.markAsTouched();
        }
      }
    }
  }

  // =============================================================================
  // MÉTODOS DE VALIDAÇÃO VISUAL
  // =============================================================================



  /**
   * Verifica se um campo é inválido (tem erro e foi tocado MANUALMENTE)
   */
  isFieldInvalid(fieldName: string): boolean {
    const field = this.cadastroForm.get(fieldName);
    // Só mostra erro se o campo foi tocado manualmente (perdeu foco)
    return !!(field && field.invalid && this.manuallyTouchedFields.has(fieldName));
  }

  /**
   * Verifica se um campo é válido (sem erro e foi tocado MANUALMENTE)
   */
  isFieldValid(fieldName: string): boolean {
    const field = this.cadastroForm.get(fieldName);
    // Só mostra como válido se foi tocado manualmente e tem valor
    return !!(field && field.valid && this.manuallyTouchedFields.has(fieldName) && field.value);
  }

  /**
   * Retorna a mensagem de erro apropriada para um campo
   */
  getFieldError(fieldName: string): string | null {
    const field = this.cadastroForm.get(fieldName);

    // Só mostra erro se foi tocado manualmente
    if (!field || !field.errors || !this.manuallyTouchedFields.has(fieldName)) {
      return null;
    }

    // Mensagens personalizadas por campo e tipo de erro
    const errorMessages: { [key: string]: { [key: string]: string } } = {
      nomeCompleto: {
        required: 'Nome completo é obrigatório'
      },
      email: {
        required: 'E-mail é obrigatório',
        email: 'Formato de e-mail inválido (ex: usuario@dominio.com)'
      },
      cpf: {
        cpfInvalido: 'CPF inválido. Verifique os números digitados'
      },
      telefone: {
        required: 'Telefone é obrigatório',
        phoneInvalido: 'Telefone inválido. Use formato: (11) 99999-9999'
      },
      dataNascimento: {
        required: 'Data de nascimento é obrigatória',
        dataFormatoInvalido: 'Use o formato DD/MM/AAAA (ex: 15/03/1990)',
        dataInvalida: 'Data inválida. Verifique se dia, mês e ano estão corretos',
        dataNoFuturo: 'Data de nascimento não pode ser no futuro',
        dataMuitoAntiga: 'Data muito antiga. Verifique se está correta'
      },
      dataInicio: {
        required: 'Data de entrada é obrigatória',
        dataFormatoInvalido: 'Use o formato DD/MM/AAAA (ex: 15/03/2024)',
        dataInvalida: 'Data inválida. Verifique se dia, mês e ano estão corretos',
        dataNoFuturo: 'Data de entrada não pode ser no futuro',
        dataMuitoAntiga: 'Data muito antiga. Verifique se está correta',
        dataAnteriorNascimento: 'Data de entrada não pode ser anterior à data de nascimento'
      },

      usuarioSistema: {
        required: 'Usuário do sistema é obrigatório'
      },
      senhaSistema: {
        required: this.isEditMode ? 'Se informada, senha deve ter pelo menos 6 caracteres' : 'Senha do sistema é obrigatória',
        minlength: 'Senha deve ter pelo menos 6 caracteres'
      }
    };

    const fieldErrors = errorMessages[fieldName];
    if (!fieldErrors) return null;

    // Retorna a primeira mensagem de erro encontrada
    for (const errorType in field.errors) {
      if (fieldErrors[errorType]) {
        return fieldErrors[errorType];
      }
    }

    return null;
  }

  /**
   * Função para garantir que o toggle de status funcione corretamente
   */
  onStatusToggleChange(event: any) {
    const novoValor = event.detail.checked;
    console.log('Toggle de status acionado. Novo valor:', novoValor);
    
    // Atualizar a propriedade local
    this.funcionarioAtivo = novoValor;
    this.statusAlterado = true; // Marcar que houve alteração
    
    // Também atualizar o FormControl para manter sincronização
    const ativoControl = this.cadastroForm.get('ativo');
    if (ativoControl) {
      ativoControl.setValue(novoValor, { emitEvent: false });
      ativoControl.markAsDirty();
      ativoControl.markAsTouched();
      console.log('FormControl e propriedade local atualizados para:', novoValor);
    }
  }

  /**
   * Verifica se o botão deve estar habilitado
   */
  get botaoHabilitado(): boolean {
    if (this.isEditMode) {
      // Em modo de edição, habilitar se o formulário é válido OU se o status foi alterado
      return this.cadastroForm.valid || this.statusAlterado;
    } else {
      // Em modo de cadastro, apenas se o formulário é válido
      return this.cadastroForm.valid;
    }
  }

  /**
   * Função alternativa para toggle manual
   */
  toggleStatusManual() {
    console.log('Clique manual no item do toggle');
    this.funcionarioAtivo = !this.funcionarioAtivo;
    this.statusAlterado = true; // Marcar que houve alteração
    
    // Atualizar o FormControl
    const ativoControl = this.cadastroForm.get('ativo');
    if (ativoControl) {
      ativoControl.setValue(this.funcionarioAtivo, { emitEvent: false });
      ativoControl.markAsDirty();
      ativoControl.markAsTouched();
      console.log('Status alterado manualmente para:', this.funcionarioAtivo);
    }
  }
}

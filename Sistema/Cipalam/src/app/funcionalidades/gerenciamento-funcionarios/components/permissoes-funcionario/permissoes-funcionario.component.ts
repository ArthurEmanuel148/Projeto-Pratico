import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { FuncionalidadeSistema } from '../../../../core/models/funcionalidade-sistema.interface'; // Ajuste o caminho se sua interface estiver em outro local
import { FuncionalidadesSistemaService } from '../../../../core/services/funcionalidades-sistema.service'; // Ajuste o caminho se seu serviço estiver em outro local

@Component({
  selector: 'app-permissoes-funcionario',
  templateUrl: './permissoes-funcionario.component.html',
  styleUrls: ['./permissoes-funcionario.component.scss'],
  standalone: false, // Confirmado que é false
})
export class PermissoesFuncionarioComponent implements OnInit {
  @Input() nomeFuncionario: string = '';
  @Input() permissoesOriginais: Record<string, boolean> = {};
  @Input() isEditMode: boolean = false;

  permissoesForm!: FormGroup;
  todasAsFuncionalidades: FuncionalidadeSistema[] = [];
  isLoading: boolean = true;

  constructor(
    private modalCtrl: ModalController,
    private fb: FormBuilder,
    private funcionalidadesService: FuncionalidadesSistemaService
  ) { }

  ngOnInit() {
    this.isLoading = true;
    this.funcionalidadesService.getTodasFuncionalidades().subscribe(
      (funcionalidades) => {
        console.log('FUNCIONALIDADES RECEBIDAS DO SERVIÇO:', funcionalidades); // <--- DEBUG
        this.todasAsFuncionalidades = funcionalidades;
        if (this.todasAsFuncionalidades && this.todasAsFuncionalidades.length > 0) {
          this.criarFormularioDePermissoes();
          console.log('FORMULÁRIO DE PERMISSÕES CRIADO:', this.permissoesForm.value); // <--- DEBUG
        } else {
          console.warn('Nenhuma funcionalidade recebida para criar o formulário.');
        }
        this.isLoading = false;
      },
      (error) => {
        console.error('Erro ao carregar funcionalidades:', error);
        this.isLoading = false;
        this.modalCtrl.dismiss(null, 'error');
      }
    );

  }

  criarFormularioDePermissoes() {
    const group: { [key: string]: FormControl } = {};
    if (this.todasAsFuncionalidades && this.todasAsFuncionalidades.length > 0) {
      this.todasAsFuncionalidades.forEach(func => {
        let valorInicial = true; // Padrão para novo cadastro

        // Se estiver em modo de edição, usar as permissões originais
        if (this.isEditMode && this.permissoesOriginais && typeof this.permissoesOriginais[func.chave] !== 'undefined') {
          valorInicial = this.permissoesOriginais[func.chave];
        }

        group[func.chave] = this.fb.control(valorInicial);
      });
    }
    this.permissoesForm = this.fb.group(group);
  }

  confirmarPermissoes() {
    if (this.permissoesForm.valid) {
      this.modalCtrl.dismiss(this.permissoesForm.value, 'confirmar');
    } else {
      // Idealmente, o botão estaria desabilitado, mas como fallback:
      console.error('Formulário de permissões inválido.');
    }
  }

  cancelar() {
    this.modalCtrl.dismiss(null, 'cancelar');
  }
}
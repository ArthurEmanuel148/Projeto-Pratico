import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, ToastController } from '@ionic/angular';
import { FuncionalidadesSistemaService } from '../core/services/funcionalidades-sistema.service';



interface Feature {
  id: string;
  name: string;
  icon: string;
  route?: string; // Rota para navegação
  action?: () => void; // Ação customizada
  color?: string; // Cor do ícone (opcional)
}

@Component({
  selector: 'app-painel-funcionario',
  templateUrl: './painel-funcionario.page.html',
  styleUrls: ['./painel-funcionario.page.scss'],
  standalone: false,
})

export class PainelFuncionarioPage implements OnInit {
  usuarioLogado: any = null;
  mostUsedFeatures: any[] = [];

  constructor(
    private router: Router,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private funcionalidadesService: FuncionalidadesSistemaService
  ) { }

  ngOnInit() {
    // Carrega usuário logado
    const usuario = localStorage.getItem('usuarioLogado');
    if (usuario) {
      this.usuarioLogado = JSON.parse(usuario);
    }

    // Carrega funcionalidades permitidas
    this.funcionalidadesService.getTodasFuncionalidades().subscribe(funcs => {
      if (this.usuarioLogado && this.usuarioLogado.permissoes) {
        this.mostUsedFeatures = funcs
          .filter(f => this.usuarioLogado.permissoes[f.chave])
          .map(f => ({
            icon: f.icone,
            name: f.nomeAmigavel,
            route: f.rota // <-- padronize para 'route'
          }));
      }
    });
  }

  handleFeatureClick(feature: any) {
    if (feature.route) {
      this.router.navigateByUrl(feature.route);
    }
  }
}
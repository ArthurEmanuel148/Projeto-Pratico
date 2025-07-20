import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, ToastController } from '@ionic/angular';
import { FuncionalidadesSistemaService } from '../core/services/funcionalidades-sistema.service';
import { FuncionalidadesUsoService, FuncionalidadeUso } from '../core/services/funcionalidades-usos.service';
import { AuthService } from '../core/services/auth.service';



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
  estatisticasUso: any = null;

  constructor(
    private router: Router,
    private alertController: AlertController,
    private toastController: ToastController,
    private authService: AuthService,
    private funcionalidadesService: FuncionalidadesSistemaService,
    private funcionalidadesUsosService: FuncionalidadesUsoService
  ) { }

  ngOnInit() {
    // Carrega usuário logado
    this.usuarioLogado = this.authService.getFuncionarioLogado();

    // Carrega funcionalidades mais usadas para o dashboard
    this.funcionalidadesUsosService.getDashboardItems().subscribe((dashboardItems: FuncionalidadeUso[]) => {
      this.mostUsedFeatures = dashboardItems.map((item: FuncionalidadeUso) => ({
        id: item.chave,
        name: item.nomeAmigavel,
        icon: item.icone,
        route: item.rota,
        color: 'primary',
        usageCount: item.contador,
        lastAccess: item.ultimoAcesso
      }));
    });

    // Carrega estatísticas de uso
    this.estatisticasUso = this.funcionalidadesUsosService.getEstatisticas();
  }

  handleFeatureClick(feature: any) {
    // Registrar o acesso
    this.funcionalidadesUsosService.registrarAcesso({
      chave: feature.id,
      nomeAmigavel: feature.name,
      icone: feature.icon,
      rota: feature.route
    });

    // Navegar para a funcionalidade
    if (feature.route) {
      this.router.navigateByUrl(feature.route);
    }
  }
}

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, ToastController } from '@ionic/angular';



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
  mostUsedFeatures: Feature[] = [];

  constructor(
    private router: Router,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController
  ) { }

  ngOnInit() {
    this.loadMostUsedFeatures();
  }

  loadMostUsedFeatures() {
    // Simulação: Em um app real, isso viria de um serviço,
    // preferências do usuário, ou análise de uso.
    this.mostUsedFeatures = [
      { id: 'new_order', name: 'Novo Pedido', icon: 'add-circle-outline', route: '/pedidos/novo', color: 'success' },
      { id: 'clients', name: 'Clientes', icon: 'people-outline', route: '/cadastros/clientes' },
      { id: 'inventory', name: 'Estoque', icon: 'cube-outline', route: '/estoque/consulta', color: 'secondary' },
      { id: 'reports', name: 'Relatórios', icon: 'analytics-outline', action: () => this.showReportsInfo(), color: 'tertiary' },
      // Adicione mais funcionalidades conforme necessário
    ];
  }

  handleFeatureClick(feature: Feature) {
    if (feature.route) {
      this.router.navigate([feature.route]);
    } else if (feature.action) {
      feature.action();
    } else {
      console.warn('Funcionalidade sem rota ou ação definida:', feature.name);
      this.presentToast(`Funcionalidade "${feature.name}" ainda não implementada.`);
    }
  }

  async showReportsInfo() {
    const alert = await this.alertCtrl.create({
      header: 'Relatórios',
      message: 'A seção de relatórios permite visualizar dados consolidados do sistema.',
      buttons: ['OK']
    });
    await alert.present();
  }

  async presentToast(message: string) {
    const toast = await this.toastCtrl.create({
      message: message,
      duration: 2000,
      position: 'bottom'
    });
    toast.present();
  }
}
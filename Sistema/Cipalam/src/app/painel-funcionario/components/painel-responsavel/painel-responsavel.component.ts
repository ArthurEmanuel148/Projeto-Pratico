import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-painel-responsavel',
    template: `
    <ion-content class="ion-padding responsavel-content">
      <div class="welcome-container">
        <div class="welcome-header">
          <ion-icon name="home-outline" color="primary" class="welcome-icon"></ion-icon>
          <h1>Bem-vindo(a), {{ usuarioLogado?.pessoa?.nmPessoa || usuarioLogado?.nomePessoa || 'Responsável' }}!</h1>
          <p>Esta é sua área exclusiva para acompanhar a matrícula do seu filho(a).</p>
        </div>
      </div>

      <!-- Seção de Informações da Matrícula -->
      <div class="section-container">
        <ion-card>
          <ion-card-header>
            <ion-card-title color="primary">
              <ion-icon name="school-outline" slot="start"></ion-icon>
              Situação da Matrícula
            </ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <div class="status-info">
              <ion-chip color="success">
                <ion-icon name="checkmark-circle-outline"></ion-icon>
                <ion-label>Matrícula Ativa</ion-label>
              </ion-chip>
              <p>Sua matrícula foi processada com sucesso. Agora você pode acompanhar o progresso dos documentos necessários.</p>
            </div>
          </ion-card-content>
        </ion-card>
      </div>

      <!-- Seção de Documentos -->
      <div class="section-container">
        <ion-card>
          <ion-card-header>
            <ion-card-title color="primary">
              <ion-icon name="document-text-outline" slot="start"></ion-icon>
              Documentos Necessários
            </ion-card-title>
            <ion-card-subtitle>
              Envie os documentos para finalizar o processo de matrícula
            </ion-card-subtitle>
          </ion-card-header>
          <ion-card-content>
            <ion-list>
              <ion-item>
                <ion-icon name="document-outline" slot="start" color="warning"></ion-icon>
                <ion-label>
                  <h3>RG do Responsável</h3>
                  <p>Status: Pendente</p>
                </ion-label>
                <ion-chip slot="end" color="warning">Pendente</ion-chip>
              </ion-item>
              
              <ion-item>
                <ion-icon name="document-outline" slot="start" color="warning"></ion-icon>
                <ion-label>
                  <h3>CPF do Responsável</h3>
                  <p>Status: Pendente</p>
                </ion-label>
                <ion-chip slot="end" color="warning">Pendente</ion-chip>
              </ion-item>
              
              <ion-item>
                <ion-icon name="document-outline" slot="start" color="warning"></ion-icon>
                <ion-label>
                  <h3>Certidão de Nascimento do Aluno</h3>
                  <p>Status: Pendente</p>
                </ion-label>
                <ion-chip slot="end" color="warning">Pendente</ion-chip>
              </ion-item>
              
              <ion-item>
                <ion-icon name="document-outline" slot="start" color="warning"></ion-icon>
                <ion-label>
                  <h3>Comprovante de Renda</h3>
                  <p>Status: Pendente</p>
                </ion-label>
                <ion-chip slot="end" color="warning">Pendente</ion-chip>
              </ion-item>
            </ion-list>
            
            <ion-button expand="block" color="primary" class="upload-button">
              <ion-icon name="cloud-upload-outline" slot="start"></ion-icon>
              Enviar Documentos
            </ion-button>
          </ion-card-content>
        </ion-card>
      </div>

      <!-- Seção de Informações de Contato -->
      <div class="section-container">
        <ion-card>
          <ion-card-header>
            <ion-card-title color="primary">
              <ion-icon name="call-outline" slot="start"></ion-icon>
              Precisa de Ajuda?
            </ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <p>Entre em contato conosco caso tenha dúvidas sobre o processo de matrícula:</p>
            
            <ion-item lines="none">
              <ion-icon name="call" slot="start" color="primary"></ion-icon>
              <ion-label>
                <h3>Telefone</h3>
                <p>(31) 3822-9999</p>
              </ion-label>
            </ion-item>
            
            <ion-item lines="none">
              <ion-icon name="mail" slot="start" color="primary"></ion-icon>
              <ion-label>
                <h3>E-mail</h3>
                <p>contato@cipalam.org.br</p>
              </ion-label>
            </ion-item>
            
            <ion-item lines="none">
              <ion-icon name="time" slot="start" color="primary"></ion-icon>
              <ion-label>
                <h3>Horário de Atendimento</h3>
                <p>Segunda a Sexta: 8h às 17h</p>
              </ion-label>
            </ion-item>
          </ion-card-content>
        </ion-card>
      </div>

      <div class="logout-section">
        <ion-button expand="block" fill="outline" color="danger" (click)="logout()">
          <ion-icon name="log-out-outline" slot="start"></ion-icon>
          Sair do Sistema
        </ion-button>
      </div>
    </ion-content>
  `,
    styles: [`
    .responsavel-content {
      --ion-color-primary: #2dd36f;
      --ion-color-primary-shade: #24b864;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
      min-height: 100vh;
    }

    .welcome-container {
      text-align: center;
      margin-bottom: 20px;
    }

    .welcome-header {
      padding: 20px;
      border-radius: 10px;
      margin-bottom: 20px;
    }

    .welcome-icon {
      font-size: 3rem;
      margin-bottom: 10px;
    }

    .welcome-header h1 {
      color: var(--ion-color-primary);
      font-weight: 600;
      margin: 10px 0;
      font-size: 1.5rem;
    }

    .welcome-header p {
      color: var(--ion-color-medium);
      font-size: 1rem;
      margin: 0;
    }

    .section-container {
      margin-bottom: 20px;
    }

    ion-card {
      border-radius: 12px;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
      margin: 16px 0;
    }

    ion-card-title {
      font-size: 1.2rem;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .status-info {
      text-align: center;
      padding: 10px 0;
    }

    .status-info ion-chip {
      margin-bottom: 15px;
    }

    .upload-button {
      margin-top: 20px;
      --border-radius: 8px;
      font-weight: 600;
    }

    .logout-section {
      margin-top: 30px;
      padding: 20px 0;
    }

    ion-chip[color="warning"] {
      --background: rgba(255, 193, 7, 0.2);
      --color: #e6a400;
    }

    ion-chip[color="success"] {
      --background: rgba(45, 211, 111, 0.2);
      --color: #2dd36f;
    }
  `],
    standalone: true,
    imports: [IonicModule, CommonModule]
})
export class PainelResponsavelComponent implements OnInit {
    usuarioLogado: any;

    constructor(private authService: AuthService) { }

    ngOnInit() {
        this.usuarioLogado = this.authService.getFuncionarioLogado();
        console.log('Usuário responsável logado:', this.usuarioLogado);
    }

    logout() {
        this.authService.logout();
    }
}

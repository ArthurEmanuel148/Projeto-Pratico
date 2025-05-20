// src/app/app.component.ts
import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html', // Este html só terá <ion-router-outlet>
  styleUrls: ['app.component.scss'], // Este scss provavelmente estará vazio
  standalone: false, // Se o seu app.component não for standalone
})
export class AppComponent {
  constructor() {
    // Lógica mínima aqui, se houver alguma que precise estar no root absoluto.
    // A maior parte da inicialização (tema, etc.) foi para o PainelLayoutComponent.
  }
}
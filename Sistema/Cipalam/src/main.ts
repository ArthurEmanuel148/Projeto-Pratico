import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';

import { AppModule } from './app/app.module';

// Importar sistema de ícones do Ionicons
import { addIcons } from 'ionicons';

// Registrar locale pt-BR
registerLocaleData(localePt, 'pt-BR');

// SOLUÇÃO: Registrar todos os ícones automaticamente
// Esta é uma abordagem mais robusta que garante que todos os ícones funcionem
import * as allIcons from 'ionicons/icons';
addIcons(allIcons);

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.log(err));

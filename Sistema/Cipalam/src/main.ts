import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';

import { AppModule } from './app/app.module';

// Registrar locale pt-BR
registerLocaleData(localePt, 'pt-BR');

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.log(err));

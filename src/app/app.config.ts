import { importProvidersFrom } from '@angular/core';
import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';
import { provideQuillConfig } from 'ngx-quill/config';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(),
    provideQuillConfig({
      modules: {
        toolbar: [
          ['bold', 'italic', 'underline'],                  // custom button values
          [{ 'list': 'ordered'}, { 'list': 'bullet' }],
          [{ 'script': 'sub'}, { 'script': 'super' }],      // superscript/subscript
        ] 
      },
      sanitize: true,
      customOptions: [{
        import: 'formats/font',
        whitelist: ['garamond']
      }]
    })

  ]
};

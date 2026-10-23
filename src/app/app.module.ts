import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './auth/login/login.component';
import { InicioComponent } from './components/inicio/inicio.component';
import { NavComponent } from './components/shared/nav/nav.component';
import { FooterComponent } from './components/shared/footer/footer.component';
import { ServiciosComponent } from './components/servicios/servicios.component';
import { ComoFuncionaComponent } from './components/como-funciona/como-funciona.component';
import { FormsModule } from '@angular/forms';
import {
  HttpBackend,
  HttpClient,
  HttpClientModule,
} from '@angular/common/http';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ContratoComponent } from './components/contrato/contrato.component';
import { ResenaModalComponent } from './components/resena-modal/resena-modal.component';
import { ContratoDetalleModalComponent } from './components/contrato-detalle-modal/contrato-detalle-modal.component';
import { DashboardColaboradorComponent } from './components/colaborador/dashboard-colaborador/dashboard-colaborador.component';
import { EstrellasComponent } from './shared/estrellas/estrellas.component';

import { ReactiveFormsModule } from '@angular/forms';
import { AuthTokenInterceptor } from './core/http/auth-token.interceptor';
import { ErrorInterceptor } from './core/http/error.interceptor';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { Chat2Component } from './components/chat/chat.component';
import { ResgistroCompletoComponent } from './components/resgistro-completo/resgistro-completo/resgistro-completo.component';
import { NavColaboradorComponent } from './components/shared/nav-colaborador/nav-colaborador.component';
import { InicioColaboradorComponent } from './components/colaborador/inicio-colaborador/inicio-colaborador.component';
import { ContratoColaboradorComponent } from './components/colaborador/contrato-colaborador/contrato-colaborador.component';
import { ResenaColaboradorComponent } from './components/colaborador/resena-colaborador/resena-colaborador.component';
import { NgxUiLoaderModule, NgxUiLoaderConfig, SPINNER, POSITION, PB_DIRECTION } from 'ngx-ui-loader';


export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

const ngxUiLoaderConfig: NgxUiLoaderConfig = {
  fgsType: SPINNER.ballSpinClockwise, // tipo de spinner
  fgsColor: '#7494ec',                // 🎨 color principal del spinner
  fgsSize: 100,                       // tamaño del spinner
  bgsColor: '#000000',                // color del fondo (backdrop)
  bgsOpacity: 0.5,                    // opacidad del fondo
  pbColor: '#7494ec',                 // color de la barra de progreso
  pbDirection: PB_DIRECTION.leftToRight,
  pbThickness: 4,
  text: 'Cargando...',                // texto opcional
  textColor: '#FFFFFF',               // color del texto
  textPosition: POSITION.centerCenter // posición del texto
};

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    InicioComponent,
    NavComponent,
    FooterComponent,
    ServiciosComponent,
    ComoFuncionaComponent,
    ContratoComponent,
    ResenaModalComponent,
    ContratoDetalleModalComponent,
    DashboardColaboradorComponent,
    EstrellasComponent,
    Chat2Component,
    ResgistroCompletoComponent,
    NavColaboradorComponent,
    InicioColaboradorComponent,
    ContratoColaboradorComponent,
    ResenaColaboradorComponent    ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    TranslateModule.forRoot({
      defaultLanguage: 'es', // idioma por defecto
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient],
      },
    }),
        NgxUiLoaderModule.forRoot(ngxUiLoaderConfig)

    
  ],
  providers: [
    // El orden importa: primero se adjunta el token, luego se atienden los errores de la respuesta.
    { provide: HTTP_INTERCEPTORS, useClass: AuthTokenInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
  ],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppModule {}

import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './auth/login/login.component';
import { InicioComponent } from './components/inicio/inicio.component';
import { NavComponent } from './components/shared/nav/nav.component';
import { FooterComponent } from './components/shared/footer/footer.component';
import { ServiciosComponent } from './components/servicios/servicios.component';
import { ChatComponent } from './components/chat/chat.component';
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

import { ReactiveFormsModule } from '@angular/forms';
import { AuthInterceptor } from './guards/auth.interceptor';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { PrimengModule } from './primeng/primeng.module';
import { MessageComponent } from './components/message/message.component';

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    InicioComponent,
    NavComponent,
    FooterComponent,
    ServiciosComponent,
    ChatComponent,
    ComoFuncionaComponent,
    ContratoComponent,
    MessageComponent
    ],
  imports: [
    PrimengModule,
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    TranslateModule.forRoot({
      defaultLanguage: 'es', // idioma por defecto
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient],
      },
    }),
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
  ],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppModule {}

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { InicioComponent } from './components/inicio/inicio.component';
import { ServiciosComponent } from './components/servicios/servicios.component';
import { ChatComponent } from './components/chat/chat.component';
import { ComoFuncionaComponent } from './components/como-funciona/como-funciona.component';
import { MessageComponent } from './components/message/message.component';

import { ContratoComponent } from './components/contrato/contrato.component';
import { AuthGuard } from './guards/auth.guard';
import { AuthenticatedGuard } from './guards/authenticated.guard';
import { OlvidoContrasenaComponent } from './auth/olvido_contrasena/olvido-contrasena/olvido-contrasena.component';

const routes: Routes = [
{ path: 'login', component: LoginComponent, data: { animation: 'LoginPage' },canActivate:[AuthenticatedGuard] },
{ path: 'forgot-password', component: OlvidoContrasenaComponent },
  
{ path: 'inicio', component: InicioComponent, data: { animation: 'InicioPage' },canActivate:[AuthGuard] },
  { path: 'servicios', component: ServiciosComponent, data: { animation: 'ServiciosPage' },canActivate:[AuthGuard] },
  { path: 'contrato', component: ContratoComponent, data: { animation: 'ContratoPage' },canActivate:[AuthGuard] },
  { path: 'chat', component: MessageComponent , data: { animation: 'ChatPage' },canActivate:[AuthGuard] },
  { path: 'como-funciona', component: ComoFuncionaComponent, data: { animation: 'ComoFuncionaPage' },canActivate:[AuthGuard] },
  { path: '**', redirectTo: 'login', pathMatch: 'full' }
  
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { 

}

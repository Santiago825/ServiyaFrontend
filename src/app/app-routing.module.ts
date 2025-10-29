import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { InicioComponent } from './components/inicio/inicio.component';
import { ServiciosComponent } from './components/servicios/servicios.component';
import { ChatComponent } from './components/chat/chat.component';
import { ComoFuncionaComponent } from './components/como-funciona/como-funciona.component';
import { ContratoComponent } from './components/contrato/contrato.component';
import { AuthGuard } from './guards/auth.guard';
import { AuthenticatedGuard } from './guards/authenticated.guard';
import { OlvidoContrasenaComponent } from './auth/olvido_contrasena/olvido-contrasena/olvido-contrasena.component';
import { Chat2Component } from './components/chat2/chat2.component';
import { UsersResolver } from './services/Usuario/UsersResolver';
import { ResgistroCompletoComponent } from './components/resgistro-completo/resgistro-completo/resgistro-completo.component';
import { RegistroGuard } from './guards/registro.guard';
import { InicioColaboradorComponent } from './components/colaborador/inicio-colaborador/inicio-colaborador.component';
import { RoleGuard } from './guards/role.guard'; // 👈 nuevo import
import { ChatColaboradorComponent } from './components/colaborador/chat-colaborador/chat-colaborador.component';
import { ResenaColaboradorComponent } from './components/colaborador/resena-colaborador/resena-colaborador.component';
import { ContratoColaboradorComponent } from './components/colaborador/contrato-colaborador/contrato-colaborador.component';
import { CONSTANTES } from './constants/constants';

const routes: Routes = [
{ path: 'login', component: LoginComponent, canActivate: [AuthenticatedGuard] },
  { path: 'forgot-password', component: OlvidoContrasenaComponent },
  { path: 'registro-completo', component: ResgistroCompletoComponent, canActivate: [RegistroGuard] },

  // 🔹 Contratante
{ path: 'inicio', component: InicioComponent, canActivate: [AuthGuard,RoleGuard],data: { roles: [CONSTANTES.CONTRATANTE],animation: 'InicioPage' } },
  { path: 'servicios', component: ServiciosComponent, canActivate:[AuthGuard, RoleGuard], data: { roles: [CONSTANTES.CONTRATANTE],animation: 'ServiciosPage' } },
  { path: 'contrato', component: ContratoComponent, canActivate:[AuthGuard, RoleGuard], data: { roles: [CONSTANTES.CONTRATANTE],animation: 'ContratoPage' } },
  { path: 'chat', component: ChatComponent, canActivate:[AuthGuard, RoleGuard], data: { roles: [CONSTANTES.CONTRATANTE],animation: 'ChatPage' } },
  { path: 'chat2', component: Chat2Component, canActivate:[AuthGuard, RoleGuard], data: { roles: [CONSTANTES.CONTRATANTE,CONSTANTES.COLABORADOR],animation: 'Chat2Page' }, resolve: { users: UsersResolver } },
  { path: 'como-funciona', component: ComoFuncionaComponent, canActivate: [AuthGuard, RoleGuard],data: { roles: [CONSTANTES.CONTRATANTE],animation: 'ComoFuncionaPage' } },

  // 🔹 Colaborador
{ path: 'inicio-colaborador', component: InicioColaboradorComponent, canActivate: [AuthGuard,RoleGuard],data: { roles: [CONSTANTES.COLABORADOR],animation: 'InicioCPage' } },
{ path: 'chat-colaborador', component: ChatColaboradorComponent, canActivate: [AuthGuard,RoleGuard],data: { roles: [CONSTANTES.COLABORADOR],animation: 'ChatCPage' } },
{ path: 'resena-colaborador', component: ResenaColaboradorComponent, canActivate: [AuthGuard,RoleGuard],data: { roles: [CONSTANTES.COLABORADOR],animation: 'resenaPage' } },
{ path: 'contrato-colaborador', component: ContratoColaboradorComponent, canActivate: [AuthGuard,RoleGuard],data: { roles: [CONSTANTES.COLABORADOR],animation: 'ContratoPage' } },

  { path: '**', redirectTo: 'login', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}

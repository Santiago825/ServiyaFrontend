import {
  Component,
  OnInit,
  OnDestroy,
  AfterViewChecked,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { ChatService } from '../../services/chat/chat.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { UsuarioService } from '../../services/Usuario/usuario.service';

@Component({
  selector: 'app-chat2',
  templateUrl: './chat2.component.html',
  styleUrls: ['./chat2.component.css'],
})
export class Chat2Component implements OnInit, OnDestroy, AfterViewChecked {
  username: string = '';
  activeTab: string = '';
  messageSubscription!: Subscription;
  rol!: any;
  privateChats: Map<string, any[]> = new Map();
  privateChatsArray: string[] = [];

  @ViewChild('scrollAnchor') private scrollAnchor!: ElementRef;

  constructor(
    public chatService: ChatService,
    private authService: AuthService,
    private usuarioService: UsuarioService
  ) {
    this.rol = authService.getRol();
  }

  ngOnInit(): void {
    const { idUsuario, username } = this.authService.getUser();
    this.username = username;

    let obtenerUsuarios: ((id: number) => any) | undefined;

    if (this.rol === 'COLABORADOR') {
      obtenerUsuarios = this.usuarioService.obtenerSeguidoresColaborador.bind(
        this.usuarioService
      );
    } else if (this.rol === 'CONTRATANTE') {
      obtenerUsuarios = this.usuarioService.obtenerColaboradoresSeguidos.bind(
        this.usuarioService
      );
    }

    // 🔹 Obtener lista de usuarios para chats privados
    if (obtenerUsuarios) {
      obtenerUsuarios(idUsuario).subscribe({
        next: (resp: any) => {
          if (resp && resp.lista) {
            this.privateChatsArray = resp.lista
              .map((col: any) => col.username)
              .filter((name: string) => name !== this.username);

            this.privateChatsArray.forEach((user) => {
              if (!this.privateChats.has(user)) {
                this.privateChats.set(user, []);
              }
            });
          }
        },
        error: (err: any) => {
          console.error('Error al obtener usuarios seguidos', err);
        },
      });
    }

    // 🔌 Conectar usuario al WebSocket
    this.chatService.connect(this.username);



    // 🔄 Escuchar mensajes del socket
    this.messageSubscription = this.chatService.message$.subscribe(
      (payload) => {
        if (!payload) return;

        switch (payload.status) {
          case 'JOIN':
            if (
              payload.senderName &&
              payload.senderName !== this.username &&
              !this.privateChats.has(payload.senderName)
            ) {
              this.privateChats.set(payload.senderName, []);
              if (!this.privateChatsArray.includes(payload.senderName)) {
                this.privateChatsArray.push(payload.senderName);
              }
            }
            break;

          case 'MESSAGE':
            if (payload.receiverName === this.username) {
              // 📥 Mensaje recibido (privado)
              if (!this.privateChats.has(payload.senderName)) {
                this.privateChats.set(payload.senderName, []);
              }
              this.privateChats.get(payload.senderName)?.push(payload);
            } else if (payload.receiverName) {
              // 📤 Mensaje enviado (privado)
              if (!this.privateChats.has(payload.receiverName)) {
                this.privateChats.set(payload.receiverName, []);
              }
              this.privateChats.get(payload.receiverName)?.push(payload);
            } 
            break;
        }

        this.scrollToBottom();
      }
    );
  }

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  // ✅ Enviar mensaje
  sendMessage(): void {
    const message = this.chatService.userData.message.trim();
    if (!message) return;

   
      this.chatService.sendPrivateValue(this.activeTab);
    

    setTimeout(() => this.scrollToBottom(), 100);
  }

  // ✅ Cambiar entre chat público o privado
  changeTab(tab: string): void {
    this.activeTab = tab;

    
      this.chatService.obtenerMensajesPrivados(this.username, tab).subscribe({
        next: (msgs) => {
          this.privateChats.set(tab, msgs);
          setTimeout(() => this.scrollToBottom(), 100);

        },
        error: (err) => console.error('Error al cargar mensajes privados:', err),
      });
    

  }

  // ✅ Desplazar el chat hacia el final automáticamente
  private scrollToBottom(): void {
    try {
      const container = this.scrollAnchor?.nativeElement;
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    } catch (err) {
      console.warn('No se pudo desplazar automáticamente:', err);
    }
  }

  ngOnDestroy(): void {
    if (this.messageSubscription) {
      this.messageSubscription.unsubscribe();
    }
    this.chatService.disconnect();
  }
}

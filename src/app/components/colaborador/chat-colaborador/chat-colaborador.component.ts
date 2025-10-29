import { 
  AfterViewChecked, 
  Component, 
  ElementRef, 
  HostListener, 
  OnInit, 
  ViewChild 
} from '@angular/core';
import { ChatService } from '../../../services/chat/chat.service';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { UsuarioService } from 'src/app/services/Usuario/usuario.service';
import { ActivatedRoute } from '@angular/router';
import { PersonaService } from 'src/app/services/Persona/persona.service';
import { AuthService } from 'src/app/services/auth/auth.service';

@Component({
  selector: 'app-chat-colaborador',
  templateUrl: './chat-colaborador.component.html',
  styleUrls: ['./chat-colaborador.component.css'],
    animations: [
        trigger('slideFade', [
          state('hidden', style({
            transform: 'translateX(100%)',
            opacity: 0
          })),
          state('visible', style({
            transform: 'translateX(0)',
            opacity: 1
          })),
          transition('hidden => visible', [
            animate('300ms ease-out')
          ]),
          transition('visible => hidden', [
            animate('300ms ease-in')
          ])
        ])
      ]
})
export class ChatColaboradorComponent {
   tab = 'CHATROOM';
    privateChatsArray: string[] = [];
    isMobileView: boolean = false;
  
    @ViewChild('publicChatMessages') publicChatMessages!: ElementRef;
    @ViewChild('privateChatMessages') privateChatMessages!: ElementRef;
  
    constructor(private authService:AuthService,private usuarioService:UsuarioService, public chatService: ChatService,  private personaService: PersonaService,private route: ActivatedRoute
  ) {}
  
    
    ngOnInit(): void {
      this.updateView();
      const {idUsuario} = this.authService.getUser();
  
      // 🟢 Espera los usuarios ANTES de conectar
      this.usuarioService.obtenerUsuarios().subscribe({
        next: (users) => {
          const usuario=users['lista']
          // Inicializa las salas privadas
          usuario.forEach((u: any) => {
            if (u.username && !this.chatService.privateChats.has(u.username)) {
              this.chatService.privateChats.set(u.username, []);
            }
          });
  
          // Conecta el chat SOLO después
          this.chatService.connect();
  
          // Suscríbete a los mensajes
          this.chatService.message$.subscribe(() => {
            this.updatePrivateChatsArray();
          });
        },
        error: (err:any) => {
          console.error('Error al cargar usuarios:', err);
        }
      });
    }
  
    @HostListener('window:resize')
    updateView() {
      this.isMobileView = window.innerWidth <= 768;
    }
  
    sendValue() {
      if (this.userData.message.trim() !== '') {
        this.chatService.sendValue();
        this.userData.message = '';
      }
    }
  
    sendPrivateValue() {
      if (this.userData.message.trim() !== '') {
        this.chatService.sendPrivateValue(this.tab);
        this.userData.message = '';
      }
    }
  
    setTab(name: string) {
      this.tab = name;
      setTimeout(() => this.scrollToBottom(), 50);
    }
  
    // 🔹 Volver a lista en móviles
    closeTab() {
      this.tab = 'CHATROOM';
    }
  
    updatePrivateChatsArray() {
      this.privateChatsArray = Array.from(this.chatService.privateChats.keys());
    }
  
    get userData() {
      return this.chatService.userData;
    }
  
    get publicChats() {
      return this.chatService.publicChats;
    }
  
    get privateChats() {
      return this.chatService.privateChats;
    }
  
    ngAfterViewChecked() {
      this.scrollToBottom();
    }
  
    private scrollToBottom(): void {
      try {
        const chatList =
          this.tab === 'CHATROOM'
            ? this.publicChatMessages?.nativeElement
            : this.privateChatMessages?.nativeElement;
  
        if (chatList) {
          chatList.scrollTo({
            top: chatList.scrollHeight,
            behavior: 'smooth'
          });
        }
      } catch (err) {
        console.warn('Error en scroll automático:', err);
      }
    }
  

}

import { Injectable } from '@angular/core';
import { Client, IMessage } from '@stomp/stompjs';
import * as SockJS from 'sockjs-client';
import { BehaviorSubject } from 'rxjs';
import { environment } from 'src/app/environment/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private stompClient!: Client;
  private username!: string;

  public message$ = new BehaviorSubject<any>(null);
  public privateChats: Map<string, any[]> = new Map();

  public userData: any = {
    username: '',
    receivername: '',
    connected: false,
    message: '',
  };

  constructor(private http: HttpClient) {}

  connect(username: string): void {
    this.username = username;
    this.userData.username = username;

    const socketFactory = () => new SockJS('http://localhost:8080/ws');

    this.stompClient = new Client({
      webSocketFactory: socketFactory,
      reconnectDelay: 5000,
      onConnect: () => {
        console.log('✅ Conectado al WebSocket');
        this.userData.connected = true;
        this.userJoin();

        // ✅ Solo suscripción privada
        this.stompClient.subscribe(`/user/${username}/private`, (message: IMessage) => {
          const payload = JSON.parse(message.body);
          this.message$.next(payload);
        });
      },
      onStompError: (frame) => {
        console.error('❌ Error STOMP:', frame.headers['message']);
      },
      onWebSocketClose: () => {
        console.warn('⚠️ WebSocket cerrado');
        this.userData.connected = false;
      },
    });

    this.stompClient.activate();
  }

  private userJoin(): void {
    const chatMessage = {
      senderName: this.username,
      status: 'JOIN',
    };
    this.stompClient.publish({
      destination: '/app/message',
      body: JSON.stringify(chatMessage),
    });
  }

  sendPrivateValue(receiver: string): void {
    if (this.stompClient && this.userData.message.trim() !== '') {
      const chatMessage = {
        senderName: this.username,
        receiverName: receiver,
        message: this.userData.message,
        status: 'MESSAGE',
      };

      this.stompClient.publish({
        destination: '/app/private-message',
        body: JSON.stringify(chatMessage),
      });

      // Emitir localmente
      this.message$.next(chatMessage);
      this.userData.message = '';
    }
  }

  disconnect(): void {
    if (this.stompClient && this.stompClient.active) {
      this.stompClient.deactivate();
      this.userData.connected = false;
    }
  }


  obtenerMensajesPublicos() {
  return this.http.get<any[]>(environment.urlApiPrivate+'public');
}

obtenerMensajesPrivados(user1: string, user2: string) {
  return this.http.get<any[]>(`${environment.urlApiPrivate}private/${user1}/${user2}`);
}
}

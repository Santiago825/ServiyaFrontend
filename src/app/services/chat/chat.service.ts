import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Client, Message, Stomp } from '@stomp/stompjs';
import * as SockJS from 'sockjs-client';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private stompClient: Client | null = null;

  public publicChats: any[] = [];
  public privateChats = new Map<string, any[]>();
  public message$ = new BehaviorSubject<any>(null);

  userData = {
    username: '',
    receivername: '',
    connected: false,
    message: ''
  };

  // 🟢 Reemplazo del antiguo connect()
connect() {
  console.log('👤 Usuario conectado como:', this.userData.username);

  if (this.stompClient && this.stompClient.connected) {
    console.warn('🔁 Chat ya conectado, omitiendo reconexión.');
    return;
  }

  const socketFactory = () => new SockJS('http://localhost:8080/ws');

  this.stompClient = new Client({
    webSocketFactory: socketFactory,
    reconnectDelay: 5000,
    debug: (str) => console.log(str),
    onConnect: (frame) => this.onConnected(),
    onStompError: (frame) => this.onError(frame)
  });

  this.stompClient.activate();
}

  initializePrivateRooms(users: any[]) {
  users.forEach(u => {
    const username = u.username || u.nombre;
    if (username && username !== this.userData.username) {
      if (!this.privateChats.has(username)) {
        this.privateChats.set(username, []);
      }
    }
  });

  // Emitir evento para que el componente se actualice
  this.message$.next({ type: 'INIT_ROOMS' });
}


onConnected() {
  if (this.userData.connected) return; // Evita duplicar subscripciones

  this.userData.connected = true;

  this.stompClient?.subscribe('/chatroom/public', (msg) => this.onMessageReceived(msg));
  this.stompClient?.subscribe(`/user/${this.userData.username}/private`, (msg) => this.onPrivateMessage(msg));

  this.userJoin();
}

  userJoin() {
    const chatMessage = {
      senderName: this.userData.username,
      status: 'JOIN'
    };
    this.stompClient?.publish({
      destination: '/app/message',
      body: JSON.stringify(chatMessage)
    });
  }

  onMessageReceived(payload: Message) {
    const payloadData = JSON.parse(payload.body);
    switch (payloadData.status) {
      case 'JOIN':
        if (!this.privateChats.get(payloadData.senderName)) {
          this.privateChats.set(payloadData.senderName, []);
        }
        break;
      case 'MESSAGE':
        this.publicChats.push(payloadData);
        this.message$.next(payloadData);
        break;
    }
  }

  onPrivateMessage(payload: Message) {
    const payloadData = JSON.parse(payload.body);
    if (this.privateChats.get(payloadData.senderName)) {
      this.privateChats.get(payloadData.senderName)?.push(payloadData);
    } else {
      this.privateChats.set(payloadData.senderName, [payloadData]);
    }
    this.message$.next(payloadData);
  }

  onError(err: any) {
    console.error('STOMP error:', err);
  }

  sendValue() {
    if (this.stompClient && this.stompClient.connected) {
      const chatMessage = {
        senderName: this.userData.username,
        message: this.userData.message,
        status: 'MESSAGE'
      };
      this.stompClient.publish({
        destination: '/app/message',
        body: JSON.stringify(chatMessage)
      });
      this.userData.message = '';
    }
  }

  sendPrivateValue(tab: string) {
    console.log('📤 Enviando mensaje privado', {
  to: tab,
  from: this.userData.username,
  message: this.userData.message
});
    if (this.stompClient && this.stompClient.connected) {
      const chatMessage = {
        senderName: this.userData.username,
        receiverName: tab,
        message: this.userData.message,
        status: 'MESSAGE'
      };

      if (this.userData.username !== tab) {
        this.privateChats.get(tab)?.push(chatMessage);
      }

      this.stompClient.publish({
        destination: '/app/private-message',
        body: JSON.stringify(chatMessage)
      });

      this.userData.message = '';
    }
  }
  disconnect() {
  if (this.stompClient && this.stompClient.connected) {
    this.stompClient.deactivate();
    this.userData.connected = false;
  }
}
}

import { Component } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
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
export class ChatComponent {
   selectedChatId: number | null = null;
  newMessageText: string = '';

  // Datos de prueba (simulando chats y mensajes)
  chats = [
    { id: 1, name: 'Ana Plomería', avatar: 'assets/ana.jpg', lastMessage: 'Sí, puedo ir mañana a las 3 PM.', unreadCount: 1, messages: [
      { text: 'Hola, ¿está disponible para un servicio de plomería?', time: '10:00 AM', isUser: true },
      { text: 'Sí, ¿cuál es el problema?', time: '10:05 AM', isUser: false },
      { text: 'Hay una fuga en la cocina. ¿Cuál es su tarifa?', time: '10:15 AM', isUser: true },
      { text: 'La tarifa por hora es $40.000 COP. Sí, puedo ir mañana a las 3 PM.', time: '10:20 AM', isUser: false }
    ]},
    { id: 2, name: 'David Electricista', avatar: 'assets/david.jpg', lastMessage: 'Te confirmo la hora en un momento.', unreadCount: 0, messages: [
      { text: 'Ok, gracias.', time: 'Ayer', isUser: true }
    ]},
    { id: 3, name: 'Sofía Pintora', avatar: 'assets/sofia.jpg', lastMessage: 'Adjunté las fotos de mi trabajo previo.', unreadCount: 3, messages: [
      // ... más mensajes
    ]}
  ];

  constructor() { }

  ngOnInit(): void { }

  /**
   * Selecciona un chat de la lista.
   * @param id El ID del chat a seleccionar.
   */
 selectChat(id: number): void {
  this.selectedChatId = id; 
  const chat = this.chats.find(c => c.id === id);
  if (chat) chat.unreadCount = 0;
}

  /**
   * Obtiene el nombre del chat seleccionado.
   * @param id El ID del chat.
   * @returns El nombre del profesional.
   */
  getChatName(id: number): string {
    return this.chats.find(c => c.id === id)?.name || 'Conversación';
  }

  /**
   * Obtiene los mensajes del chat seleccionado.
   * @param id El ID del chat.
   * @returns Arreglo de mensajes.
   */
  getMessages(id: number): any[] {
    return this.chats.find(c => c.id === id)?.messages || [];
  }

  /**
   * Envía un nuevo mensaje al chat activo.
   */
  sendMessage(): void {
    if (this.newMessageText.trim() === '' || this.selectedChatId === null) {
      return;
    }

    const newMessage = {
      text: this.newMessageText.trim(),
      time: new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }),
      isUser: true // Asume que el usuario está enviando
    };

    const chat = this.chats.find(c => c.id === this.selectedChatId);
    if (chat) {
      chat.messages.push(newMessage);
      chat.lastMessage = newMessage.text;
    }

    this.newMessageText = ''; // Limpia el input
  }


}

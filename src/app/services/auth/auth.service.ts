import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { CompatClient, Stomp } from '@stomp/stompjs';
import { Observable, Subject, tap } from 'rxjs';
import { environment } from 'src/app/environment/environment';
import Swal from 'sweetalert2';
import * as SokJS from 'sockjs-client';
import { registro } from 'src/app/models/registro';
import { ChatService } from '../chat/chat.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private tokenKey = 'authToken';
  private webSocketUrl = environment.urlApiPrivate + environment.webSocketUrl;
  private stompClient: CompatClient = {} as CompatClient;
  private subscriptionActiveUsers: any;
  private activeUsersSubject = new Subject<any>();

  constructor(private http: HttpClient, private router: Router,private chatService:ChatService) {
    this.startTokenCheck();
  }
  login(username: string, password: string): Observable<any> {
    return this.http
      .post<any>(environment.urlApi + 'login', { username, password })
      .pipe(
        tap((response) => {
          if (response.token) {
            this.setToken(response.token);
            this.saveUser(response);
            this.saveRol(response.rol);
          }
        })
      );
  }
  registro(registro: registro): Observable<any> {
    return this.http.post<any>(
      environment.urlApi + 'registro',
      registro
    );
  }
  validarUsername(username: string): Observable<any> {
    return this.http.get<any>(
      environment.urlApi + 'validar-username?username=' + username
    );
  }
  private setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }
  public getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  isAutenticated(): boolean {
    const token = this.getToken();
    if (!token) {
      return false;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const exp = payload.exp * 1000;
      const now = Date.now();

      return now < exp;
    } catch (e) {
      return false;
    }
  }

  startTokenWatcher() {
    setInterval(() => {
      if (this.isAutenticated()) {
        this.logout();
        this.router.navigate(['/login']);
      }
    }, 60_000); // cada 1 minuto
  }
  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem('user')
    localStorage.removeItem('user')
    this.chatService.disconnect();

    this.router.navigate(['login']);
  }
  saveUser(user: any) {
     localStorage.setItem(
      'user',
      JSON.stringify({
        username: user.username,
        idUsuario: user.idUsuario
      })
      );
  }
  saveRol(rol: string) {
    localStorage.setItem('rol', rol);
  }

  getRol(): string | null {
    return localStorage.getItem('rol');
  }
  getUser(): any {
    return JSON.parse(localStorage.getItem('user') ?? '{}');
  }
  connect(user: any) {
    const soket = new SokJS(this.webSocketUrl);
    this.stompClient = Stomp.over(soket);
    this.stompClient.connect(
      {},
      () => this.onConnect(user),
      (error: any) => console.log(error)
    );
  }
  private onConnect(user: any) {
    this.subscribeActive();
    this.sendConnect(user);
  }
  private subscribeActive() {
    this.subscriptionActiveUsers = this.stompClient.subscribe(
      '/topic/active',
      (message: any) => {
        const user = JSON.parse(message.body);
        this.activeUsersSubject.next(user);
      }
    );
  }
  sendConnect(user: any) {
    this.stompClient.send('app/user/connect', {}, JSON.stringify(user));
  }
  subscribeActiveUsers(): Observable<any> {
    return this.activeUsersSubject.asObservable();
  }
  startTokenCheck() {
    setInterval(() => {
      const token = this.getToken();
      if (token && !this.isAutenticated()) {
        // Token vencido
        Swal.fire({
          icon: 'warning',
          title: 'Sesión expirada',
          text: 'Tu sesión ha caducado. Por favor, inicia sesión nuevamente.',
          confirmButtonText: 'Aceptar',
        }).then(() => {
          this.logout();
        });
      }
    }, 5000); // cada 5 segundos
  }
}

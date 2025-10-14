import { Component } from '@angular/core';
import { AuthService } from 'src/app/services/auth/auth.service';

@Component({
  selector: 'app-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.css']
})
export class MessageComponent {
  currentUser:any={};
  activeUsersSubscription : any;
  constructor(
    private authService:AuthService
  ){

  }
  ngOnInit(){
    this.currentUser = this.authService.getUser();
    this.authService.connect(this.currentUser)
    this.activeUsersSubscription=this.authService.subscribeActiveUsers().subscribe({
      next:(user:any)=>{
        console.log(user)
      },
      error(err){
        console.error(err);
      }
    })
  }


}

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Route, Router } from '@angular/router';
import { AlertController, LoadingController } from '@ionic/angular';
import { ChatService } from 'src/app/services/chat.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  loginForm: any;
  constructor(private formBuilder: FormBuilder,
    private router: Router,
    private chatService: ChatService,
    private alertController: AlertController,
    private loadingController: LoadingController
    ) { }

  ngOnInit() {
    this.loginForm = this.formBuilder.group({
      email : ['', [Validators.required, Validators.email]],
      password : ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  // right work
  async signUp(){
    console.log(`signup value: email=${this.loginForm.value.email}, password=${this.loginForm.value.password}`);
    const loading = await this.loadingController.create();
    await loading.present();
    this.chatService.signup(this.loginForm.value).then(user =>{ 
      // console.log(`signup response user: ${user}`); // 
      loading.dismiss();
      // this.router.navigateByUrl('/chat', {replaceUrl : true});
    },
    async (err: any) =>{
      loading.dismiss();
      const alert = await this.alertController.create({
        header: 'Sign up failed',
        message: err.message,
        buttons: ['Ok'],
      });

      await alert.present();
    });
  }


  // right work
  async signIn() {
    console.log(`signin value: ${this.loginForm.value}`);
    const loading = await this.loadingController.create();
    await loading.present();

    this.chatService.signIn(this.loginForm.value).then((res) =>{
      loading.dismiss();
      console.log(`signin response value: ${res}`);
      // this.router.navigateByUrl('/chat', { replaceUrl: true});
      this.router.navigateByUrl('/chat');
    },
    async (err) => {
      loading.dismiss();
      const alert = await this.alertController.create({
        header: ':(',
        message: err.message,
        buttons: ['OK'],
      });

      await alert.present();
    }
    )
  }

  get email(){
    return this.loginForm.get('email');
  }

  get password(){
    return this.loginForm.get('password');
  }

}

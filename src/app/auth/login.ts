import { Component } from '@angular/core';
import { PageHeader } from '../page-header/page-header';
import { FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-login',
  imports: [PageHeader, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login{

  constructor(
    private authService: AuthService,
    private router: Router
  ){}

  loginForm = new FormGroup({
    username: new FormControl<string>("", Validators.required),
    password: new FormControl<string>("", Validators.required),
  });

  get username() {
    return this.loginForm.get("username") as FormControl;
  }

  get password() {
    return this.loginForm.get("password") as FormControl;
  }

  showValidationErrors: boolean = false;
  loginUnsuccessful: boolean = false;

  ngOnInit(){
    this.authService.initialiseCsrf().subscribe();
  }

  redirectToHome(){
    this.router.navigate(['/home']);
  }

  submit(){
    this.showValidationErrors = false;
    this.username.updateValueAndValidity();
    this.password.updateValueAndValidity();

    console.log(this.username.value);
    console.log(this.password.value);

    if (this.loginForm.invalid){
      this.showValidationErrors = true;
    }
    
    else{
      this.authService.login(this.username.value, this.password.value).subscribe(
        {
          next: () => {
            this.loginUnsuccessful = false;
            this.redirectToHome();
          },
          error: () => this.loginUnsuccessful = true
        }
      );
    }
  }

}

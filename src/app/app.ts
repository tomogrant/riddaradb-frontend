import { Component, signal, computed, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from './auth/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  private authService = inject(AuthService);
  private router = inject(Router);

  $loggedIn = computed(() => this.authService.$loggedIn());

  ngOnInit(){
    //When application starts on load or refresh, set logged-in user
    console.log("APPLICATION STARTED");
    this.authService.getCurrentUser().subscribe();
  }

  logout(){
    this.authService.logout().subscribe({
      next: () => this.redirectToHome()
    });
  }

  redirectToHome(){
    this.router.navigate(['/home']);
  }
}

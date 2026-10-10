import { Component, signal, computed, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from './auth/auth.service';
import { Collapse } from 'bootstrap';

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
  $isAdmin = computed(() => this.authService.$isAdmin());

  ngOnInit(){
    //When application starts on load or refresh, set logged-in user
    console.log("APPLICATION STARTED");
    this.authService.getCurrentUser().subscribe();
  }

  logout(){
    this.authService.logout().subscribe({
      next: () => this.redirectToLogin()
    });
  }

  redirectToLogin(){
    this.router.navigate(['/login']);
  }

  closeNavbar(){
    const nav = document.getElementById("mainNavbar");
    if (nav){
      const collapse = Collapse.getInstance(nav);
      collapse?.hide();
    }
  }
}

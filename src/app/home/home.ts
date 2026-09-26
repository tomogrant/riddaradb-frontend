import { Component, computed, inject } from "@angular/core";
import { PageHeader } from "../page-header/page-header";
import { AuthService } from "../auth/auth.service";

@Component({
  selector: "app-home",
  imports: [PageHeader],
  templateUrl: "./home.html",
  styleUrl: "./home.css",
})
export class Home {
  authService = inject(AuthService);

  $loggedIn = computed(() => this.authService.$loggedIn());
  $currentUser = computed(() => this.authService.$currentUser());

  ngOnInit(){
    console.log("Current user: " + this.$currentUser());
  }
}


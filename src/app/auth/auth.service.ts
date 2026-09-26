import { HttpClient } from "@angular/common/http";
import { computed, Injectable } from "@angular/core";
import { switchMap, tap } from "rxjs";
import { signal } from "@angular/core";
import { Roles } from "./roles";

export interface User{
  username: string,
  firstName: string,
  lastNames: string,
  authorities: string[]
}

@Injectable({
  providedIn: "root"
})
export class AuthService {

  private $currentUserWritable = signal<User | null>(null);
  readonly $currentUser = this.$currentUserWritable.asReadonly();
  readonly $loggedIn = computed(() => this.$currentUser() !== null);
  readonly $isAdmin = computed(() => this.$currentUser()?.authorities.includes(Roles.ROLE_ADMINISTRATOR));

  authMain = "/api/auth";

  constructor(private httpClient: HttpClient){}

  initialiseCsrf(){
    return this.httpClient.get(`${this.authMain}/csrf`, { withCredentials: true})
      .pipe(
        tap(data => console.log("CSRF token: " + JSON.stringify(data)))
      );
  }

  getCurrentUser(){
    return this.httpClient.get<User>(`${this.authMain}/me`, { withCredentials: true}) 
    .pipe(tap(user => {
      this.$currentUserWritable.set(user);
      console.log("Current user: " + this.$currentUser()?.username);
    }));
  }

  login(username: string, password: string){
    const body = new URLSearchParams();

    body.set("username", username);
    body.set("password", password);

    return this.httpClient.post(`${this.authMain}/login`, body.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }, 
      withCredentials: true
    }).pipe(switchMap(() => this.getCurrentUser()));
  }

  logout(){
    return this.httpClient.post(`${this.authMain}/logout`, {}, 
      {withCredentials: true})
      .pipe(tap(() => this.$currentUserWritable.set(null)));
  }
}
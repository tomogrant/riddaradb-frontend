import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { IUser } from "./IUser";
import { Observable } from "rxjs";
import { tap, catchError, throwError } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class AdminService {
  adminMain = "/api/admin";
  constructor(private httpClient: HttpClient) {}

  getUsers(): Observable<IUser[]> {
    return this.httpClient.get<IUser[]>(`${this.adminMain}/getusers`).pipe(
      tap((data) => console.log("All user data got: " + JSON.stringify(data))),
      catchError(this.errorHandler),
    );
  }

  postUser(user: IUser): Observable<IUser> {
    console.log("Posting user: " + JSON.stringify(user));
    return this.httpClient.post<IUser>(`${this.adminMain}/postuser`, user).pipe(
      tap((data) => console.log("User posted: " + JSON.stringify(data))),
      catchError(this.errorHandler),
    );
  }

  putUser(user: IUser): Observable<IUser> {
    console.log("Putting user: " + JSON.stringify(user));
    return this.httpClient.put<IUser>(`${this.adminMain}/putuser`, user).pipe(
      tap((data) => console.log("User updated: " + JSON.stringify(data))),
      catchError(this.errorHandler),
    );
  }

  deleteUser(username: string): Observable<IUser> {
    console.log("request sent: " + `${this.adminMain}/deleteuser/${username}`);
    return this.httpClient.delete<IUser>(`${this.adminMain}/deleteuser/${username}`);
  }

  private errorHandler(error: HttpErrorResponse) {
    let errorMessage = "error";
    return throwError(() => errorMessage);
  }
}

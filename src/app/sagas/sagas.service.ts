import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Injectable } from '@angular/core';
import { ISaga } from './ISaga';
import { Observable, catchError, tap, throwError } from "rxjs";

@Injectable({
  providedIn: 'root'
})

export class SagasService {

  sagasMain = '/api/sagas';
  constructor(private httpClient: HttpClient){}

    //GET ALL SAGAS
    getSagas(): Observable<ISaga[]>{//Gets an observable of type ISaga[]. Can be accessed and subscribed to by other classes to access data. 
        return this.httpClient.get<ISaga[]>(`${this.sagasMain}/getsagas`)
        .pipe(tap(data => console.log('All saga data got: ' + JSON.stringify(data))),
        catchError(this.errorHandler));
    }

    //GET SAGA BY ID
    getSagaById(id: number): Observable<ISaga>{
        return this.httpClient.get<ISaga>(`${this.sagasMain}/getsagabyid/${id}`)
        .pipe(tap(data => console.log(`Saga with ID ${id}: ` + JSON.stringify(data))),
        catchError(this.errorHandler));
    }

    private errorHandler (error: HttpErrorResponse){
        let errorMessage = 'error';
        return throwError(() => errorMessage);
  }
}

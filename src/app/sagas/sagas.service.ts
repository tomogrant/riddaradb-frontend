import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Injectable } from '@angular/core';
import { ISaga } from './ISaga';
import { Observable, catchError, tap, throwError } from "rxjs";

@Injectable({
  providedIn: 'root'
})

export class SagasService {

  sagasMain = '/api/getsagas';
      constructor(private httpClient: HttpClient){}

    //GET ALL SAGAS
    getSagas(): Observable<ISaga[]>{//Gets an observable of type IPerformance[]. Can be accessed and subscribed to by other classes to access data. 
        return this.httpClient.get<ISaga[]>(this.sagasMain)
        .pipe(tap(data => console.log('All performance data got: ' + JSON.stringify(data))),
        catchError(this.errorHandler));
    }

        private errorHandler (error: HttpErrorResponse){
        let errorMessage = 'error';
        return throwError(() => errorMessage);
  }
}

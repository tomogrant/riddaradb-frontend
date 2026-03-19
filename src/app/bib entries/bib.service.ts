import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Injectable } from '@angular/core';
import { IBib } from './IBib';
import { Observable, catchError, tap, throwError } from "rxjs";

@Injectable({
  providedIn: 'root'
})

export class BibService {

  bibMain = '/api/bibentries';
  constructor(private httpClient: HttpClient){}

    //GET ALL BIB ENTRIES
    getBibEntries(): Observable<IBib[]>{//Gets an observable of type IBib[]. Can be accessed and subscribed to by other classes to access data. 
        return this.httpClient.get<IBib[]>(`${this.bibMain}/getbibentries`)
        .pipe(tap(data => console.log('All bib data got: ' + JSON.stringify(data))),
        catchError(this.errorHandler));
    }

    //GET BIB ENTRY BY ID
    getBibEntryById(id: number): Observable<IBib>{
        return this.httpClient.get<IBib>(`${this.bibMain}/getbibentrybyid/${id}`)
        .pipe(tap(data => console.log(`Bib entry with ID ${id}: ` + JSON.stringify(data))),
        catchError(this.errorHandler));
    }

    private errorHandler (error: HttpErrorResponse){
        let errorMessage = 'error';
        return throwError(() => errorMessage);
  }
}

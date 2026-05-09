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

  //POST BIB
  postBib(bib: IBib): Observable<IBib>{
      console.log('Posting bib: ' + JSON.stringify(bib));
      return this.httpClient.post<IBib>(`${this.bibMain}/postbibentry`, bib)
      .pipe(tap(data => console.log('Bib entry posted: ' + JSON.stringify(data))),
      catchError(this.errorHandler));
  }

  //PUT BIB
  putBib(bib: IBib): Observable<IBib>{
    console.log('Putting bib: ' + JSON.stringify(bib));
    return this.httpClient.put<IBib>(`${this.bibMain}/putbibentry`, bib)
    .pipe(tap(data => console.log('Saga updated: ' + JSON.stringify(data))),
    catchError(this.errorHandler));
  }

  //DELETE SAGA VERSION BY ID
  deleteBib(id: number): Observable<IBib>{
      console.log("request sent: " + `${this.bibMain}/deletebibentry/${id}`);
      return this.httpClient.delete<IBib>(`${this.bibMain}/deletebibentry/${id}`);
  }

  private errorHandler (error: HttpErrorResponse){
      let errorMessage = 'error';
      return throwError(() => errorMessage);
  }
}

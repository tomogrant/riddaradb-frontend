import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Injectable } from '@angular/core';
import { Observable, catchError, tap, throwError } from "rxjs";
import { IMs } from "./IMs";
import { IMsRepositoryVm } from "./IMsRepositoryVm";
import { IMsRepositoryDto } from "./IMsRepositoryDto";

@Injectable({
  providedIn: 'root'
})

export class MsService{

  msMain = '/api/ms';
  constructor(private httpClient: HttpClient){}

    getMsRepositories(): Observable<IMsRepositoryDto[]>{
        return this.httpClient.get<IMsRepositoryDto[]>(`${this.msMain}/getmsrepositories`)
        .pipe(tap(data => console.log('All MS repository data got: ' + JSON.stringify(data))),
        catchError(this.errorHandler));
    }

    //POST MS REPOSITORY
    postMsRepository(repo: IMsRepositoryDto): Observable<IMsRepositoryDto>{
        console.log('Posting repo: ' + JSON.stringify(repo));
        return this.httpClient.post<IMsRepositoryDto>(`${this.msMain}/postmsrepository`, repo)
        .pipe(tap(data => console.log('Repo posted: ' + JSON.stringify(data))),
        catchError(this.errorHandler));
    }

    //PUT MS REPOSITORY
    putMsRepository(repo: IMsRepositoryDto): Observable<IMsRepositoryVm>{
        console.log('Posting repo: ' + JSON.stringify(repo));
        return this.httpClient.put<IMsRepositoryVm>(`${this.msMain}/putmsrepository`, repo)
        .pipe(tap(data => console.log('Repo posted: ' + JSON.stringify(data))),
        catchError(this.errorHandler));
    }

    //DELETE MS REPOSITORY BY ID
    deleteMsRepository(id: number): Observable<IMsRepositoryDto>{
        console.log("request sent: " + `${this.msMain}/deletemsrepository/${id}`);
        return this.httpClient.delete<IMsRepositoryDto>(`${this.msMain}/deletemsrepository/${id}`);
    }

    //GET ALL MS ENTRIES
    getMsEntries(): Observable<IMs[]>{//Gets an observable of type IMS[]. Can be accessed and subscribed to by other classes to access data. 
        return this.httpClient.get<IMs[]>(`${this.msMain}/getmsentries`)
        .pipe(tap(data => console.log('All MS data got: ' + JSON.stringify(data))),
        catchError(this.errorHandler));
    }
  
    //GET MS ENTRY BY ID
    getMsEntryById(id: number): Observable<IMs>{
        return this.httpClient.get<IMs>(`${this.msMain}/getmsentrybyid/${id}`)
        .pipe(tap(data => console.log(`MS entry with ID ${id}: ` + JSON.stringify(data))),
        catchError(this.errorHandler));
    }
  
    //POST MS
    postMs(ms: IMs): Observable<IMs>{
        console.log('Posting MS: ' + JSON.stringify(ms));
        return this.httpClient.post<IMs>(`${this.msMain}/postmsentry`, ms)
        .pipe(tap(data => console.log('MS entry posted: ' + JSON.stringify(data))),
        catchError(this.errorHandler));
    }
  
    //PUT MS
    putMs(ms: IMs): Observable<IMs>{
      console.log('Putting MS: ' + JSON.stringify(ms));
      return this.httpClient.put<IMs>(`${this.msMain}/putmsentry`, ms)
      .pipe(tap(data => console.log('MS updated: ' + JSON.stringify(data))),
      catchError(this.errorHandler));
    }
  
    //DELETE MS BY ID
    deleteMs(id: number): Observable<IMs>{
        console.log("request sent: " + `${this.msMain}/deletemsentry/${id}`);
        return this.httpClient.delete<IMs>(`${this.msMain}/deletemsentry/${id}`);
    }
  
    private errorHandler (error: HttpErrorResponse){
        let errorMessage = 'error';
        return throwError(() => errorMessage);
    }

}
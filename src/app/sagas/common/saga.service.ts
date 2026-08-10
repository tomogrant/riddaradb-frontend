import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Injectable } from '@angular/core';
import { ISagaResponseDto } from './ISagaResponseDto';
import { Observable, catchError, tap, throwError } from "rxjs";
import { ISagaRequestDto } from "./ISagaRequestDto";
import { ISagaVersionResponseDto } from "./ISagaVersionResponseDto";
import { ISagaVersionTitleDto } from "./ISagaVersionTitleDto";
import { ISagaTitleDto } from "./ISagaTitleDto";

@Injectable({
  providedIn: 'root'
})

export class SagaService {

  sagasMain = '/api/sagas';
  constructor(private httpClient: HttpClient){}

    //SAGAS
    
    //CREATE SAGA DTO
    postSaga(saga: ISagaRequestDto): Observable<ISagaResponseDto>{
        console.log('Posting saga: ' + JSON.stringify(saga));
        return this.httpClient.post<ISagaResponseDto>(`${this.sagasMain}/postsaga`, saga)
        .pipe(tap(data => console.log('Saga posted: ' + JSON.stringify(data))),
        catchError(this.errorHandler));
    }

    //READ ALL SAGA VMS
    getSagas(): Observable<ISagaResponseDto[]>{//Gets an observable of type ISaga[]. Can be accessed and subscribed to by other classes to access data. 
        return this.httpClient.get<ISagaResponseDto[]>(`${this.sagasMain}/getsagas`)
        .pipe(tap(data => console.log('All saga data got: ' + JSON.stringify(data))),
        catchError(this.errorHandler));
    }

    //READ SAGA VM BY ID
    getSagaById(id: number): Observable<ISagaResponseDto>{
        return this.httpClient.get<ISagaResponseDto>(`${this.sagasMain}/getsagabyid/${id}`)
        .pipe(tap(data => console.log(`Saga with ID ${id}: ` + JSON.stringify(data))),
        catchError(this.errorHandler));
    }

    getSagaTitles(): Observable<ISagaTitleDto[]>{
        return this.httpClient.get<ISagaTitleDto[]>(`${this.sagasMain}/getsagatitles`)
        .pipe(tap(data => console.log('All saga title data got: ' + JSON.stringify(data))),
        catchError(this.errorHandler));
    }

    //UPDATE SAGA DTO
    putSaga(saga: ISagaRequestDto): Observable<ISagaResponseDto>{
        console.log('Updating saga: ' + JSON.stringify(saga));
        return this.httpClient.put<ISagaResponseDto>(`${this.sagasMain}/putsaga`, saga)
        .pipe(tap(data => console.log('Saga updated: ' + JSON.stringify(data))),
        catchError(this.errorHandler));
    }

    //DELETE SAGA BY ID
    deleteSaga(id: number): Observable<ISagaResponseDto>{
        console.log("request sent: " + `${this.sagasMain}/deletesaga/${id}`);
        return this.httpClient.delete<ISagaResponseDto>(`${this.sagasMain}/deletesaga/${id}`);
    }

    //SAGA VERSIONS

    getSagaVersions(): Observable<ISagaVersionResponseDto[]>{
        return this.httpClient.get<ISagaVersionResponseDto[]>(`${this.sagasMain}/getsagaversions`)
        .pipe(tap(data => console.log('All saga version data got: ' + JSON.stringify(data))),
        catchError(this.errorHandler));
    }

    //READ SAGA VERSION BY ID
    getSagaVersionById(id: number): Observable<ISagaVersionResponseDto>{
        return this.httpClient.get<ISagaVersionResponseDto>(`${this.sagasMain}/getsagaversionbyid/${id}`)
        .pipe(tap(data => console.log(`Saga version with ID ${id}: ` + JSON.stringify(data))),
        catchError(this.errorHandler));
    }

    getSagaVersionTitles(): Observable<ISagaVersionTitleDto[]>{
        return this.httpClient.get<ISagaVersionTitleDto[]>(`${this.sagasMain}/getsagaversiontitles`)
        .pipe(tap(data => console.log('All saga version title data got: ' + JSON.stringify(data))),
        catchError(this.errorHandler));
    }

    private errorHandler (error: HttpErrorResponse){
        return throwError(() => error);
  }
}

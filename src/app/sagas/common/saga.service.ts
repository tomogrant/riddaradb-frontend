import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Injectable } from '@angular/core';
import { ISagaVm } from './ISagaVm';
import { Observable, catchError, tap, throwError } from "rxjs";
import { ISagaVersionRequestDto } from "./ISagaVersionRequestDto";
import { ISagaDto } from "./ISagaDto";
import { ISagaVersionResponseDto } from "./ISagaVersionResponseDto";

@Injectable({
  providedIn: 'root'
})

export class SagaService {

  sagasMain = '/api/sagas';
  constructor(private httpClient: HttpClient){}

    //SAGAS
    
    //CREATE SAGA DTO
    postSaga(saga: ISagaDto): Observable<ISagaDto>{
        console.log('Posting saga: ' + JSON.stringify(saga));
        return this.httpClient.post<ISagaDto>(`${this.sagasMain}/postsaga`, saga)
        .pipe(tap(data => console.log('Saga posted: ' + JSON.stringify(data))),
        catchError(this.errorHandler));
    }

    //READ ALL SAGA VMS
    getSagas(): Observable<ISagaVm[]>{//Gets an observable of type ISaga[]. Can be accessed and subscribed to by other classes to access data. 
        return this.httpClient.get<ISagaVm[]>(`${this.sagasMain}/getsagas`)
        .pipe(tap(data => console.log('All saga data got: ' + JSON.stringify(data))),
        catchError(this.errorHandler));
    }

    //READ SAGA VM BY ID
    getSagaById(id: number): Observable<ISagaVm>{
        return this.httpClient.get<ISagaVm>(`${this.sagasMain}/getsagabyid/${id}`)
        .pipe(tap(data => console.log(`Saga with ID ${id}: ` + JSON.stringify(data))),
        catchError(this.errorHandler));
    }

    //UPDATE SAGA DTO
    putSaga(saga: ISagaDto): Observable<ISagaDto>{
        console.log('Updating saga: ' + JSON.stringify(saga));
        return this.httpClient.put<ISagaDto>(`${this.sagasMain}/putsaga`, saga)
        .pipe(tap(data => console.log('Saga posted: ' + JSON.stringify(data))),
        catchError(this.errorHandler));
    }

    //DELETE SAGA BY ID
    deleteSaga(id: number): Observable<ISagaDto>{
        console.log("request sent: " + `${this.sagasMain}/deletesaga/${id}`);
        return this.httpClient.delete<ISagaDto>(`${this.sagasMain}/deletesaga/${id}`);
    }

    //SAGA VERSIONS

    //CREATE SAGA VERSION
    postSagaVersion(sagaVersion: ISagaVersionRequestDto): Observable<ISagaVersionRequestDto>{
        console.log('Posting saga version: ' + JSON.stringify(sagaVersion));
        return this.httpClient.post<ISagaVersionRequestDto>(`${this.sagasMain}/postsagaversion`, sagaVersion)
        .pipe(tap(data => console.log('Saga version posted: ' + JSON.stringify(data))),
        catchError(this.errorHandler));
    }

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

    //UPDATE SAGA VERSION DTO
    putSagaVersion(sagaVersion: ISagaVersionRequestDto): Observable<ISagaVersionRequestDto>{
        console.log('Updating saga version: ' + JSON.stringify(sagaVersion));
        return this.httpClient.put<ISagaVersionRequestDto>(`${this.sagasMain}/putsagaversion`, sagaVersion)
        .pipe(tap(data => console.log('Saga version put: ' + JSON.stringify(data))),
        catchError(this.errorHandler));
    }


    //DELETE SAGA VERSION BY ID
    deleteSagaVersion(id: number): Observable<ISagaVersionRequestDto>{
        console.log("request sent: " + `${this.sagasMain}/deletesagaversion/${id}`);
        return this.httpClient.delete<ISagaVersionRequestDto>(`${this.sagasMain}/deletesagaversion/${id}`);
    }

    private errorHandler (error: HttpErrorResponse){
        let errorMessage = 'error';
        return throwError(() => errorMessage);
  }
}

import { Injectable, inject } from '@angular/core';
import { Observable, catchError, throwError, tap } from 'rxjs';
import { IMotif } from './IMotif';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})

export class MotifService {
    httpClient = inject(HttpClient);
    motifMain = '/api/motifs';


    //CREATE MOTIF
    postMotif(motif: IMotif): Observable<IMotif>{
        return this.httpClient.post<IMotif>(`${this.motifMain}/postmotif`, motif)
        .pipe(tap(motif => console.log('Motif posted: ' + JSON.stringify(motif))),
        catchError(this.errorHandler));
    }

    //READ ALL MOTIFS
    getMotifs(): Observable<IMotif[]>{
        return this.httpClient.get<IMotif[]>(`${this.motifMain}/getmotifs`)
        .pipe(tap(motifs => console.log('Motif posted: ' + JSON.stringify(motifs))),
        catchError(this.errorHandler));
    }

    //READ ROOT MOTIFS
    getRootMotifs(): Observable<IMotif[]>{
        return this.httpClient.get<IMotif[]>(`${this.motifMain}/getrootmotifs`)
        .pipe(tap(motifs => console.log('Root motifs returned: ' + JSON.stringify(motifs))),
        catchError(this.errorHandler));
    }

    //READ CHILD MOTIFS
    getChildren(id: number): Observable<IMotif[]>{
        return this.httpClient.get<IMotif[]>(`${this.motifMain}/getchildmotifsbyid/${id}`)
        .pipe(tap(motifs => console.log('Child motifs of ID ' + id + ': ' + JSON.stringify(motifs))),
        catchError(this.errorHandler));
    }

    //UPDATE MOTIF
    updateMotif(motif: IMotif): Observable<IMotif>{
        return this.httpClient.put<IMotif>(`${this.motifMain}/putmotif`, motif)
        .pipe(tap(motif => console.log('Motif put: ' + JSON.stringify(motif))),
        catchError(this.errorHandler));
    }


    //DELETE MOTIF BY ID
    deleteMotif(id: number): Observable<IMotif>{
        console.log("request sent: " + `${this.motifMain}/deletemotif/${id}`);
        return this.httpClient.delete<IMotif>(`${this.motifMain}/deletemotif/${id}`);
    }

        private errorHandler (error: HttpErrorResponse){
        return throwError(() => error);
  }


}
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})

export class SagasService {

  sagasMain = 'http://localhost:8000/getsagas';

  constructor(private http: HttpClient) {}
    getSagas(){
      return this.http.get(this.sagasMain);
  }
}

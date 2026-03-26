import { Routes } from '@angular/router';
import { HomeComponent } from './home/home';
import { SagasAll } from './sagas/sagas-all/sagas-all';
import { SagasSingle } from './sagas/sagas-single/sagas-single';
import { BibAll } from './bib/bib-all/bib-all';
import { BibSingle } from './bib/bib-single/bib-single';

export const routes: Routes = [
    { path: '', component: HomeComponent, pathMatch: 'full' },
    { path: 'sagas-all', component: SagasAll },
    { path: 'sagas-single/:id', component: SagasSingle },
    { path: 'bib-all', component: BibAll },
    { path: 'bib-single/:id', component: BibSingle },
];

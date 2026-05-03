import { Routes } from '@angular/router';
import { HomeComponent } from './home/home';
import { SagasAll } from './sagas/sagas-all/sagas-all';
import { SagasSingle } from './sagas/sagas-single/sagas-single';
import { BibAll } from './bib/bib-all/bib-all';
import { BibSingle } from './bib/bib-single/bib-single';

export const routes: Routes = [
    { path: 'home', component: HomeComponent, pathMatch: 'full' },
    { path: 'sagas', component: SagasAll },
    { path: 'sagas/:id', component: SagasSingle },
    { path: 'bib', component: BibAll },
    { path: 'bib/:id', component: BibSingle },
    { path: 'bib/action/:mode', component: BibSingle }
];

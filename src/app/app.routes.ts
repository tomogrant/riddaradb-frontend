import { Routes } from '@angular/router';
import { HomeComponent } from './home/home';
import { SagasComponent } from './sagas/sagas';
import { BibComponent } from './bib entries/bib';
import { BibEntryComponent } from './bib-entry/bib-entry.component';

export const routes: Routes = [
    { path: '', component: HomeComponent, pathMatch: 'full' },
    { path: 'sagas', component: SagasComponent },
    { path: 'bib/:id', component: BibEntryComponent },
    { path: 'bibentries', component: BibComponent }
];

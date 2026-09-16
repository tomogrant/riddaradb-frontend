import { Routes } from '@angular/router';
import { HomeComponent } from './home/home';
import { SagasAll } from './sagas/sagas-all/sagas-all';
import { SagasSingle } from './sagas/sagas-single/sagas-single';
import { BibAll } from './bib/bib-all/bib-all';
import { BibSingle } from './bib/bib-single/bib-single';
import { MotifsAll } from './motifs/motifs-all/motifs-all';
import { MsAll } from './ms/ms-all/ms-all';
import { MsSingle } from './ms/ms-slngle/ms-single';
import { Characters } from './characters/characters';
import { Locations } from './locations/locations';

export const routes: Routes = [
    { path: 'home', component: HomeComponent, title: 'riddaraDB - Home' },
    { path: '', redirectTo: '/home', pathMatch: 'full' },
    { path: 'sagas', component: SagasAll, title: 'riddaraDB - Sagas' },
    { path: 'sagas/:id', component: SagasSingle },
    { path: 'sagas/action/:mode', component: SagasSingle, title: 'riddaraDB - Sagas'},
    { path: 'bib', component: BibAll, title: 'riddaraDB - Bibliography' },
    { path: 'bib/:id', component: BibSingle, title: 'riddaraDB - Bibliography entry' },
    { path: 'bib/action/:mode', component: BibSingle, title: 'riddaraDB - Bibliography' },
    { path: 'motifs', component: MotifsAll, title: 'riddaraDB - Folkloric motifs' },
    { path: 'motifs/:searchterm', component: MotifsAll, title: 'riddaraDB - Folkloric motifs' },
    { path: 'ms', component: MsAll, title: 'riddaraDB - Manuscripts'},
    { path: 'ms/:id', component: MsSingle, title: 'riddaraDB - Manuscript entry'},
    { path: 'ms/action/:mode/:repoid', component: MsSingle, title: 'riddaraDB - Manuscripts'},
    { path: 'characters', component: Characters, title: 'riddaraDB - Characters'},
    { path: 'locations', component: Locations, title: 'riddaraDB - Locations'},
];

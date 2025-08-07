import { Routes } from '@angular/router';
import { HomeComponent } from './home/home';
import { SagasComponent } from './sagas/sagas';

export const routes: Routes = [
    { path: '', component: HomeComponent, pathMatch: 'full' },
    { path: 'sagas', component: SagasComponent }
];

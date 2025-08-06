import { Routes } from '@angular/router';
import { Home } from './home/home';
import { Sagas } from './sagas/sagas';

export const routes: Routes = [
    {path: 'home', component: Home},
    {path: 'sagas', component: Sagas}
];

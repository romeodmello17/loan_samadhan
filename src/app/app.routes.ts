import { Routes } from '@angular/router';
import { App } from './app';
import { EmiCalculator } from './emi-calculator/emi-calculator';
import { Home } from './home/home';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'emicalculator', component: EmiCalculator },
];

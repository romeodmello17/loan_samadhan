import { Routes } from '@angular/router';
import { App } from './app';
import { EmiCalculator } from './emi-calculator/emi-calculator';
import { Home } from './home/home';
import { LeadForm } from './lead-form/lead-form';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'emicalculator', component: EmiCalculator },
  { path: 'leadform', component: LeadForm },
  { path: '**', component: App },
];

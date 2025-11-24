import { Component } from '@angular/core';
import { Hero } from '../hero/hero';
import { TopServices } from '../top-services/top-services';
import { EmiSection } from '../emi-section/emi-section';

@Component({
  selector: 'app-home',
  imports: [Hero, TopServices,EmiSection],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {}

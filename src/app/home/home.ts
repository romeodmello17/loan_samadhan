import { Component } from '@angular/core';
import { Hero } from '../hero/hero';
import { TopServices } from '../top-services/top-services';
import { EmiSection } from '../emi-section/emi-section';
import { Whyus } from '../whyus/whyus';

@Component({
  selector: 'app-home',
  imports: [Hero, TopServices,EmiSection,Whyus],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {}

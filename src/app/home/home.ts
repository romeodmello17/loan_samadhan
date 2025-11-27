import { Component } from '@angular/core';
import { Hero } from '../hero/hero';
import { TopServices } from '../top-services/top-services';
import { EmiSection } from '../emi-section/emi-section';
import { Whyus } from '../whyus/whyus';
import { LeadForm } from '../lead-form/lead-form';

@Component({
  selector: 'app-home',
  imports: [Hero, TopServices,EmiSection,Whyus,LeadForm],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {}

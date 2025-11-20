import { Component } from '@angular/core';
import { Hero } from '../hero/hero';
import { TopServices } from '../top-services/top-services';

@Component({
  selector: 'app-home',
  imports: [Hero, TopServices],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {}

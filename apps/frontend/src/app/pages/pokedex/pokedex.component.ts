import { Component } from '@angular/core';
import { TrainerComponent } from '@pages/trainer/trainer.component';
import { CardsListComponent } from '@shared/cards-list/cards-list.component';

@Component({
  selector: 'app-pokedex',
  imports: [CardsListComponent, TrainerComponent],
  templateUrl: './pokedex.component.html',
  styleUrl: './pokedex.component.scss',
})
export class PokedexComponent {}

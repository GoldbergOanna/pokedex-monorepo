import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '@core/auth/service/auth.service';

@Component({
  selector: 'app-trainer',
  imports: [CommonModule],
  templateUrl: './trainer.component.html',
  styleUrl: './trainer.component.scss',
})
export class TrainerComponent {
  private auth = inject(AuthService);
  // readonly name = computed(() => this.auth.user()?.name ?? 'Trainer');
  readonly name = computed(() => 'Trainer');
}

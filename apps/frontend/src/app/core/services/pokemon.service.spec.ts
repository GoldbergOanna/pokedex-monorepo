import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { AuthService } from '@core/auth/service/auth.service';
import { PokemonService } from './pokemon.service';

const API = 'http://localhost:3000';
const page = (owned: boolean) => ({
  data: [{ id: 6, name: 'Charizard', type: ['Fire'], sprite: '', owned }],
  page: 1,
  totalPages: 1,
  totalCount: 1,
});

describe('PokemonService', () => {
  let service: PokemonService;
  let http: HttpTestingController;
  let token: string | null;

  beforeEach(() => {
    token = 'token-user-a';
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: { getAccessToken: () => token } },
      ],
    });
    service = TestBed.inject(PokemonService);
    http = TestBed.inject(HttpTestingController);
    // Initial page request made by the constructor.
    http.expectOne((r) => r.url === `${API}/pokedex`).flush(page(false));
  });

  afterEach(() => http.verify());

  it('sends only one toggle request when clicked twice quickly', () => {
    service.toggleOwnership(6).subscribe();
    service.toggleOwnership(6).subscribe();

    const requests = http.match(`${API}/me/collection/6/toggle`);
    expect(requests.length).toBe(1);
    expect(service.isToggling(6)).toBe(true);

    requests[0].flush({ owned: true, updated: [6] });
    expect(service.isToggling(6)).toBe(false);
  });

  it('resets loading when a page request is cancelled', () => {
    service.updateQuery({ search: 'char' });
    expect(service.loading()).toBe(true);

    // Back to the cached query: switchMap cancels the in-flight request.
    service.updateQuery({ search: undefined });
    expect(http.expectOne((r) => r.params.get('search') === 'char').cancelled).toBe(true);
    expect(service.loading()).toBe(false);
  });

  it('does not reuse cached pages from a previous user', () => {
    token = 'token-user-b';
    service.updateQuery({ page: 1, limit: 20 });

    http.expectOne((r) => r.url === `${API}/pokedex`).flush(page(true));
    expect(service.pokemons()[0].owned).toBe(true);
  });
});

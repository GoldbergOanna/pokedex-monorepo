import { Injectable, signal, computed, inject, effect } from '@angular/core';
import { ApiService } from '@core/api/api.service';
import {
  QueryParams,
  type Pokemon,
  type PokemonSummary,
  type PokemonPageResponse,
} from './pokemon.model';
import { BehaviorSubject, Observable, of, switchMap, tap } from 'rxjs';
import { HttpParams } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class PokemonService {
  private api = inject(ApiService);

  // State
  loading = signal(false);
  pokemons = signal<PokemonSummary[]>([]);
  totalPages = signal(1);
  totalCount = signal(0);
  currentpage = signal(1);

  //in-memory cache
  private cache = new Map<string, PokemonPageResponse>();

  // subbject for manual triggers is needed
  private _quesry$ = new BehaviorSubject<QueryParams>({ page: 1, limit: 20 });

  readonly state$ = this._quesry$.pipe(
    switchMap((params) => this.fetchPage(params)),
  );

  constructor() {
    //keep the signals in sync with stream
    this.state$.subscribe((pageData) => {
      this.pokemons.set(pageData.data);
      this.totalPages.set(pageData.totalPages);
      this.totalCount.set(pageData.totalCount);
      this.currentpage.set(pageData.page);
    });
  }

  //method to update query params
  updateQuery(params: QueryParams) {
    const currentParams = this._quesry$.value;
    const newParams = { ...currentParams, ...params };
    this._quesry$.next(newParams);
  }

  //fetch page with caching
  fetchPage(params: QueryParams): Observable<PokemonPageResponse> {
    const query = JSON.stringify(params);
    const cached = this.cache.get(query);
    if (cached) {
      return of(cached);
    }

    this.loading.set(true);
    const httpParams = new HttpParams({
      fromObject: params as Record<string, string | number | boolean>,
    });
    return this.api
      .get<PokemonPageResponse>('pokedex', { params: httpParams })
      .pipe(
        tap((res) => {
          this.loading.set(false);
          this.cache.set(query, res);
        }),
      );
  }

  getById(id: number) {
    this.loading.set(true);
    return this.api.get<Pokemon>(`pokedex/${id}`).pipe(
      tap({
        next: () => this.loading.set(false),
        error: () => this.loading.set(false),
      }),
    );
  }

  toggleOwnership(id: number) {
    return this.api
      .post<{
        owned: boolean;
        updated: number[];
      }>(`me/collection/${id}/toggle`, {})
      .pipe(
        tap({
          next: ({ owned, updated }) => {
            this.loading.set(false);
            this.pokemons.update((list) =>
              list.map((p) => (updated.includes(p.id) ? { ...p, owned } : p)),
            );
            [...this.cache.entries()].forEach(([k, v]) =>
              this.cache.set(k, {
                ...v,
                data: v.data.map((p) =>
                  updated.includes(p.id) ? { ...p, owned } : p,
                ),
              }),
            );
          },
          error: (err) => {
            this.loading.set(false);
            console.error('Toggle ownership failed', err);
          },
        }),
      );
  }

  private buildQuery(params: QueryParams): string {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value.toString());
      }
    });
    return searchParams.toString();
  }

  clearCache() {
    this.cache.clear();
  }
}

import { Injectable, signal, inject } from '@angular/core';
import { ApiService } from '@core/api/api.service';
import type {
  QueryParams,
  Pokemon,
  PokemonSummary,
  PokemonPageResponse,
} from '@pokedex/shared-types';
import { BehaviorSubject, Observable, of, switchMap, tap } from 'rxjs';
import { HttpParams } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class PokemonService {
  private api = inject(ApiService);

  loading = signal(false);
  pokemons = signal<PokemonSummary[]>([]);
  totalPages = signal(1);
  totalCount = signal(0);
  currentpage = signal(1);

  private cache = new Map<string, PokemonPageResponse>();
  private _quesry$ = new BehaviorSubject<QueryParams>({ page: 1, limit: 20 });

  readonly state$ = this._quesry$.pipe(
    switchMap((params) => this.fetchPage(params)),
  );

  constructor() {
    this.state$.subscribe((pageData) => {
      this.pokemons.set(pageData.data);
      this.totalPages.set(pageData.totalPages);
      this.totalCount.set(pageData.totalCount);
      this.currentpage.set(pageData.page);
    });
  }

  updateQuery(params: QueryParams) {
    const currentParams = this._quesry$.value;
    const newParams = { ...currentParams, ...params };
    this._quesry$.next(newParams);
  }

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
        tap({
          next: (res) => {
            this.loading.set(false);
            this.cache.set(query, res);
          },
          error: () => {
            this.loading.set(false);
          },
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

  clearCache() {
    this.cache.clear();
  }
}

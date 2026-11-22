import { Injectable, signal, inject } from '@angular/core';
import { ApiService } from '@core/api/api.service';
import { AuthService } from '@core/auth/service/auth.service';
import type {
  QueryParams,
  Pokemon,
  PokemonSummary,
  PokemonPageResponse,
} from '@pokedex/shared-types';
import {
  BehaviorSubject,
  EMPTY,
  Observable,
  defer,
  finalize,
  of,
  switchMap,
  tap,
} from 'rxjs';
import { HttpParams } from '@angular/common/http';

type PokemonWithOwnership = Pokemon & { owned: boolean };
type ToggleOwnershipResponse = { owned: boolean; updated: number[] };

@Injectable({ providedIn: 'root' })
export class PokemonService {
  private api = inject(ApiService);
  private auth = inject(AuthService);

  loading = signal(false);
  pokemons = signal<PokemonSummary[]>([]);
  totalPages = signal(1);
  totalCount = signal(0);
  currentpage = signal(1);

  private readonly togglingIds = signal<ReadonlySet<number>>(new Set());

  private cache = new Map<string, PokemonPageResponse>();
  // The cache holds per-user ownership, so it is only valid for one session.
  private cacheSessionToken: string | null = null;
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
    const cacheKey = JSON.stringify(params);
    const cached = this.readCache(cacheKey);
    return cached ? of(cached) : this.requestPage(params, cacheKey);
  }

  getById(id: number) {
    return this.api.get<PokemonWithOwnership>(`pokedex/${id}`);
  }

  isToggling(id: number): boolean {
    return this.togglingIds().has(id);
  }

  toggleOwnership(id: number): Observable<ToggleOwnershipResponse> {
    return defer(() => {
      // Ignore repeat clicks while a toggle for this Pokémon is in flight.
      if (this.isToggling(id)) return EMPTY;

      this.setToggling(id, true);
      return this.api
        .post<ToggleOwnershipResponse>(`me/collection/${id}/toggle`, {})
        .pipe(
          tap({
            next: ({ owned, updated }) => this.applyOwnership(updated, owned),
            error: (err) => console.error('Toggle ownership failed', err),
          }),
          finalize(() => this.setToggling(id, false)),
        );
    });
  }

  private requestPage(
    params: QueryParams,
    cacheKey: string,
  ): Observable<PokemonPageResponse> {
    const httpParams = new HttpParams({
      fromObject: params as Record<string, string | number | boolean>,
    });
    return defer(() => {
      this.loading.set(true);
      return this.api.get<PokemonPageResponse>('pokedex', {
        params: httpParams,
      });
    }).pipe(
      tap((res) => this.cache.set(cacheKey, res)),
      // Runs on success, error and cancellation (switchMap), so loading never sticks.
      finalize(() => this.loading.set(false)),
    );
  }

  private readCache(cacheKey: string): PokemonPageResponse | undefined {
    const sessionToken = this.auth.getAccessToken();
    if (sessionToken !== this.cacheSessionToken) {
      this.cache.clear();
      this.cacheSessionToken = sessionToken;
    }
    return this.cache.get(cacheKey);
  }

  private applyOwnership(updatedIds: number[], owned: boolean) {
    const withOwnership = (p: PokemonSummary) =>
      updatedIds.includes(p.id) ? { ...p, owned } : p;

    this.pokemons.update((list) => list.map(withOwnership));
    for (const [key, page] of this.cache) {
      this.cache.set(key, { ...page, data: page.data.map(withOwnership) });
    }
  }

  private setToggling(id: number, isToggling: boolean) {
    this.togglingIds.update((ids) => {
      const next = new Set(ids);
      if (isToggling) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  }
}

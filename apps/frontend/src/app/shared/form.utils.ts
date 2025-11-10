import { FormGroup } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  debounceTime,
  distinctUntilChanged,
  map,
  startWith,
} from 'rxjs/operators';

export const normalizeFormValues = <T extends Record<string, unknown>>(
  values: T,
): T => {
  return Object.fromEntries(
    Object.entries(values).map(([key, value]) => [key, value ?? undefined]),
  ) as T;
};

export function formToSignal<T extends Record<string, unknown>>(
  form: FormGroup,
  options?: { debounceMs?: number; equals?: (a: T, b: T) => boolean },
) {
  const debounceMs = options?.debounceMs ?? 400;
  const equals =
    options?.equals ?? ((a, b) => JSON.stringify(a) === JSON.stringify(b));
  const initialValue = normalizeFormValues(form.getRawValue() as T);

  return toSignal(
    form.valueChanges.pipe(
      startWith(form.getRawValue() as T),
      debounceTime(debounceMs),
      distinctUntilChanged(equals),
      map((value) => normalizeFormValues(value)),
    ),
    { initialValue },
  );
}

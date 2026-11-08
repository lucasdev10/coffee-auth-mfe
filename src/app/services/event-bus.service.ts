import { Injectable } from '@angular/core';
import { fromEvent, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * Represents a custom event emitted between MFEs.
 */
export interface MFECustomEvent<
  T extends Record<string, unknown> | null | undefined = Record<string, unknown>,
> {
  /** Event type identifier (e.g., 'auth:login', 'auth:logout') */
  type: string;
  /** Event payload */
  detail: T;
  /** Unix timestamp (ms) when the event was emitted */
  timestamp: number;
  /** Source MFE name */
  source: string;
}

/**
 * EventBusService — Auth MFE local implementation.
 *
 * Mirrors the Shell App's EventBusService interface so that, at runtime, the
 * singleton instance provided by Module Federation can be injected transparently.
 * When running standalone (e.g., in unit tests or without the Shell), this local
 * implementation emits the same window CustomEvents directly.
 *
 * Events emitted by the Auth MFE:
 *   - "auth:login"  — fired after a successful login or registration.
 *   - "auth:logout" — fired after a successful logout.
 */
@Injectable({ providedIn: 'root' })
export class EventBusService {
  /**
   * Emits a custom event on the global window object.
   *
   * @param eventType - Event identifier (e.g., 'auth:login')
   * @param detail    - Event payload
   * @param source    - Name of the MFE emitting the event
   */
  emit<T extends Record<string, unknown> | null | undefined>(
    eventType: string,
    detail: T,
    source: string,
  ): void {
    const mfeEvent: MFECustomEvent<T> = {
      type: eventType,
      detail,
      timestamp: Date.now(),
      source,
    };

    window.dispatchEvent(
      new CustomEvent(eventType, {
        detail: mfeEvent,
        bubbles: true,
        cancelable: true,
      }),
    );
  }

  /**
   * Listens for custom events emitted on the global window object.
   *
   * @param eventType - Event identifier to listen for
   * @returns Observable that emits typed MFECustomEvent objects
   */
  listen<T extends Record<string, unknown> | null | undefined = Record<string, unknown>>(
    eventType: string,
  ): Observable<MFECustomEvent<T>> {
    return fromEvent<CustomEvent<MFECustomEvent<T>>>(window, eventType).pipe(
      map((event) => event.detail),
    );
  }
}

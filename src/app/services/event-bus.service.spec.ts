import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { take } from 'rxjs/operators';
import { EventBusService, MFECustomEvent } from './event-bus.service';

describe('EventBusService', () => {
  let service: EventBusService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EventBusService);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should be created as a singleton', () => {
    const service2 = TestBed.inject(EventBusService);
    expect(service).toBe(service2);
  });

  describe('emit()', () => {
    it('should dispatch a CustomEvent on the window object', () => {
      const dispatchSpy = vi.spyOn(window, 'dispatchEvent');
      service.emit('auth:login', { user: { id: '1' }, token: 'abc' }, 'auth-mfe');

      expect(dispatchSpy).toHaveBeenCalledOnce();
      const [event] = dispatchSpy.mock.calls[0];
      expect(event).toBeInstanceOf(CustomEvent);
      expect((event as CustomEvent).type).toBe('auth:login');
    });

    it('should include the correct MFECustomEvent structure in event.detail', () => {
      const dispatchSpy = vi.spyOn(window, 'dispatchEvent');
      const detail = { user: { id: '42' }, token: 'tok-xyz' };

      service.emit('auth:login', detail, 'auth-mfe');

      const event = dispatchSpy.mock.calls[0][0] as CustomEvent<MFECustomEvent>;
      expect(event.detail.type).toBe('auth:login');
      expect(event.detail.source).toBe('auth-mfe');
      expect(event.detail.detail).toEqual(detail);
      expect(typeof event.detail.timestamp).toBe('number');
    });

    it('should dispatch event with bubbles: true and cancelable: true', () => {
      const dispatchSpy = vi.spyOn(window, 'dispatchEvent');
      service.emit('auth:logout', {}, 'auth-mfe');

      const event = dispatchSpy.mock.calls[0][0] as CustomEvent;
      expect(event.bubbles).toBe(true);
      expect(event.cancelable).toBe(true);
    });

    it('should include a numeric timestamp in the event detail', () => {
      const before = Date.now();
      const dispatchSpy = vi.spyOn(window, 'dispatchEvent');
      service.emit('auth:logout', {}, 'auth-mfe');
      const after = Date.now();

      const event = dispatchSpy.mock.calls[0][0] as CustomEvent<MFECustomEvent>;
      expect(event.detail.timestamp).toBeGreaterThanOrEqual(before);
      expect(event.detail.timestamp).toBeLessThanOrEqual(after);
    });
  });

  describe('listen()', () => {
    it('should receive events emitted via emit()', async () => {
      const detail = { user: { id: '1' }, token: 'my-token' };

      const received = await new Promise<MFECustomEvent<{ user: { id: string }; token: string }>>((resolve) => {
        service
          .listen<{ user: { id: string }; token: string }>('auth:login')
          .pipe(take(1))
          .subscribe((mfeEvent) => resolve(mfeEvent));

        service.emit('auth:login', detail, 'auth-mfe');
      });

      expect(received.type).toBe('auth:login');
      expect(received.detail).toEqual(detail);
      expect(received.source).toBe('auth-mfe');
    });

    it('should receive "auth:logout" events with empty payload', async () => {
      const received = await new Promise<MFECustomEvent>((resolve) => {
        service
          .listen('auth:logout')
          .pipe(take(1))
          .subscribe((mfeEvent) => resolve(mfeEvent));

        service.emit('auth:logout', {}, 'auth-mfe');
      });

      expect(received.type).toBe('auth:logout');
      expect(received.source).toBe('auth-mfe');
    });

    it('should not receive events of a different type', async () => {
      const received: MFECustomEvent[] = [];
      const sub = service.listen('auth:login').subscribe((e) => received.push(e));

      service.emit('auth:logout', {}, 'auth-mfe');
      service.emit('cart:item-added', { productId: '1' }, 'cart-mfe');

      // Small delay to let any spurious events arrive
      await new Promise((r) => setTimeout(r, 50));
      expect(received).toHaveLength(0);
      sub.unsubscribe();
    });
  });
});

import 'zone.js';
import 'zone.js/testing';
import { getTestBed } from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting,
} from '@angular/platform-browser-dynamic/testing';
// resolveComponentResources is exported as an internal API (ɵ-prefixed) in Angular 21+
// It is needed to resolve external templateUrl/styleUrl references in tests that
// run under vitest/jsdom without the full BrowserDynamic compilation pipeline.
import { ɵresolveComponentResources as resolveComponentResources } from '@angular/core';

// Resolve external templateUrl and styleUrl before any tests run.
beforeAll(async () => {
  await resolveComponentResources((url: string) =>
    fetch(url).catch(() => new Response('', { status: 200 })),
  );
});

// First, initialize the Angular testing environment.
getTestBed().initTestEnvironment(
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting(),
);

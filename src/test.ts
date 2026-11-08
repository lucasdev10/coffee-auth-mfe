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
// We return an empty Response for all URLs — components only need to be "resolved"
// (i.e., their resources fetched) to be usable in tests; the actual template
// content is replaced via TestBed.overrideComponent in each spec that needs
// rendering, so empty content here is intentional.
beforeAll(async () => {
  await resolveComponentResources(() =>
    Promise.resolve(new Response('', { status: 200 })),
  );
});

// First, initialize the Angular testing environment.
getTestBed().initTestEnvironment(
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting(),
);

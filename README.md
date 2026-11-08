# coffee-auth-mfe

Auth Micro Frontend for the CoffeeWorkshop application.

## Overview

This MFE is responsible for authentication and authorization flows including:
- Login page (`/auth/login`)
- Register page (`/auth/register`)

It is part of the CoffeeWorkshop Micro Frontend architecture and runs independently on **port 4204**.

## Architecture

- **Type**: Remote (Module Federation)
- **Name**: `auth`
- **Port**: `4204`
- **Remote Entry**: `http://localhost:4204/remoteEntry.js`
- **Exposes**: `./Routes` → `AUTH_ROUTES`

## Prerequisites

- Node.js 20+
- Angular CLI 21+
- `coffee-shared-lib` built and available at `../coffee-shared-lib` (see below)

## Installation

### 1. Build the Shared Library

```bash
cd ../coffee-shared-lib
npm install
npm run build
```

### 2. Install Dependencies

```bash
cd coffee-auth-mfe
npm install --legacy-peer-deps
```

> **Note**: `--legacy-peer-deps` is required because this project uses `file:` protocol local dependencies (`coffee-shared-lib`), which can trigger a peer resolution bug in npm 10.x.

### 3. Start the MFE

```bash
npm start
```

The app will be available at `http://localhost:4204` with live-reload enabled.

## Available Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `npm start` | `ng serve --port 4204` | Serve on port 4204 with live-reload (development) |
| `npm run build` | `ng build` | Production build |
| `npm run build:prod` | `ng build --configuration production` | Explicit production build |
| `npm run watch` | `ng build --watch --configuration development` | Watch mode build |
| `npm run test` | `vitest --run` | Run unit tests (single run) |
| `npm run test:watch` | `vitest` | Run unit tests in watch mode |
| `npm run test:coverage` | `vitest --coverage --run` | Run tests with coverage report |
| `npm run lint` | `ng lint` | Run linting |

## Module Federation

This MFE is configured as a **remote** in the Module Federation setup:

```js
// webpack.config.js
{
  name: 'auth',
  filename: 'remoteEntry.js',
  exposes: {
    './Routes': './src/app/auth.routes.ts',
  }
}
```

The Shell App loads this MFE dynamically via:

```typescript
loadRemoteModule({
  type: 'module',
  remoteEntry: 'http://localhost:4204/remoteEntry.js',
  exposedModule: './Routes',
}).then((m) => m.AUTH_ROUTES)
```

## Port Assignments

All MFEs in the CoffeeWorkshop architecture run on fixed ports:

| Application | Port | Remote Entry URL |
|-------------|------|-----------------|
| Shell App (CoffeeWorkshop) | 4200 | N/A (host) |
| Products MFE (coffee-products-mfe) | 4201 | `http://localhost:4201/remoteEntry.js` |
| Cart MFE (coffee-cart-mfe) | 4202 | `http://localhost:4202/remoteEntry.js` |
| Admin MFE (coffee-admin-mfe) | 4203 | `http://localhost:4203/remoteEntry.js` |
| **Auth MFE (coffee-auth-mfe)** | **4204** | **`http://localhost:4204/remoteEntry.js`** |
| User MFE (coffee-user-mfe) | 4205 | `http://localhost:4205/remoteEntry.js` |

## Shared Library Dependency

This MFE uses `coffee-shared-lib` for shared components, pipes, directives, and utilities.

The library is referenced as a local file dependency:

```json
"coffee-shared-lib": "file:../coffee-shared-lib"
```

Make sure to build the shared library before installing or running this MFE:

```bash
cd ../coffee-shared-lib
npm run build
```

Shared items used from the library:
- `FormErrorComponent` — displays form validation errors
- `EUserRole` — user role enum for auth state typing

## Environment Configuration

The MFE uses Angular environment files for environment-specific configuration:

| File | Usage |
|------|-------|
| `src/environments/environment.ts` | Development config |
| `src/environments/environment.prod.ts` | Production config |

Key environment variables:

```typescript
// environment.ts (development)
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000',
};
```

When running with the Shell App for integration testing, ensure the Shell's `webpack.config.js` points to `http://localhost:4204/remoteEntry.js` for the `auth` remote.

## Communication

### NgRx Store

- Reads from and dispatches to the Shell App's global NgRx store (auth slice)
- Auth state: `token`, `user`, `isAuthenticated`
- Dispatches global actions: `[Auth] Login Success`, `[Auth] Register Success`, `[Auth] Logout Success`

### Custom Events

- Emits `auth:login` event with `{ user, token }` on successful login or registration
- Emits `auth:logout` event on logout

Events are dispatched on `window`, allowing the Shell App and other MFEs to listen:

```typescript
window.addEventListener('auth:login', (event: CustomEvent) => {
  const { user, token } = event.detail;
});
```

## Development Workflow

### Standalone Development (no Shell required)

```bash
npm start
# Visit http://localhost:4204/auth/login
```

### Integration Development (with Shell App)

Start all MFEs, then start the Shell:

```bash
# Terminal 1 — Auth MFE
cd coffee-auth-mfe && npm start

# Terminal 2 — Other MFEs as needed
cd coffee-products-mfe && npm start

# Terminal 3 — Shell App
cd CoffeeWorkshop && npm start
# Visit http://localhost:4200
```

Or use the Shell App's `start:all` script to launch all MFEs simultaneously:

```bash
cd CoffeeWorkshop
npm run start:all
```

## Testing

Tests use [Vitest](https://vitest.dev/) with jsdom for DOM simulation.

```bash
# Single run
npm test

# Watch mode (for development)
npm run test:watch

# With coverage report (outputs to coverage/)
npm run test:coverage
```

Current test suite: **9 test files, 110 tests**

| Test File | Tests | Coverage |
|-----------|-------|---------|
| `auth.routes.spec.ts` | 5 | AUTH_ROUTES structure |
| `app.spec.ts` | 2 | AppComponent bootstrap |
| `event-bus.service.spec.ts` | 9 | EventBusService emit/listen |
| `auth.effects.spec.ts` | 19 | Login, register, logout, hydrate effects |
| `auth.facade.spec.ts` | 10 | AuthFacade dispatch/selector wiring |
| `auth.reducer.spec.ts` | 14 | State transitions for all actions |
| `auth.selectors.spec.ts` | 8 | All selectors |
| `login-page.spec.ts` | 18 | Form validation, submit, error display |
| `register-page.spec.ts` | 25 | Form validation, submit, error display |

## Troubleshooting

**MFE not loading in Shell App**
Ensure this MFE is running on port 4204 and `remoteEntry.js` is accessible:
```bash
curl http://localhost:4204/remoteEntry.js
```

**Shared library import errors**
Rebuild the shared library:
```bash
cd ../coffee-shared-lib && npm run build
```

**`npm install` fails with `Cannot read properties of null (reading 'edgesOut')`**
Use `--legacy-peer-deps`:
```bash
npm install --legacy-peer-deps
```

**Angular version mismatch**
Ensure all MFEs use Angular 21.x. Check with:
```bash
npx ng version
```

**Port 4204 already in use**
Find and kill the conflicting process:
```powershell
Get-NetTCPConnection -LocalPort 4204 -ErrorAction SilentlyContinue |
  Select-Object -ExpandProperty OwningProcess |
  ForEach-Object { Stop-Process -Id $_ -Force }
```

**Tests fail with `Failed to resolve entry for package "coffee-shared-lib"`**
Ensure `vitest.config.ts` has the `resolve.alias` for `coffee-shared-lib` pointing to the source `public-api.ts`:
```typescript
resolve: {
  alias: {
    'coffee-shared-lib': resolve(__dirname, '../coffee-shared-lib/projects/coffee-shared/src/public-api.ts'),
  },
}
```

## Project Structure

```
coffee-auth-mfe/
├── src/
│   ├── app/
│   │   ├── auth/
│   │   │   ├── pages/
│   │   │   │   ├── login-page/     # LoginPageComponent
│   │   │   │   └── register-page/  # RegisterPageComponent
│   │   │   └── store/              # AuthStore (NgRx: state, actions, reducers, selectors, effects)
│   │   ├── services/
│   │   │   └── event-bus.service.ts # Custom event emission
│   │   ├── auth.routes.ts           # AUTH_ROUTES (Module Federation exposed module)
│   │   └── app.config.ts            # Application configuration
│   ├── environments/
│   │   ├── environment.ts
│   │   └── environment.prod.ts
│   └── bootstrap.ts                 # Angular bootstrap entry point
├── webpack.config.js                # Module Federation configuration
├── angular.json                     # Angular workspace config
├── vitest.config.ts                 # Vitest test configuration
└── package.json
```

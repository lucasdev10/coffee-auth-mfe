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
- `coffee-shared-lib` built (see below)

## Setup

### 1. Build the Shared Library

```bash
cd ../coffee-shared-lib
npm install
npm run build
```

### 2. Install Dependencies

```bash
cd coffee-auth-mfe
npm install
```

### 3. Start the MFE

```bash
npm start
```

The app will be available at `http://localhost:4204`.

## Scripts

| Script | Description |
|--------|-------------|
| `npm start` | Serve on port 4204 (development) |
| `npm run build` | Production build |
| `npm run build:prod` | Explicit production build |
| `npm run test` | Run unit tests (single run) |
| `npm run test:watch` | Run unit tests in watch mode |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run lint` | Run linting |

## Shared Library Dependency

This MFE uses `coffee-shared-lib` for shared components, pipes, directives, and utilities.

The library is referenced as a local file dependency:
```json
"coffee-shared-lib": "file:../coffee-shared-lib"
```

Make sure to build the shared library before running this MFE.

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

## Communication

### NgRx Store
- Reads from and dispatches to the Shell App's global NgRx store (auth slice)
- Auth state: `token`, `user`, `isAuthenticated`

### Custom Events
- Emits `auth:login` event with `{ user, token }` on successful login
- Emits `auth:logout` event on logout

## Development Notes

- When developing standalone (without Shell), use `npm start`
- When testing with Shell, ensure Shell App is running on port 4200
- All MFEs must be running for full integration testing

## Troubleshooting

**MFE not loading in Shell**: Ensure this MFE is running on port 4204 and `remoteEntry.js` is accessible at `http://localhost:4204/remoteEntry.js`.

**Shared library import errors**: Rebuild the shared library with `npm run build` in `coffee-shared-lib`.

**Angular version mismatch**: Ensure all MFEs use Angular 21.x (check `package.json`).

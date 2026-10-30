const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin');
const mf = require('@angular-architects/module-federation/webpack');
const path = require('path');
const share = mf.share;

const moduleFederationConfig = {
  name: 'auth',
  filename: 'remoteEntry.js',
  exposes: {
    './Routes': './src/app/auth.routes.ts',
  },
  shared: share({
    '@angular/core': { singleton: true, strictVersion: false, requiredVersion: '21.1.0' },
    '@angular/common': { singleton: true, strictVersion: false, requiredVersion: '21.1.0' },
    '@angular/router': { singleton: true, strictVersion: false, requiredVersion: '21.1.0' },
    '@angular/forms': { singleton: true, strictVersion: false, requiredVersion: '21.1.0' },
    '@angular/material': { singleton: true, strictVersion: false, requiredVersion: '21.1.5' },
    '@ngrx/store': { singleton: true, strictVersion: false, requiredVersion: '21.0.1' },
    '@ngrx/effects': { singleton: true, strictVersion: false, requiredVersion: '21.0.1' },
    'rxjs': { singleton: true, strictVersion: false, requiredVersion: '7.8.0' },
    'coffee-shared-lib': { singleton: true, strictVersion: false },
  }),
};

module.exports = {
  output: {
    uniqueName: 'auth',
    publicPath: 'auto',
  },
  optimization: {
    runtimeChunk: false,
  },
  plugins: [
    new ModuleFederationPlugin(moduleFederationConfig),
  ],
};

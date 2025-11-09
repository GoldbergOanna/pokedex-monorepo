const { pathsToModuleNameMapper } = require('../../node_modules/ts-jest');

const { compilerOptions } = require('./tsconfig.json');

module.exports = {
  preset: 'jest-preset-angular',
  setupFilesAfterEnv: ['<rootDir>/setup-jest.cjs'],
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths || {}, {
    prefix: '<rootDir>/src/',
  }),
  testEnvironment: 'jsdom',
  transformIgnorePatterns: [
    'node_modules/(?!.*\\.mjs$|@angular|@ngrx|ngx-socket-io|zone.js)'
  ],
  modulePaths: ['<rootDir>/../../node_modules'],
};
// https://jestjs.io/docs/configuration
const config = {
  collectCoverage: true,
  collectCoverageFrom: ['lib/**/*.js'],
  coverageDirectory: 'coverage/',
  coveragePathIgnorePatterns: ['<rootDir>/node_modules/'],
  coverageThreshold: {
    global: {
      lines: 60
    }
  },

  errorOnDeprecated: true,

  globals: {},

  moduleFileExtensions: ['js', 'mjs'],

  testEnvironment: 'node',

  testMatch: [`<rootDir>/__tests__/**/*.test.{js,mjs}`],

  // jest-circus/runner is the default value for testRunner, but I keep it here to remember it.
  testRunner: 'jest-circus/runner',

  testTimeout: 5000,

  verbose: true
}

// console.log('=== Jest config ===', config)

module.exports = config

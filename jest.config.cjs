const config = {
  collectCoverage: true,
  // https://jestjs.io/docs/configuration#collectcoveragefrom-array
  collectCoverageFrom: ['lib/**/*.js'],
  coverageDirectory: 'coverage/',
  coveragePathIgnorePatterns: ['<rootDir>/node_modules/'],
  coverageThreshold: {
    global: {
      lines: 49
    }
  },

  // https://jestjs.io/docs/configuration#errorondeprecated-boolean
  errorOnDeprecated: true,

  globals: {},

  moduleFileExtensions: ['js', 'mjs'],

  // https://jestjs.io/docs/configuration#testenvironment-string
  testEnvironment: 'node',

  testMatch: [`<rootDir>/__tests__/**/*.test.{js,mjs}`],

  // jest-circus/runner is the default value for testRunner, but I keep it here to remember it.
  // https://jestjs.io/docs/configuration#testrunner-string
  testRunner: 'jest-circus/runner',

  // 5000ms is the default value for testTimeout.
  // https://jestjs.io/docs/configuration#testtimeout-number
  testTimeout: 5000,

  // https://jestjs.io/docs/configuration#verbose-boolean
  verbose: true
}

// console.log('=== Jest config ===', config)

module.exports = config

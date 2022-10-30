module.exports = {
  roots: ['.'],
  transform: {
    '^.+\\.ts$': [
      'ts-jest', {
        tsconfig: './tsconfig.test.json'
      }
    ],
  },
  testRegex: '\\.test\\.ts$',
  moduleFileExtensions: ['ts', 'js'],
  collectCoverageFrom: [
    'src/**/**.ts'
  ],
  coverageDirectory: 'coverage-report',
};

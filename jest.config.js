module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testRegex: undefined,
  testMatch: ["**/*.test.ts?(x)"],
  collectCoverageFrom: ["src/**/*.ts"],
  moduleNameMapper: {
    "@marionebl/result": "<rootDir>/src/index.ts"
  }
};

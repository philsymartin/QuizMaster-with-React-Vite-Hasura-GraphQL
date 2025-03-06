import type { Config } from 'jest';

const config: Config = {
  rootDir: "./",
  testEnvironment: "jsdom",
  transform: {
    "^.+\\.tsx?$": ["ts-jest", {}],
  },
  moduleNameMapper: {
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
    "^@redux/(.*)$": "<rootDir>/src/redux/$1",
    "^@services/(.*)$": "<rootDir>/src/services/$1",
    "^@mutations/(.*)$": "<rootDir>/src/mutations/$1"
  },
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  transformIgnorePatterns: ["node_modules/(?!(lucide-react)/)",
  ],
  testMatch: ["<rootDir>/src/__tests__/**/*.(test|spec).(ts|tsx)"],
};

export default config;
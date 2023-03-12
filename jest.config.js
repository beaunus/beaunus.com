/** @type {import('@jest/types').Config.InitialOptions} */
const config = {
  moduleFileExtensions: ["ts", "tsx", "js", "json", "jsx"],
  moduleNameMapper: { "@/(.*)$": "<rootDir>/src/$1" },
  testPathIgnorePatterns: ["<rootDir>[/\\\\](node_modules|.next)[/\\\\]"],
  transform: { "\\.[jt]sx?$": ["babel-jest", { presets: ["next/babel"] }] },
};

module.exports = config;

/**
 * @type {import('semantic-release').GlobalConfig}
 */

export default {
  branches: ["main"],
  plugins: [
    "@semantic-release/commit-analyzer",
    {
      preset: "conventionalcommits",
      releaseRules: [
        { type: "docs", scope: "README", release: "patch" },
        { type: "refactor", release: "patch" },
        { type: "style", release: "patch" },
      ],
    },
    "@semantic-release/release-notes-generator",
    [
      "@semantic-release/changelog",
      {
        changelogFile: "CHANGELOG.md",
      },
    ],
    "@semantic-release/npm",
    [
      "@semantic-release/git",
      {
        assets: ["CHANGELOG.md", "package.json"],
      },
    ],
    "@semantic-release/github",
  ],
};

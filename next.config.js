const isGithubActions = process.env.GITHUB_ACTIONS || false;

let assetPrefix;
let basePath;

if (isGithubActions) {
  const repo = "github-autocomplete-component";
  assetPrefix = `/${repo}/`;
  basePath = `/${repo}`;
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  assetPrefix: assetPrefix,
  basePath: basePath,
  reactStrictMode: true,
  swcMinify: true,
  compiler: {
    styledComponents: true,
  },
};

module.exports = nextConfig;

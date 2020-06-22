export function isPullRequest(): boolean {
  return (process.env.GITHUB_REF?.indexOf('refs/pull/') === 0);
}

export function isTag(): boolean {
  return (process.env.GITHUB_REF?.indexOf('refs/tags/') === 0);
}

export function isBuild(): boolean {
  return (process.env.GITHUB_REF?.indexOf('refs/heads/') === 0);
}

export function isPullRequest(): boolean {
  return (process.env.GITHUB_REF?.indexOf('refs/pull/') === 0);
}

export function isTag(): boolean {
  return (process.env.GITHUB_REF?.indexOf('refs/tags/') === 0);
}

export function isBuild(): boolean {
  return (process.env.GITHUB_REF?.indexOf('refs/heads/') === 0);
}

// GitHub only sets GITHUB_BASE_REF for forked repositories.
// See: https://help.github.com/en/actions/configuring-and-managing-workflows/using-environment-variables
export function isFork(): boolean {
  return (process.env.GITHUB_BASE_REF !== undefined);
}

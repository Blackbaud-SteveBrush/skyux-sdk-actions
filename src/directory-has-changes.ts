import { spawn } from './spawn';

export async function directoryHasChanges(dir: string) {

  const output = await spawn('git', ['status', dir, '--porcelain']);
  if (!output) {
    return false;
  }

  const result = output.trim();

  console.log('directoryHasChanges()?', output, result.indexOf('??'));

  // Untracked files are prefixed with '??'
  // Modified files are prefixed with 'M'
  // https://git-scm.com/docs/git-status/1.8.1#_output
  // https://stackoverflow.com/a/6978402/6178885
  return (
    result.indexOf('??') === 0 ||
    result.indexOf('M') === 0
  );
}
import { spawn } from './spawn';

export async function directoryHasChanges(dir: string) {

  console.log('BEFORE directoryHasChanges()');
  const output = await spawn('git', ['status', dir, '--porcelain']);
  if (!output) {
    return false;
  }

  console.log('directoryHasChanges() output before trim:', output);
  const result = output.trim();

  console.log('AFTER directoryHasChanges() -->', output, result.indexOf('??'));

  // Untracked files are prefixed with '??'
  // Modified files are prefixed with 'M'
  // https://git-scm.com/docs/git-status/1.8.1#_output
  // https://stackoverflow.com/a/6978402/6178885
  return (
    result.indexOf('??') === 0 ||
    result.indexOf('M') === 0
  );
}

import * as core from '@actions/core';
import spawn from 'cross-spawn';
import * as path from 'path';

export async function execute(command: string, args: string): Promise<string> {

  const childProcess = spawn(command, args.split(' '), {
    stdio: 'inherit',
    cwd: path.resolve(process.cwd(), core.getInput('working-directory'))
  });

  return new Promise((resolve) => {

    let output: string;
    if (childProcess.stdout) {
      childProcess.stdout.on('data', (data) => {
        output = data.toString('utf8');
      });
    }

    let errorMessage: string;
    if (childProcess.stderr) {
      childProcess.stderr.on('data', (data) => {
        errorMessage = data.toString('utf8');
      });
    }

    childProcess.on('error', (err) => {
      console.log('CHILD PROCESS ON ERROR:', err);
      throw err;
    });

    childProcess.on('exit', (code) => {
      if (code === 0) {
        console.log('EXECUTE OUTPUT:', output);
        resolve(output);
      } else {
        console.log('CHILD PROCESS STDERR:', errorMessage);
        throw new Error(errorMessage);
      }
    });
  });
}

import * as core from '@actions/core';
import { spawn } from 'cross-spawn';
import * as child_process from 'child_process';
import * as path from 'path';

export async function execute(command: string, args: string, config?: {
  spawnOptions: child_process.SpawnOptions
}): Promise<string> {

  let spawnOptions: child_process.SpawnOptions = {
    stdio: 'inherit',
    cwd: path.resolve(process.cwd(), core.getInput('working-directory'))
  };

  if (config && config.spawnOptions) {
    spawnOptions = {...spawnOptions, ...config.spawnOptions};
  }

  const childProcess = spawn(command, args.split(' '), spawnOptions);

  return new Promise((resolve, reject) => {

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
        reject(errorMessage);
      }
    });
  });
}
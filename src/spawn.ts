
import * as core from '@actions/core';
import { spawn as crossSpawn } from 'cross-spawn';
import * as path from 'path';

export async function spawn(command: string, args: string[] = []): Promise<string> {

  const childProcess = crossSpawn(command, args, {
    stdio: 'pipe',
    cwd: path.resolve(process.cwd(), core.getInput('working-directory'))
  });

  return new Promise((resolve, reject) => {

    let output: string;
    if (childProcess.stdout) {
      childProcess.stdout.on('data', (data) => {
        if (data) {
          const fragment = data.toString('utf8').trim();
          if (fragment) {
            console.log(fragment);
            output += fragment;
          }
        }
      });
    }

    let errorMessage: string;
    if (childProcess.stderr) {
      childProcess.stderr.on('data', (data) => {
        errorMessage = data.toString('utf8');
      });
    }

    childProcess.on('error', (err) => reject(err));

    childProcess.on('exit', (code) => {
      if (code === 0) {
        resolve(output);
      } else {
        reject(errorMessage);
      }
    });
  });
}
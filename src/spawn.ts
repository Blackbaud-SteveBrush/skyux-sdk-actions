
import * as core from '@actions/core';
import crossSpawn from 'cross-spawn';
import * as path from 'path';

export async function spawn(command: string, args: string[] = []): Promise<string> {
  const childProcess = crossSpawn.sync(command, args, {
    stdio: 'inherit',
    cwd: path.resolve(process.cwd(), core.getInput('working-directory'))
  });

  return Promise.resolve(childProcess.stdout.toString());

  // const spawn = require('child_process').spawn;
  // // Create a child process
  // var child = spawn(command , args, {
  //   stdio: 'inherit',
  //   cwd: path.resolve(process.cwd(), core.getInput('working-directory'))
  // });

  // return new Promise((resolve, reject) => {
  //   child.stdout.on('data', function (data: any) {
  //     console.log('ls command output: ' + data);
  //     resolve(data);
  //   });

  //   child.stderr.on('data', function (data: any) {
  //     //throw errors
  //     console.log('stderr: ' + data);
  //     reject(data);
  //   });

  //   child.on('close', function (code: any) {
  //     console.log('child process exited with code ' + code);
  //   });
  // });

  // const childProcess = crossSpawn(command, args, {
  //   stdio: 'inherit',
  //   cwd: path.resolve(process.cwd(), core.getInput('working-directory'))
  // });

  // return new Promise((resolve, reject) => {
  //   let output: string;
  //   if (childProcess.stdout) {
  //     console.log('There\'s an stdout!!!!!');
  //     childProcess.stdout.on('data', (data) => {
  //       output = data.toString('utf8');
  //       console.log('CHILD SPAWN OUTPUT!', output);
  //     });
  //   }

  //   let errorMessage: string;
  //   if (childProcess.stderr) {
  //     childProcess.stderr.on('data', (data) => {
  //       errorMessage = data.toString('utf8');
  //     });
  //   }

  //   childProcess.on('error', (err) => reject(err));

  //   childProcess.on('exit', (code) => {
  //     if (code === 0) {
  //       resolve(output);
  //     } else {
  //       reject(errorMessage);
  //     }
  //   });
  // });
}
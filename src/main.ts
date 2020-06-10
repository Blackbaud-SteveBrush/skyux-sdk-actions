import * as core from '@actions/core';
// import { checkScreenshots } from './visual-baselines';
import { spawn } from './spawn';

function runSkyUxCommand(command: string, args?: string[]): Promise<string> {
  return spawn('npx', [
    '-p', '@skyux-sdk/cli@next',
    'skyux', command,
    '--logFormat', 'none',
    '--platform', 'travis',
    ...args || ''
  ]);
}

async function installCerts(): Promise<void> {
  await runSkyUxCommand('certs', ['install']);
}

async function install(): Promise<void> {
  await spawn('npm', ['ci']);
  await spawn('npm', ['install', '--no-save', '--no-package-lock', 'blackbaud/skyux-sdk-builder-config']);
}

async function build() {
  await runSkyUxCommand('build');
}

async function coverage() {
  await runSkyUxCommand('test', ['--coverage', 'library']);
}

async function visual() {
  await runSkyUxCommand('e2e');
  // await checkScreenshots();

  // spawn('node', path.resolve(process.cwd(), './node_modules/@skyux-sdk/builder-config/scripts/visual-baselines.js'));
  // spawn('node', path.resolve(process.cwd(), './node_modules/@skyux-sdk/builder-config/scripts/visual-failures.js'));
}

async function buildLibrary() {
  await runSkyUxCommand('build-public-library');

  /**
   * const npmTag = 'latest';
   * npm publish --access public --tag $npmTag;
   * notifySlack();
   */
}

async function run(): Promise<void> {
  try {
    await install();
    await installCerts();
    await build();
    await coverage();
    await visual();
    await buildLibrary();
  } catch (error) {
    core.setFailed(error);
    console.log('ERROR:', error);
    process.exit(1);
  }
}

run();

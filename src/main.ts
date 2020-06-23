import * as core from '@actions/core';

import {
  spawn
} from './spawn';

import {
  checkNewBaselineScreenshots,
  checkNewFailureScreenshots
} from './screenshot-comparator';

import {
  isTag
} from './commit-type';

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
  try {
    await runSkyUxCommand('e2e');
    await checkNewBaselineScreenshots();
  } catch (err) {
    await checkNewFailureScreenshots();
    core.setFailed('End-to-end tests failed.');
  }
}

async function buildLibrary() {
  await runSkyUxCommand('build-public-library');
}

// async function publishLibrary() {
//   /**
//    * const npmTag = 'latest';
//    * npm publish --access public --tag $npmTag;
//    * notifySlack();
//    */
// }

async function run(): Promise<void> {
  // if (isFork()) {
  //   core.info('Builds not run during forked pull requests.');
  //   process.exit();
  // }

  // Set environment variables so that BrowserStack launcher can read them.
  process.env.BROWSER_STACK_ACCESS_KEY = core.getInput('browser-stack-access-key');
  process.env.BROWSER_STACK_USERNAME = core.getInput('browser-stack-username');
  process.env.BROWSER_STACK_PROJECT = core.getInput('browser-stack-project') || process.env.GITHUB_REPOSITORY;

  try {
    await install();
    await installCerts();
    await visual();
    await build();
    await coverage();
    await buildLibrary();

    if (isTag()) {
      // await publishLibrary();
    }

  } catch (error) {
    core.setFailed(error);
    process.exit(1);
  }
}

run();

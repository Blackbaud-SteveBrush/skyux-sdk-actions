import * as core from '@actions/core';

import {
  spawn
} from './spawn';

import {
  checkNewBaselineScreenshots,
  checkNewFailureScreenshots
} from './screenshot-comparator';

import {
  isBuild,
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
  try {
    await runSkyUxCommand('certs', ['install']);
  } catch (err) {
    core.setFailed('SSL certificates installation failed.');
  }
}

async function install(): Promise<void> {
  try {
    await spawn('npm', ['ci']);
    await spawn('npm', ['install', '--no-save', '--no-package-lock', 'blackbaud/skyux-sdk-builder-config']);
  } catch (err) {
    core.setFailed('Packages installation failed.');
  }
}

async function build() {
  try {
    await runSkyUxCommand('build');
  } catch (err) {
    core.setFailed('Build failed.');
  }
}

async function coverage() {
  try {
    await runSkyUxCommand('test', ['--coverage', 'library']);
  } catch (err) {
    core.setFailed('Code coverage failed.');
  }
}

async function visual() {
  try {
    await runSkyUxCommand('e2e');
    if (isBuild()) {
      await checkNewBaselineScreenshots();
    }
  } catch (err) {
    await checkNewFailureScreenshots();
    core.setFailed('End-to-end tests failed.');
  }
}

async function buildLibrary() {
  try {
    await runSkyUxCommand('build-public-library');
  } catch (err) {
    core.setFailed('Library build failed.');
  }
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

  await install();
  await installCerts();
  await visual();
  await build();
  await coverage();
  await buildLibrary();

  if (isTag()) {
    // await publishLibrary();
  }
}

run();

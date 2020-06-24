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
  isPullRequest,
  isTag
} from './commit-type';

function runSkyUxCommand(command: string, args?: string[]): Promise<string> {
  core.info(`
========================================
> Running SKY UX command: '${command}'
========================================
`);

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
  const repository = process.env.GITHUB_REPOSITORY || '';

  // Generate a random 9-digit number of GitHub's run ID is not defined.
  // See: https://stackoverflow.com/a/3437180/6178885
  const buildId = process.env.GITHUB_RUN_ID || Math.random().toString().slice(2,11);

  try {
    await runSkyUxCommand('e2e');
    if (isBuild()) {
      await checkNewBaselineScreenshots(repository, buildId);
    }
  } catch (err) {
    await checkNewFailureScreenshots(buildId);
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

  console.log('isPullRequest?', isPullRequest());
  console.log('isBuild?', isBuild());
  console.log('isTag?', isTag());

  // Set environment variables so that BrowserStack launcher can read them.
  core.exportVariable('BROWSER_STACK_ACCESS_KEY', core.getInput('browser-stack-access-key'));
  core.exportVariable('BROWSER_STACK_USERNAME', core.getInput('browser-stack-username'));
  core.exportVariable('BROWSER_STACK_PROJECT', core.getInput('browser-stack-project') || process.env.GITHUB_REPOSITORY);

  await install();
  await installCerts();
  await coverage();
  await build();
  await visual();
  await buildLibrary();

  if (isTag()) {
    // await publishLibrary();
  }
}

run();

import * as core from '@actions/core';
// import * as github from '@actions/github';
import * as fs from 'fs-extra';
import * as path from 'path';
// import * as slack from '@slack/webhook';

import {
  spawn
} from './spawn';

import {
  checkNewBaselineScreenshots,
  checkNewFailureScreenshots
} from './screenshot-comparator';

import {
  getTag,
  isPush,
  isPullRequest,
  isTag
} from './utils';

function runSkyUxCommand(command: string, args?: string[]): Promise<string> {
  core.info(`
=====================================================
> Running SKY UX command: '${command}'
=====================================================
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
    if (isPush()) {
      await checkNewBaselineScreenshots(repository, buildId);
    }
  } catch (err) {
    if (isPush()) {
      await checkNewFailureScreenshots(buildId);
    }
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

async function publishLibrary() {
  const packageJsonPath = path.resolve(process.cwd(), core.getInput('working-directory'), 'package.json');
  const packageJson = fs.readJsonSync(packageJsonPath);
  const packageName = packageJson.name;
  const version = packageJson.version;

  core.info(`Preparing to publish ${packageName}@${version} to NPM...`);

  const npmFilePath = path.resolve(process.cwd(), '.npmrc');
  const npmToken = core.getInput('npm-token');
  await fs.ensureFile(npmFilePath);
  fs.writeFileSync(npmFilePath, `//registry.npmjs.org/:_authToken=${npmToken}`);

  try {
    const npmTag = (getTag().indexOf('-') > -1) ? 'next' : 'latest';
    await spawn('npm', ['publish', '--access', 'public', '--tag', npmTag, '--dryrun']);
    const repository = process.env.GITHUB_REPOSITORY || '';
    const changelogUrl = `https://github.com/${repository}/blob/${version}/CHANGELOG.md`;
    core.info(`Successfully published ${packageName}@${version} to NPM.`);
    await notifySlack(`${packageName}@${version} published to NPM.\n${changelogUrl}`);
  } catch (err) {
    core.setFailed(err);
    console.log('ERROR:', err);
    await notifySlack(`${packageName}@${version} failed to publish to NPM.`);
  }

  fs.removeSync(npmFilePath);
}

async function notifySlack(message: string) {
  const url = core.getInput('slack-webhook');
  if (url) {
    core.info('Notifying Slack.');
    console.log('SLACK MESSAGE:', message);
    // const webhook = new slack.IncomingWebhook(url);
    // await webhook.send({
    //   text: '[test message] Notification sent from GitHub Actions!'
    // });
  } else {
    core.info('No webhook available for Slack notification.');
  }
}

async function run(): Promise<void> {
  if (isPush()) {
    // Get the last commit message.
    // See: https://stackoverflow.com/a/7293026/6178885
    const message = await spawn('git', ['log', '-1', '--pretty=%B', '--oneline'], {
      cwd: process.cwd()
    });

    if (message.indexOf('[ci skip]') > -1) {
      core.info('Found "[ci skip]" in last commit message. Aborting build and test run.');
      process.exit(0);
    }
  }

  console.log('isPullRequest?', isPullRequest());
  console.log('isPush?', isPush());
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
    await publishLibrary();
  }
}

run();

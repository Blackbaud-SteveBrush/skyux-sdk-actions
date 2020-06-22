import * as core from '@actions/core';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as rimraf from 'rimraf';

import {
  directoryHasChanges
} from './directory-has-changes';

import {
  spawn
} from './spawn';

const BASELINE_SCREENSHOT_DIR = 'screenshots-baseline';
const FAILURE_SCREENSHOT_DIR = 'screenshots-diff';
const TEMP_DIR = '.skypagesvisualbaselinetemp';

async function cloneRepoAsAdmin(gitUrl: string, branch: string, directory: string) {
  await spawn('git', ['config', '--global', 'user.email', '"sky-build-user@blackbaud.com"']);
  await spawn('git', ['config', '--global', 'user.name', '"Blackbaud Sky Build User"']);
  await spawn('git', ['clone', gitUrl, '--branch', branch, '--single-branch', directory]);
}

async function commitScreenshots(checkoutBranch: string, commitBranch: string, changesDir: string) {
  const buildId = process.env.GITHUB_RUN_ID;

  const workingDirectory = core.getInput('working-directory');

  const config = {
    cwd: path.resolve(workingDirectory, TEMP_DIR)
  };

  try {
    await spawn('git', ['checkout', checkoutBranch], config);
  } catch (err) {
    await spawn('git', ['checkout', '-b', checkoutBranch], config);
  }

  await spawn('git', ['status'], config);
  await spawn('git', ['add', changesDir], config);
  await spawn('git', ['commit', '--message', `Build #${buildId}: Added new screenshots. [ci skip]`], config);
  await spawn('git', ['push', '--force', '--quiet', 'origin', commitBranch], config);
}

async function commitBaselineScreenshots() {
  const branch = process.env.VISUAL_BASELINES_REPO_BRANCH || 'master';
  const repoUrl = process.env.VISUAL_BASELINES_REPO_URL;

  const workingDirectory = core.getInput('working-directory');

  if (!repoUrl) {
    core.setFailed('The environment variable `VISUAL_BASELINES_REPO_URL` is not set!');
    return;
  }

  await cloneRepoAsAdmin(repoUrl, branch, TEMP_DIR);

  // Move new screenshots to fresh copy of the repo.
  await fs.copy(
    path.resolve(workingDirectory, BASELINE_SCREENSHOT_DIR),
    path.resolve(workingDirectory, TEMP_DIR, BASELINE_SCREENSHOT_DIR)
  );

  core.info(`Preparing to commit new baseline screenshots to the '${branch}' branch.`);

  await commitScreenshots(branch, branch, BASELINE_SCREENSHOT_DIR);

  core.info('New baseline images saved.');
}

async function commitFailureScreenshots() {
  const branch = process.env.GITHUB_RUN_ID || 'master';
  const repoUrl = process.env.VISUAL_FAILURES_REPO_URL;

  const workingDirectory = core.getInput('working-directory');

  if (!repoUrl) {
    core.setFailed('The environment variable `VISUAL_FAILURES_REPO_URL` is not set!');
    return;
  }

  await cloneRepoAsAdmin(repoUrl, 'master', TEMP_DIR);

  // Move new screenshots to fresh copy of the repo.
  await fs.copy(
    path.resolve(workingDirectory, FAILURE_SCREENSHOT_DIR),
    path.resolve(workingDirectory, TEMP_DIR, FAILURE_SCREENSHOT_DIR)
  );

  core.info(`Preparing to commit failure screenshots to the '${branch}' branch.`);

  await commitScreenshots('master', branch, FAILURE_SCREENSHOT_DIR);

  const url = repoUrl.split('@')[1].replace('.git', '');

  core.setFailed(`SKY UX visual test failure!\nScreenshots may be viewed at: https://${url}/tree/${branch}`);
}

export async function checkNewBaselineScreenshots() {
  const hasChanges = await directoryHasChanges(BASELINE_SCREENSHOT_DIR);
  if (hasChanges) {
    core.info('New screenshots detected.');
    await commitBaselineScreenshots();
  } else {
    core.info('No new screenshots detected. Done.');
  }

  rimraf.sync(TEMP_DIR);
}

export async function checkNewFailureScreenshots() {
  const hasChanges = await directoryHasChanges(FAILURE_SCREENSHOT_DIR);
  if (hasChanges) {
    core.info('New screenshots detected.');
    await commitFailureScreenshots();
  } else {
    core.info('No new screenshots detected. Done.');
  }

  rimraf.sync(TEMP_DIR);
}

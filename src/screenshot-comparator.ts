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

async function cloneRepoAsAdmin(gitUrl: string, branch: string) {
  await spawn('git', ['config', '--global', 'user.email', '"sky-build-user@blackbaud.com"']);
  await spawn('git', ['config', '--global', 'user.name', '"Blackbaud Sky Build User"']);
  await spawn('git', ['clone', gitUrl, '--branch', branch, '--single-branch', TEMP_DIR]);
}

async function commitScreenshots(changesDirectory: string, branch: string) {
  core.info(`Preparing to commit screenshots to the '${branch}' branch.`);
  const workingDirectory = core.getInput('working-directory');
  const buildId = process.env.GITHUB_RUN_ID;

  const config = {
    cwd: path.resolve(workingDirectory, TEMP_DIR)
  };

  try {
    await spawn('git', ['checkout', branch]);
  } catch (err) {
    await spawn('git', ['checkout', '-b', branch]);
  }

  await spawn('git', ['add', changesDirectory], config);
  await spawn('git', ['commit', '--message', `Build #${buildId}: Added new screenshots. [ci skip]`], config);
  await spawn('git', ['push', '--force', '--quiet', 'origin', branch], config);

  core.info('New images saved.');
}

async function commitBaselineScreenshots() {
  const branch = process.env.VISUAL_BASELINES_REPO_BRANCH || 'master';
  const repoUrl = process.env.VISUAL_BASELINES_REPO_URL;

  const workingDirectory = core.getInput('working-directory');

  if (!repoUrl) {
    core.setFailed('The environment variable `VISUAL_BASELINES_REPO_URL` is not set!');
    return;
  }

  await cloneRepoAsAdmin(repoUrl, branch);

  await fs.copy(
    path.resolve(workingDirectory, BASELINE_SCREENSHOT_DIR),
    path.resolve(workingDirectory, TEMP_DIR, BASELINE_SCREENSHOT_DIR)
  );

  await commitScreenshots(BASELINE_SCREENSHOT_DIR, branch);
}

async function commitFailureScreenshots() {
  const branch = process.env.GITHUB_RUN_ID || 'master';
  const repoUrl = process.env.VISUAL_FAILURES_REPO_URL;

  const workingDirectory = core.getInput('working-directory');

  if (!repoUrl) {
    core.setFailed('The environment variable `VISUAL_FAILURES_REPO_URL` is not set!');
    return;
  }

  await cloneRepoAsAdmin(repoUrl, 'master');

  await fs.copy(
    path.resolve(workingDirectory, FAILURE_SCREENSHOT_DIR),
    path.resolve(workingDirectory, TEMP_DIR, FAILURE_SCREENSHOT_DIR)
  );

  await commitScreenshots(FAILURE_SCREENSHOT_DIR, branch);

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

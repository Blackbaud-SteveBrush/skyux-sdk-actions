import * as core from '@actions/core';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as rimraf from 'rimraf';

import { directoryHasChanges } from './directory-has-changes';
import { spawn } from './spawn';

const BASELINE_SCREENSHOT_DIR = 'screenshots-baseline';
const FAILURE_SCREENSHOT_DIR = 'screenshots-diff';
const TEMP_DIR = '.skypagesvisualbaselinetemp';

async function commitBaselineScreenshots() {
  const branch = process.env.VISUAL_BASELINES_REPO_BRANCH || 'master';
  const gitUrl = process.env.VISUAL_BASELINES_REPO_URL;
  const buildId = process.env.GITHUB_RUN_ID;

  if (!gitUrl) {
    core.setFailed('The environment variable `VISUAL_BASELINES_REPO_URL` is not set!');
    return;
  }

  // Clone a fresh copy of the baselines repo.
  await spawn('git', ['config', '--global', 'user.email', '"sky-build-user@blackbaud.com"']);
  await spawn('git', ['config', '--global', 'user.name', '"Blackbaud Sky Build User"']);
  await spawn('git', ['clone', gitUrl, '--branch', branch, '--single-branch', TEMP_DIR]);

  await fs.copy(
    path.resolve(core.getInput('working-directory'), BASELINE_SCREENSHOT_DIR),
    path.resolve(core.getInput('working-directory'), TEMP_DIR, BASELINE_SCREENSHOT_DIR)
  );

  const config = {
    cwd: path.resolve(core.getInput('working-directory'), TEMP_DIR)
  };

  // Commit the screenshots to the baselines repo.
  await spawn('git', ['add', BASELINE_SCREENSHOT_DIR], config);
  await spawn('git', ['commit', '--message', `Build #${buildId}: Added new baseline screenshots. [ci skip]`], config);
  await spawn('git', ['push', '--force', '--quiet', 'origin', branch], config);

  core.info('New baseline images saved.');
}

async function commitFailureScreenshots() {
  return Promise.resolve();
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

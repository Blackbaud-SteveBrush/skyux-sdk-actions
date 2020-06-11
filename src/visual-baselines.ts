import { directoryHasChanges } from './directory-has-changes';
import * as core from '@actions/core';
import * as path from 'path';
import * as fs from 'fs-extra';
import * as rimraf from 'rimraf';
import { spawn } from './spawn';

const BASELINE_SCREENSHOT_DIR = 'screenshots-baseline';
const TEMP_DIR = '.skypagesvisualbaselinetemp';

async function commitBaselineScreenshots() {
  const branch = 'master';
  const gitUrl = process.env.VISUAL_BASELINES_REPO_URL;
  const buildId = process.env.GITHUB_RUN_ID;

  if (!gitUrl) {
    core.setFailed('The environment variable `VISUAL_BASELINES_REPO_URL` is not set!');
    return;
  }

  await spawn('git', ['config', '--global', 'user.email', '"sky-build-user@blackbaud.com"']);
  await spawn('git', ['config', '--global', 'user.name', '"Blackbaud Sky Build User"']);
  await spawn('git', ['clone', gitUrl, '--single-branch', TEMP_DIR]);

  await fs.copy(
    BASELINE_SCREENSHOT_DIR,
    path.resolve(TEMP_DIR, BASELINE_SCREENSHOT_DIR)
  );

  const config = { cwd: TEMP_DIR };

  await spawn('git', ['checkout', branch], config);
  await spawn('git', ['status'], config);
  await spawn('git', ['add', BASELINE_SCREENSHOT_DIR], config);
  await spawn('git', ['commit', '-m', `Build #${buildId}: Added new baseline screenshots. [ci skip]`], config);
  await spawn('git', ['push', '-fq', 'origin', branch], config);

  core.info('New baseline images saved.');
}

export async function checkScreenshots() {
  const hasChanges = await directoryHasChanges(BASELINE_SCREENSHOT_DIR);
  if (hasChanges) {
    core.info('New baseline images detected.');
    await commitBaselineScreenshots();
  } else {
    core.info('No new baseline images detected. Done.');
  }

  rimraf.sync(TEMP_DIR);
}

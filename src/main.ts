import * as core from '@actions/core';
import spawn from 'cross-spawn';
import * as path from 'path';

function runCommand(name: string, args: string): void {
  const result = spawn.sync(name, args.split(' '), {
    stdio: 'inherit',
    cwd: path.resolve(process.cwd(), core.getInput('working-directory'))
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status === 1) {
    throw new Error('Something bad happened.');
  }
}

function installCerts() {
  runCommand('npx', '-p @skyux-sdk/cli@next skyux certs install');
}

function install() {
  runCommand('npm', 'ci');
  runCommand('npm', 'install --no-save --no-package-lock blackbaud/skyux-sdk-builder-config');
}

function build() {
  runCommand('npx', '-p @skyux-sdk/cli@next skyux build');
}

function coverage() {
  runCommand('npx', '-p @skyux-sdk/cli@next skyux test --coverage library --platform travis');
  runCommand('bash', '<(curl -s https://codecov.io/bash)');
}

function visual() {
  runCommand('npx', '-p @skyux-sdk/cli@next skyux e2e --platform travis');
  // runCommand('node', path.resolve(process.cwd(), './node_modules/@skyux-sdk/builder-config/scripts/visual-baselines.js'));
  // runCommand('node', path.resolve(process.cwd(), './node_modules/@skyux-sdk/builder-config/scripts/visual-failures.js'));
}

function buildLibrary() {
  runCommand('npx', '-p @skyux-sdk/cli@next skyux build-public-library');

  /**
   * const npmTag = 'latest';
   * npm publish --access public --tag $npmTag;
   * notifySlack();
   */
}

async function run(): Promise<void> {
  try {
    install();
    installCerts();
    build();
    coverage();
    visual();
    buildLibrary();
  } catch (error) {
    // core.setFailed(error.message);
    console.log('ERROR:', error);
    process.exit(1);
  }
}

run();

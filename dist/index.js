module.exports =
/******/ (function(modules, runtime) { // webpackBootstrap
/******/ 	"use strict";
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		var threw = true;
/******/ 		try {
/******/ 			modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 			threw = false;
/******/ 		} finally {
/******/ 			if(threw) delete installedModules[moduleId];
/******/ 		}
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	__webpack_require__.ab = __dirname + "/";
/******/
/******/ 	// the startup function
/******/ 	function startup() {
/******/ 		// Load entry module and return exports
/******/ 		return __webpack_require__(198);
/******/ 	};
/******/
/******/ 	// run startup
/******/ 	return startup();
/******/ })
/************************************************************************/
/******/ ({

/***/ 87:
/***/ (function(module) {

module.exports = require("os");

/***/ }),

/***/ 129:
/***/ (function(module) {

module.exports = require("child_process");

/***/ }),

/***/ 198:
/***/ (function(__unusedmodule, exports, __webpack_require__) {

"use strict";

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(__webpack_require__(470));
const visual_baselines_1 = __webpack_require__(972);
const spawn_1 = __webpack_require__(820);
function runSkyUxCommand(command, args) {
    return spawn_1.spawn('npx', [
        '-p', '@skyux-sdk/cli@next',
        'skyux', command,
        '--logFormat', 'none',
        '--platform', 'travis',
        ...args || ''
    ]);
}
function installCerts() {
    return __awaiter(this, void 0, void 0, function* () {
        yield runSkyUxCommand('certs', ['install']);
    });
}
function install() {
    return __awaiter(this, void 0, void 0, function* () {
        yield spawn_1.spawn('npm', ['ci']);
        yield spawn_1.spawn('npm', ['install', '--no-save', '--no-package-lock', 'blackbaud/skyux-sdk-builder-config']);
    });
}
function build() {
    return __awaiter(this, void 0, void 0, function* () {
        yield runSkyUxCommand('build');
    });
}
function coverage() {
    return __awaiter(this, void 0, void 0, function* () {
        yield runSkyUxCommand('test', ['--coverage', 'library']);
    });
}
function visual() {
    return __awaiter(this, void 0, void 0, function* () {
        yield runSkyUxCommand('e2e');
        yield visual_baselines_1.checkScreenshots();
        // spawn('node', path.resolve(process.cwd(), './node_modules/@skyux-sdk/builder-config/scripts/visual-baselines.js'));
        // spawn('node', path.resolve(process.cwd(), './node_modules/@skyux-sdk/builder-config/scripts/visual-failures.js'));
    });
}
function buildLibrary() {
    return __awaiter(this, void 0, void 0, function* () {
        yield runSkyUxCommand('build-public-library');
    });
}
// async function publishLibrary() {
//   /**
//    * const npmTag = 'latest';
//    * npm publish --access public --tag $npmTag;
//    * notifySlack();
//    */
// }
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield install();
            yield installCerts();
            // await build();
            // await coverage();
            yield visual();
            // await buildLibrary();
            // await publishLibrary();
        }
        catch (error) {
            core.setFailed(error);
            console.log('ERROR:', error);
            process.exit(1);
        }
    });
}
run();


/***/ }),

/***/ 229:
/***/ (function(__unusedmodule, exports, __webpack_require__) {

"use strict";

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const spawn_1 = __webpack_require__(820);
function directoryHasChanges(dir) {
    return __awaiter(this, void 0, void 0, function* () {
        const output = yield spawn_1.spawn('git', ['status', dir, '--porcelain', '--verbose']);
        if (!output) {
            console.log('NO OUTPUTT?????', output);
            return false;
        }
        const result = output.trim();
        // Untracked files are prefixed with '??'
        // Modified files are prefixed with 'M'
        // https://git-scm.com/docs/git-status/1.8.1#_output
        // https://stackoverflow.com/a/6978402/6178885
        return (result.indexOf('??') === 0 ||
            result.indexOf('M') === 0);
    });
}
exports.directoryHasChanges = directoryHasChanges;


/***/ }),

/***/ 431:
/***/ (function(__unusedmodule, exports, __webpack_require__) {

"use strict";

var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const os = __importStar(__webpack_require__(87));
/**
 * Commands
 *
 * Command Format:
 *   ::name key=value,key=value::message
 *
 * Examples:
 *   ::warning::This is the message
 *   ::set-env name=MY_VAR::some value
 */
function issueCommand(command, properties, message) {
    const cmd = new Command(command, properties, message);
    process.stdout.write(cmd.toString() + os.EOL);
}
exports.issueCommand = issueCommand;
function issue(name, message = '') {
    issueCommand(name, {}, message);
}
exports.issue = issue;
const CMD_STRING = '::';
class Command {
    constructor(command, properties, message) {
        if (!command) {
            command = 'missing.command';
        }
        this.command = command;
        this.properties = properties;
        this.message = message;
    }
    toString() {
        let cmdStr = CMD_STRING + this.command;
        if (this.properties && Object.keys(this.properties).length > 0) {
            cmdStr += ' ';
            let first = true;
            for (const key in this.properties) {
                if (this.properties.hasOwnProperty(key)) {
                    const val = this.properties[key];
                    if (val) {
                        if (first) {
                            first = false;
                        }
                        else {
                            cmdStr += ',';
                        }
                        cmdStr += `${key}=${escapeProperty(val)}`;
                    }
                }
            }
        }
        cmdStr += `${CMD_STRING}${escapeData(this.message)}`;
        return cmdStr;
    }
}
/**
 * Sanitizes an input into a string so it can be passed into issueCommand safely
 * @param input input to sanitize into a string
 */
function toCommandValue(input) {
    if (input === null || input === undefined) {
        return '';
    }
    else if (typeof input === 'string' || input instanceof String) {
        return input;
    }
    return JSON.stringify(input);
}
exports.toCommandValue = toCommandValue;
function escapeData(s) {
    return toCommandValue(s)
        .replace(/%/g, '%25')
        .replace(/\r/g, '%0D')
        .replace(/\n/g, '%0A');
}
function escapeProperty(s) {
    return toCommandValue(s)
        .replace(/%/g, '%25')
        .replace(/\r/g, '%0D')
        .replace(/\n/g, '%0A')
        .replace(/:/g, '%3A')
        .replace(/,/g, '%2C');
}
//# sourceMappingURL=command.js.map

/***/ }),

/***/ 470:
/***/ (function(__unusedmodule, exports, __webpack_require__) {

"use strict";

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = __webpack_require__(431);
const os = __importStar(__webpack_require__(87));
const path = __importStar(__webpack_require__(622));
/**
 * The code to exit an action
 */
var ExitCode;
(function (ExitCode) {
    /**
     * A code indicating that the action was successful
     */
    ExitCode[ExitCode["Success"] = 0] = "Success";
    /**
     * A code indicating that the action was a failure
     */
    ExitCode[ExitCode["Failure"] = 1] = "Failure";
})(ExitCode = exports.ExitCode || (exports.ExitCode = {}));
//-----------------------------------------------------------------------
// Variables
//-----------------------------------------------------------------------
/**
 * Sets env variable for this action and future actions in the job
 * @param name the name of the variable to set
 * @param val the value of the variable. Non-string values will be converted to a string via JSON.stringify
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function exportVariable(name, val) {
    const convertedVal = command_1.toCommandValue(val);
    process.env[name] = convertedVal;
    command_1.issueCommand('set-env', { name }, convertedVal);
}
exports.exportVariable = exportVariable;
/**
 * Registers a secret which will get masked from logs
 * @param secret value of the secret
 */
function setSecret(secret) {
    command_1.issueCommand('add-mask', {}, secret);
}
exports.setSecret = setSecret;
/**
 * Prepends inputPath to the PATH (for this action and future actions)
 * @param inputPath
 */
function addPath(inputPath) {
    command_1.issueCommand('add-path', {}, inputPath);
    process.env['PATH'] = `${inputPath}${path.delimiter}${process.env['PATH']}`;
}
exports.addPath = addPath;
/**
 * Gets the value of an input.  The value is also trimmed.
 *
 * @param     name     name of the input to get
 * @param     options  optional. See InputOptions.
 * @returns   string
 */
function getInput(name, options) {
    const val = process.env[`INPUT_${name.replace(/ /g, '_').toUpperCase()}`] || '';
    if (options && options.required && !val) {
        throw new Error(`Input required and not supplied: ${name}`);
    }
    return val.trim();
}
exports.getInput = getInput;
/**
 * Sets the value of an output.
 *
 * @param     name     name of the output to set
 * @param     value    value to store. Non-string values will be converted to a string via JSON.stringify
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function setOutput(name, value) {
    command_1.issueCommand('set-output', { name }, value);
}
exports.setOutput = setOutput;
/**
 * Enables or disables the echoing of commands into stdout for the rest of the step.
 * Echoing is disabled by default if ACTIONS_STEP_DEBUG is not set.
 *
 */
function setCommandEcho(enabled) {
    command_1.issue('echo', enabled ? 'on' : 'off');
}
exports.setCommandEcho = setCommandEcho;
//-----------------------------------------------------------------------
// Results
//-----------------------------------------------------------------------
/**
 * Sets the action status to failed.
 * When the action exits it will be with an exit code of 1
 * @param message add error issue message
 */
function setFailed(message) {
    process.exitCode = ExitCode.Failure;
    error(message);
}
exports.setFailed = setFailed;
//-----------------------------------------------------------------------
// Logging Commands
//-----------------------------------------------------------------------
/**
 * Gets whether Actions Step Debug is on or not
 */
function isDebug() {
    return process.env['RUNNER_DEBUG'] === '1';
}
exports.isDebug = isDebug;
/**
 * Writes debug message to user log
 * @param message debug message
 */
function debug(message) {
    command_1.issueCommand('debug', {}, message);
}
exports.debug = debug;
/**
 * Adds an error issue
 * @param message error issue message. Errors will be converted to string via toString()
 */
function error(message) {
    command_1.issue('error', message instanceof Error ? message.toString() : message);
}
exports.error = error;
/**
 * Adds an warning issue
 * @param message warning issue message. Errors will be converted to string via toString()
 */
function warning(message) {
    command_1.issue('warning', message instanceof Error ? message.toString() : message);
}
exports.warning = warning;
/**
 * Writes info to log with console.log.
 * @param message info message
 */
function info(message) {
    process.stdout.write(message + os.EOL);
}
exports.info = info;
/**
 * Begin an output group.
 *
 * Output until the next `groupEnd` will be foldable in this group
 *
 * @param name The name of the output group
 */
function startGroup(name) {
    command_1.issue('group', name);
}
exports.startGroup = startGroup;
/**
 * End an output group.
 */
function endGroup() {
    command_1.issue('endgroup');
}
exports.endGroup = endGroup;
/**
 * Wrap an asynchronous function call in a group.
 *
 * Returns the same type as the function itself.
 *
 * @param name The name of the group
 * @param fn The function to wrap in the group
 */
function group(name, fn) {
    return __awaiter(this, void 0, void 0, function* () {
        startGroup(name);
        let result;
        try {
            result = yield fn();
        }
        finally {
            endGroup();
        }
        return result;
    });
}
exports.group = group;
//-----------------------------------------------------------------------
// Wrapper action state
//-----------------------------------------------------------------------
/**
 * Saves state for current action, the state can only be retrieved by this action's post job execution.
 *
 * @param     name     name of the state to store
 * @param     value    value to store. Non-string values will be converted to a string via JSON.stringify
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function saveState(name, value) {
    command_1.issueCommand('save-state', { name }, value);
}
exports.saveState = saveState;
/**
 * Gets the value of an state set by this action's main execution.
 *
 * @param     name     name of the state to get
 * @returns   string
 */
function getState(name) {
    return process.env[`STATE_${name}`] || '';
}
exports.getState = getState;
//# sourceMappingURL=core.js.map

/***/ }),

/***/ 622:
/***/ (function(module) {

module.exports = require("path");

/***/ }),

/***/ 820:
/***/ (function(__unusedmodule, exports, __webpack_require__) {

"use strict";

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
function spawn(command, args = []) {
    return __awaiter(this, void 0, void 0, function* () {
        const spawn = __webpack_require__(129).spawn;
        // Create a child process
        var child = spawn(command, args);
        return new Promise((resolve, reject) => {
            child.stdout.on('data', function (data) {
                console.log('ls command output: ' + data);
                resolve(data);
            });
            child.stderr.on('data', function (data) {
                //throw errors
                console.log('stderr: ' + data);
                reject(data);
            });
            child.on('close', function (code) {
                console.log('child process exited with code ' + code);
            });
        });
        // const childProcess = crossSpawn(command, args, {
        //   stdio: 'inherit',
        //   cwd: path.resolve(process.cwd(), core.getInput('working-directory'))
        // });
        // return new Promise((resolve, reject) => {
        //   let output: string;
        //   if (childProcess.stdout) {
        //     console.log('There\'s an stdout!!!!!');
        //     childProcess.stdout.on('data', (data) => {
        //       output = data.toString('utf8');
        //       console.log('CHILD SPAWN OUTPUT!', output);
        //     });
        //   }
        //   let errorMessage: string;
        //   if (childProcess.stderr) {
        //     childProcess.stderr.on('data', (data) => {
        //       errorMessage = data.toString('utf8');
        //     });
        //   }
        //   childProcess.on('error', (err) => reject(err));
        //   childProcess.on('exit', (code) => {
        //     if (code === 0) {
        //       resolve(output);
        //     } else {
        //       reject(errorMessage);
        //     }
        //   });
        // });
    });
}
exports.spawn = spawn;


/***/ }),

/***/ 972:
/***/ (function(__unusedmodule, exports, __webpack_require__) {

"use strict";

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const directory_has_changes_1 = __webpack_require__(229);
function checkScreenshots() {
    return __awaiter(this, void 0, void 0, function* () {
        const baselineScreenshotsDir = 'screenshots-baseline';
        const hasChanges = yield directory_has_changes_1.directoryHasChanges(baselineScreenshotsDir);
        if (hasChanges) {
            console.log('Has changes!', baselineScreenshotsDir);
        }
        else {
            console.log('no changes found :-(', baselineScreenshotsDir);
        }
    });
}
exports.checkScreenshots = checkScreenshots;
// const fs = require('fs-extra');
// const path = require('path');
// const rimraf = require('rimraf');
// const logger = require('@blackbaud/skyux-logger');
// const {
//   exec,
//   dirHasChanges,
//   getBuildId
// } = require('./utils');
// const baselineScreenshotsDir = 'screenshots-baseline';
// const tempDir = '.skypagesvisualbaselinetemp';
// function handleBaselineScreenshots() {
//   const branch = 'master';
//   const opts = { cwd: tempDir };
//   const gitUrl = process.env.VISUAL_BASELINES_REPO_URL;
//   const buildId = getBuildId();
//   return Promise.resolve()
//     .then(() => exec('git', ['config', '--global', 'user.email', '"sky-build-user@blackbaud.com"']))
//     .then(() => exec('git', ['config', '--global', 'user.name', '"Blackbaud Sky Build User"']))
//     .then(() => exec('git', ['clone', gitUrl, '--single-branch', tempDir]))
//     .then(() => fs.copy(
//       baselineScreenshotsDir,
//       path.resolve(tempDir, baselineScreenshotsDir)
//     ))
//     .then(() => exec('git', ['checkout', branch], opts))
//     .then(() => exec('git', ['status'], opts))
//     .then(() => exec('git', ['add', baselineScreenshotsDir], opts))
//     .then(() => exec('git', [
//       'commit', '-m', `Build #${buildId}: Added new baseline screenshots. [ci skip]`
//     ], opts))
//     .then(() => exec('git', ['push', '-fq', 'origin', branch], opts))
//     .then(() => {
//       logger.info('New baseline images saved.');
//     });
// }
// export async function checkScreenshots(): Promise<any> {
//   // Don't commit new visual baseline images during a pull request.
//   if (process.env.TRAVIS_PULL_REQUEST !== 'false') {
//     logger.info('New visual baseline images are not saved during a pull request. Aborting script.');
//     return Promise.resolve();
//   }
//   logger.info('Checking new visual baseline images...');
//   return Promise.resolve()
//     .then(() => dirHasChanges(baselineScreenshotsDir))
//     .then((hasChanges) => {
//       if (hasChanges) {
//         logger.info('New baseline images detected.');
//         return handleBaselineScreenshots();
//       }
//       logger.info('No new baseline images detected. Done.');
//     });
// }
// // checkScreenshots()
// //   .then(() => {
// //     rimraf.sync(tempDir);
// //     process.exit(0);
// //   })
// //   .catch((err) => {
// //     logger.error(err);
// //     rimraf.sync(tempDir);
// //     process.exit(1);
// //   });


/***/ })

/******/ });
/**
 * `magik-moji` CLI entry point.
 *
 * Supported sub-commands:
 *   install         install the prepare-commit-msg git hook
 *   uninstall       remove the prepare-commit-msg git hook
 *   add <file>      transform the commit-message file in place
 *   pick [message]  print a single chosen emoji (for ad-hoc use)
 *   list            print every emoji in the active pool
 *   help            print this help text
 */
import {
    DEFAULT_EMOJIS,
    install,
    loadConfig,
    pickEmoji,
    printError,
    transformMessage,
    uninstall,
} from '../index.js';
import * as fs from 'fs';
import * as path from 'path';
import { bold, cyan } from 'barva';

/**
 * Render the built-in help text. Kept separate so tests could invoke it
 * without spawning the full CLI.
 */
function printHelp(): void {
    const lines = [
        bold`magik-moji` + ` — automagically add a random emoji to git commits`,
        '',
        bold`Usage:`,
        `  ${cyan`magik-moji`} <command> [args]`,
        '',
        bold`Commands:`,
        `  ${cyan`install`}          install the prepare-commit-msg git hook`,
        `  ${cyan`uninstall`}        remove the prepare-commit-msg git hook`,
        `  ${cyan`add <file>`}       transform the commit-message file in place`,
        `  ${cyan`pick [message]`}   print a single chosen emoji`,
        `  ${cyan`list`}             print every emoji in the active pool`,
        `  ${cyan`help`}             print this help text`,
        '',
    ];
    process.stdout.write(lines.join('\n') + '\n');
}

/**
 * Dispatch the parsed argv to the matching sub-command. Exported for
 * testing so we can drive the CLI without spawning a child process.
 *
 * @param argv - everything after `process.argv[2]`
 * @returns the intended process exit code
 */
export function run(argv: readonly string[]): number {
    const [command, ...rest] = argv;

    switch (command) {
        case undefined:
        case 'help':
        case '--help':
        case '-h':
            printHelp();
            return 0;

        case 'install':
            install(path.join(__dirname, 'hook-run.js'));
            return 0;

        case 'uninstall':
            uninstall();
            return 0;

        case 'add': {
            const file = rest[0];
            if (!file) {
                printError('`add` requires a path to a commit-message file');
                return 1;
            }
            if (!fs.existsSync(file)) {
                printError(`file not found: ${file}`);
                return 1;
            }
            const config = loadConfig();
            const original = fs.readFileSync(file, 'utf8');
            const updated = transformMessage(original, config, null);
            if (updated !== original) fs.writeFileSync(file, updated);
            return 0;
        }

        case 'pick': {
            const message = rest.join(' ');
            const config = loadConfig();
            process.stdout.write(pickEmoji({ message, config }) + '\n');
            return 0;
        }

        case 'list': {
            const config = loadConfig();
            const pool =
                config.emojis && config.emojis.length > 0
                    ? config.emojis
                    : DEFAULT_EMOJIS;
            process.stdout.write(pool.join(' ') + '\n');
            return 0;
        }

        default:
            printError(`unknown command: ${command}`);
            printHelp();
            return 1;
    }
}

/* istanbul ignore next — direct CLI invocation path. */
if (require.main === module) {
    process.exit(run(process.argv.slice(2)));
}

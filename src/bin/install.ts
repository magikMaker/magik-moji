/**
 * Run as a `postinstall` npm/yarn lifecycle script. Failures are
 * swallowed so they never block an `install` — for example when the
 * package is installed outside a Git repository, or in a CI image where
 * `.git` is stripped.
 */
import * as path from 'path';
import { install, printError } from '../index.js';

try {
    // Resolve hook-run.js relative to this compiled bin script's own
    // directory (dist/bin/) so the git hook always points at the right
    // file regardless of how the package was installed.
    install(path.join(__dirname, 'hook-run.js'));
} catch (err) {
    printError(
        `install skipped — ${err instanceof Error ? err.message : String(err)}`,
    );
    // Exit 0 so `npm install` / `yarn install` does not fail.
    process.exit(0);
}

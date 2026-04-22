/**
 * Run as a `preuninstall` npm/yarn lifecycle script. Failures are
 * swallowed so they never block an uninstall.
 */
import { printError, uninstall } from '../index.js';

try {
    uninstall();
} catch (err) {
    printError(
        `uninstall skipped — ${err instanceof Error ? err.message : String(err)}`,
    );
    process.exit(0);
}

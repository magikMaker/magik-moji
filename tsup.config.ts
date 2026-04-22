import { defineConfig } from 'tsup';

/**
 * tsup build configuration. Produces:
 *  - CJS + ESM + d.ts for the library entry
 *  - CJS bundles for each bin script (installed by npm/yarn lifecycle)
 */
export default defineConfig([
    {
        entry: { index: 'src/index.ts' },
        format: ['cjs', 'esm'],
        dts: true,
        clean: false,
        sourcemap: true,
        target: 'node18',
    },
    {
        entry: {
            'bin/cli': 'src/bin/cli.ts',
            'bin/hook-run': 'src/bin/hook-run.ts',
            'bin/install': 'src/bin/install.ts',
            'bin/uninstall': 'src/bin/uninstall.ts',
        },
        format: ['cjs'],
        dts: false,
        clean: false,
        sourcemap: false,
        target: 'node18',
        banner: { js: '#!/usr/bin/env node' },
    },
]);

# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.1] — 2026-04-22

### Fixed

- `install()` resolved `hook-run.js` using `__dirname` of the calling
  bundle, which produced `dist/bin/bin/hook-run.js` when invoked from
  the `postinstall` bin entry. `install(hookScriptPath)` now takes the
  script path as a parameter and each bin caller passes one resolved
  from its own `__dirname`.

## [1.0.0] — 2026-04-21

### Added

- Rewritten in strict TypeScript (target `es2020`, built with `tsup`).
- Dual CJS / ESM output with bundled `.d.ts` declarations.
- Configurable emoji pool via `.magikmojirc`, `.magikmojirc.json`,
  `magikmoji.config.json`, or a `magikMoji` key in `package.json`.
- **Semantic** mode — Conventional Commit types map to a matching emoji.
- **Deterministic** mode — FNV-1a hash of the commit message selects a
  stable emoji.
- **Suffix** position support (`position: "suffix"`).
- Branch-skip list (`skipBranches`) and custom `skipPatterns`.
- `MAGIK_MOJI_DISABLE=1` environment flag for one-off opt-out.
- Idempotent transformation — messages that already start with an emoji
  are left untouched, preventing stacking on `--amend`.
- New CLI: `magik-moji install | uninstall | add | pick | list | help`.
- Coloured install / error output via `barva`.
- Full Jest test suite with coverage reporting.
- `CHANGELOG.md` and modernised `README.md`.
- `yarn release` script — creates a GitHub release via Octokit and
  pulls notes from the matching `CHANGELOG.md` section when available.
  GitHub creates the `v<version>` tag server-side, so no manual tag
  pushing is needed.

### Changed

- `engines.node` bumped from `>=5.0.0` to `>=18`.
- Skip list now covers `Merge`, `Revert`, `fixup!`, `squash!`, `amend!`
  (previously only `Merge`).
- Removed duplicate 🎨 entry from the default pool.

### Removed

- Legacy `.eslintrc` and inline ANSI colour constants — replaced with a
  flat ESLint 9 config and the `barva` colour library.

## [0.0.7] — 2017-xx-xx

- Legacy JavaScript release. See git history for prior changes.

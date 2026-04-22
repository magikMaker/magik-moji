#!/usr/bin/env node

/**
 * Create a GitHub release for the version currently recorded in
 * `package.json`. Reads the repo info from `git remote get-url origin`,
 * then publishes a release tagged `v<version>` via the GitHub REST API.
 *
 * @module release-github
 * @author magikMaker
 * @version 1.0.0
 *
 * Usage:
 *   node scripts/release-github.mjs [releaseNotes]
 *
 * Requirements:
 *   - `GITHUB_TOKEN` environment variable with `repo` scope (or a
 *     fine-grained token with `Contents: read and write` on this repo).
 *   - The tag `v<version>` must already exist on the remote (pushed by
 *     `yarn postversion`).
 */

import { Octokit } from '@octokit/rest';
import { readFileSync } from 'fs';
import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

/** @constant {string} __filename Absolute path to this module. */
const __filename = fileURLToPath(import.meta.url);

/** @constant {string} __dirname Directory containing this module. */
const __dirname = path.dirname(__filename);

/**
 * Parse the `origin` remote URL and return `{ owner, repo }`. Supports
 * both HTTPS (`https://github.com/owner/repo.git`) and SSH
 * (`git@github.com:owner/repo.git`) URL formats.
 *
 * @returns {{ owner: string, repo: string }}
 * @throws exits the process with code 1 if the URL cannot be parsed
 */
function getRepoInfo() {
    try {
        const remoteUrl = execSync('git remote get-url origin')
            .toString()
            .trim();

        let match;
        if (remoteUrl.startsWith('https')) {
            // https://github.com/owner/repo.git
            match = remoteUrl.match(/github\.com\/([^/]+)\/([^/.]+)/);
        } else {
            // git@github.com:owner/repo.git
            match = remoteUrl.match(/github\.com:([^/]+)\/([^/.]+)/);
        }

        if (!match) {
            throw new Error(
                'Unable to parse repository info from git remote URL',
            );
        }

        return { owner: match[1], repo: match[2] };
    } catch (error) {
        console.error('Error getting repository info:', error.message);
        process.exit(1);
    }
}

/**
 * Read `version` out of the project `package.json`.
 *
 * @returns {string} the current `version` field
 */
function getVersion() {
    try {
        const packageJsonPath = path.resolve(__dirname, '..', 'package.json');
        const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
        return packageJson.version;
    } catch (error) {
        console.error('Error reading package.json:', error.message);
        process.exit(1);
    }
}

/**
 * Extract the section for `version` from `CHANGELOG.md`. Returns `null`
 * when no matching heading is present so the caller can fall back to a
 * generic release-notes string.
 *
 * The format recognised is [Keep a Changelog]-style:
 *
 * ```markdown
 * ## [1.2.3] — 2026-04-22
 * ...
 * ## [1.2.2] — 2026-04-10
 * ```
 *
 * @param {string} version - the version to look up
 * @returns {string | null} the section body, trimmed, or `null`
 */
function getChangelogNotes(version) {
    try {
        const changelogPath = path.resolve(__dirname, '..', 'CHANGELOG.md');
        const changelog = readFileSync(changelogPath, 'utf8');
        const escaped = version.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(
            `##\\s*\\[?${escaped}\\]?.*?\\n([\\s\\S]*?)(?=\\n##\\s|$)`,
        );
        const match = changelog.match(regex);
        if (match && match[1]) {
            return match[1].trim();
        }
    } catch {
        // CHANGELOG is optional; swallow and fall back.
    }
    return null;
}

/**
 * Main entry: authenticate with Octokit and create the release.
 *
 * @returns {Promise<void>}
 */
async function createRelease() {
    const token = process.env.GITHUB_TOKEN;
    if (!token) {
        console.error('GITHUB_TOKEN environment variable is required');
        process.exit(1);
    }

    const octokit = new Octokit({ auth: token });
    const repoInfo = getRepoInfo();
    const version = getVersion();
    const tagName = `v${version}`;

    const cliNotes = process.argv[2];
    const changelogNotes = getChangelogNotes(version);
    const releaseNotes =
        cliNotes || changelogNotes || `Release version ${version}`;

    try {
        console.log(`Creating GitHub release for ${tagName}...`);

        const release = await octokit.repos.createRelease({
            ...repoInfo,
            tag_name: tagName,
            name: `Release ${version}`,
            body: releaseNotes,
            draft: false,
            prerelease: false,
        });

        console.log(
            `✅ GitHub release created successfully: ${release.data.html_url}`,
        );
    } catch (error) {
        console.error(
            'Error creating GitHub release:',
            error.response?.data?.message || error.message,
        );
        process.exit(1);
    }
}

createRelease().catch((error) => {
    console.error('Unexpected error:', error);
    process.exit(1);
});

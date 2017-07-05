#!/usr/bin/env node

/**
 * This gets called from the git hook (shell) and adds the emoji
 */
require('../').addEmoji(process.argv[2]);

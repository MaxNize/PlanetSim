#!/usr/bin/env node

/**
 * Check Max Lines Enforcer
 *
 * Validates that all source files comply with the 200-line maximum rule.
 * Consults max-lines-exceptions.json for approved exemptions.
 *
 * Usage:
 *   node scripts/check-max-lines.js --exceptions max-lines-exceptions.json
 *
 * Exit codes:
 *   0 - all files pass
 *   1 - files exceed limit without approved exception
 */

const fs = require('fs');
const path = require('path');
const { globSync } = require('glob');

const MAX_LINES = 200;
const SKIP_DIRS = ['node_modules', 'target', 'dist', '.git', '.github'];

// Parse CLI args
const args = process.argv.slice(2);
let exceptionsPath = 'max-lines-exceptions.json';
for (let i = 0; i < args.length; i++) {
    if (args[i] === '--exceptions' && args[i + 1]) {
        exceptionsPath = args[i + 1];
    }
}

// Load exceptions
let exceptions = [];
try {
    const exceptionsFile = fs.readFileSync(exceptionsPath, 'utf-8');
    const exceptionsData = JSON.parse(exceptionsFile);
    exceptions = exceptionsData.exemptions || [];
} catch (err) {
    console.error(`⚠️  Could not load exceptions file: ${exceptionsPath}`);
    console.error(err.message);
}

/**
 * Check if a file path matches any exception glob pattern.
 * @param {string} filePath - relative file path
 * @returns {object|null} - matching exception or null
 */
function isExempt(filePath) {
    const minimatchLib = require('minimatch');
    const minimatch = (
        minimatchLib && minimatchLib.minimatch
    ) || (minimatchLib && minimatchLib.default) || minimatchLib;
    for (const exempt of exceptions) {
        if (minimatch(filePath, exempt.path)) {
            return exempt;
        }
    }
    return null;
}

/**
 * Count lines in a file.
 * @param {string} filePath - absolute file path
 * @returns {number}
 */
function countLines(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    return content.split('\n').length;
}

/**
 * Walk directory recursively and find all source files.
 * @param {string} dir - directory to scan
 * @returns {string[]} - absolute file paths
 */
function getSourceFiles(dir = '.') {
    const patterns = [
        'frontend/src/**/*.{ts,tsx}',
        'wasm/src/**/*.rs',
        'Docs/**/*.md',
    ];

    const fileSet = new Set();
    for (const pattern of patterns) {
        const files = globSync(pattern, {
            ignore: SKIP_DIRS.map(d => `**/${d}/**`),
            absolute: false,
        });
        files.forEach(f => fileSet.add(f));
    }

    return Array.from(fileSet).sort();
}

// Main
const sourceFiles = getSourceFiles();
let violations = [];

for (const file of sourceFiles) {
    const lineCount = countLines(file);

    if (lineCount > MAX_LINES) {
        const exempt = isExempt(file);
        if (!exempt) {
            violations.push({
                file,
                lineCount,
                limit: MAX_LINES,
                exempt: false,
            });
        } else {
            console.log(`✅ ${file} (${lineCount} lines) - exempted: ${exempt.reason}`);
        }
    }
}

if (violations.length === 0) {
    console.log(`\n✨ All ${sourceFiles.length} files comply with ${MAX_LINES}-line maximum.`);
    process.exit(0);
} else {
    console.error(`\n❌ ${violations.length} file(s) exceed ${MAX_LINES}-line limit:\n`);
    for (const v of violations) {
        console.error(`  ${v.file} (${v.lineCount} lines)`);
        console.error(`    → Add to max-lines-exceptions.json with reason and approval\n`);
    }
    process.exit(1);
}

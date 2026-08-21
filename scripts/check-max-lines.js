#!/usr/bin/env node

/**
 * Check Max Lines Enforcer
 *
 * Validates that all source files comply with the 200-line maximum rule.
 * Consults max-lines-exceptions.json for approved exemptions.
 *
 * Zero-dependency implementation (uses only Node.js standard fs and path modules)
 * to allow execution in lean environments without installed node_modules.
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

const MAX_LINES = 200;
const SKIP_DIRS = new Set(['node_modules', 'target', 'dist', '.git', '.github', 'Wireframe', 'pkg']);
const ROOT_DIR = path.resolve(__dirname, '..');

// Parse CLI args
const args = process.argv.slice(2);
let exceptionsPath = path.join(ROOT_DIR, 'max-lines-exceptions.json');
for (let i = 0; i < args.length; i++) {
    if (args[i] === '--exceptions' && args[i + 1]) {
        exceptionsPath = path.resolve(args[i + 1]);
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
 * Convert glob pattern to RegExp.
 * @param {string} globPattern
 * @returns {RegExp}
 */
function globToRegex(globPattern) {
    const normalized = globPattern.replace(/\\/g, '/');
    const escaped = normalized
        .replace(/[.+^${}()|[\]\\]/g, '\\$&')
        .replace(/\*\*/g, '.*')
        .replace(/\*/g, '[^/]*');
    return new RegExp(`^${escaped}$`);
}

const compiledExceptions = exceptions.map(ex => ({
    ...ex,
    regex: globToRegex(ex.path),
}));

/**
 * Check if a file path matches any exception pattern.
 * @param {string} relativeFilePath
 * @returns {object|null}
 */
function isExempt(relativeFilePath) {
    const normalized = relativeFilePath.replace(/\\/g, '/');
    for (const exempt of compiledExceptions) {
        if (exempt.regex.test(normalized)) {
            return exempt;
        }
    }
    return null;
}

/**
 * Count lines in a file.
 * @param {string} filePath
 * @returns {number}
 */
function countLines(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    return content.split('\n').length;
}

/**
 * Check whether a path refers to a test file, which is excluded from the line limit.
 * @param {string} relativeFilePath
 * @returns {boolean}
 */
function isTestFile(relativeFilePath) {
    const normalized = relativeFilePath.replace(/\\/g, '/');
    return (
        /\.test\.(ts|tsx)$/.test(normalized) ||
        /_tests?\.rs$/.test(normalized) ||
        /\/tests\.rs$/.test(normalized)
    );
}

/**
 * Recursively find source files.
 * @param {string} dir
 * @param {string} baseDir
 * @param {string[]} fileList
 * @returns {string[]}
 */
function walkDir(dir, baseDir, fileList = []) {
    let entries = [];
    try {
        entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
        return fileList;
    }

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        const relPath = path.relative(baseDir, fullPath).replace(/\\/g, '/');

        if (entry.isDirectory()) {
            if (!SKIP_DIRS.has(entry.name) && !relPath.startsWith('Docs/Wireframe')) {
                walkDir(fullPath, baseDir, fileList);
            }
        } else if (entry.isFile()) {
            if (isTestFile(relPath)) {
                continue;
            }
            if (
                (relPath.startsWith('frontend/src/') && (relPath.endsWith('.ts') || relPath.endsWith('.tsx'))) ||
                (relPath.startsWith('wasm/src/') && relPath.endsWith('.rs')) ||
                (relPath.startsWith('Docs/') && relPath.endsWith('.md'))
            ) {
                fileList.push(relPath);
            }
        }
    }
    return fileList;
}

function getSourceFiles() {
    const files = walkDir(ROOT_DIR, ROOT_DIR);
    return files.sort();
}

// Main
const sourceFiles = getSourceFiles();
let violations = [];

for (const file of sourceFiles) {
    const absPath = path.join(ROOT_DIR, file);
    const lineCount = countLines(absPath);

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

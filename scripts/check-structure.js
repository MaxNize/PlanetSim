#!/usr/bin/env node

/**
 * Project Structure Verifier
 *
 * Verifies that all required project directories and configuration files exist.
 *
 * Exit codes:
 *   0 - all checks pass
 *   1 - at least one check fails
 */

const fs = require('fs');
const path = require('path');

const checks = [
    { type: 'dir', path: 'frontend/src', name: 'frontend/src' },
    { type: 'dir', path: 'frontend/src/components', name: 'frontend/src/components' },
    { type: 'dir', path: 'frontend/src/hooks', name: 'frontend/src/hooks' },
    { type: 'dir', path: 'frontend/src/services', name: 'frontend/src/services' },
    { type: 'dir', path: 'frontend/src/utils', name: 'frontend/src/utils' },
    { type: 'dir', path: 'frontend/src/types', name: 'frontend/src/types' },
    { type: 'dir', path: 'wasm/src', name: 'wasm/src' },
    { type: 'dir', path: 'wasm/src/physics', name: 'wasm/src/physics' },
    { type: 'dir', path: 'wasm/src/wasm', name: 'wasm/src/wasm' },
    { type: 'dir', path: 'Docs', name: 'Docs' },
    { type: 'dir', path: 'scripts', name: 'scripts' },
    { type: 'file', path: '.editorconfig', name: '.editorconfig' },
    { type: 'file', path: 'Makefile', name: 'Makefile' },
    { type: 'file', path: 'package.json', name: 'package.json' },
    { type: 'file', path: 'Cargo.toml', name: 'Cargo.toml' },
    { type: 'file', path: 'max-lines-exceptions.json', name: 'max-lines-exceptions.json' },
    { type: 'file', path: '.nvmrc', name: '.nvmrc' },
    { type: 'file', path: '.rust-toolchain.toml', name: '.rust-toolchain.toml' },
];

let passed = 0;
let failed = 0;

for (const check of checks) {
    const fullPath = path.join(process.cwd(), check.path);
    let exists = false;

    try {
        const stat = fs.statSync(fullPath);
        if (check.type === 'dir') {
            exists = stat.isDirectory();
        } else if (check.type === 'file') {
            exists = stat.isFile();
        }
    } catch (err) {
        exists = false;
    }

    if (exists) {
        console.log(`✅ ${check.name}`);
        passed++;
    } else {
        console.error(`❌ ${check.name}`);
        failed++;
    }
}

console.log(`\n📋 Results: ${passed} passed, ${failed} failed`);

process.exit(failed > 0 ? 1 : 0);

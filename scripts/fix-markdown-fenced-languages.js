const fs = require('fs');
const path = require('path');
const glob = require('glob');

const patterns = ['Docs/**/*.md', 'README.md', 'CONTRIBUTING.md'];
let changedFiles = 0;

patterns.forEach(pattern => {
    glob.sync(pattern, { nodir: true }).forEach(file => {
        const text = fs.readFileSync(file, 'utf8');
        const updated = text.replace(/^```\s*$/gm, '```text');
        if (updated !== text) {
            fs.writeFileSync(file, updated, 'utf8');
            console.log('Patched', file);
            changedFiles++;
        }
    });
});

console.log(`Done. Files changed: ${changedFiles}`);

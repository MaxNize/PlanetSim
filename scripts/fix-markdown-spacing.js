const fs = require('fs');
const glob = require('glob');

const patterns = ['Docs/**/*.md', 'README.md', 'CONTRIBUTING.md'];
let changed = 0;

patterns.forEach(pattern => {
    glob.sync(pattern, { nodir: true }).forEach(file => {
        const text = fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n');
        const lines = text.split('\n');
        const out = [];
        let inCode = false;
        let blankCount = 0;
        for (let i = 0; i < lines.length; i++) {
            let line = lines[i];
            // Detect fence (```), toggle inCode
            if (/^\s*```/.test(line)) {
                inCode = !inCode;
                out.push(line.replace(/[ \t]+$/g, ''));
                blankCount = 0;
                continue;
            }
            if (inCode) {
                // leave code lines untouched (but remove trailing spaces)
                out.push(line.replace(/[ \t]+$/g, ''));
                blankCount = 0;
                continue;
            }

            // Outside code blocks: normalize
            // Remove trailing spaces
            line = line.replace(/[ \t]+$/g, '');

            if (line.trim() === '') {
                blankCount++;
                if (blankCount <= 1) out.push('');
                continue;
            }
            blankCount = 0;

            // Remove duplicate leading list markers like '- - ' -> '- '
            line = line.replace(/^([ \t]*)-\s*-\s*/g, '$1- ');
            // Normalize '*' list markers to '-'
            line = line.replace(/^([ \t]*)\*\s+/g, '$1- ');
            // Ensure single space after checkbox like '- [x]' or '- [ ]'
            line = line.replace(/^([ \t]*-\s*\[[ xX]\])\s+/g, '$1 ');
            // Ensure single space after unordered marker '- ' or '+ '
            line = line.replace(/^([ \t]*[-+])\s+/g, '$1 ');
            // Ensure single space after ordered list marker '1. '
            line = line.replace(/^([ \t]*\d+\.)\s+/g, '$1 ');

            out.push(line);
        }

        let newText = out.join('\n');
        if (!newText.endsWith('\n')) newText += '\n';
        if (newText !== text) {
            fs.writeFileSync(file, newText, 'utf8');
            console.log('Fixed spacing in', file);
            changed++;
        }
    });
});

console.log('Done. Files changed:', changed);

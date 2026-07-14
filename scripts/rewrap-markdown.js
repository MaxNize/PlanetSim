const fs = require('fs');
const glob = require('glob');

const MAX = 200;
const patterns = ['Docs/**/*.md', 'README.md', 'CONTRIBUTING.md'];
let changed = 0;

function wrapLine(line, prefix = '') {
    const words = line.split(' ');
    let out = '';
    let cur = prefix;
    for (const w of words) {
        if (cur.length + (cur.trim() ? 1 : 0) + w.length > MAX) {
            out += cur.trimRight() + '\n';
            cur = prefix + w + ' ';
        } else {
            cur += (cur.trim() ? ' ' : '') + w;
        }
    }
    out += cur.trimRight();
    return out;
}

patterns.forEach(pattern => {
    const files = glob.sync(pattern, { nodir: true });
    files.forEach(file => {
        const text = fs.readFileSync(file, 'utf8');
        const lines = text.split(/\r?\n/);
        let inCode = false;
        let modified = false;
        const outLines = [];
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const codeFence = line.match(/^\s*```/);
            if (codeFence) {
                inCode = !inCode;
                outLines.push(line);
                continue;
            }
            if (inCode) { outLines.push(line); continue; }
            // Skip tables (lines starting with |) and headings and lists with preformatted blocks
            if (/^\s*\|/.test(line) || /^\s*>/.test(line) || /^\s*```/.test(line) || /^\s*#/.test(line)) { outLines.push(line); continue; }
            // For list items, keep the marker as prefix
            const listMatch = line.match(/^(\s*[-*+]\s+)/);
            const numMatch = line.match(/^(\s*\d+\.\s+)/);
            let prefix = '';
            let content = line;
            if (listMatch) {
                prefix = listMatch[1];
                content = line.slice(prefix.length);
            } else if (numMatch) {
                prefix = numMatch[1];
                content = line.slice(prefix.length);
            } else {
                // preserve leading indentation
                const indentMatch = line.match(/^(\s+)/);
                prefix = indentMatch ? indentMatch[1] : '';
            }
            if (content.length > MAX || line.length > MAX) {
                // wrap content into paragraphs preserving prefix on first line
                const wrapped = wrapLine(content.trim(), prefix).split('\n');
                // first line should include marker if any
                wrapped.forEach((l, idx) => {
                    if (idx === 0) outLines.push((prefix || '') + l.trim());
                    else outLines.push((prefix ? ' '.repeat(prefix.length) : '') + l.trim());
                });
                modified = true;
            } else {
                outLines.push(line);
            }
        }
        if (modified) {
            fs.writeFileSync(file, outLines.join('\n') + '\n', 'utf8');
            console.log('Reflowed', file);
            changed++;
        }
    });
});
console.log('Done. Files changed:', changed);

const path = require('node:path');

const relativeToFrontend = (files) =>
  files.map((file) => path.relative(path.join(__dirname, 'frontend'), file)).join(' ');

module.exports = {
  'frontend/src/**/*.{ts,tsx}': (files) => {
    const rel = relativeToFrontend(files);
    return [
      `sh -c "cd frontend && eslint --max-warnings 0 --fix ${rel}"`,
      `sh -c "cd frontend && prettier --write ${rel}"`,
    ];
  },
  'frontend/src/**/*.css': (files) => {
    const rel = relativeToFrontend(files);
    return [
      `sh -c "cd frontend && stylelint --fix ${rel}"`,
      `sh -c "cd frontend && prettier --write ${rel}"`,
    ];
  },
  '{Docs,.}/**/*.md': (files) => `markdownlint-cli2 --fix ${files.join(' ')}`,
};

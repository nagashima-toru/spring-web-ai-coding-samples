module.exports = {
  // TypeScript and JavaScript files
  '**/*.{ts,tsx,js,jsx}': (filenames) => {
    const escapedFilenames = filenames.map((filename) => `"${filename}"`).join(' ');
    return [
      `prettier --write ${escapedFilenames}`,
      `eslint --fix ${escapedFilenames}`,
      'tsc --noEmit',
    ];
  },

  // Other files (JSON, Markdown, CSS, etc.)
  '**/*.{json,md,css,yaml,yml}': (filenames) => {
    const escapedFilenames = filenames.map((filename) => `"${filename}"`).join(' ');
    return [`prettier --write ${escapedFilenames}`];
  },
};

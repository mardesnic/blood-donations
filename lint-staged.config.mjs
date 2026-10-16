const config = {
  '**/*.{ts,tsx,mjs}': ['prettier --write', 'eslint'],
  // tsc checks the whole project and can't take file names, so it runs once.
  '**/*.{ts,tsx}': () => 'npm run type-check',
  './*.md': ['prettier --write'],
};

export default config;

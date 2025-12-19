import nextConfig from 'eslint-config-next';

const config = [
  ...nextConfig,
  {
    // Disable TypeScript rules for .js files
    files: ['**/*.js'],
    rules: {
      '@typescript-eslint/ban-ts-comment': 'off',
    },
  },
];

export default config;

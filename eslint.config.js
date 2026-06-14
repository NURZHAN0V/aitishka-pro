import antfu from '@antfu/eslint-config'

export default antfu(
  {
    vue: true,
    typescript: true,
  },
  {
    ignores: [
      'content/**',
      'dist/**',
      'public/content/**',
    ],
  },
  {
    files: ['scripts/**/*.mjs'],
    rules: {
      'node/prefer-global/buffer': 'off',
      'node/prefer-global/process': 'off',
      'no-unused-vars': 'off',
      'unused-imports/no-unused-imports': 'off',
      'unused-imports/no-unused-vars': 'off',
    },
  },
)
